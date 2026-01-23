'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { TeamManagement, demoTeam, demoMembers } from '@/components/team/TeamManagement';
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Activity,
  Target,
  Clock,
  Calendar,
  ChevronRight,
  Award,
} from 'lucide-react';
import type { Team, TeamMember } from '@/lib/database.types';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  avgDRS: number;
  sessionsCount: number;
  totalHours: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  streak: number;
}

// Demo leaderboard data
const leaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avgDRS: 92,
    sessionsCount: 45,
    totalHours: 78,
    trend: 'up',
    trendValue: 3.2,
    streak: 7,
  },
  {
    rank: 2,
    userId: 'user-2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avgDRS: 88,
    sessionsCount: 32,
    totalHours: 56,
    trend: 'up',
    trendValue: 1.5,
    streak: 4,
  },
  {
    rank: 3,
    userId: 'user-3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avgDRS: 85,
    sessionsCount: 28,
    totalHours: 42,
    trend: 'stable',
    trendValue: 0.2,
    streak: 2,
  },
  {
    rank: 4,
    userId: 'user-5',
    name: 'Alex Kim',
    email: 'alex@example.com',
    avgDRS: 82,
    sessionsCount: 22,
    totalHours: 35,
    trend: 'up',
    trendValue: 4.1,
    streak: 3,
  },
  {
    rank: 5,
    userId: 'user-6',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    avgDRS: 79,
    sessionsCount: 18,
    totalHours: 28,
    trend: 'down',
    trendValue: -2.3,
    streak: 0,
  },
];

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  avgTeamDRS: number;
  totalSessions: number;
  totalCodingHours: number;
  deployReadyRate: number;
}

const teamStats: TeamStats = {
  totalMembers: 5,
  activeMembers: 4,
  avgTeamDRS: 85,
  totalSessions: 145,
  totalCodingHours: 239,
  deployReadyRate: 72,
};

export default function TeamPage() {
  const [team] = useState<Team>(demoTeam);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'management'>('leaderboard');
  const currentUserId = 'user-1'; // Demo: current user

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">
            {rank}
          </span>
        );
    }
  };

  const getTrendIcon = (entry: LeaderboardEntry) => {
    switch (entry.trend) {
      case 'up':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">+{entry.trendValue.toFixed(1)}%</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">{entry.trendValue.toFixed(1)}%</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-gray-400">
            <Minus className="w-4 h-4" />
            <span className="text-xs font-medium">0%</span>
          </div>
        );
    }
  };

  return (
    <DashboardLayout userPlan="pro" userName="Sarah Chen" userEmail="sarah@example.com">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-500 mt-1">{team.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-100 rounded-full">
              PRO
            </span>
          </div>
        </div>

        {/* Team Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Members</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {teamStats.activeMembers}/{teamStats.totalMembers}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Avg Team DRS</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{teamStats.avgTeamDRS}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{teamStats.totalSessions}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Hours</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{teamStats.totalCodingHours}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Deploy Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{teamStats.deployReadyRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs">Top DRS</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(...leaderboardData.map((e) => e.avgDRS))}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </div>
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'management'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Management
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'leaderboard' ? (
          <div className="space-y-6">
            {/* Top 3 Podium */}
            <div className="bg-gradient-to-r from-brand-50 via-white to-brand-50 rounded-xl border border-brand-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Top Performers This Month
              </h3>
              <div className="flex items-end justify-center gap-4 md:gap-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 border-4 border-gray-300 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl md:text-2xl font-bold text-gray-600">
                      {leaderboardData[1].name.charAt(0)}
                    </span>
                  </div>
                  <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="font-medium text-gray-900 text-sm md:text-base">
                    {leaderboardData[1].name.split(' ')[0]}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-gray-700">
                    {leaderboardData[1].avgDRS}
                  </p>
                  <div className="h-16 md:h-20 w-20 md:w-24 bg-gray-200 rounded-t-lg mt-2" />
                </div>

                {/* 1st Place */}
                <div className="text-center -mt-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <span className="text-2xl md:text-3xl font-bold text-yellow-700">
                      {leaderboardData[0].name.charAt(0)}
                    </span>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                  <p className="font-medium text-gray-900">
                    {leaderboardData[0].name.split(' ')[0]}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-brand-600">
                    {leaderboardData[0].avgDRS}
                  </p>
                  <div className="h-24 md:h-28 w-20 md:w-24 bg-brand-500 rounded-t-lg mt-2" />
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-50 border-4 border-amber-400 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl md:text-2xl font-bold text-amber-700">
                      {leaderboardData[2].name.charAt(0)}
                    </span>
                  </div>
                  <Medal className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="font-medium text-gray-900 text-sm md:text-base">
                    {leaderboardData[2].name.split(' ')[0]}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-gray-700">
                    {leaderboardData[2].avgDRS}
                  </p>
                  <div className="h-12 md:h-14 w-20 md:w-24 bg-amber-400 rounded-t-lg mt-2" />
                </div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Full Rankings</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">This month</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                      entry.userId === currentUserId ? 'bg-brand-50/50' : ''
                    }`}
                  >
                    <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>

                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">
                        {entry.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{entry.name}</p>
                        {entry.userId === currentUserId && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 rounded-full">
                            You
                          </span>
                        )}
                        {entry.streak >= 5 && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {entry.streak} day streak
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{entry.email}</p>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">{entry.sessionsCount} sessions</p>
                      <p className="text-sm text-gray-500">{entry.totalHours}h coded</p>
                    </div>

                    <div className="w-24 text-right">
                      <p
                        className={`text-2xl font-bold ${
                          entry.avgDRS >= 85
                            ? 'text-green-600'
                            : entry.avgDRS >= 70
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {entry.avgDRS}
                      </p>
                      {getTrendIcon(entry)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Team Achievements</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">
                    Top Team DRS - January
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-full">
                  <Target className="w-5 h-5 text-brand-500" />
                  <span className="text-sm font-medium text-brand-700">
                    100% Deploy Rate Week
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700">
                    50 Sessions Milestone
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <Star className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Zero Contract Violations
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <TeamManagement
            team={team}
            members={demoMembers}
            currentUserId={currentUserId}
            onInviteMember={async (email, role) => {
              console.log('Invite:', email, role);
              // Demo - would call API
            }}
            onRemoveMember={async (memberId) => {
              console.log('Remove:', memberId);
              // Demo - would call API
            }}
            onUpdateMemberRole={async (memberId, role) => {
              console.log('Update role:', memberId, role);
              // Demo - would call API
            }}
            onUpdateTeam={async (updates) => {
              console.log('Update team:', updates);
              // Demo - would call API
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
