'use client';

import { Loader2, CreditCard, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface CheckoutButtonProps {
  plan: 'pro' | 'enterprise';
  interval: 'month' | 'year';
  email?: string;
  teamName?: string;
  seats?: number;
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  plan,
  interval,
  email,
  teamName,
  seats = 1,
  variant = 'primary',
  className = '',
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          interval,
          email,
          teamName,
          seats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {children || (
              <>
                <CreditCard className="w-5 h-5" />
                Upgrade to {plan === 'pro' ? 'Pro' : 'Enterprise'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </>
        )}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// Compact upgrade banner for dashboard
interface UpgradeBannerProps {
  currentPlan?: string;
}

export function UpgradeBanner({ currentPlan = 'free' }: UpgradeBannerProps) {
  if (currentPlan !== 'free') return null;

  return (
    <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">Unlock Pro Features</h3>
          <p className="text-brand-100 mt-1">
            Get team leaderboards, DRS alerts, 90-day history, and more.
          </p>
        </div>
        <CheckoutButton
          plan="pro"
          interval="month"
          variant="secondary"
          className="bg-white text-brand-600 hover:bg-brand-50"
        >
          Upgrade for $29/mo
        </CheckoutButton>
      </div>
    </div>
  );
}
