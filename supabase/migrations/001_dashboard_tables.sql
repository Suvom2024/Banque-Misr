-- Enhanced Dashboard Tables Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. user_performance_snapshots
-- ============================================
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

-- ============================================
-- 2. ai_recommendations
-- ============================================
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

-- ============================================
-- 3. user_competency_gaps
-- ============================================
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

-- ============================================
-- 4. user_scenario_progress
-- ============================================
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

-- ============================================
-- 5. user_stats
-- ============================================
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

-- ============================================
-- 6. achievements
-- ============================================
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

-- ============================================
-- 7. user_achievements
-- ============================================
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

-- ============================================
-- 8. activity_feed
-- ============================================
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

-- ============================================
-- Update existing tables
-- ============================================

-- Add missing columns to sessions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'progress_percent') THEN
    ALTER TABLE sessions ADD COLUMN progress_percent integer CHECK (progress_percent >= 0 AND progress_percent <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'xp_earned') THEN
    ALTER TABLE sessions ADD COLUMN xp_earned integer DEFAULT 0;
  END IF;
END $$;

-- Add missing columns to scenarios table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scenarios' AND column_name = 'estimated_xp') THEN
    ALTER TABLE scenarios ADD COLUMN estimated_xp integer DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_performance_snapshots_updated_at BEFORE UPDATE ON user_performance_snapshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON ai_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_competency_gaps_updated_at BEFORE UPDATE ON user_competency_gaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_scenario_progress_updated_at BEFORE UPDATE ON user_scenario_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE user_performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competency_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scenario_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own performance snapshots" ON user_performance_snapshots;
DROP POLICY IF EXISTS "Users can view own recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can update own recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "Users can view own competency gaps" ON user_competency_gaps;
DROP POLICY IF EXISTS "Users can view own scenario progress" ON user_scenario_progress;
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view own activity feed" ON activity_feed;
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;

-- Create RLS policies
CREATE POLICY "Users can view own performance snapshots" ON user_performance_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recommendations" ON ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own competency gaps" ON user_competency_gaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own scenario progress" ON user_scenario_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own activity feed" ON activity_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view achievements" ON achievements FOR SELECT USING (true);

-- ============================================
-- Seed initial achievements data
-- ============================================

INSERT INTO achievements (code, name, description, icon, category, criteria_jsonb, badge_color) VALUES
('10_sessions', '10 Sessions Milestone', 'Complete 10 training sessions', 'celebration', 'sessions', '{"min_sessions": 10}', '#FFC72C'),
('perfect_score', 'Perfect Score', 'Achieve a perfect 100% score in any session', 'star', 'scores', '{"min_score": 100}', '#FFC72C'),
('7_day_streak', '7-Day Streak', 'Train for 7 consecutive days', 'local_fire_department', 'streaks', '{"min_streak_days": 7}', '#FF6B6B'),
('top_performer', 'Top Performer', 'Rank in top 10% of your team', 'emoji_events', 'scores', '{"min_percentile": 90}', '#FFC72C'),
('competency_master', 'Competency Master', 'Achieve 90+ in all core competencies', 'workspace_premium', 'competencies', '{"min_score": 90, "competencies": ["Empathy", "Clarity", "Objection Handling", "Rapport Building"]}', '#7A1A25'),
('goal_achiever', 'Goal Achiever', 'Complete 5 development goals', 'flag', 'goals', '{"min_goals_completed": 5}', '#10B981')
ON CONFLICT (code) DO NOTHING;

