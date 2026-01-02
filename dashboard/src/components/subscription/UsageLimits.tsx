'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Database,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
} from 'lucide-react';

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    teamMembers: 1,
    historyDays: 7,
    sessionsPerMonth: 50,
    apiRequests: 0,
    exportEnabled: false,
    alertsEnabled: false,
    customPatterns: 0,
  },
  pro: {
    teamMembers: 10,
    historyDays: 90,
    sessionsPerMonth: 1000,
    apiRequests: 10000,
    exportEnabled: true,
    alertsEnabled: true,
    customPatterns: 5,
  },
  enterprise: {
    teamMembers: Infinity,
    historyDays: Infinity,
    sessionsPerMonth: Infinity,
    apiRequests: Infinity,
    exportEnabled: true,
    alertsEnabled: true,
    customPatterns: Infinity,
  },
} as const;

type PlanType = keyof typeof PLAN_LIMITS;

interface UsageData {
  teamMembers: number;
  sessionsThisMonth: number;
  apiRequestsThisMonth: number;
  customPatterns: number;
  oldestSessionDate: Date;
}

interface UsageLimitsProps {
  plan: PlanType;
  usage: UsageData;
  onUpgrade?: () => void;
}

// Progress bar component
function UsageBar({
  current,
  limit,
  label,
  icon: Icon,
  warningThreshold = 0.8,
}: {
  current: number;
  limit: number;
  label: string;
  icon: React.ElementType;
  warningThreshold?: number;
}) {
  const isUnlimited = limit === Infinity;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isWarning = !isUnlimited && percentage >= warningThreshold * 100;
  const isAtLimit = !isUnlimited && current >= limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${isAtLimit ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-gray-500'}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-mono ${isAtLimit ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-600'}`}>
          {current.toLocaleString()} / {isUnlimited ? '∞' : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-brand-500'
          }`}
          style={{ width: isUnlimited ? '0%' : `${percentage}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Limit reached. Upgrade to continue.
        </p>
      )}
      {isWarning && !isAtLimit && (
        <p className="text-xs text-yellow-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Approaching limit. Consider upgrading.
        </p>
      )}
    </div>
  );
}

// Feature toggle display
function FeatureStatus({
  enabled,
  label,
  icon: Icon,
}: {
  enabled: boolean;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${enabled ? 'text-green-500' : 'text-gray-300'}`} />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded ${enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}

export function UsageLimits({ plan, usage, onUpgrade }: UsageLimitsProps) {
  const limits = PLAN_LIMITS[plan];
  const [cycleReset, setCycleReset] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate next month reset
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setCycleReset(nextMonth);
  }, []);

  const historyDaysUsed = usage.oldestSessionDate
    ? Math.floor((Date.now() - usage.oldestSessionDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const hasLimitIssues =
    usage.teamMembers >= limits.teamMembers ||
    usage.sessionsThisMonth >= limits.sessionsPerMonth ||
    (limits.apiRequests > 0 && usage.apiRequestsThisMonth >= limits.apiRequests);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usage & Limits</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            {cycleReset && ` · Resets ${cycleReset.toLocaleDateString()}`}
          </p>
        </div>
        {plan !== 'enterprise' && hasLimitIssues && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            Upgrade
          </button>
        )}
      </div>

      {/* Usage Metrics */}
      <div className="p-6 space-y-6">
        {/* Team Members */}
        <UsageBar
          current={usage.teamMembers}
          limit={limits.teamMembers}
          label="Team Members"
          icon={Users}
        />

        {/* Sessions This Month */}
        <UsageBar
          current={usage.sessionsThisMonth}
          limit={limits.sessionsPerMonth}
          label="Sessions This Month"
          icon={BarChart3}
        />

        {/* API Requests */}
        {limits.apiRequests > 0 && (
          <UsageBar
            current={usage.apiRequestsThisMonth}
            limit={limits.apiRequests}
            label="API Requests This Month"
            icon={Zap}
          />
        )}

        {/* Custom Patterns */}
        {limits.customPatterns > 0 && (
          <UsageBar
            current={usage.customPatterns}
            limit={limits.customPatterns}
            label="Custom Patterns"
            icon={Database}
          />
        )}

        {/* History Retention */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">History Retention</span>
            </div>
            <span className="text-sm text-gray-600">
              {limits.historyDays === Infinity ? 'Unlimited' : `${limits.historyDays} days`}
            </span>
          </div>
          {historyDaysUsed > 0 && limits.historyDays !== Infinity && (
            <p className="text-xs text-gray-500">
              Oldest session: {historyDaysUsed} days ago
              {historyDaysUsed >= limits.historyDays && (
                <span className="text-yellow-600 ml-1">
                  · Older sessions will be archived
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Features</h3>
        <div className="space-y-1">
          <FeatureStatus
            enabled={limits.exportEnabled}
            label="CSV/JSON Export"
            icon={Database}
          />
          <FeatureStatus
            enabled={limits.alertsEnabled}
            label="Slack/Discord Alerts"
            icon={Zap}
          />
          <FeatureStatus
            enabled={limits.apiRequests > 0}
            label="API Access"
            icon={BarChart3}
          />
        </div>
      </div>

      {/* Upgrade CTA for Free Users */}
      {plan === 'free' && onUpgrade && (
        <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-blue-50 border-t border-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-900">Unlock Pro Features</p>
              <p className="text-xs text-brand-700">
                Get 90-day history, team features, and API access
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition"
            >
              Upgrade to Pro
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export sample data for development
export const sampleUsage: UsageData = {
  teamMembers: 3,
  sessionsThisMonth: 42,
  apiRequestsThisMonth: 1250,
  customPatterns: 2,
  oldestSessionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
};

// Usage limits hook for fetching real data
export function useUsageLimits(userId: string) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        // This would be replaced with actual API call
        // const response = await fetch(`/api/usage/${userId}`);
        // const data = await response.json();
        setUsage(sampleUsage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch usage');
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [userId]);

  return { usage, loading, error };
}
