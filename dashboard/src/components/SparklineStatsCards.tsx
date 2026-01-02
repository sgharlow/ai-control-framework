'use client';

import { Target, Activity, Clock, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface DayData {
  date: string;
  value: number;
}

interface SparklineStat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  sparklineData: DayData[];
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface SparklineStatsCardsProps {
  avgDRS: number;
  totalSessions: number;
  totalHours: number;
  deployReady: number;
  historicalData: {
    drs: DayData[];
    sessions: DayData[];
    hours: DayData[];
    deployReady: DayData[];
  };
}

function Sparkline({ data, color }: { data: DayData[]; color: string }) {
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function calculateTrend(data: DayData[]): { direction: 'up' | 'down' | 'stable'; value: number } {
  if (data.length < 2) return { direction: 'stable', value: 0 };

  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;

  const change = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  if (change > 3) return { direction: 'up', value: change };
  if (change < -3) return { direction: 'down', value: change };
  return { direction: 'stable', value: change };
}

export function SparklineStatsCards({
  avgDRS,
  totalSessions,
  totalHours,
  deployReady,
  historicalData,
}: SparklineStatsCardsProps) {
  const drsTrend = calculateTrend(historicalData.drs);
  const sessionsTrend = calculateTrend(historicalData.sessions);
  const hoursTrend = calculateTrend(historicalData.hours);
  const deployTrend = calculateTrend(historicalData.deployReady);

  const stats: SparklineStat[] = [
    {
      label: 'Average DRS',
      value: avgDRS,
      suffix: '',
      icon: Target,
      color: avgDRS >= 85 ? '#22c55e' : avgDRS >= 70 ? '#eab308' : '#ef4444',
      bg: avgDRS >= 85 ? 'bg-green-100' : avgDRS >= 70 ? 'bg-yellow-100' : 'bg-red-100',
      sparklineData: historicalData.drs,
      trend: drsTrend.direction,
      trendValue: drsTrend.value,
    },
    {
      label: 'Total Sessions',
      value: totalSessions,
      suffix: '',
      icon: Activity,
      color: '#3b82f6',
      bg: 'bg-blue-100',
      sparklineData: historicalData.sessions,
      trend: sessionsTrend.direction,
      trendValue: sessionsTrend.value,
    },
    {
      label: 'Hours Coded',
      value: totalHours,
      suffix: 'h',
      icon: Clock,
      color: '#8b5cf6',
      bg: 'bg-purple-100',
      sparklineData: historicalData.hours,
      trend: hoursTrend.direction,
      trendValue: hoursTrend.value,
    },
    {
      label: 'Deploy Ready',
      value: deployReady,
      suffix: '',
      icon: CheckCircle2,
      color: '#22c55e',
      bg: 'bg-green-100',
      sparklineData: historicalData.deployReady,
      trend: deployTrend.direction,
      trendValue: deployTrend.value,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                  {stat.suffix}
                </span>
                {stat.trend !== 'stable' && (
                  <span
                    className={`flex items-center text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {Math.abs(stat.trendValue).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Last 7 days</span>
              <Sparkline data={stat.sparklineData.slice(-7)} color={stat.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Generate sample historical data for demo
export function generateHistoricalData(days: number = 7) {
  const now = new Date();

  const generateDayData = (baseValue: number, variance: number): DayData[] => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue + (Math.random() - 0.5) * variance * 2),
      };
    });
  };

  return {
    drs: generateDayData(82, 8),
    sessions: generateDayData(5, 3),
    hours: generateDayData(12, 4),
    deployReady: generateDayData(75, 15),
  };
}
