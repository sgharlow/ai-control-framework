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
