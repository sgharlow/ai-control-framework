'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCode,
  Clock,
  GitBranch,
  Download,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface Session {
  id: string;
  project_name: string;
  drs_score: number;
  session_duration_minutes: number;
  files_changed: number;
  lines_added: number;
  lines_removed: number;
  contracts_locked: boolean;
  mocks_cleared: boolean;
  tests_passing: boolean;
  evidence_captured: boolean;
  created_at: string;
  ended_at: string | null;
  component_scores?: {
    contract_integrity: number;
    behavioral_contracts: number;
    security_validation: number;
    data_integrity: number;
    no_mocks: number;
    tests_passing: number;
    integration_evidence: number;
    architecture_stability: number;
    production_readiness: number;
    context_preservation: number;
    error_handling: number;
    scope_compliance: number;
    documentation: number;
  };
}

// Demo data
const demoSessions: Session[] = [
  {
    id: '1',
    project_name: 'user-auth-feature',
    drs_score: 92,
    session_duration_minutes: 85,
    files_changed: 4,
    lines_added: 156,
    lines_removed: 23,
    contracts_locked: true,
    mocks_cleared: true,
    tests_passing: true,
    evidence_captured: true,
    created_at: '2025-12-31T10:30:00Z',
    ended_at: '2025-12-31T11:55:00Z',
    component_scores: {
      contract_integrity: 7,
      behavioral_contracts: 7,
      security_validation: 14,
      data_integrity: 8,
      no_mocks: 7,
      tests_passing: 7,
      integration_evidence: 9,
      architecture_stability: 7,
      production_readiness: 12,
      context_preservation: 6,
      error_handling: 4,
      scope_compliance: 4,
      documentation: 0,
    },
  },
  {
    id: '2',
    project_name: 'api-refactor',
    drs_score: 78,
    session_duration_minutes: 120,
    files_changed: 6,
    lines_added: 234,
    lines_removed: 89,
    contracts_locked: true,
    mocks_cleared: false,
    tests_passing: true,
    evidence_captured: true,
    created_at: '2025-12-30T14:15:00Z',
    ended_at: '2025-12-30T16:15:00Z',
    component_scores: {
      contract_integrity: 7,
      behavioral_contracts: 6,
      security_validation: 12,
      data_integrity: 7,
      no_mocks: 3,
      tests_passing: 7,
      integration_evidence: 7,
      architecture_stability: 6,
      production_readiness: 10,
      context_preservation: 5,
      error_handling: 4,
      scope_compliance: 4,
      documentation: 0,
    },
  },
  {
    id: '3',
    project_name: 'payment-integration',
    drs_score: 88,
    session_duration_minutes: 95,
    files_changed: 3,
    lines_added: 89,
    lines_removed: 12,
    contracts_locked: true,
    mocks_cleared: true,
    tests_passing: true,
    evidence_captured: false,
    created_at: '2025-12-29T09:45:00Z',
    ended_at: '2025-12-29T11:20:00Z',
    component_scores: {
      contract_integrity: 7,
      behavioral_contracts: 7,
      security_validation: 14,
      data_integrity: 8,
      no_mocks: 7,
      tests_passing: 7,
      integration_evidence: 6,
      architecture_stability: 7,
      production_readiness: 11,
      context_preservation: 6,
      error_handling: 4,
      scope_compliance: 4,
      documentation: 0,
    },
  },
  {
    id: '4',
    project_name: 'dashboard-ui',
    drs_score: 95,
    session_duration_minutes: 60,
    files_changed: 2,
    lines_added: 145,
    lines_removed: 34,
    contracts_locked: true,
    mocks_cleared: true,
    tests_passing: true,
    evidence_captured: true,
    created_at: '2025-12-28T16:00:00Z',
    ended_at: '2025-12-28T17:00:00Z',
    component_scores: {
      contract_integrity: 7,
      behavioral_contracts: 7,
      security_validation: 16,
      data_integrity: 9,
      no_mocks: 7,
      tests_passing: 7,
      integration_evidence: 9,
      architecture_stability: 7,
      production_readiness: 12,
      context_preservation: 6,
      error_handling: 4,
      scope_compliance: 4,
      documentation: 0,
    },
  },
  {
    id: '5',
    project_name: 'test-coverage',
    drs_score: 85,
    session_duration_minutes: 45,
    files_changed: 5,
    lines_added: 312,
    lines_removed: 45,
    contracts_locked: true,
    mocks_cleared: true,
    tests_passing: false,
    evidence_captured: true,
    created_at: '2025-12-27T11:30:00Z',
    ended_at: '2025-12-27T12:15:00Z',
    component_scores: {
      contract_integrity: 7,
      behavioral_contracts: 7,
      security_validation: 14,
      data_integrity: 8,
      no_mocks: 7,
      tests_passing: 4,
      integration_evidence: 8,
      architecture_stability: 6,
      production_readiness: 10,
      context_preservation: 6,
      error_handling: 4,
      scope_compliance: 4,
      documentation: 0,
    },
  },
  {
    id: '6',
    project_name: 'notification-service',
    drs_score: 72,
    session_duration_minutes: 110,
    files_changed: 7,
    lines_added: 289,
    lines_removed: 67,
    contracts_locked: false,
    mocks_cleared: true,
    tests_passing: true,
    evidence_captured: true,
    created_at: '2025-12-26T13:00:00Z',
    ended_at: '2025-12-26T14:50:00Z',
    component_scores: {
      contract_integrity: 4,
      behavioral_contracts: 5,
      security_validation: 12,
      data_integrity: 7,
      no_mocks: 7,
      tests_passing: 7,
      integration_evidence: 6,
      architecture_stability: 5,
      production_readiness: 9,
      context_preservation: 5,
      error_handling: 3,
      scope_compliance: 2,
      documentation: 0,
    },
  },
  {
    id: '7',
    project_name: 'cache-layer',
    drs_score: 65,
    session_duration_minutes: 140,
    files_changed: 8,
    lines_added: 456,
    lines_removed: 123,
    contracts_locked: false,
    mocks_cleared: false,
    tests_passing: false,
    evidence_captured: false,
    created_at: '2025-12-25T10:00:00Z',
    ended_at: '2025-12-25T12:20:00Z',
    component_scores: {
      contract_integrity: 3,
      behavioral_contracts: 4,
      security_validation: 10,
      data_integrity: 6,
      no_mocks: 3,
      tests_passing: 3,
      integration_evidence: 5,
      architecture_stability: 5,
      production_readiness: 8,
      context_preservation: 5,
      error_handling: 3,
      scope_compliance: 2,
      documentation: 0,
    },
  },
];

type SortField = 'drs_score' | 'created_at' | 'session_duration_minutes' | 'files_changed';
type SortDirection = 'asc' | 'desc';
type DRSFilter = 'all' | 'deploy-ready' | 'warning' | 'critical';

export default function SessionsPage() {
  const [sessions] = useState<Session[]>(demoSessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [drsFilter, setDrsFilter] = useState<DRSFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedSessions = useMemo(() => {
    let result = [...sessions];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.project_name.toLowerCase().includes(query)
      );
    }

    // Apply DRS filter
    if (drsFilter !== 'all') {
      result = result.filter((s) => {
        if (drsFilter === 'deploy-ready') return s.drs_score >= 85;
        if (drsFilter === 'warning') return s.drs_score >= 70 && s.drs_score < 85;
        if (drsFilter === 'critical') return s.drs_score < 70;
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'drs_score':
          comparison = a.drs_score - b.drs_score;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'session_duration_minutes':
          comparison = a.session_duration_minutes - b.session_duration_minutes;
          break;
        case 'files_changed':
          comparison = a.files_changed - b.files_changed;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [sessions, searchQuery, drsFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const getDRSBadge = (score: number) => {
    if (score >= 85) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3.5 h-3.5" />
          {score}
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3.5 h-3.5" />
          {score}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <XCircle className="w-3.5 h-3.5" />
        {score}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Project', 'DRS Score', 'Duration (min)', 'Files Changed', 'Lines Added', 'Lines Removed', 'Date'];
    const rows = filteredAndSortedSessions.map((s) => [
      s.project_name,
      s.drs_score,
      s.session_duration_minutes,
      s.files_changed,
      s.lines_added,
      s.lines_removed,
      new Date(s.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drs-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout userPlan="pro" userName="Sarah Chen" userEmail="sarah@example.com">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
            <p className="text-gray-500 mt-1">
              View and analyze your DRS coding sessions
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* DRS Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">DRS Status:</span>
              <div className="flex gap-1">
                {(['all', 'deploy-ready', 'warning', 'critical'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDrsFilter(filter)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      drsFilter === filter
                        ? filter === 'deploy-ready'
                          ? 'bg-green-100 text-green-700'
                          : filter === 'warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : filter === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-brand-100 text-brand-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'deploy-ready' ? '85+' : filter === 'warning' ? '70-84' : '<70'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredAndSortedSessions.length} of {sessions.length} sessions
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Project
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('drs_score')}
                  >
                    <div className="flex items-center gap-1">
                      DRS
                      <SortIcon field="drs_score" />
                    </div>
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('session_duration_minutes')}
                  >
                    <div className="flex items-center gap-1">
                      Duration
                      <SortIcon field="session_duration_minutes" />
                    </div>
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('files_changed')}
                  >
                    <div className="flex items-center gap-1">
                      Changes
                      <SortIcon field="files_changed" />
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th
                    className="text-left px-6 py-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <GitBranch className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {session.project_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getDRSBadge(session.drs_score)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{session.session_duration_minutes}m</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileCode className="w-4 h-4" />
                        <span>{session.files_changed} files</span>
                        <span className="text-green-600">+{session.lines_added}</span>
                        <span className="text-red-500">-{session.lines_removed}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {session.contracts_locked && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Contracts Locked" />
                        )}
                        {session.mocks_cleared && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full" title="Mocks Cleared" />
                        )}
                        {session.tests_passing && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full" title="Tests Passing" />
                        )}
                        {session.evidence_captured && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full" title="Evidence Captured" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedSessions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sessions found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="font-medium">Status indicators:</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Contracts Locked</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Mocks Cleared</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            <span>Tests Passing</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>Evidence Captured</span>
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Session Details
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedSession.project_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* DRS Score */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">DRS Score</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {selectedSession.drs_score}
                  </p>
                </div>
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    selectedSession.drs_score >= 85
                      ? 'bg-green-100'
                      : selectedSession.drs_score >= 70
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}
                >
                  {selectedSession.drs_score >= 85 ? (
                    <CheckCircle
                      className={`w-10 h-10 ${
                        selectedSession.drs_score >= 85
                          ? 'text-green-600'
                          : selectedSession.drs_score >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    />
                  ) : selectedSession.drs_score >= 70 ? (
                    <AlertCircle className="w-10 h-10 text-yellow-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {selectedSession.session_duration_minutes}m
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Files Changed</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {selectedSession.files_changed}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Lines Added</p>
                  <p className="text-xl font-semibold text-green-600">
                    +{selectedSession.lines_added}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Lines Removed</p>
                  <p className="text-xl font-semibold text-red-500">
                    -{selectedSession.lines_removed}
                  </p>
                </div>
              </div>

              {/* Compliance Checks */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Compliance Checks
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      selectedSession.contracts_locked
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {selectedSession.contracts_locked ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">Contracts Locked</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      selectedSession.mocks_cleared
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {selectedSession.mocks_cleared ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">Mocks Cleared</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      selectedSession.tests_passing
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {selectedSession.tests_passing ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">Tests Passing</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      selectedSession.evidence_captured
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {selectedSession.evidence_captured ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">Evidence Captured</span>
                  </div>
                </div>
              </div>

              {/* Component Scores */}
              {selectedSession.component_scores && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Component Scores
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedSession.component_scores).map(
                      ([key, value]) => {
                        const maxScores: Record<string, number> = {
                          contract_integrity: 7,
                          behavioral_contracts: 7,
                          security_validation: 16,
                          data_integrity: 9,
                          no_mocks: 7,
                          tests_passing: 7,
                          integration_evidence: 9,
                          architecture_stability: 7,
                          production_readiness: 14,
                          context_preservation: 7,
                          error_handling: 4,
                          scope_compliance: 4,
                          documentation: 2,
                        };
                        const maxScore = maxScores[key] || 10;
                        const percentage = (value / maxScore) * 100;
                        const label = key
                          .split('_')
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(' ');

                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 w-40 truncate">
                              {label}
                            </span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentage >= 80
                                    ? 'bg-green-500'
                                    : percentage >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-16 text-right">
                              {value}/{maxScore}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Started: {new Date(selectedSession.created_at).toLocaleString()}</span>
                  {selectedSession.ended_at && (
                    <span>Ended: {new Date(selectedSession.ended_at).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
