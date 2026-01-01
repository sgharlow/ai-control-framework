'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PricingFeature[];
  popular?: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  currentPlan?: string;
  onSelect?: (plan: string, interval: 'month' | 'year') => void;
}

export function PricingCard({
  name,
  description,
  price,
  features,
  popular = false,
  plan,
  currentPlan,
  onSelect,
}: PricingCardProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(false);

  const displayPrice = interval === 'month' ? price.monthly : price.yearly;
  const savings = Math.round((1 - price.yearly / (price.monthly * 12)) * 100);

  const handleSelect = async () => {
    if (!onSelect || plan === 'free' || plan === currentPlan) return;

    setLoading(true);
    try {
      await onSelect(plan, interval);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = plan === currentPlan;

  return (
    <div
      className={`relative rounded-2xl border ${
        popular
          ? 'border-brand-500 ring-2 ring-brand-500'
          : 'border-gray-200'
      } bg-white p-8 shadow-sm`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-brand-500 text-white text-sm font-medium px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>

      {/* Interval Toggle */}
      {plan !== 'free' && (
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setInterval('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                interval === 'month'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('year')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                interval === 'year'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
              {savings > 0 && (
                <span className="ml-1 text-brand-600">-{savings}%</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="mt-6 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900">
            ${displayPrice}
          </span>
          {plan !== 'free' && (
            <span className="text-gray-500">/{interval}</span>
          )}
        </div>
        {plan !== 'free' && interval === 'year' && (
          <p className="mt-1 text-sm text-gray-500">
            Billed annually (${price.yearly * 12}/year)
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div
              className={`mt-0.5 ${
                feature.included ? 'text-brand-500' : 'text-gray-300'
              }`}
            >
              <Check className="w-5 h-5" />
            </div>
            <span
              className={`text-sm ${
                feature.included ? 'text-gray-700' : 'text-gray-400'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div className="mt-8">
        <button
          onClick={handleSelect}
          disabled={loading || isCurrentPlan || plan === 'free'}
          className={`w-full py-3 px-4 rounded-lg font-medium text-center transition ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : popular
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : plan === 'free'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : plan === 'free' ? (
            'Free Forever'
          ) : (
            `Upgrade to ${name}`
          )}
        </button>
      </div>
    </div>
  );
}

// Pricing tiers configuration
export const pricingTiers = {
  free: {
    name: 'Free',
    description: 'For individual developers',
    price: { monthly: 0, yearly: 0 },
    features: [
      { text: 'Personal DRS tracking', included: true },
      { text: '7-day history', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Team features', included: false },
      { text: 'Extended history', included: false },
      { text: 'DRS alerts', included: false },
      { text: 'Custom reports', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For teams and agencies',
    price: { monthly: 29, yearly: 24 },
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Team leaderboard', included: true },
      { text: '90-day history', included: true },
      { text: 'DRS alerts', included: true },
      { text: 'Custom reports', included: true },
      { text: 'Up to 10 team members', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 99, yearly: 84 },
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited history', included: true },
      { text: 'SSO integration', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Custom onboarding', included: true },
    ],
  },
};
