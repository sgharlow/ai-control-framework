import { vi } from 'vitest';

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Global fetch mock
global.fetch = vi.fn();

// Mock Request and Response if not available
if (typeof Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    body: BodyInit | null;
    headers: Headers;

    constructor(input: RequestInfo | URL, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.toString();
      this.method = init?.method || 'GET';
      this.body = init?.body || null;
      this.headers = new Headers(init?.headers);
    }

    async text(): Promise<string> {
      if (typeof this.body === 'string') return this.body;
      return '';
    }

    async json(): Promise<unknown> {
      const text = await this.text();
      return JSON.parse(text);
    }
  } as unknown as typeof Request;
}

// Mock Headers if needed
if (typeof Headers === 'undefined') {
  global.Headers = class Headers extends Map<string, string> {
    get(name: string): string | null {
      return super.get(name.toLowerCase()) || null;
    }
    set(name: string, value: string): this {
      return super.set(name.toLowerCase(), value);
    }
  } as unknown as typeof Headers;
}
