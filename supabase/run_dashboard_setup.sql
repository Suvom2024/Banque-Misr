-- ============================================
-- COMPLETE DASHBOARD SETUP SCRIPT
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- STEP 0: Create base tables if they don't exist
-- ============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scenarios table if it doesn't exist
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  difficulty text,
  duration_minutes integer,
  estimated_xp integer DEFAULT 0,
  skills_covered jsonb,
  tone_settings jsonb,
  ai_coach_level text,
  tags text[],
  image_url text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  scenario_id uuid REFERENCES scenarios(id),
  status text,
  started_at timestamptz,
  completed_at timestamptz,
  overall_score integer,
  trend text,
  ai_summary text,
  audio_recording_url text,
  transcript jsonb,
  voice_settings jsonb,
  xp_earned integer DEFAULT 0,
  progress_percent integer CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_competencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS session_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id),
  competency_name text NOT NULL,
  score integer,
  feedback text,
  feedback_type text,
  icon text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, competency_name)
);

-- Create development_goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS development_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  target_date date,
  progress integer DEFAULT 0,
  ai_insight text,
  trend_data jsonb,
  icon text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- STEP 1: Create all dashboard tables (from 001_dashboard_tables.sql)
-- ============================================

-- 1. user_performance_snapshots
CREATE TABLE IF NOT EXISTS user_performance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  overall_score decimal(5,2) NOT NULL,
  performance_rating text NOT NULL CHECK (performance_rating IN ('EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_IMPROVEMENT')),
  time_trained_hours decimal(6,2) NOT NULL DEFAULT 0,
  time_trained_change_percent decimal(5,2),
  key_strength text,
  top_competencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_message text,
  ai_message_detail text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_user_performance_snapshots_user_date ON user_performance_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_performance_snapshots_user_period ON user_performance_snapshots(user_id, period_start, period_end);

-- 2. ai_recommendations
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('focus_area', 'scenario', 'skill', 'goal')),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  priority integer NOT NULL DEFAULT 0,
  reason text,
  related_scenario_id uuid REFERENCES scenarios(id) ON DELETE SET NULL,
  related_competency text,
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  expires_at timestamptz,
  is_dismissed boolean NOT NULL DEFAULT false,
  dismissed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_active ON ai_recommendations(user_id, is_dismissed, expires_at) WHERE is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_priority ON ai_recommendations(user_id, priority DESC, created_at DESC);

-- 3. user_competency_gaps
CREATE TABLE IF NOT EXISTS user_competency_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_name text NOT NULL,
  current_average_score decimal(5,2) NOT NULL,
  target_score decimal(5,2) NOT NULL DEFAULT 80.00,
  gap_size decimal(5,2) NOT NULL,
  recent_trend text CHECK (recent_trend IN ('improving', 'declining', 'stable')),
  sessions_analyzed integer NOT NULL DEFAULT 0,
  last_analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, competency_name)
);

CREATE INDEX IF NOT EXISTS idx_user_competency_gaps_user ON user_competency_gaps(user_id, gap_size DESC);
CREATE INDEX IF NOT EXISTS idx_user_competency_gaps_user_trend ON user_competency_gaps(user_id, recent_trend);

-- 4. user_scenario_progress
CREATE TABLE IF NOT EXISTS user_scenario_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed')) DEFAULT 'not-started',
  last_session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  best_score integer CHECK (best_score >= 0 AND best_score <= 100),
  attempts_count integer NOT NULL DEFAULT 0,
  last_accessed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_user_scenario_progress_user_status ON user_scenario_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_scenario_progress_scenario ON user_scenario_progress(scenario_id);
CREATE INDEX IF NOT EXISTS idx_user_scenario_progress_user_accessed ON user_scenario_progress(user_id, last_accessed_at DESC);

-- 5. user_stats
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('week', 'month', 'quarter', 'year')),
  sessions_count integer NOT NULL DEFAULT 0,
  avg_score decimal(5,2),
  time_trained_hours decimal(6,2) NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  current_streak_days integer NOT NULL DEFAULT 0,
  leaderboard_rank integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start, period_end, period_type)
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_period ON user_stats(user_id, period_start DESC, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_leaderboard ON user_stats(period_type, period_start, leaderboard_rank) WHERE leaderboard_rank IS NOT NULL;

-- 6. achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('sessions', 'scores', 'streaks', 'competencies', 'goals')),
  criteria_jsonb jsonb NOT NULL,
  badge_color text DEFAULT '#FFC72C',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);

-- 7. user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  metadata_jsonb jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

-- 8. activity_feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('session_completed', 'session_started', 'achievement_earned', 'goal_created', 'goal_completed', 'assessment_completed', 'milestone_reached')),
  title text NOT NULL,
  description text,
  icon text NOT NULL,
  related_session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  related_goal_id uuid REFERENCES development_goals(id) ON DELETE SET NULL,
  related_achievement_id uuid REFERENCES achievements(id) ON DELETE SET NULL,
  metadata_jsonb jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_type ON activity_feed(user_id, activity_type);

-- Update existing tables (add missing columns)
DO $$ 
BEGIN
  -- Add columns to sessions table if they don't exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sessions') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'progress_percent') THEN
      ALTER TABLE sessions ADD COLUMN progress_percent integer CHECK (progress_percent >= 0 AND progress_percent <= 100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'xp_earned') THEN
      ALTER TABLE sessions ADD COLUMN xp_earned integer DEFAULT 0;
    END IF;
  END IF;
  
  -- Add columns to scenarios table if they don't exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scenarios') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'estimated_xp') THEN
      ALTER TABLE scenarios ADD COLUMN estimated_xp integer DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_performance_snapshots_updated_at ON user_performance_snapshots;
DROP TRIGGER IF EXISTS update_ai_recommendations_updated_at ON ai_recommendations;
DROP TRIGGER IF EXISTS update_user_competency_gaps_updated_at ON user_competency_gaps;
DROP TRIGGER IF EXISTS update_user_scenario_progress_updated_at ON user_scenario_progress;
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;

CREATE TRIGGER update_user_performance_snapshots_updated_at BEFORE UPDATE ON user_performance_snapshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_competency_gaps_updated_at BEFORE UPDATE ON user_competency_gaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_scenario_progress_updated_at BEFORE UPDATE ON user_scenario_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE user_performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competency_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scenario_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own performance snapshots" ON user_performance_snapshots;
DROP POLICY IF EXISTS "Users can view own recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can update own recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can view own competency gaps" ON user_competency_gaps;
DROP POLICY IF EXISTS "Users can view own scenario progress" ON user_scenario_progress;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own activity feed" ON activity_feed;
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;

CREATE POLICY "Users can view own performance snapshots" ON user_performance_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recommendations" ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own competency gaps" ON user_competency_gaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own scenario progress" ON user_scenario_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own activity feed" ON activity_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view achievements" ON achievements FOR SELECT USING (true);

-- Seed initial achievements
INSERT INTO achievements (code, name, description, icon, category, criteria_jsonb, badge_color) VALUES
('10_sessions', '10 Sessions Milestone', 'Complete 10 training sessions', 'celebration', 'sessions', '{"min_sessions": 10}', '#FFC72C'),
('perfect_score', 'Perfect Score', 'Achieve a perfect 100% score in any session', 'star', 'scores', '{"min_score": 100}', '#FFC72C'),
('7_day_streak', '7-Day Streak', 'Train for 7 consecutive days', 'local_fire_department', 'streaks', '{"min_streak_days": 7}', '#FF6B6B'),
('top_performer', 'Top Performer', 'Rank in top 10% of your team', 'emoji_events', 'scores', '{"min_percentile": 90}', '#FFC72C'),
('competency_master', 'Competency Master', 'Achieve 90+ in all core competencies', 'workspace_premium', 'competencies', '{"min_score": 90, "competencies": ["Empathy", "Clarity", "Objection Handling", "Rapport Building"]}', '#7A1A25'),
('goal_achiever', 'Goal Achiever', 'Complete 5 development goals', 'flag', 'goals', '{"min_goals_completed": 5}', '#10B981')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- STEP 2: Insert seed data
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_scenario_id_1 uuid;
  v_scenario_id_2 uuid;
  v_scenario_id_3 uuid;
  v_session_id_1 uuid;
  v_session_id_2 uuid;
  v_session_id_3 uuid;
  v_achievement_id_1 uuid;
  v_goal_id_1 uuid;
  v_goal_id_2 uuid;
BEGIN
  -- Get first user from profiles
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found. Please create a user account first, then run this script again.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using user_id: %', v_user_id;

  -- Create or get scenarios
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scenarios') THEN
    SELECT id INTO v_scenario_id_1 FROM scenarios WHERE title LIKE '%High-Value Client%' LIMIT 1;
  END IF;
  
  IF v_scenario_id_1 IS NULL THEN
    INSERT INTO scenarios (title, description, category, difficulty, duration_minutes, estimated_xp, skills_covered, tone_settings, ai_coach_level, tags, is_featured, is_active)
    VALUES (
      'High-Value Client Negotiation',
      'Navigate a complex negotiation with a key client to secure a favorable outcome while maintaining trust.',
      'Sales',
      'Advanced',
      25,
      150,
      '[{"icon": "handshake", "label": "Negotiation"}, {"icon": "psychology_alt", "label": "Strategy"}]'::jsonb,
      '{"type": "Neutral"}'::jsonb,
      'Pro',
      ARRAY['Negotiation', 'Strategy'],
      true,
      true
    ) RETURNING id INTO v_scenario_id_1;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scenarios') THEN
    SELECT id INTO v_scenario_id_2 FROM scenarios WHERE title LIKE '%Escalated Complaint%' LIMIT 1;
  END IF;
  
  IF v_scenario_id_2 IS NULL THEN
    INSERT INTO scenarios (title, description, category, difficulty, duration_minutes, estimated_xp, skills_covered, tone_settings, ai_coach_level, tags, is_featured, is_active)
    VALUES (
      'Managing an Escalated Complaint',
      'Address an urgent and sensitive complaint from a customer to de-escalate the situation swiftly.',
      'Customer Service',
      'Intermediate',
      15,
      100,
      '[{"icon": "favorite", "label": "De-escalation"}, {"icon": "support_agent", "label": "Empathy"}]'::jsonb,
      '{"type": "Supportive"}'::jsonb,
      'Standard',
      ARRAY['De-escalation', 'Empathy'],
      false,
      true
    ) RETURNING id INTO v_scenario_id_2;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scenarios') THEN
    SELECT id INTO v_scenario_id_3 FROM scenarios WHERE title LIKE '%Performance Review%' LIMIT 1;
  END IF;
  
  IF v_scenario_id_3 IS NULL THEN
    INSERT INTO scenarios (title, description, category, difficulty, duration_minutes, estimated_xp, skills_covered, tone_settings, ai_coach_level, tags, is_featured, is_active)
    VALUES (
      'Performance Review Discussion',
      'Conduct a constructive performance review with a team member, focusing on feedback loops.',
      'Management',
      'Intermediate',
      20,
      120,
      '[{"icon": "psychology", "label": "Coaching"}, {"icon": "groups", "label": "Leadership"}]'::jsonb,
      '{"type": "Supportive"}'::jsonb,
      'Standard',
      ARRAY['Coaching', 'Leadership'],
      false,
      true
    ) RETURNING id INTO v_scenario_id_3;
  END IF;

  -- Create test sessions
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sessions') AND v_scenario_id_1 IS NOT NULL THEN
    INSERT INTO sessions (user_id, scenario_id, status, overall_score, started_at, completed_at, progress_percent, xp_earned, trend, ai_summary)
    VALUES (
      v_user_id,
      v_scenario_id_1,
      'completed',
      92,
      (now() - interval '2 days')::timestamptz,
      (now() - interval '2 days' + interval '25 minutes')::timestamptz,
      100,
      150,
      '+5% vs Last',
      'Excellent performance in negotiation. Strong objection handling and rapport building.'
    ) RETURNING id INTO v_session_id_1;

    INSERT INTO sessions (user_id, scenario_id, status, overall_score, started_at, completed_at, progress_percent, xp_earned, trend, ai_summary)
    VALUES (
      v_user_id,
      v_scenario_id_2,
      'completed',
      85,
      (now() - interval '1 day')::timestamptz,
      (now() - interval '1 day' + interval '15 minutes')::timestamptz,
      100,
      100,
      '+3% vs Last',
      'Good de-escalation skills demonstrated. Empathy was strong throughout.'
    ) RETURNING id INTO v_session_id_2;

    INSERT INTO sessions (user_id, scenario_id, status, overall_score, started_at, completed_at, progress_percent, xp_earned, trend, ai_summary)
    VALUES (
      v_user_id,
      v_scenario_id_3,
      'in-progress',
      0,
      (now() - interval '2 hours')::timestamptz,
      NULL,
      45,
      0,
      NULL,
      NULL
    ) RETURNING id INTO v_session_id_3;
  END IF;

  -- Create session competencies
  IF v_session_id_1 IS NOT NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'session_competencies') THEN
    INSERT INTO session_competencies (session_id, competency_name, score, feedback, feedback_type, icon)
    VALUES
      (v_session_id_1, 'Empathy', 95, 'Consistently validated feelings using phrases like "I understand why..."', 'positive', 'favorite'),
      (v_session_id_1, 'Clarity', 90, 'Instructions were direct. Minimal filler words used.', 'positive', 'record_voice_over'),
      (v_session_id_1, 'Objection Handling', 88, 'Handled objections smoothly with the A-R-C method.', 'positive', 'psychology_alt'),
      (v_session_id_1, 'Rapport Building', 92, 'Opened with genuine interest in the client''s needs.', 'positive', 'handshake'),
      (v_session_id_2, 'Empathy', 88, 'Strong validation of customer concerns.', 'positive', 'favorite'),
      (v_session_id_2, 'Clarity', 85, 'Clear communication throughout.', 'positive', 'record_voice_over'),
      (v_session_id_2, 'Objection Handling', 82, 'Good handling of complaints.', 'neutral', 'psychology_alt'),
      (v_session_id_2, 'Rapport Building', 87, 'Built good rapport quickly.', 'positive', 'handshake');
  END IF;

  -- Create user scenario progress
  IF v_scenario_id_1 IS NOT NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_scenario_progress') THEN
    INSERT INTO user_scenario_progress (user_id, scenario_id, status, last_session_id, best_score, attempts_count, last_accessed_at, completed_at)
    VALUES
      (v_user_id, v_scenario_id_1, 'completed', v_session_id_1, 92, 1, (now() - interval '2 days')::timestamptz, (now() - interval '2 days')::timestamptz),
      (v_user_id, v_scenario_id_2, 'completed', v_session_id_2, 85, 1, (now() - interval '1 day')::timestamptz, (now() - interval '1 day')::timestamptz),
      (v_user_id, v_scenario_id_3, 'in-progress', v_session_id_3, NULL, 1, (now() - interval '2 hours')::timestamptz, NULL)
    ON CONFLICT (user_id, scenario_id) DO UPDATE
    SET status = EXCLUDED.status,
        last_session_id = EXCLUDED.last_session_id,
        best_score = GREATEST(COALESCE(user_scenario_progress.best_score, 0), COALESCE(EXCLUDED.best_score, 0)),
        attempts_count = user_scenario_progress.attempts_count + 1,
        last_accessed_at = EXCLUDED.last_accessed_at,
        completed_at = EXCLUDED.completed_at;
  END IF;

  -- Create user performance snapshot
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_performance_snapshots') THEN
    INSERT INTO user_performance_snapshots (
      user_id, snapshot_date, overall_score, performance_rating, time_trained_hours,
      time_trained_change_percent, key_strength, top_competencies, ai_message, ai_message_detail,
      period_start, period_end
    )
    VALUES (
      v_user_id, CURRENT_DATE, 87.5, 'EXCELLENT', 0.67, 5.2, 'Empathy',
      '[
        {"name": "Empathy", "score": 91.5, "trend": "improving", "icon": "favorite"},
        {"name": "Rapport Building", "score": 89.5, "trend": "stable", "icon": "handshake"},
        {"name": "Clarity", "score": 87.5, "trend": "improving", "icon": "record_voice_over"},
        {"name": "Objection Handling", "score": 85.0, "trend": "stable", "icon": "psychology_alt"}
      ]'::jsonb,
      '"You are on track for Q2 objectives!"',
      'Your empathy score in recent simulations has improved by 12%. Keep focusing on active listening techniques.',
      (CURRENT_DATE - interval '30 days')::date, CURRENT_DATE
    )
    ON CONFLICT (user_id, snapshot_date, period_start, period_end) DO NOTHING;
  END IF;

  -- Create user stats
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats') THEN
    INSERT INTO user_stats (
      user_id, period_start, period_end, period_type, sessions_count, avg_score,
      time_trained_hours, xp_earned, current_streak_days, leaderboard_rank
    )
    VALUES
      (v_user_id, (CURRENT_DATE - interval '7 days')::date, CURRENT_DATE, 'week', 2, 88.5, 0.67, 250, 2, 12),
      (v_user_id, (CURRENT_DATE - interval '30 days')::date, CURRENT_DATE, 'month', 5, 85.2, 2.5, 650, 2, 15)
    ON CONFLICT (user_id, period_start, period_end, period_type) DO NOTHING;
  END IF;

  -- Create competency gaps
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_competency_gaps') THEN
    INSERT INTO user_competency_gaps (
      user_id, competency_name, current_average_score, target_score, gap_size,
      recent_trend, sessions_analyzed, last_analyzed_at
    )
    VALUES
      (v_user_id, 'Objection Handling', 85.0, 80.0, -5.0, 'stable', 2, now()),
      (v_user_id, 'Active Listening', 75.0, 80.0, 5.0, 'improving', 2, now()),
      (v_user_id, 'Pacing', 78.0, 80.0, 2.0, 'stable', 2, now())
    ON CONFLICT (user_id, competency_name) DO UPDATE
    SET current_average_score = EXCLUDED.current_average_score,
        gap_size = EXCLUDED.gap_size,
        recent_trend = EXCLUDED.recent_trend,
        sessions_analyzed = EXCLUDED.sessions_analyzed,
        last_analyzed_at = EXCLUDED.last_analyzed_at;
  END IF;

  -- Create AI recommendations
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_recommendations') THEN
    INSERT INTO ai_recommendations (
      user_id, recommendation_type, title, description, icon, tags, priority,
      reason, related_competency, confidence_score, expires_at, is_dismissed
    )
    VALUES (
      v_user_id, 'focus_area', 'Improve Active Listening',
      'Your Active Listening score is 75%, which is below your target of 80%. Focus on this area to improve your overall performance.',
      'hearing', ARRAY['ACTIVE LISTENING', 'RECOMMENDED'], 5,
      'Gap of 5.0% below target', 'Active Listening', 0.75,
      (now() + interval '7 days')::timestamptz, false
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get achievement IDs and create user achievements
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievements') THEN
    SELECT id INTO v_achievement_id_1 FROM achievements WHERE code = '10_sessions';
    
    IF v_achievement_id_1 IS NOT NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at, metadata_jsonb)
      VALUES (v_user_id, v_achievement_id_1, (now() - interval '5 days')::timestamptz, '{"sessions_completed": 10}'::jsonb)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END IF;

  -- Create activity feed entries
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_feed') THEN
    INSERT INTO activity_feed (
      user_id, activity_type, title, description, icon, related_session_id, metadata_jsonb
    )
    VALUES
      (v_user_id, 'session_completed', 'Completed: High-Value Client Negotiation', 'Achieved a score of 92%', 'check_circle', v_session_id_1, '{"score": 92, "duration": 25}'::jsonb),
      (v_user_id, 'session_completed', 'Completed: Managing an Escalated Complaint', 'Achieved a score of 85%', 'check_circle', v_session_id_2, '{"score": 85, "duration": 15}'::jsonb),
      (v_user_id, 'session_started', 'Started: Performance Review Discussion', 'Session in progress', 'play_circle', v_session_id_3, '{}'::jsonb),
      (v_user_id, 'achievement_earned', 'Achievement Unlocked: 10 Sessions Milestone', 'Complete 10 training sessions', 'emoji_events', NULL, '{"achievement_code": "10_sessions"}'::jsonb)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create development goals
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'development_goals') THEN
    INSERT INTO development_goals (user_id, title, description, target_date, progress, status)
    VALUES (
      v_user_id,
      'Advanced Negotiation',
      'Master complex negotiation tactics focusing on win-win outcomes in high-stakes corporate accounts.',
      (CURRENT_DATE + interval '30 days')::date,
      72,
      'active'
    ) RETURNING id INTO v_goal_id_1;

    INSERT INTO development_goals (user_id, title, description, target_date, progress, status)
    VALUES (
      v_user_id,
      'Customer Empathy',
      'Consistently demonstrate empathy in 90% of customer interactions, specifically handling complaints.',
      (CURRENT_DATE + interval '45 days')::date,
      45,
      'active'
    ) RETURNING id INTO v_goal_id_2;

    -- Add activity feed entry for goal
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_feed') THEN
      INSERT INTO activity_feed (user_id, activity_type, title, description, icon, related_goal_id)
      VALUES (
        v_user_id,
        'goal_created',
        'Created Goal: Advanced Negotiation',
        'Target: ' || to_char((CURRENT_DATE + interval '30 days')::date, 'Mon DD, YYYY'),
        'flag',
        v_goal_id_1
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RAISE NOTICE '✅ Seed data created successfully!';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Scenarios: %, %, %', v_scenario_id_1, v_scenario_id_2, v_scenario_id_3;
  RAISE NOTICE 'Sessions: %, %, %', v_session_id_1, v_session_id_2, v_session_id_3;

END $$;

