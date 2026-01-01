'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface DailyData {
  date: string;
  avgDRS: number;
  sessions: number;
  hoursCodedAggregated: number;
}

interface ExtendedDRSChartProps {
  data: DailyData[];
  period: '7d' | '30d' | '90d';
  onPeriodChange: (period: '7d' | '30d' | '90d') => void;
}

export function ExtendedDRSChart({
  data,
  period,
  onPeriodChange,
}: ExtendedDRSChartProps) {
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable' as const, value: 0 };
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, d) => sum + d.avgDRS, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + d.avgDRS, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 2) return { direction: 'up' as const, value: change };
    if (change < -2) return { direction: 'down' as const, value: change };
    return { direction: 'stable' as const, value: change };
  };

  const trend = calculateTrend();
  const currentAvg =
    data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + d.avgDRS, 0) / data.length)
      : 0;
  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);

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

  const periodLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-lg">
              <Calendar className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Extended DRS Trend
              </h3>
              <p className="text-sm text-gray-500">{periodLabels[period]}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
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
            <span className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-100 rounded-full">
              PRO
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Average DRS</p>
            <p className="text-2xl font-bold text-gray-900">{currentAvg}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Deploy Ready Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.length > 0
                ? Math.round(
                    (data.filter((d) => d.avgDRS >= 85).length / data.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
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
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#9ca3af"
                fontSize={12}
                ticks={[0, 25, 50, 70, 85, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'avgDRS') return [value, 'DRS Score'];
                  if (name === 'sessions') return [value, 'Sessions'];
                  return [value, name];
                }}
              />
              <ReferenceLine
                y={85}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{
                  value: 'Deploy Ready',
                  position: 'right',
                  fill: '#22c55e',
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={70}
                stroke="#eab308"
                strokeDasharray="5 5"
                label={{
                  value: 'Warning',
                  position: 'right',
                  fill: '#eab308',
                  fontSize: 12,
                }}
              />
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
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#22c55e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Generate demo data
export function generateDemoData(days: number): DailyData[] {
  const data: DailyData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate realistic DRS with some variance and slight upward trend
    const baseScore = 78 + (days - i) * 0.1;
    const variance = (Math.random() - 0.5) * 15;
    const avgDRS = Math.min(100, Math.max(50, Math.round(baseScore + variance)));

    data.push({
      date: date.toISOString().split('T')[0],
      avgDRS,
      sessions: Math.floor(Math.random() * 8) + 3,
      hoursCodedAggregated: Math.floor(Math.random() * 20) + 5,
    });
  }

  return data;
}
