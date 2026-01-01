-- DRS Sessions Table
-- Tracks AI-assisted coding sessions with Deployability Rating Scores

CREATE TABLE IF NOT EXISTS drs_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  drs_score INTEGER NOT NULL CHECK (drs_score >= 0 AND drs_score <= 100),
  session_duration_minutes INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  contracts_locked BOOLEAN DEFAULT false,
  mocks_cleared BOOLEAN DEFAULT false,
  tests_passing BOOLEAN DEFAULT false,
  evidence_captured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  metadata JSONB
);

-- DRS Events Table
-- Tracks score changes within a session (for detailed analytics)

CREATE TABLE IF NOT EXISTS drs_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES drs_sessions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'check', 'gate_passed', 'warning', 'error'
  drs_score INTEGER NOT NULL,
  component_scores JSONB NOT NULL, -- All 13 component scores
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drs_sessions_user_id ON drs_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_drs_sessions_created_at ON drs_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drs_sessions_project ON drs_sessions(project_name);
CREATE INDEX IF NOT EXISTS idx_drs_events_session ON drs_events(session_id);
CREATE INDEX IF NOT EXISTS idx_drs_events_created ON drs_events(created_at);

-- Row Level Security
ALTER TABLE drs_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drs_events ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own sessions
-- Anonymous users can see demo data (user_id IS NULL)

CREATE POLICY "Users can view own sessions" ON drs_sessions
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own sessions" ON drs_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sessions" ON drs_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events" ON drs_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM drs_sessions
      WHERE drs_sessions.id = drs_events.session_id
      AND (drs_sessions.user_id = auth.uid() OR drs_sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert own events" ON drs_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM drs_sessions
      WHERE drs_sessions.id = drs_events.session_id
      AND (drs_sessions.user_id = auth.uid() OR drs_sessions.user_id IS NULL)
    )
  );

-- View for session statistics (Pro feature)
CREATE OR REPLACE VIEW drs_session_stats AS
SELECT
  user_id,
  COUNT(*) as total_sessions,
  ROUND(AVG(drs_score), 1) as avg_drs_score,
  MAX(drs_score) as best_score,
  SUM(session_duration_minutes) as total_minutes,
  SUM(files_changed) as total_files,
  SUM(lines_added) as total_lines,
  COUNT(*) FILTER (WHERE drs_score >= 85) as deploy_ready_count,
  ROUND(
    COUNT(*) FILTER (WHERE drs_score >= 85)::numeric / NULLIF(COUNT(*), 0) * 100,
    1
  ) as deploy_ready_pct
FROM drs_sessions
GROUP BY user_id;
