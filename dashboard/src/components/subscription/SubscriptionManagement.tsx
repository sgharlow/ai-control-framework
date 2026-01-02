'use client';

import { useState } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  XCircle,
} from 'lucide-react';
import { pricingTiers } from '../checkout/PricingCard';

// Subscription status types
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';

interface Subscription {
  status: SubscriptionStatus;
  plan: 'free' | 'pro' | 'enterprise';
  interval: 'month' | 'year';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

interface BillingHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

interface SubscriptionManagementProps {
  subscription: Subscription;
  billingHistory: BillingHistory[];
  onUpgrade?: (plan: string, interval: 'month' | 'year') => Promise<void>;
  onDowngrade?: (plan: string) => Promise<void>;
  onCancel?: () => Promise<void>;
  onReactivate?: () => Promise<void>;
  onUpdatePayment?: () => Promise<void>;
}

// Status badge component
function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const configs = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Active' },
    trialing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Trial' },
    past_due: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: 'Past Due' },
    canceled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Canceled' },
    none: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle, label: 'Free' },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

export function SubscriptionManagement({
  subscription,
  billingHistory,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onUpdatePayment,
}: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'billing' | 'change'>('overview');

  const currentTier = pricingTiers[subscription.plan];
  const daysRemaining = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="mt-1 text-gray-600">Manage your plan, billing, and payment methods</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'billing', label: 'Billing History' },
          { key: 'change', label: 'Change Plan' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeSection === tab.key
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{currentTier.name} Plan</h2>
                  <StatusBadge status={subscription.status} />
                </div>
                <p className="text-gray-600">{currentTier.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${currentTier.price[subscription.interval === 'month' ? 'monthly' : 'yearly']}
                  <span className="text-lg font-normal text-gray-500">/{subscription.interval}</span>
                </div>
              </div>
            </div>

            {/* Period Info */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Period Ends</p>
                    <p className="font-medium text-gray-900">
                      {subscription.currentPeriodEnd.toLocaleDateString()}
                      <span className="text-sm text-gray-500 ml-1">({daysRemaining} days)</span>
                    </p>
                  </div>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Cancellation Scheduled</p>
                      <p className="text-sm text-gray-600">
                        Access until {subscription.currentPeriodEnd.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
              {onUpdatePayment && (
                <button
                  onClick={() => handleAction(onUpdatePayment)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Update Payment Method
                </button>
              )}
              {subscription.cancelAtPeriodEnd && onReactivate ? (
                <button
                  onClick={() => handleAction(onReactivate)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reactivate Subscription
                </button>
              ) : (
                onCancel && subscription.plan !== 'free' && (
                  <button
                    onClick={() => handleAction(onCancel)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition"
                  >
                    Cancel Subscription
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscription.plan === 'enterprise' ? 'Unlimited' : subscription.plan === 'pro' ? '10' : '1'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">History Retention</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscription.plan === 'enterprise' ? 'Unlimited' : subscription.plan === 'pro' ? '90 days' : '7 days'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">API Access</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscription.plan !== 'free' ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing History Section */}
      {activeSection === 'billing' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {billingHistory.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No billing history available
              </div>
            ) : (
              billingHistory.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        invoice.status === 'paid'
                          ? 'bg-green-100'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : invoice.status === 'pending' ? (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">${invoice.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{invoice.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  {invoice.invoiceUrl && (
                    <a
                      href={invoice.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                    >
                      View Invoice
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Change Plan Section */}
      {activeSection === 'change' && (
        <div className="space-y-6">
          {/* Current Plan Indicator */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <p className="text-brand-800">
              You are currently on the <strong>{currentTier.name}</strong> plan.
              {subscription.plan !== 'enterprise' && ' Upgrade to unlock more features.'}
            </p>
          </div>

          {/* Plan Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(pricingTiers).map(([key, tier]) => {
              const planKey = key as 'free' | 'pro' | 'enterprise';
              const isCurrentPlan = planKey === subscription.plan;
              const isUpgrade =
                (subscription.plan === 'free' && planKey !== 'free') ||
                (subscription.plan === 'pro' && planKey === 'enterprise');
              const isDowngrade =
                (subscription.plan === 'enterprise' && planKey !== 'enterprise') ||
                (subscription.plan === 'pro' && planKey === 'free');

              return (
                <div
                  key={key}
                  className={`rounded-xl border p-6 ${
                    isCurrentPlan ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{tier.name}</h3>
                      <p className="text-sm text-gray-500">{tier.description}</p>
                    </div>
                    {isCurrentPlan && (
                      <span className="text-xs font-medium bg-brand-100 text-brand-700 px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">${tier.price.monthly}</span>
                    <span className="text-gray-500">/month</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        {feature.included ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                        {feature.text}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <button
                      onClick={() => {
                        if (isUpgrade && onUpgrade) {
                          handleAction(() => onUpgrade(planKey, 'month'));
                        } else if (isDowngrade && onDowngrade) {
                          handleAction(() => onDowngrade(planKey));
                        }
                      }}
                      disabled={isLoading || planKey === 'free'}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                        isUpgrade
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : isDowngrade
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isUpgrade ? (
                        <>
                          <ArrowUpRight className="w-4 h-4" />
                          Upgrade
                        </>
                      ) : isDowngrade ? (
                        <>
                          <ArrowDownRight className="w-4 h-4" />
                          Downgrade
                        </>
                      ) : (
                        'Free Plan'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Downgrade Warning */}
          {subscription.plan !== 'free' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">About Downgrading</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    When you downgrade, you'll keep your current features until the end of your billing
                    period. After that, you'll lose access to premium features including extended history,
                    team features, and DRS alerts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export sample data for development/testing
export const sampleSubscription: Subscription = {
  status: 'active',
  plan: 'pro',
  interval: 'month',
  currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  cancelAtPeriodEnd: false,
};

export const sampleBillingHistory: BillingHistory[] = [
  {
    id: 'inv_001',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    amount: 29.0,
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'inv_002',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    amount: 29.0,
    status: 'paid',
    invoiceUrl: '#',
  },
  {
    id: 'inv_003',
    date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    amount: 29.0,
    status: 'paid',
    invoiceUrl: '#',
  },
];
