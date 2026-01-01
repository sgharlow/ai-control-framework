'use client';

import { useState } from 'react';
import { DRSChart } from '@/components/DRSChart';
import { SessionList } from '@/components/SessionList';
import { StatsCards } from '@/components/StatsCards';
import { Activity, BarChart3, Clock, Target } from 'lucide-react';

// Demo data for initial display
const demoSessions = [
  {
    id: '1',
    project_name: 'user-auth-feature',
    drs_score: 92,
    session_duration_minutes: 85,
    files_changed: 4,
    lines_added: 156,
    created_at: '2025-12-31T10:30:00Z',
  },
  {
    id: '2',
    project_name: 'api-refactor',
    drs_score: 78,
    session_duration_minutes: 120,
    files_changed: 6,
    lines_added: 234,
    created_at: '2025-12-30T14:15:00Z',
  },
  {
    id: '3',
    project_name: 'payment-integration',
    drs_score: 88,
    session_duration_minutes: 95,
    files_changed: 3,
    lines_added: 89,
    created_at: '2025-12-29T09:45:00Z',
  },
  {
    id: '4',
    project_name: 'dashboard-ui',
    drs_score: 95,
    session_duration_minutes: 60,
    files_changed: 2,
    lines_added: 145,
    created_at: '2025-12-28T16:00:00Z',
  },
  {
    id: '5',
    project_name: 'test-coverage',
    drs_score: 85,
    session_duration_minutes: 45,
    files_changed: 5,
    lines_added: 312,
    created_at: '2025-12-27T11:30:00Z',
  },
];

export default function Dashboard() {
  const [sessions] = useState(demoSessions);

  const avgDRS = Math.round(
    sessions.reduce((sum, s) => sum + s.drs_score, 0) / sessions.length
  );
  const totalSessions = sessions.length;
  const totalHours = Math.round(
    sessions.reduce((sum, s) => sum + s.session_duration_minutes, 0) / 60
  );
  const deployReady = sessions.filter((s) => s.drs_score >= 85).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  AI Control Dashboard
                </h1>
                <p className="text-sm text-gray-500">DRS Tracking & Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-brand-100 text-brand-700 text-sm font-medium rounded-full">
                Free Tier
              </span>
              <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards
          avgDRS={avgDRS}
          totalSessions={totalSessions}
          totalHours={totalHours}
          deployReady={deployReady}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                DRS Trend (Last 7 Days)
              </h2>
            </div>
            <DRSChart sessions={sessions} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Session Activity
              </h2>
            </div>
            <div className="space-y-4">
              {sessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.project_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      session.drs_score >= 85
                        ? 'text-brand-600'
                        : session.drs_score >= 70
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {session.drs_score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="mt-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Session History
                </h2>
              </div>
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                Export CSV
              </button>
            </div>
            <SessionList sessions={sessions} />
          </div>
        </div>

        {/* Pro Features Teaser */}
        <div className="mt-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Unlock Pro Features</h2>
          <p className="text-brand-100 mb-4">
            Get team analytics, Slack/Discord alerts, custom patterns, and
            priority support.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              Team Leaderboard
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              DRS Alerts
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              30-Day Trends
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              Custom Reports
            </span>
          </div>
          <button className="mt-4 px-6 py-2 bg-white text-brand-600 rounded-lg font-medium hover:bg-brand-50 transition-colors">
            Upgrade for $29/month
          </button>
        </div>
      </main>
    </div>
  );
}
