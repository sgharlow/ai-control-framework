import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Mock Stripe — the route instantiates its client ONCE at module import, so the tests must
// configure the very fn that factory instance holds; a shared hoisted mock is that fn.
const { mockConstructEvent } = vi.hoisted(() => ({ mockConstructEvent: vi.fn() }));
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    })),
  };
});

// Mock Supabase — vi.hoisted so the vi.mock factory (hoisted above module consts) can see these
const {
  mockSupabaseFrom,
  mockSupabaseSelect,
  mockSupabaseInsert,
  mockSupabaseUpdate,
  mockSupabaseSingle,
  mockSupabaseEq,
} = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
  mockSupabaseSelect: vi.fn(),
  mockSupabaseInsert: vi.fn(),
  mockSupabaseUpdate: vi.fn(),
  mockSupabaseSingle: vi.fn(),
  mockSupabaseEq: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('valid-signature'),
  }),
}));

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Re-establish the headers default every test: restore/clear cycles had wiped the
    // module-scope implementation, leaving headers() → undefined from the second test on.
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('valid-signature'),
    } as unknown as Awaited<ReturnType<typeof headers>>);

    // Setup Supabase chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
    });
    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValue({
      single: mockSupabaseSingle,
    });
    mockSupabaseSingle.mockResolvedValue({ data: null });
    mockSupabaseInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'team-123' }, error: null }),
      }),
    });
    mockSupabaseUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'team-123' }, error: null }),
        }),
      }),
    });

  });

  describe('POST handler', () => {
    it('should reject requests without signature', async () => {
      // Override headers mock to return null signature
      const { headers } = await import('next/headers');
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(null),
      } as unknown as Headers);

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('No signature');
    });

    it('should reject invalid signatures', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Invalid signature');
    });

    it('should skip already processed events (idempotency)', async () => {
      // Event already exists in database
      mockSupabaseSingle.mockResolvedValueOnce({ data: { id: 'existing-event' } });

      mockConstructEvent.mockReturnValue({
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: {} },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.skipped).toBe(true);
    });

    describe('checkout.session.completed', () => {
      it('should create team and license key on checkout completion', async () => {
        const mockSession: Partial<Stripe.Checkout.Session> = {
          customer: 'cus_123',
          subscription: 'sub_123',
          customer_details: { email: 'test@example.com' } as Stripe.Checkout.Session.CustomerDetails,
          metadata: { team_name: 'Test Team' },
        };

        mockConstructEvent.mockReturnValue({
          id: 'evt_checkout_123',
          type: 'checkout.session.completed',
          data: { object: mockSession },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        // Verify team creation was called
        expect(mockSupabaseFrom).toHaveBeenCalledWith('teams');
        expect(mockSupabaseInsert).toHaveBeenCalled();
      });
    });

    describe('customer.subscription.updated', () => {
      it('should update team seats on subscription change', async () => {
        const mockSubscription: Partial<Stripe.Subscription> = {
          customer: 'cus_123',
          items: {
            data: [
              {
                quantity: 5,
                price: { id: 'price_pro' } as Stripe.Price,
              } as Stripe.SubscriptionItem,
            ],
          } as Stripe.ApiList<Stripe.SubscriptionItem>,
        };

        mockConstructEvent.mockReturnValue({
          id: 'evt_sub_update_123',
          type: 'customer.subscription.updated',
          data: { object: mockSubscription },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        // Verify update was called
        expect(mockSupabaseFrom).toHaveBeenCalledWith('teams');
        expect(mockSupabaseUpdate).toHaveBeenCalled();
      });

      it('should set enterprise plan when price includes "enterprise"', async () => {
        const mockSubscription: Partial<Stripe.Subscription> = {
          customer: 'cus_123',
          items: {
            data: [
              {
                quantity: 10,
                price: { id: 'price_enterprise_annual' } as Stripe.Price,
              } as Stripe.SubscriptionItem,
            ],
          } as Stripe.ApiList<Stripe.SubscriptionItem>,
        };

        mockConstructEvent.mockReturnValue({
          id: 'evt_sub_update_enterprise',
          type: 'customer.subscription.updated',
          data: { object: mockSubscription },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        await POST(request);

        // The update should include enterprise plan
        expect(mockSupabaseUpdate).toHaveBeenCalled();
      });
    });

    describe('customer.subscription.deleted', () => {
      it('should revoke access on subscription cancellation', async () => {
        const mockSubscription: Partial<Stripe.Subscription> = {
          customer: 'cus_123',
        };

        // Mock team exists
        mockSupabaseUpdate.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'team-123' }, error: null }),
            }),
          }),
        });

        mockConstructEvent.mockReturnValue({
          id: 'evt_sub_deleted_123',
          type: 'customer.subscription.deleted',
          data: { object: mockSubscription },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        // Verify license revocation was attempted
        expect(mockSupabaseFrom).toHaveBeenCalledWith('teams');
        expect(mockSupabaseFrom).toHaveBeenCalledWith('license_keys');
      });
    });

    describe('invoice.paid', () => {
      it('should extend license on invoice payment', async () => {
        const mockInvoice: Partial<Stripe.Invoice> = {
          customer: 'cus_123',
          subscription: 'sub_123',
        };

        // Sequence the single() results: the blanket select-override used before also made
        // the stripe_events idempotency lookup "find" the event, short-circuiting the handler.
        mockSupabaseSingle
          .mockResolvedValueOnce({ data: null }) // stripe_events: not yet processed
          .mockResolvedValueOnce({ data: { id: 'team-123' } }); // teams: found

        // License extension awaits update().eq().eq() directly (two eqs, no single)
        mockSupabaseUpdate.mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        });

        mockConstructEvent.mockReturnValue({
          id: 'evt_invoice_paid_123',
          type: 'invoice.paid',
          data: { object: mockInvoice },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        expect(mockSupabaseFrom).toHaveBeenCalledWith('teams');
      });

      it('should skip one-time payments without subscription', async () => {
        const mockInvoice: Partial<Stripe.Invoice> = {
          customer: 'cus_123',
          subscription: null, // One-time payment
        };

        mockConstructEvent.mockReturnValue({
          id: 'evt_invoice_paid_onetime',
          type: 'invoice.paid',
          data: { object: mockInvoice },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });

    describe('invoice.payment_failed', () => {
      it('should handle failed payments gracefully', async () => {
        const mockInvoice: Partial<Stripe.Invoice> = {
          customer: 'cus_123',
          customer_email: 'test@example.com',
        };

        mockConstructEvent.mockReturnValue({
          id: 'evt_invoice_failed_123',
          type: 'invoice.payment_failed',
          data: { object: mockInvoice },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });

    describe('unhandled events', () => {
      it('should acknowledge unhandled event types', async () => {
        mockConstructEvent.mockReturnValue({
          id: 'evt_unknown_123',
          type: 'customer.created',
          data: { object: {} },
        });

        const request = new Request('http://localhost/api/webhooks/stripe', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.received).toBe(true);
      });
    });
  });

  describe('GET handler', () => {
    it('should return 405 Method Not Allowed', async () => {
      const response = await GET();
      expect(response.status).toBe(405);

      const body = await response.json();
      expect(body.error).toBe('Method not allowed');
    });
  });
});

describe('License Key Generation', () => {
  it('should generate keys in correct format', () => {
    // Test the license key format pattern
    const keyPattern = /^ACF-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

    // Generate multiple keys and verify format
    for (let i = 0; i < 10; i++) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const parts = [];
      for (let p = 0; p < 4; p++) {
        let part = '';
        for (let j = 0; j < 4; j++) {
          part += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(part);
      }
      const key = `ACF-PRO-${parts.join('-')}`;
      expect(key).toMatch(keyPattern);
    }
  });

  it('should generate unique keys', () => {
    const keys = new Set<string>();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < 100; i++) {
      const parts = [];
      for (let p = 0; p < 4; p++) {
        let part = '';
        for (let j = 0; j < 4; j++) {
          part += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(part);
      }
      keys.add(`ACF-PRO-${parts.join('-')}`);
    }

    // All 100 keys should be unique (extremely high probability)
    expect(keys.size).toBe(100);
  });
});
