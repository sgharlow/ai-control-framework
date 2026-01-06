'use client';

import { useState } from 'react';
import { Check, X, Zap, Shield, Users, Clock, ChartBar, Headphones } from 'lucide-react';
import { PricingCard, pricingTiers } from '@/components/checkout/PricingCard';

// FAQ data
const faqs = [
  {
    question: 'What is the Deployability Rating Score (DRS)?',
    answer:
      'DRS is a 0-100 score that measures how ready your AI-assisted code is for production. It evaluates 13 components including contract integrity, security validation, test coverage, and production readiness.',
  },
  {
    question: 'Can I try Pro features before upgrading?',
    answer:
      'Yes! Start with our Free plan and experience the core DRS tracking. When you\'re ready for team features, extended history, and alerts, upgrade to Pro with our 14-day money-back guarantee.',
  },
  {
    question: 'How does team pricing work?',
    answer:
      'Pro includes up to 10 team members. Enterprise offers unlimited team members. Each member gets their own DRS tracking with team-wide visibility through the leaderboard.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. Enterprise customers can also pay via invoice.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely. Cancel anytime and keep access until the end of your billing period. We don\'t believe in lock-in—earn your continued subscription.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Yes, we offer a 14-day money-back guarantee. If the framework doesn\'t improve your AI development workflow, we\'ll refund you—no questions asked.',
  },
];

// Comparison features
const comparisonFeatures = [
  {
    category: 'Core Features',
    features: [
      { name: 'DRS Tracking', free: true, pro: true, enterprise: true },
      { name: 'Session Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Full Suite' },
      { name: 'History Retention', free: '7 days', pro: '90 days', enterprise: 'Unlimited' },
      { name: 'Export Data', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Team Features',
    features: [
      { name: 'Team Members', free: '1', pro: '10', enterprise: 'Unlimited' },
      { name: 'Team Leaderboard', free: false, pro: true, enterprise: true },
      { name: 'Role-Based Access', free: false, pro: false, enterprise: true },
      { name: 'Team Reports', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Integrations',
    features: [
      { name: 'API Access', free: false, pro: true, enterprise: true },
      { name: 'Webhooks', free: false, pro: true, enterprise: true },
      { name: 'SSO / SAML', free: false, pro: false, enterprise: true },
      { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Community Support', free: true, pro: true, enterprise: true },
      { name: 'Email Support', free: false, pro: true, enterprise: true },
      { name: 'Priority Support', free: false, pro: true, enterprise: true },
      { name: 'Dedicated Success Manager', free: false, pro: false, enterprise: true },
      { name: 'SLA Guarantee', free: false, pro: false, enterprise: true },
    ],
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 mx-auto" />
    );
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSelectPlan = async (plan: string, interval: 'month' | 'year') => {
    // In production, this would redirect to Stripe checkout
    console.log(`Selected plan: ${plan}, interval: ${interval}`);
    // window.location.href = `/api/checkout?plan=${plan}&interval=${interval}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your team. Start free, upgrade when you need more.
            </p>

            {/* Billing Toggle */}
            <div className="mt-10 flex justify-center">
              <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setBillingInterval('month')}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition ${
                    billingInterval === 'month'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('year')}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition flex items-center gap-2 ${
                    billingInterval === 'year'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid md:grid-cols-3 gap-8">
          <PricingCard
            {...pricingTiers.free}
            plan="free"
            onSelect={handleSelectPlan}
          />
          <PricingCard
            {...pricingTiers.pro}
            plan="pro"
            popular={true}
            onSelect={handleSelectPlan}
          />
          <PricingCard
            {...pricingTiers.enterprise}
            plan="enterprise"
            onSelect={handleSelectPlan}
          />
        </div>
      </div>

      {/* Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Teams Choose AI Control Framework
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ship 3x Faster</h3>
            <p className="text-gray-600">
              DRS tracking prevents false progress. Know exactly when code is production-ready.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reduce Risk</h3>
            <p className="text-gray-600">
              Catch issues before they reach production with 13 automated quality checks.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scale Confidently</h3>
            <p className="text-gray-600">
              Team leaderboards and shared dashboards keep everyone aligned on quality.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Detailed Plan Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 w-1/3">
                    Features
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      Pro
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    </span>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr key={category.category} className="bg-gray-50">
                      <td
                        colSpan={4}
                        className="py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-gray-700">{feature.name}</td>
                        <td className="py-4 px-4 text-center">
                          <FeatureValue value={feature.free} />
                        </td>
                        <td className="py-4 px-4 text-center bg-brand-50/30">
                          <FeatureValue value={feature.pro} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <FeatureValue value={feature.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Trusted by Engineering Teams</h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of developers shipping better AI-assisted code with confidence.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold">150+</div>
              <div className="text-brand-200">Tests Passing</div>
            </div>
            <div>
              <div className="text-4xl font-bold">13</div>
              <div className="text-brand-200">DRS Components</div>
            </div>
            <div>
              <div className="text-4xl font-bold">85+</div>
              <div className="text-brand-200">Target DRS</div>
            </div>
            <div>
              <div className="text-4xl font-bold">v2.0</div>
              <div className="text-brand-200">Production Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span
                    className={`transform transition ${openFaq === idx ? 'rotate-180' : ''}`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Ship with Confidence?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start free. Upgrade when you're ready. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/api/checkout?plan=free"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition"
            >
              Start Free
            </a>
            <a
              href="/api/checkout?plan=pro"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition"
            >
              Get Pro — $29/month
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
