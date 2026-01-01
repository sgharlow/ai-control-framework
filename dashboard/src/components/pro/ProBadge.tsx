'use client';

import { Crown, Sparkles, Check } from 'lucide-react';

interface ProBadgeProps {
  plan: 'free' | 'pro' | 'enterprise';
  expiresAt?: Date;
  seatCount?: number;
  usedSeats?: number;
}

export function ProBadge({ plan, expiresAt, seatCount, usedSeats }: ProBadgeProps) {
  const planConfig = {
    free: {
      label: 'Free',
      icon: null,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200',
    },
    pro: {
      label: 'Pro',
      icon: Crown,
      bgColor: 'bg-gradient-to-r from-brand-500 to-brand-600',
      textColor: 'text-white',
      borderColor: 'border-brand-500',
    },
    enterprise: {
      label: 'Enterprise',
      icon: Sparkles,
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-white',
      borderColor: 'border-purple-500',
    },
  };

  const config = planConfig[plan];
  const IconComponent = config.icon;

  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`rounded-lg border ${config.borderColor} overflow-hidden`}>
      {/* Badge Header */}
      <div className={`${config.bgColor} ${config.textColor} px-4 py-3`}>
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="w-5 h-5" />}
          <span className="font-semibold">{config.label} Plan</span>
        </div>
      </div>

      {/* Plan Details */}
      {plan !== 'free' && (
        <div className="bg-white px-4 py-3 space-y-2">
          {seatCount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Seats</span>
              <span className="font-medium text-gray-900">
                {usedSeats || 1} / {seatCount}
              </span>
            </div>
          )}

          {daysUntilExpiry !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Renews in</span>
              <span
                className={`font-medium ${
                  daysUntilExpiry <= 7
                    ? 'text-red-600'
                    : daysUntilExpiry <= 30
                    ? 'text-yellow-600'
                    : 'text-gray-900'
                }`}
              >
                {daysUntilExpiry} days
              </span>
            </div>
          )}

          {/* Pro Features */}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500 mb-2">Includes:</p>
            <ul className="space-y-1">
              {[
                'Team Leaderboard',
                'DRS Alerts',
                '30-Day Trends',
                'Custom Reports',
                'Priority Support',
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <Check className="w-3 h-3 text-brand-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Upgrade CTA for Free */}
      {plan === 'free' && (
        <div className="bg-white px-4 py-3">
          <p className="text-xs text-gray-500 mb-3">
            Upgrade to unlock Pro features:
          </p>
          <ul className="space-y-1 mb-3">
            {['Team Leaderboard', 'DRS Alerts', '30-Day Trends'].map(
              (feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs text-gray-400"
                >
                  <div className="w-3 h-3 rounded-full border border-gray-300" />
                  {feature}
                </li>
              )
            )}
          </ul>
          <button className="w-full px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}

// Usage stats component
interface UsageStatsProps {
  sessionsThisMonth: number;
  sessionsLimit: number;
  apiCallsThisMonth: number;
  apiCallsLimit: number;
}

export function UsageStats({
  sessionsThisMonth,
  sessionsLimit,
  apiCallsThisMonth,
  apiCallsLimit,
}: UsageStatsProps) {
  const sessionPercent = (sessionsThisMonth / sessionsLimit) * 100;
  const apiPercent = (apiCallsThisMonth / apiCallsLimit) * 100;

  const getBarColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-brand-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h4 className="font-medium text-gray-900">Usage This Month</h4>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Sessions</span>
            <span className="font-medium text-gray-900">
              {sessionsThisMonth} / {sessionsLimit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(sessionPercent)} transition-all`}
              style={{ width: `${Math.min(sessionPercent, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">API Calls</span>
            <span className="font-medium text-gray-900">
              {apiCallsThisMonth.toLocaleString()} /{' '}
              {apiCallsLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(apiPercent)} transition-all`}
              style={{ width: `${Math.min(apiPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
