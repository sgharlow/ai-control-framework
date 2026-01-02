'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieChartIcon, Info } from 'lucide-react';

interface DRSComponent {
  name: string;
  score: number;
  maxPoints: number;
  description: string;
}

interface DRSBreakdownChartProps {
  components: DRSComponent[];
  totalScore: number;
}

const COMPONENT_COLORS = {
  'Contract Integrity': '#22c55e',
  'Behavioral Contracts': '#16a34a',
  'Security Validation': '#ef4444',
  'Data Integrity': '#3b82f6',
  'No Mocks': '#8b5cf6',
  'Tests Passing': '#06b6d4',
  'Integration Evidence': '#f59e0b',
  'Architecture Stability': '#ec4899',
  'Production Readiness': '#10b981',
  'Context Preservation': '#6366f1',
  'Error Handling': '#f97316',
  'Scope Compliance': '#14b8a6',
  Documentation: '#a855f7',
};

const DEFAULT_COLOR = '#9ca3af';

export function DRSBreakdownChart({
  components,
  totalScore,
}: DRSBreakdownChartProps) {
  const chartData = components.map((comp) => ({
    name: comp.name,
    value: comp.score,
    maxValue: comp.maxPoints,
    percentage: Math.round((comp.score / comp.maxPoints) * 100),
    description: comp.description,
    fill:
      COMPONENT_COLORS[comp.name as keyof typeof COMPONENT_COLORS] ||
      DEFAULT_COLOR,
  }));

  // Calculate categories
  const security = components
    .filter((c) =>
      ['Security Validation', 'Data Integrity', 'Error Handling'].includes(
        c.name
      )
    )
    .reduce((sum, c) => sum + c.score, 0);
  const quality = components
    .filter((c) =>
      ['Tests Passing', 'Integration Evidence', 'No Mocks'].includes(c.name)
    )
    .reduce((sum, c) => sum + c.score, 0);
  const architecture = components
    .filter((c) =>
      [
        'Contract Integrity',
        'Behavioral Contracts',
        'Architecture Stability',
      ].includes(c.name)
    )
    .reduce((sum, c) => sum + c.score, 0);
  const operations = components
    .filter((c) =>
      [
        'Production Readiness',
        'Context Preservation',
        'Scope Compliance',
        'Documentation',
      ].includes(c.name)
    )
    .reduce((sum, c) => sum + c.score, 0);

  const categoryData = [
    { name: 'Security', value: security, color: '#ef4444' },
    { name: 'Quality', value: quality, color: '#3b82f6' },
    { name: 'Architecture', value: architecture, color: '#22c55e' },
    { name: 'Operations', value: operations, color: '#f59e0b' },
  ];

  const getScoreColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              DRS Component Breakdown
            </h3>
            <p className="text-sm text-gray-500">Score distribution by area</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Category Overview */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {categoryData.map((cat) => (
            <div key={cat.name} className="text-center p-3 bg-gray-50 rounded-lg">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: cat.color }}
              />
              <p className="text-xs text-gray-500">{cat.name}</p>
              <p className="text-lg font-bold text-gray-900">{cat.value}</p>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-gray-900">{data.name}</p>
                        <p className="text-lg font-bold" style={{ color: data.color }}>
                          {data.value} points
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Center label */}
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-bold"
                fill="#111827"
              >
                {totalScore}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm"
                fill="#6b7280"
              >
                / 100
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Component Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Info className="w-4 h-4" />
            <span>Individual component scores</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {chartData.map((comp) => (
              <div
                key={comp.name}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: comp.fill }}
                  />
                  <span className="text-sm text-gray-700 truncate max-w-32">
                    {comp.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comp.value}/{comp.maxValue}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(
                      comp.percentage
                    )}`}
                  >
                    {comp.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default DRS components with weights from the framework
export const DEFAULT_DRS_COMPONENTS: DRSComponent[] = [
  { name: 'Contract Integrity', score: 7, maxPoints: 7, description: 'Frozen contracts, no unauthorized changes' },
  { name: 'Behavioral Contracts', score: 7, maxPoints: 7, description: 'Input/output contracts respected' },
  { name: 'Security Validation', score: 16, maxPoints: 16, description: 'Security checks passing' },
  { name: 'Data Integrity', score: 9, maxPoints: 9, description: 'Data validation and consistency' },
  { name: 'No Mocks', score: 7, maxPoints: 7, description: 'Real services, no mocks after 30min' },
  { name: 'Tests Passing', score: 7, maxPoints: 7, description: 'All tests green' },
  { name: 'Integration Evidence', score: 9, maxPoints: 9, description: 'Proof of real integrations' },
  { name: 'Architecture Stability', score: 7, maxPoints: 7, description: 'No drift from design' },
  { name: 'Production Readiness', score: 14, maxPoints: 14, description: 'Ready for deployment' },
  { name: 'Context Preservation', score: 7, maxPoints: 7, description: 'Context maintained across sessions' },
  { name: 'Error Handling', score: 4, maxPoints: 4, description: 'Graceful error management' },
  { name: 'Scope Compliance', score: 4, maxPoints: 4, description: 'Within scope limits' },
  { name: 'Documentation', score: 2, maxPoints: 2, description: 'Code documented appropriately' },
];
