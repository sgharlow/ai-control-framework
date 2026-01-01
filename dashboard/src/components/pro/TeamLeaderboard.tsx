'use client';

import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avgDRS: number;
  sessionsThisWeek: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface TeamLeaderboardProps {
  members: TeamMember[];
  teamName: string;
}

export function TeamLeaderboard({ members, teamName }: TeamLeaderboardProps) {
  const sortedMembers = [...members].sort((a, b) => b.avgDRS - a.avgDRS);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 text-center text-gray-400 font-medium">{index + 1}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDRSColor = (drs: number) => {
    if (drs >= 85) return 'text-green-600 bg-green-100';
    if (drs >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Team Leaderboard</h3>
            <p className="text-sm text-gray-500">{teamName}</p>
          </div>
          <span className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-100 rounded-full">
            PRO
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedMembers.map((member, index) => (
          <div
            key={member.id}
            className={`px-6 py-4 flex items-center gap-4 ${
              index === 0 ? 'bg-yellow-50/50' : ''
            }`}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(index)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{member.name}</p>
              <p className="text-sm text-gray-500 truncate">{member.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {getTrendIcon(member.trend)}
              <span
                className={`text-xs ${
                  member.trend === 'up'
                    ? 'text-green-600'
                    : member.trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}
              >
                {member.trendValue > 0 ? '+' : ''}
                {member.trendValue}%
              </span>
            </div>

            <div className="text-right">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getDRSColor(
                  member.avgDRS
                )}`}
              >
                {member.avgDRS}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {member.sessionsThisWeek} sessions
              </p>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No team members yet</p>
          <p className="text-sm text-gray-400 mt-1">Invite your team to get started</p>
        </div>
      )}
    </div>
  );
}

// Demo data for preview
export const demoTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avgDRS: 92,
    sessionsThisWeek: 12,
    trend: 'up',
    trendValue: 5,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avgDRS: 88,
    sessionsThisWeek: 8,
    trend: 'up',
    trendValue: 3,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avgDRS: 85,
    sessionsThisWeek: 15,
    trend: 'stable',
    trendValue: 0,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    avgDRS: 78,
    sessionsThisWeek: 6,
    trend: 'down',
    trendValue: -4,
  },
  {
    id: '5',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    avgDRS: 72,
    sessionsThisWeek: 4,
    trend: 'down',
    trendValue: -8,
  },
];
