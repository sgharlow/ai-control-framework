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
} from 'recharts';

interface Session {
  id: string;
  project_name: string;
  drs_score: number;
  created_at: string;
}

interface DRSChartProps {
  sessions: Session[];
}

export function DRSChart({ sessions }: DRSChartProps) {
  const chartData = sessions
    .slice()
    .reverse()
    .map((session) => ({
      date: new Date(session.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      drs: session.drs_score,
      project: session.project_name,
    }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-gray-900">{data.project}</p>
                    <p className="text-sm text-gray-500">{data.date}</p>
                    <p
                      className={`text-lg font-bold ${
                        data.drs >= 85
                          ? 'text-green-600'
                          : data.drs >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      DRS: {data.drs}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine
            y={85}
            stroke="#22c55e"
            strokeDasharray="5 5"
            label={{
              value: 'Deploy Ready (85)',
              position: 'right',
              fill: '#22c55e',
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="drs"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#16a34a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
