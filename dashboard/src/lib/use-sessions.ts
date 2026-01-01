'use client';

import { useState, useEffect } from 'react';
import { createClient } from './supabase';
import type { DRSSession } from './database.types';

// Demo data for when Supabase is not configured
const demoSessions: DRSSession[] = [
  {
    id: '1',
    user_id: null,
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
    metadata: null,
  },
  {
    id: '2',
    user_id: null,
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
    metadata: null,
  },
  {
    id: '3',
    user_id: null,
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
    metadata: null,
  },
  {
    id: '4',
    user_id: null,
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
    metadata: null,
  },
  {
    id: '5',
    user_id: null,
    project_name: 'test-coverage',
    drs_score: 85,
    session_duration_minutes: 45,
    files_changed: 5,
    lines_added: 312,
    lines_removed: 56,
    contracts_locked: true,
    mocks_cleared: true,
    tests_passing: true,
    evidence_captured: true,
    created_at: '2025-12-27T11:30:00Z',
    ended_at: '2025-12-27T12:15:00Z',
    metadata: null,
  },
];

interface UseSessionsResult {
  sessions: DRSSession[];
  loading: boolean;
  error: Error | null;
  isDemo: boolean;
  refetch: () => Promise<void>;
}

export function useSessions(limit = 50): UseSessionsResult {
  const [sessions, setSessions] = useState<DRSSession[]>(demoSessions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  const fetchSessions = async () => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured, using demo data');
      setLoading(false);
      setIsDemo(true);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('drs_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setSessions(data);
        setIsDemo(false);
      } else {
        // No data yet, use demo data
        setIsDemo(true);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Fall back to demo data on error
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [limit]);

  return {
    sessions,
    loading,
    error,
    isDemo,
    refetch: fetchSessions,
  };
}

export async function createSession(
  session: Omit<DRSSession, 'id' | 'created_at'>
): Promise<DRSSession | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, cannot create session');
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('drs_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return data;
}

export async function updateSession(
  id: string,
  updates: Partial<DRSSession>
): Promise<DRSSession | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, cannot update session');
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('drs_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return data;
}
