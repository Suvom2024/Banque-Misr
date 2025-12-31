-- AI-Powered Performance Analysis Tables
-- This migration adds tables for dynamic, AI-generated performance analysis

-- ============================================
-- 1. Turn AI Analysis
-- Stores AI-generated metrics and feedback for each conversation turn
-- ============================================
CREATE TABLE IF NOT EXISTS turn_ai_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id uuid NOT NULL REFERENCES session_turns(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  ai_metrics jsonb NOT NULL DEFAULT '{}'::jsonb, -- {clarity: 85, empathy: 78, pacing: 120, directness: 65, sentiment: 'positive'}
  ai_feedback text,
  ai_recommendations jsonb DEFAULT '[]'::jsonb,
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  model_version text DEFAULT 'gemini-2.5-flash',
  analyzed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(turn_id)
);

CREATE INDEX IF NOT EXISTS idx_turn_ai_analysis_session ON turn_ai_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_turn_ai_analysis_turn ON turn_ai_analysis(turn_id);
CREATE INDEX IF NOT EXISTS idx_turn_ai_analysis_analyzed ON turn_ai_analysis(analyzed_at DESC);

-- ============================================
-- 2. User Performance Thresholds
-- Stores dynamic, user-specific thresholds calculated from their performance history
-- ============================================
CREATE TABLE IF NOT EXISTS user_performance_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  threshold_type text NOT NULL CHECK (threshold_type IN (
    'excellent', 'good', 'fair', 'needs_improvement',
    'peer_top_1', 'peer_top_5', 'peer_top_10', 'peer_top_25',
    'assessment_trigger_clarity', 'assessment_trigger_empathy',
    'weak_competency', 'strong_competency'
  )),
  competency_name text, -- NULL for overall thresholds, specific competency name for competency-specific thresholds
  threshold_value decimal(5,2) NOT NULL,
  calculation_method text NOT NULL CHECK (calculation_method IN (
    'percentile', 'average', 'adaptive', 'peer_relative', 'scenario_specific'
  )),
  samples_used integer DEFAULT 0, -- Number of sessions/turns used to calculate this threshold
  calculated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Thresholds can expire and be recalculated
  metadata jsonb DEFAULT '{}'::jsonb, -- Additional calculation context
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, threshold_type, competency_name)
);

CREATE INDEX IF NOT EXISTS idx_user_thresholds_user ON user_performance_thresholds(user_id, threshold_type);
CREATE INDEX IF NOT EXISTS idx_user_thresholds_competency ON user_performance_thresholds(user_id, competency_name);
CREATE INDEX IF NOT EXISTS idx_user_thresholds_expires ON user_performance_thresholds(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 3. Session AI Summary
-- Stores comprehensive AI-generated analysis for completed sessions
-- ============================================
CREATE TABLE IF NOT EXISTS session_ai_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  overall_analysis text NOT NULL,
  overall_score decimal(5,2), -- AI-calculated overall score
  key_strengths jsonb DEFAULT '[]'::jsonb, -- [{competency: 'Empathy', score: 92, examples: [...]}]
  improvement_areas jsonb DEFAULT '[]'::jsonb, -- [{competency: 'Pacing', score: 65, recommendations: [...]}]
  personalized_feedback text,
  next_steps jsonb DEFAULT '[]'::jsonb, -- [{type: 'scenario', title: '...', reason: '...'}]
  conversation_highlights jsonb DEFAULT '[]'::jsonb, -- Notable moments in the conversation
  model_version text DEFAULT 'gemini-2.5-flash',
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id)
);

CREATE INDEX IF NOT EXISTS idx_session_ai_summary_session ON session_ai_summary(session_id);
CREATE INDEX IF NOT EXISTS idx_session_ai_summary_generated ON session_ai_summary(generated_at DESC);

-- ============================================
-- 4. Performance Analysis Configuration
-- Stores configuration for how thresholds and analysis should be calculated
-- ============================================
CREATE TABLE IF NOT EXISTS performance_analysis_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default configuration
INSERT INTO performance_analysis_config (config_key, config_value, description) VALUES
  ('default_thresholds', '{
    "excellent": 90,
    "good": 80,
    "fair": 70,
    "needs_improvement": 60,
    "peer_top_1": 95,
    "peer_top_5": 90,
    "peer_top_10": 85,
    "peer_top_25": 80,
    "weak_competency": 75,
    "strong_competency": 85
  }'::jsonb, 'Default threshold values used when user has no history'),
  ('assessment_trigger', '{
    "min_turns": 3,
    "max_turns": 5,
    "clarity_threshold": 80,
    "empathy_threshold": 70,
    "recent_turns_analyzed": 3
  }'::jsonb, 'Default assessment trigger thresholds'),
  ('threshold_calculation', '{
    "percentile_excellent": 90,
    "percentile_good": 75,
    "percentile_fair": 50,
    "min_samples_for_calculation": 5,
    "recalculation_interval_days": 7
  }'::jsonb, 'Configuration for dynamic threshold calculation'),
  ('ai_analysis', '{
    "model": "gemini-2.5-flash",
    "analyze_on_turn_complete": true,
    "analyze_on_session_complete": true,
    "confidence_threshold": 0.7
  }'::jsonb, 'AI analysis configuration')
ON CONFLICT (config_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_performance_config_key ON performance_analysis_config(config_key) WHERE is_active = true;

-- ============================================
-- 5. Update session_turns table to add AI analysis reference
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_turns' AND column_name = 'ai_analysis_id') THEN
    ALTER TABLE session_turns ADD COLUMN ai_analysis_id uuid REFERENCES turn_ai_analysis(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 6. Update sessions table to add AI summary reference
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'ai_summary_id') THEN
    ALTER TABLE sessions ADD COLUMN ai_summary_id uuid REFERENCES session_ai_summary(id) ON DELETE SET NULL;
  END IF;
  
  -- Add column to track if AI analysis is in progress
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'ai_analysis_status') THEN
    ALTER TABLE sessions ADD COLUMN ai_analysis_status text CHECK (ai_analysis_status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending';
  END IF;
END $$;

-- ============================================
-- 7. Functions for automatic threshold updates
-- ============================================

-- Function to mark thresholds for recalculation
CREATE OR REPLACE FUNCTION mark_thresholds_for_recalculation(user_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_performance_thresholds
  SET expires_at = now()
  WHERE user_id = user_id_param
    AND expires_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's dynamic threshold (with fallback to defaults)
CREATE OR REPLACE FUNCTION get_user_threshold(
  user_id_param uuid,
  threshold_type_param text,
  competency_name_param text DEFAULT NULL
)
RETURNS decimal(5,2) AS $$
DECLARE
  user_threshold decimal(5,2);
  default_threshold decimal(5,2);
BEGIN
  -- Try to get user-specific threshold
  SELECT threshold_value INTO user_threshold
  FROM user_performance_thresholds
  WHERE user_id = user_id_param
    AND threshold_type = threshold_type_param
    AND (competency_name_param IS NULL AND competency_name IS NULL OR competency_name = competency_name_param)
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY updated_at DESC
  LIMIT 1;

  -- If no user threshold, get default from config
  IF user_threshold IS NULL THEN
    SELECT (config_value->>threshold_type_param)::decimal INTO default_threshold
    FROM performance_analysis_config
    WHERE config_key = 'default_thresholds'
      AND is_active = true;
    
    RETURN COALESCE(default_threshold, 80.0); -- Ultimate fallback
  END IF;

  RETURN user_threshold;
END;
$$ LANGUAGE plpgsql;

