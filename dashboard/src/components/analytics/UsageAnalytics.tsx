'use client';

import React, { useMemo } from 'react';
import {
  BarChart3,
  Database,
  Zap,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface UsageData {
  apiCalls: number;
  apiLimit: number;
  storageUsed: number;
  storageLimit: number;
  sessionsThisMonth: number;
  activeUsers: number;
  avgSessionDuration: number;
  peakUsageTime: string;
}

interface DailyUsage {
  date: string;
  apiCalls: number;
  sessions: number;
}

interface FeatureUsage {
  feature: string;
  count: number;
  percentage: number;
}

interface UsageAnalyticsProps {
  usage: UsageData;
  dailyUsage: DailyUsage[];
  featureUsage: FeatureUsage[];
  plan: 'free' | 'pro' | 'enterprise';
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

function UsageBar({ label, used, limit, unit, color }: {
  label: string;
  used: number;
  limit: number;
  unit: string;
  color: string;
}) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 95;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-600'}`}>
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : color
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-amber-600">Approaching limit - consider upgrading</p>
      )}
      {isAtLimit && (
        <p className="text-xs text-red-600">Limit reached - upgrade to continue</p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color, bgColor }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subValue && (
        <div className="text-sm text-gray-500 mt-1">{subValue}</div>
      )}
    </div>
  );
}

export function UsageAnalytics({ usage, dailyUsage, featureUsage, plan }: UsageAnalyticsProps) {
  const planLabel = plan === 'enterprise' ? 'Enterprise' : plan === 'pro' ? 'Pro' : 'Free';
  const planColor = plan === 'enterprise' ? 'text-purple-600' : plan === 'pro' ? 'text-blue-600' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Usage Analytics</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
          plan === 'pro' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {planLabel} Plan
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Resource Usage</h3>
        <div className="space-y-5">
          <UsageBar
            label="API Calls"
            used={usage.apiCalls}
            limit={usage.apiLimit}
            unit="calls"
            color="bg-blue-500"
          />
          <UsageBar
            label="Storage"
            used={usage.storageUsed}
            limit={usage.storageLimit}
            unit="MB"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Sessions This Month"
          value={usage.sessionsThisMonth}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={usage.activeUsers}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={Clock}
          label="Avg Session Duration"
          value={`${usage.avgSessionDuration}m`}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Peak Usage"
          value={usage.peakUsageTime}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Daily API Usage (Last 14 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                />
                <Bar dataKey="apiCalls" fill="#3b82f6" radius={[4, 4, 0, 0]} name="API Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Usage Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Feature Usage Distribution</h3>
          <div className="h-64 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={featureUsage}
                    dataKey="count"
                    nameKey="feature"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {featureUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {featureUsage.map((feature, index) => (
                <div key={feature.feature} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{feature.feature}</span>
                  <span className="text-sm font-medium text-gray-900">{feature.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Usage Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">-</span>
            Batch similar operations to reduce API call count
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">-</span>
            Use caching for frequently accessed data
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">-</span>
            Schedule heavy operations during off-peak hours
          </li>
          {plan === 'free' && (
            <li className="flex items-start gap-2">
              <span className="text-purple-600">-</span>
              <span className="text-purple-700 font-medium">Upgrade to Pro for 10x more API calls and storage</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Generate sample data for demo
export function generateSampleUsageData(): {
  usage: UsageData;
  dailyUsage: DailyUsage[];
  featureUsage: FeatureUsage[];
} {
  const today = new Date();
  const dailyUsage: DailyUsage[] = [];

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dailyUsage.push({
      date: date.toISOString().split('T')[0],
      apiCalls: Math.floor(Math.random() * 500) + 100,
      sessions: Math.floor(Math.random() * 20) + 5,
    });
  }

  return {
    usage: {
      apiCalls: 4250,
      apiLimit: 5000,
      storageUsed: 180,
      storageLimit: 500,
      sessionsThisMonth: 127,
      activeUsers: 3,
      avgSessionDuration: 24,
      peakUsageTime: '2-4 PM',
    },
    dailyUsage,
    featureUsage: [
      { feature: 'DRS Calculation', count: 450, percentage: 35 },
      { feature: 'Session Tracking', count: 320, percentage: 25 },
      { feature: 'Evidence Capture', count: 260, percentage: 20 },
      { feature: 'Team Sync', count: 155, percentage: 12 },
      { feature: 'Reports', count: 103, percentage: 8 },
    ],
  };
}

export default UsageAnalytics;
