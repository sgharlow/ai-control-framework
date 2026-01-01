import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Price IDs - these should be configured in Stripe Dashboard
const PRICES = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  enterprise_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, interval, email, teamName, userId, seats = 1 } = body;

    // Validate required fields
    if (!plan || !interval || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: plan, interval, email' },
        { status: 400 }
      );
    }

    // Get price ID based on plan and interval
    let priceId: string;
    if (plan === 'pro') {
      priceId = interval === 'year' ? PRICES.pro_yearly : PRICES.pro_monthly;
    } else if (plan === 'enterprise') {
      priceId = PRICES.enterprise_monthly;
    } else {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get base URL for redirects
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: seats,
        },
      ],
      customer_email: email,
      metadata: {
        user_id: userId || '',
        team_name: teamName || `${email}'s Team`,
        plan,
        seats: String(seats),
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      subscription_data: {
        metadata: {
          user_id: userId || '',
          team_name: teamName || `${email}'s Team`,
          plan,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Get session details (for success page)
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    return NextResponse.json({
      customerEmail: session.customer_details?.email,
      teamName: session.metadata?.team_name,
      plan: session.metadata?.plan,
      status: session.payment_status,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
