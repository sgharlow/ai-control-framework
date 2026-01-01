import { Target, Activity, Clock, CheckCircle2 } from 'lucide-react';

interface StatsCardsProps {
  avgDRS: number;
  totalSessions: number;
  totalHours: number;
  deployReady: number;
}

export function StatsCards({
  avgDRS,
  totalSessions,
  totalHours,
  deployReady,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Average DRS',
      value: avgDRS,
      suffix: '',
      icon: Target,
      color:
        avgDRS >= 85
          ? 'text-green-600'
          : avgDRS >= 70
          ? 'text-yellow-600'
          : 'text-red-600',
      bg:
        avgDRS >= 85
          ? 'bg-green-100'
          : avgDRS >= 70
          ? 'bg-yellow-100'
          : 'bg-red-100',
    },
    {
      label: 'Total Sessions',
      value: totalSessions,
      suffix: '',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Hours Coded',
      value: totalHours,
      suffix: 'h',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Deploy Ready',
      value: deployReady,
      suffix: '',
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
                {stat.suffix}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
