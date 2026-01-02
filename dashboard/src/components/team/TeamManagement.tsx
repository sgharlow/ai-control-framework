'use client';

import { useState } from 'react';
import {
  Users,
  UserPlus,
  Settings,
  Crown,
  Shield,
  User,
  Mail,
  Copy,
  Check,
  X,
  AlertCircle,
  Trash2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import type { Team, TeamMember } from '@/lib/database.types';

interface TeamMemberWithDetails extends TeamMember {
  email?: string;
  name?: string;
  avgDRS?: number;
  sessionsCount?: number;
}

interface TeamManagementProps {
  team: Team;
  members: TeamMemberWithDetails[];
  currentUserId: string;
  onInviteMember?: (email: string, role: TeamMember['role']) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  onUpdateMemberRole?: (memberId: string, role: TeamMember['role']) => Promise<void>;
  onUpdateTeam?: (updates: Partial<Team>) => Promise<void>;
  onLeaveTeam?: () => Promise<void>;
}

export function TeamManagement({
  team,
  members,
  currentUserId,
  onInviteMember,
  onRemoveMember,
  onUpdateMemberRole,
  onUpdateTeam,
  onLeaveTeam,
}: TeamManagementProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [teamName, setTeamName] = useState(team.name);

  const currentMember = members.find((m) => m.user_id === currentUserId);
  const isOwner = currentMember?.role === 'owner';
  const isAdmin = currentMember?.role === 'admin' || isOwner;
  const usedSeats = members.filter((m) => m.joined_at).length;
  const pendingInvites = members.filter((m) => !m.joined_at).length;

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    const styles = {
      owner: 'bg-yellow-100 text-yellow-700',
      admin: 'bg-blue-100 text-blue-700',
      member: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail || !onInviteMember) return;

    setLoading(true);
    setError(null);

    try {
      await onInviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember) return;
    if (!confirm('Are you sure you want to remove this member?')) return;

    setLoading(true);
    try {
      await onRemoveMember(memberId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamMember['role']) => {
    if (!onUpdateMemberRole) return;

    setLoading(true);
    try {
      await onUpdateMemberRole(memberId, newRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!onUpdateTeam || teamName === team.name) return;

    setLoading(true);
    try {
      await onUpdateTeam({ name: teamName });
      setShowSettingsModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${team.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-500">
                {usedSeats} of {team.seat_count} seats used
                {pendingInvites > 0 && ` • ${pendingInvites} pending`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                  disabled={usedSeats >= team.seat_count}
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
                {isOwner && (
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Seat Usage Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Seat Usage</span>
          <span className="font-medium text-gray-900">
            {usedSeats}/{team.seat_count}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              usedSeats >= team.seat_count ? 'bg-red-500' : 'bg-brand-500'
            }`}
            style={{ width: `${(usedSeats / team.seat_count) * 100}%` }}
          />
        </div>
        {usedSeats >= team.seat_count && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            All seats used. Upgrade to add more members.
          </p>
        )}
      </div>

      {/* Members List */}
      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <div
            key={member.id}
            className={`px-6 py-4 flex items-center gap-4 ${
              !member.joined_at ? 'bg-gray-50' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {getRoleIcon(member.role)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">
                  {member.name || member.email || 'Unknown'}
                </p>
                {getRoleBadge(member.role)}
                {!member.joined_at && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{member.email}</p>
            </div>

            {member.avgDRS !== undefined && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{member.avgDRS} DRS</p>
                <p className="text-xs text-gray-500">{member.sessionsCount || 0} sessions</p>
              </div>
            )}

            {isAdmin && member.user_id !== currentUserId && member.role !== 'owner' && (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <div className="py-1">
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleUpdateRole(member.id, 'admin')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Make Admin
                        </button>
                      )}
                      {member.role === 'admin' && (
                        <button
                          onClick={() => handleUpdateRole(member.id, 'member')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No team members yet</p>
          <p className="text-sm text-gray-400 mt-1">Invite your team to get started</p>
        </div>
      )}

      {/* Leave Team (for non-owners) */}
      {!isOwner && onLeaveTeam && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onLeaveTeam}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Leave Team
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="member">Member - Can view and track sessions</option>
                  <option value="admin">Admin - Can manage members and settings</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Or share invite link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${team.id}`}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-600"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="p-2 text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Team Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Subscription</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {team.plan.charAt(0).toUpperCase() + team.plan.slice(1)} Plan
                    </p>
                    <p className="text-xs text-gray-500">{team.seat_count} seats included</p>
                  </div>
                  <a
                    href="/billing"
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Manage
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={teamName === team.name || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo data for preview
export const demoTeam: Team = {
  id: 'team-1',
  name: 'Engineering Team',
  owner_id: 'user-1',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  plan: 'pro',
  seat_count: 10,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const demoMembers: TeamMemberWithDetails[] = [
  {
    id: 'member-1',
    team_id: 'team-1',
    user_id: 'user-1',
    role: 'owner',
    invited_at: '2025-01-01T00:00:00Z',
    joined_at: '2025-01-01T00:00:00Z',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avgDRS: 92,
    sessionsCount: 45,
  },
  {
    id: 'member-2',
    team_id: 'team-1',
    user_id: 'user-2',
    role: 'admin',
    invited_at: '2025-01-02T00:00:00Z',
    joined_at: '2025-01-02T00:00:00Z',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avgDRS: 88,
    sessionsCount: 32,
  },
  {
    id: 'member-3',
    team_id: 'team-1',
    user_id: 'user-3',
    role: 'member',
    invited_at: '2025-01-03T00:00:00Z',
    joined_at: '2025-01-03T00:00:00Z',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    avgDRS: 85,
    sessionsCount: 28,
  },
  {
    id: 'member-4',
    team_id: 'team-1',
    user_id: 'user-4',
    role: 'member',
    invited_at: '2025-01-05T00:00:00Z',
    joined_at: null,
    name: undefined,
    email: 'pending@example.com',
    avgDRS: undefined,
    sessionsCount: undefined,
  },
];
