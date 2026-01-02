'use client';

import {
  Users,
  TrendingUp,
  Target,
  Activity,
  Clock,
  Award,
  BarChart3,
} from 'lucide-react';

interface TeamStatsData {
  totalMembers: number;
  activeThisWeek: number;
  avgTeamDRS: number;
  drsChange: number;
  totalSessions: number;
  sessionsThisWeek: number;
  deploymentReadyPercent: number;
  topPerformer: {
    name: string;
    drs: number;
  } | null;
}

interface TeamStatsProps {
  stats: TeamStatsData;
}

export function TeamStats({ stats }: TeamStatsProps) {
  const statCards = [
    {
      label: 'Team Members',
      value: stats.totalMembers,
      subValue: `${stats.activeThisWeek} active this week`,
      icon: Users,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Average DRS',
      value: stats.avgTeamDRS,
      subValue: `${stats.drsChange >= 0 ? '+' : ''}${stats.drsChange}% from last week`,
      icon: Target,
      iconColor: stats.avgTeamDRS >= 85 ? 'text-green-500' : 'text-yellow-500',
      bgColor: stats.avgTeamDRS >= 85 ? 'bg-green-50' : 'bg-yellow-50',
      valueColor: stats.avgTeamDRS >= 85 ? 'text-green-600' : stats.avgTeamDRS >= 70 ? 'text-yellow-600' : 'text-red-600',
    },
    {
      label: 'Total Sessions',
      value: stats.totalSessions,
      subValue: `${stats.sessionsThisWeek} this week`,
      icon: Activity,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Deploy Ready',
      value: `${stats.deploymentReadyPercent}%`,
      subValue: 'of sessions reach 85+ DRS',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.valueColor || 'text-gray-900'}`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.subValue}</p>
            </div>
          );
        })}
      </div>

      {/* Top Performer Card */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">Top Performer This Week</p>
                <p className="text-lg font-bold text-gray-900">{stats.topPerformer.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">{stats.topPerformer.drs}</div>
              <p className="text-xs text-gray-500">Average DRS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo data for preview
export const demoTeamStats: TeamStatsData = {
  totalMembers: 8,
  activeThisWeek: 6,
  avgTeamDRS: 84,
  drsChange: 3,
  totalSessions: 156,
  sessionsThisWeek: 24,
  deploymentReadyPercent: 72,
  topPerformer: {
    name: 'Sarah Chen',
    drs: 92,
  },
};

// Team Activity Timeline Component
interface TeamActivityItem {
  id: string;
  type: 'session_completed' | 'member_joined' | 'drs_milestone' | 'deployment';
  user: string;
  message: string;
  timestamp: string;
  drsScore?: number;
}

interface TeamActivityProps {
  activities: TeamActivityItem[];
}

export function TeamActivity({ activities }: TeamActivityProps) {
  const getActivityIcon = (type: TeamActivityItem['type']) => {
    switch (type) {
      case 'session_completed':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'member_joined':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'drs_milestone':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'deployment':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-3 flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-full">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.message}
              </p>
              {activity.drsScore !== undefined && (
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                    activity.drsScore >= 85
                      ? 'bg-green-100 text-green-700'
                      : activity.drsScore >= 70
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  DRS: {activity.drsScore}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatTime(activity.timestamp)}
            </div>
          </div>
        ))}
      </div>
      {activities.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
}

export const demoActivities: TeamActivityItem[] = [
  {
    id: '1',
    type: 'session_completed',
    user: 'Sarah Chen',
    message: 'completed a session on user-api',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    drsScore: 94,
  },
  {
    id: '2',
    type: 'deployment',
    user: 'Marcus Johnson',
    message: 'deployed to production',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    drsScore: 88,
  },
  {
    id: '3',
    type: 'drs_milestone',
    user: 'Emily Rodriguez',
    message: 'achieved 10 consecutive 85+ DRS sessions',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: '4',
    type: 'member_joined',
    user: 'David Kim',
    message: 'joined the team',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '5',
    type: 'session_completed',
    user: 'Alex Thompson',
    message: 'completed a session on auth-service',
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    drsScore: 76,
  },
];
