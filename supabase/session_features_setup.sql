-- ============================================
-- SESSION FEATURES SETUP SCRIPT
-- Run this entire script in Supabase SQL Editor
-- Creates all tables needed for session features:
-- - Assessments (quizzes)
-- - Session turns (conversation tracking)
-- - Audio chunks (recording storage)
-- - Agent analysis (multi-agentic reports)
-- - Manager feedback
-- - Analytics presets
-- - Integrations
-- ============================================

-- ============================================
-- STEP 1: Session Assessments (Quizzes)
-- ============================================

-- Assessment questions per scenario
CREATE TABLE IF NOT EXISTS scenario_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple-choice', 'true-false', 'open-ended')),
  options jsonb, -- For multiple choice: ["option1", "option2", ...]
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1 CHECK (points > 0),
  order_index integer DEFAULT 0 CHECK (order_index >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenario_assessments_scenario_id ON scenario_assessments(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_assessments_order ON scenario_assessments(scenario_id, order_index);

-- User answers to assessments
CREATE TABLE IF NOT EXISTS session_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES scenario_assessments(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  is_correct boolean NOT NULL,
  points_earned integer DEFAULT 0 CHECK (points_earned >= 0),
  time_taken_seconds integer CHECK (time_taken_seconds >= 0),
  answered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, assessment_id)
);

CREATE INDEX IF NOT EXISTS idx_session_assessments_session_id ON session_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_assessments_assessment_id ON session_assessments(assessment_id);

-- ============================================
-- STEP 2: Session Turns (Conversation Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS session_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  turn_number integer NOT NULL CHECK (turn_number > 0),
  speaker text NOT NULL CHECK (speaker IN ('user', 'ai-coach', 'client', 'system')),
  message text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metrics jsonb, -- {sentiment: 'positive', pacing: 145, clarity: 92, empathy: 75}
  audio_chunk_id uuid, -- Reference to audio chunk if available
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, turn_number)
);

CREATE INDEX IF NOT EXISTS idx_session_turns_session_id ON session_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_session_turns_timestamp ON session_turns(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_session_turns_speaker ON session_turns(session_id, speaker);

-- ============================================
-- STEP 3: Session Audio Chunks (Recording Storage)
-- ============================================

CREATE TABLE IF NOT EXISTS session_audio_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  chunk_number integer NOT NULL CHECK (chunk_number >= 0),
  audio_url text NOT NULL, -- Supabase Storage URL
  transcript text,
  duration_seconds decimal(5,2) CHECK (duration_seconds >= 0),
  file_size_bytes integer CHECK (file_size_bytes >= 0),
  mime_type text DEFAULT 'audio/webm',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_audio_chunks_session_id ON session_audio_chunks(session_id);
CREATE INDEX IF NOT EXISTS idx_session_audio_chunks_chunk_number ON session_audio_chunks(session_id, chunk_number);

-- ============================================
-- STEP 4: Session Agent Analysis (Multi-Agentic Reports)
-- ============================================

CREATE TABLE IF NOT EXISTS session_agent_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  agent_type text NOT NULL CHECK (agent_type IN ('empathy', 'compliance', 'pacing', 'tone', 'clarity', 'objection-handling')),
  score decimal(5,2) CHECK (score >= 0 AND score <= 100),
  analysis_data jsonb NOT NULL, -- Full analysis data
  findings jsonb, -- Array of findings: [{type: 'positive', text: '...'}, ...]
  recommendations text,
  chart_data jsonb, -- For charts (e.g., empathy over time)
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, agent_type)
);

CREATE INDEX IF NOT EXISTS idx_session_agent_analysis_session_id ON session_agent_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_session_agent_analysis_agent_type ON session_agent_analysis(agent_type);
CREATE INDEX IF NOT EXISTS idx_session_agent_analysis_score ON session_agent_analysis(session_id, score DESC);

-- ============================================
-- STEP 5: Manager Feedback
-- ============================================

CREATE TABLE IF NOT EXISTS manager_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_type text CHECK (feedback_type IN ('positive', 'constructive', 'critical')),
  tags text[], -- ['strength', 'improvement', 'compliance']
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manager_feedback_session_id ON manager_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_manager_feedback_manager_id ON manager_feedback(manager_id);

-- ============================================
-- STEP 6: Analytics Presets
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL, -- {employee: 'all', timePeriod: 'month', scenario: 'all'}
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_presets_user_id ON analytics_presets(user_id);

-- ============================================
-- STEP 7: Integrations Catalog
-- ============================================

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  brand_color text,
  category text NOT NULL CHECK (category IN ('communication', 'productivity', 'servers-apis', 'storage')),
  is_pro boolean DEFAULT false,
  oauth_config jsonb, -- OAuth configuration
  api_config jsonb, -- API configuration
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);

-- ============================================
-- STEP 8: User Integrations (Connected Integrations)
-- ============================================

CREATE TABLE IF NOT EXISTS user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('connected', 'disconnected', 'error', 'pending')) DEFAULT 'pending',
  access_token text, -- Encrypted token
  refresh_token text, -- Encrypted token
  token_expires_at timestamptz,
  settings jsonb DEFAULT '{}'::jsonb, -- Integration-specific settings
  last_sync_at timestamptz,
  error_message text,
  connected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, integration_id)
);

CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_status ON user_integrations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_integrations_integration_id ON user_integrations(integration_id);

-- ============================================
-- STEP 9: Enhance Sessions Table (if needed)
-- ============================================

DO $$
BEGIN
  -- Add fields if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'current_turn') THEN
    ALTER TABLE sessions ADD COLUMN current_turn INTEGER DEFAULT 0 CHECK (current_turn >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'total_turns') THEN
    ALTER TABLE sessions ADD COLUMN total_turns INTEGER DEFAULT 0 CHECK (total_turns >= 0);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'assessment_score') THEN
    ALTER TABLE sessions ADD COLUMN assessment_score INTEGER CHECK (assessment_score >= 0 AND assessment_score <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'assessment_completed') THEN
    ALTER TABLE sessions ADD COLUMN assessment_completed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'real_time_metrics') THEN
    ALTER TABLE sessions ADD COLUMN real_time_metrics jsonb DEFAULT '{}'::jsonb; -- {sentiment, pacing, clarity}
  END IF;
  
  RAISE NOTICE '✅ Enhanced sessions table';
END $$;

-- ============================================
-- STEP 10: Create Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scenario_assessments_updated_at ON scenario_assessments;
CREATE TRIGGER update_scenario_assessments_updated_at 
  BEFORE UPDATE ON scenario_assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_agent_analysis_updated_at ON session_agent_analysis;
CREATE TRIGGER update_session_agent_analysis_updated_at 
  BEFORE UPDATE ON session_agent_analysis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manager_feedback_updated_at ON manager_feedback;
CREATE TRIGGER update_manager_feedback_updated_at 
  BEFORE UPDATE ON manager_feedback 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_presets_updated_at ON analytics_presets;
CREATE TRIGGER update_analytics_presets_updated_at 
  BEFORE UPDATE ON analytics_presets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at 
  BEFORE UPDATE ON integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_integrations_updated_at ON user_integrations;
CREATE TRIGGER update_user_integrations_updated_at 
  BEFORE UPDATE ON user_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 11: Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE scenario_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_audio_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_agent_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view scenario assessments" ON scenario_assessments;
DROP POLICY IF EXISTS "Users can view own session assessments" ON session_assessments;
DROP POLICY IF EXISTS "Users can create own session assessments" ON session_assessments;
DROP POLICY IF EXISTS "Users can view own session turns" ON session_turns;
DROP POLICY IF EXISTS "Users can create own session turns" ON session_turns;
DROP POLICY IF EXISTS "Users can view own audio chunks" ON session_audio_chunks;
DROP POLICY IF EXISTS "Users can create own audio chunks" ON session_audio_chunks;
DROP POLICY IF EXISTS "Users can view own agent analysis" ON session_agent_analysis;
DROP POLICY IF EXISTS "Managers can view feedback" ON manager_feedback;
DROP POLICY IF EXISTS "Managers can create feedback" ON manager_feedback;
DROP POLICY IF EXISTS "Users can view own analytics presets" ON analytics_presets;
DROP POLICY IF EXISTS "Users can manage own analytics presets" ON analytics_presets;
DROP POLICY IF EXISTS "Everyone can view active integrations" ON integrations;
DROP POLICY IF EXISTS "Users can view own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can manage own integrations" ON user_integrations;

-- Scenario Assessments Policies (public read, admin write)
CREATE POLICY "Everyone can view scenario assessments" ON scenario_assessments
  FOR SELECT USING (true);

-- Session Assessments Policies
CREATE POLICY "Users can view own session assessments" ON session_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_assessments.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own session assessments" ON session_assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_assessments.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Session Turns Policies
CREATE POLICY "Users can view own session turns" ON session_turns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_turns.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own session turns" ON session_turns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_turns.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Session Audio Chunks Policies
CREATE POLICY "Users can view own audio chunks" ON session_audio_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_audio_chunks.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own audio chunks" ON session_audio_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_audio_chunks.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Session Agent Analysis Policies
CREATE POLICY "Users can view own agent analysis" ON session_agent_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_agent_analysis.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Manager Feedback Policies (managers can view/create, users can view their own)
CREATE POLICY "Managers can view feedback" ON manager_feedback
  FOR SELECT USING (
    auth.uid() = manager_id OR
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = manager_feedback.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can create feedback" ON manager_feedback
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

-- Analytics Presets Policies
CREATE POLICY "Users can view own analytics presets" ON analytics_presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analytics presets" ON analytics_presets
  FOR ALL USING (auth.uid() = user_id);

-- Integrations Policies (public read for active integrations)
CREATE POLICY "Everyone can view active integrations" ON integrations
  FOR SELECT USING (is_active = true);

-- User Integrations Policies
CREATE POLICY "Users can view own integrations" ON user_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integrations" ON user_integrations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STEP 12: Seed Initial Data
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_scenario_id_1 uuid;
  v_scenario_id_2 uuid;
  v_session_id_1 uuid;
BEGIN
  -- Get current user ID
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  -- Get scenario IDs
  SELECT id INTO v_scenario_id_1 FROM scenarios WHERE title LIKE '%High-Value Client%' LIMIT 1;
  SELECT id INTO v_scenario_id_2 FROM scenarios WHERE title LIKE '%Escalated Complaint%' LIMIT 1;
  
  -- Get session ID
  SELECT id INTO v_session_id_1 FROM sessions WHERE user_id = v_user_id LIMIT 1;
  
  -- Create sample assessment questions
  IF v_scenario_id_1 IS NOT NULL THEN
    INSERT INTO scenario_assessments (scenario_id, question_text, question_type, options, correct_answer, explanation, points, order_index)
    VALUES
      (
        v_scenario_id_1,
        'What is the best approach when a client mentions budget constraints?',
        'multiple-choice',
        '["Acknowledge and pivot to value", "Ignore and continue pitch", "Offer immediate discount", "End conversation"]'::jsonb,
        'Acknowledge and pivot to value',
        'Always acknowledge client concerns before addressing them.',
        10,
        1
      ),
      (
        v_scenario_id_1,
        'True or False: You should always quote specific interest rates without disclaimers.',
        'true-false',
        NULL,
        'False',
        'Policy #304 requires mandatory disclaimers before quoting rates.',
        5,
        2
      )
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Create sample integrations
  INSERT INTO integrations (name, description, icon, brand_color, category, is_pro, is_active, order_index)
  VALUES
    ('Microsoft Teams', 'Automatically share feedback summaries and schedule training sessions', 'groups', '#6264A7', 'communication', false, true, 1),
    ('Outlook', 'Sync training invitations and receive weekly performance digests', 'mark_email_unread', '#0078D4', 'communication', false, true, 2),
    ('Gmail', 'Connect your Google Workspace account for seamless email notifications', 'mail', '#EA4335', 'communication', false, true, 3),
    ('Google Sheets', 'Export training data and analytics to spreadsheets', 'table_chart', '#34A853', 'productivity', false, true, 4),
    ('OneDrive', 'Securely store and backup voice recording archives', 'cloud_circle', '#0078D4', 'storage', false, true, 5),
    ('MCP Server', 'Connect to custom Model Context Protocol server', 'dns', '#6B7280', 'servers-apis', true, true, 6),
    ('Slack', 'Get real-time notifications about training sessions', 'chat', '#4A154B', 'communication', false, true, 7),
    ('Zoom', 'Schedule and join training sessions from Zoom', 'videocam', '#2D8CFF', 'communication', false, true, 8),
    ('Notion', 'Sync training notes and progress reports', 'description', '#000000', 'productivity', false, true, 9)
  ON CONFLICT (name) DO NOTHING;
  
  RAISE NOTICE '✅ Session features setup completed successfully!';
  RAISE NOTICE 'Created tables: scenario_assessments, session_assessments, session_turns, session_audio_chunks, session_agent_analysis, manager_feedback, analytics_presets, integrations, user_integrations';
  
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
SELECT 
  'Tables Created' as check_type,
  table_name,
  '✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'scenario_assessments',
    'session_assessments',
    'session_turns',
    'session_audio_chunks',
    'session_agent_analysis',
    'manager_feedback',
    'analytics_presets',
    'integrations',
    'user_integrations'
  )
ORDER BY table_name;

-- Check RLS policies
SELECT 
  schemaname || '.' || tablename as table_name,
  policyname,
  '✅' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'scenario_assessments',
    'session_assessments',
    'session_turns',
    'session_audio_chunks',
    'session_agent_analysis',
    'manager_feedback',
    'analytics_presets',
    'integrations',
    'user_integrations'
  )
ORDER BY tablename, policyname;

