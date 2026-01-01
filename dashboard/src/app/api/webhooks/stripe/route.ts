import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Supabase with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Generate license key format: ACF-PRO-XXXX-XXXX-XXXX-XXXX
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const parts = [];
  for (let p = 0; p < 4; p++) {
    let part = '';
    for (let i = 0; i < 4; i++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(part);
  }
  return `ACF-PRO-${parts.join('-')}`;
}

// Check if event was already processed (idempotency)
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();
  return !!data;
}

// Log event for idempotency
async function logEvent(eventId: string, eventType: string, payload: object, error?: string) {
  await supabase.from('stripe_events').insert({
    stripe_event_id: eventId,
    event_type: eventType,
    payload,
    error,
  });
}

// Handle checkout.session.completed - Create license key and team
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const customerEmail = session.customer_details?.email;
  const metadata = session.metadata || {};

  // Get or create user by email
  let userId = metadata.user_id;

  if (!userId && customerEmail) {
    // Look up user by email
    const { data: userData } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', customerEmail)
      .single();
    userId = userData?.id;
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: metadata.team_name || `${customerEmail}'s Team`,
      owner_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: 'pro',
      seat_count: 1,
    })
    .select()
    .single();

  if (teamError) {
    console.error('Failed to create team:', teamError);
    throw teamError;
  }

  // Create license key
  const licenseKey = generateLicenseKey();
  const { error: licenseError } = await supabase
    .from('license_keys')
    .insert({
      key: licenseKey,
      user_id: userId,
      team_id: team.id,
      plan: 'pro',
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    });

  if (licenseError) {
    console.error('Failed to create license key:', licenseError);
    throw licenseError;
  }

  // Add owner as team member
  if (userId) {
    await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString(),
    });
  }

  console.log(`Created team ${team.id} with license key ${licenseKey}`);
  return { team, licenseKey };
}

// Handle subscription updated - Update plan/seats
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Get current quantity (seats)
  const quantity = subscription.items.data[0]?.quantity || 1;

  // Determine plan from price
  const priceId = subscription.items.data[0]?.price.id;
  let plan = 'pro';
  if (priceId?.includes('enterprise')) {
    plan = 'enterprise';
  }

  const { error } = await supabase
    .from('teams')
    .update({
      seat_count: quantity,
      plan: plan,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update subscription:', error);
    throw error;
  }

  console.log(`Updated subscription for customer ${customerId}: ${quantity} seats, ${plan} plan`);
}

// Handle subscription deleted - Revoke access
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Update team to free plan
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .update({ plan: 'free' })
    .eq('stripe_customer_id', customerId)
    .select()
    .single();

  if (teamError) {
    console.error('Failed to update team:', teamError);
    throw teamError;
  }

  // Revoke all license keys for this team
  const { error: licenseError } = await supabase
    .from('license_keys')
    .update({ status: 'revoked' })
    .eq('team_id', team.id);

  if (licenseError) {
    console.error('Failed to revoke licenses:', licenseError);
    throw licenseError;
  }

  console.log(`Revoked access for customer ${customerId}`);
}

// Handle invoice paid - Extend license validity
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return; // One-time payment, not subscription

  // Get team
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!team) return;

  // Extend license expiration
  const { error } = await supabase
    .from('license_keys')
    .update({
      status: 'active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('team_id', team.id)
    .eq('status', 'active');

  if (error) {
    console.error('Failed to extend license:', error);
    throw error;
  }

  console.log(`Extended license for customer ${customerId}`);
}

// Handle invoice payment failed - Notify user
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const customerEmail = invoice.customer_email;

  // Log the failure - notification would be handled by email service
  console.log(`Payment failed for customer ${customerId} (${customerEmail})`);

  // Could trigger email notification here via Resend/SendGrid
  // For now, just log it
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Check idempotency
  if (await isEventProcessed(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log successful processing
    await logEvent(event.id, event.type, event.data.object as object);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error);

    // Log failed processing
    await logEvent(event.id, event.type, event.data.object as object, String(error));

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Stripe webhooks only support POST
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
