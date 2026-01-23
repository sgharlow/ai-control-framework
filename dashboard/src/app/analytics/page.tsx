'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Clock,
  FileCode,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface DailyData {
  date: string;
  avgDRS: number;
  sessions: number;
  hoursCodedAggregated: number;
}

interface ComponentScore {
  component: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface FailureMode {
  mode: string;
  count: number;
  percentage: number;
}

// Generate demo data
function generateDemoData(days: number): DailyData[] {
  const data: DailyData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseScore = 78 + (days - i) * 0.15;
    const variance = (Math.random() - 0.5) * 12;
    const avgDRS = Math.min(100, Math.max(55, Math.round(baseScore + variance)));

    data.push({
      date: date.toISOString().split('T')[0],
      avgDRS,
      sessions: Math.floor(Math.random() * 6) + 2,
      hoursCodedAggregated: Math.floor(Math.random() * 8) + 2,
    });
  }

  return data;
}

const componentScores: ComponentScore[] = [
  { component: 'Contract Integrity', score: 6.5, maxScore: 7, percentage: 93 },
  { component: 'Behavioral Contracts', score: 6.2, maxScore: 7, percentage: 89 },
  { component: 'Security Validation', score: 13.5, maxScore: 16, percentage: 84 },
  { component: 'Data Integrity', score: 7.8, maxScore: 9, percentage: 87 },
  { component: 'No Mocks', score: 6.1, maxScore: 7, percentage: 87 },
  { component: 'Tests Passing', score: 5.9, maxScore: 7, percentage: 84 },
  { component: 'Integration Evidence', score: 7.5, maxScore: 9, percentage: 83 },
  { component: 'Architecture Stability', score: 6.0, maxScore: 7, percentage: 86 },
  { component: 'Production Readiness', score: 11.2, maxScore: 14, percentage: 80 },
  { component: 'Context Preservation', score: 5.8, maxScore: 7, percentage: 83 },
  { component: 'Error Handling', score: 3.4, maxScore: 4, percentage: 85 },
  { component: 'Scope Compliance', score: 3.6, maxScore: 4, percentage: 90 },
  { component: 'Documentation', score: 1.5, maxScore: 2, percentage: 75 },
];

const failureModes: FailureMode[] = [
  { mode: 'Mock timeout exceeded', count: 12, percentage: 28 },
  { mode: 'Contract changes detected', count: 8, percentage: 19 },
  { mode: 'Missing integration evidence', count: 7, percentage: 16 },
  { mode: 'Scope limit exceeded', count: 6, percentage: 14 },
  { mode: 'Tests not passing', count: 5, percentage: 12 },
  { mode: 'Other', count: 5, percentage: 11 },
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const data = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return generateDemoData(days);
  }, [period]);

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable' as const, value: 0 };
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgDRS, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgDRS, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 2) return { direction: 'up' as const, value: change };
    if (change < -2) return { direction: 'down' as const, value: change };
    return { direction: 'stable' as const, value: change };
  };

  const trend = calculateTrend();
  const currentAvg = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.avgDRS, 0) / data.length) : 0;
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const totalHours = data.reduce((sum, d) => sum + d.hoursCodedAggregated, 0);
  const deployReadyRate = data.length > 0 ? Math.round((data.filter((d) => d.avgDRS >= 85).length / data.length) * 100) : 0;

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const radarData = componentScores.slice(0, 8).map((c) => ({
    subject: c.component.split(' ')[0],
    value: c.percentage,
    fullMark: 100,
  }));

  return (
    <DashboardLayout userPlan="pro" userName="Sarah Chen" userEmail="sarah@example.com">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">
              DRS trends, metrics, and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-100 rounded-full">
              PRO
            </span>
          </div>
        </div>

        {/* Period Selector + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Period Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Time Period</span>
            </div>
            <div className="flex gap-1">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    period === p
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>

          {/* Avg DRS */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Average DRS</span>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span
                  className={`text-sm font-medium ${
                    trend.direction === 'up'
                      ? 'text-green-600'
                      : trend.direction === 'down'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {trend.value > 0 ? '+' : ''}
                  {trend.value.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{currentAvg}</p>
          </div>

          {/* Total Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total Sessions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
          </div>

          {/* Deploy Ready Rate */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Deploy Ready Rate</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{deployReadyRate}%</p>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DRS Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">DRS Trend</h3>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="drsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis domain={[50, 100]} stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'DRS Score']}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="5 5" />
                  <ReferenceLine y={70} stroke="#eab308" strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="avgDRS"
                    stroke="transparent"
                    fill="url(#drsGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDRS"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: '#22c55e' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }} />
                <span>Deploy Ready (85+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-yellow-500" style={{ borderStyle: 'dashed' }} />
                <span>Warning (70)</span>
              </div>
            </div>
          </div>

          {/* Component Radar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Component Overview</h3>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions by Day */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sessions by Day</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Failure Modes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Common Failure Modes</h3>
            </div>
            <div className="space-y-3">
              {failureModes.slice(0, 5).map((mode, index) => (
                <div key={mode.mode} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">{mode.mode}</span>
                      <span className="text-sm font-medium text-gray-900">{mode.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${mode.percentage}%`,
                          backgroundColor: COLORS[index],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DRS Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">DRS Distribution</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Deploy Ready (85+)', value: deployReadyRate },
                      { name: 'Warning (70-84)', value: Math.max(0, 100 - deployReadyRate - 15) },
                      { name: 'Critical (<70)', value: 15 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#eab308" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-600">85+</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-gray-600">70-84</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-600">&lt;70</span>
              </div>
            </div>
          </div>
        </div>

        {/* Component Score Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Component Score Breakdown
              </h3>
            </div>
            <span className="text-sm text-gray-500">Average across all sessions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {componentScores.map((component) => (
              <div
                key={component.component}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {component.component}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {component.score.toFixed(1)}/{component.maxScore}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      component.percentage >= 85
                        ? 'bg-green-500'
                        : component.percentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${component.percentage}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span
                    className={`text-xs font-medium ${
                      component.percentage >= 85
                        ? 'text-green-600'
                        : component.percentage >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {component.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl border border-brand-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">Strength</span>
              </div>
              <p className="text-sm text-gray-600">
                Contract integrity is consistently high (93%). Keep maintaining strict contract discipline.
              </p>
            </div>
            <div className="p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-900">Improvement Area</span>
              </div>
              <p className="text-sm text-gray-600">
                Documentation score (75%) is below target. Consider adding more inline comments and README updates.
              </p>
            </div>
            <div className="p-4 bg-white/60 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <span className="font-medium text-gray-900">Trend</span>
              </div>
              <p className="text-sm text-gray-600">
                DRS is trending up {Math.abs(trend.value).toFixed(1)}% over the period. You are on track for consistent deployability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
