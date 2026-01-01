export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      drs_sessions: {
        Row: {
          id: string;
          user_id: string | null;
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
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          project_name: string;
          drs_score: number;
          session_duration_minutes?: number;
          files_changed?: number;
          lines_added?: number;
          lines_removed?: number;
          contracts_locked?: boolean;
          mocks_cleared?: boolean;
          tests_passing?: boolean;
          evidence_captured?: boolean;
          created_at?: string;
          ended_at?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          project_name?: string;
          drs_score?: number;
          session_duration_minutes?: number;
          files_changed?: number;
          lines_added?: number;
          lines_removed?: number;
          contracts_locked?: boolean;
          mocks_cleared?: boolean;
          tests_passing?: boolean;
          evidence_captured?: boolean;
          created_at?: string;
          ended_at?: string | null;
          metadata?: Json | null;
        };
      };
      drs_events: {
        Row: {
          id: string;
          session_id: string;
          event_type: string;
          drs_score: number;
          component_scores: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          event_type: string;
          drs_score: number;
          component_scores: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          event_type?: string;
          drs_score?: number;
          component_scores?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type DRSSession = Database['public']['Tables']['drs_sessions']['Row'];
export type DRSEvent = Database['public']['Tables']['drs_events']['Row'];

// Pro tier types
export interface Team {
  id: string;
  name: string;
  owner_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  seat_count: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_at: string;
  joined_at: string | null;
}

export interface LicenseKey {
  id: string;
  key: string;
  user_id: string | null;
  team_id: string | null;
  plan: 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'revoked';
  expires_at: string | null;
  activated_at: string;
  created_at: string;
}

export interface StripeEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed_at: string;
  payload: Json | null;
  error: string | null;
}
