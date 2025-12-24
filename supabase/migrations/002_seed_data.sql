-- Seed Data for Dashboard Tables
-- Run this AFTER 001_dashboard_tables.sql
-- This script inserts test data for all dashboard tables

-- ============================================
-- Helper: Get a test user ID (use your actual user or create one)
-- ============================================

-- First, let's get or create a test user
DO $$
DECLARE
  test_user_id uuid;
  test_scenario_ids uuid[];
  test_session_ids uuid[];
  test_goal_ids uuid[];
  test_achievement_ids uuid[];
BEGIN
  -- Get the first user from profiles (or use a specific user)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  -- If no user exists, we'll need to create one via auth first
  -- For now, we'll assume a user exists
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No user found in profiles table. Please create a user first via authentication.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using user ID: %', test_user_id;

  -- ============================================
  -- 1. Create Scenarios (if they don't exist)
  -- ============================================
  
  INSERT INTO scenarios (id, title, description, category, difficulty, duration_minutes, estimated_xp, skills_covered, tone_settings, ai_coach_level, tags, is_featured, is_active, created_by)
  VALUES
    (
      gen_random_uuid(),
      'High-Value Client Negotiation',
      'Navigate a complex negotiation with a key client to secure a favorable outcome while maintaining trust.',
      'Sales',
      'Advanced',
      25,
      150,
      '[{"icon": "handshake", "label": "Negotiation"}, {"icon": "psychology_alt", "label": "Objection Handling"}, {"icon": "record_voice_over", "label": "Clarity"}]'::jsonb,
      '{"type": "Neutral"}'::jsonb,
      'Pro',
      ARRAY['Negotiation', 'Strategy', 'High-Stakes'],
      true,
      true,
      test_user_id
    ),
    (
      gen_random_uuid(),
      'Managing an Escalated Complaint',
      'Address an urgent and sensitive complaint from a customer to de-escalate the situation swiftly.',
      'Customer Service',
      'Intermediate',
      15,
      100,
      '[{"icon": "favorite", "label": "Empathy"}, {"icon": "support_agent", "label": "De-escalation"}]'::jsonb,
      '{"type": "Supportive"}'::jsonb,
      'Standard',
      ARRAY['De-escalation', 'Empathy', 'Customer Service'],
      true,
      true,
      test_user_id
    ),
    (
      gen_random_uuid(),
      'Performance Review Discussion',
      'Conduct a constructive performance review with a team member, focusing on feedback loops.',
      'Management',
      'Intermediate',
      20,
      120,
      '[{"icon": "handshake", "label": "Rapport Building"}, {"icon": "record_voice_over", "label": "Clarity"}, {"icon": "hearing", "label": "Active Listening"}]'::jsonb,
      '{"type": "Supportive"}'::jsonb,
      'Pro',
      ARRAY['Coaching', 'Leadership', 'Feedback'],
      false,
      true,
      test_user_id
    ),
    (
      gen_random_uuid(),
      'Cross-Selling Investment Services',
      'Identify subtle cues in client conversation to introduce investment products naturally.',
      'Sales',
      'Intermediate',
      12,
      80,
      '[{"icon": "menu_book", "label": "Product Knowledge"}, {"icon": "psychology_alt", "label": "Objection Handling"}]'::jsonb,
      '{"type": "Neutral"}'::jsonb,
      'Standard',
      ARRAY['Cross-Selling', 'Investment', 'Product Knowledge'],
      false,
      true,
      test_user_id
    ),
    (
      gen_random_uuid(),
      'New Loan Product Introduction',
      'Master key features of our latest personal loan to present it confidently to clients.',
      'Product Knowledge',
      'Beginner',
      10,
      60,
      '[{"icon": "menu_book", "label": "Product Knowledge"}, {"icon": "record_voice_over", "label": "Clarity"}]'::jsonb,
      '{"type": "Direct"}'::jsonb,
      'Standard',
      ARRAY['Product Knowledge', 'Loan Products'],
      false,
      true,
      test_user_id
    )
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_scenario_ids;

  -- Get scenario IDs
  SELECT ARRAY_AGG(id) INTO test_scenario_ids FROM scenarios WHERE is_active = true LIMIT 5;

  -- ============================================
  -- 2. Create Sessions (completed and in-progress)
  -- ============================================

  -- Create sessions with proper sequencing
  WITH session_data AS (
    SELECT
      gen_random_uuid() as id,
      scenario_id,
      ROW_NUMBER() OVER (ORDER BY scenario_id, random()) as rn
    FROM unnest(test_scenario_ids) AS scenario_id
    LIMIT 8
  )
  INSERT INTO sessions (id, user_id, scenario_id, status, started_at, completed_at, overall_score, trend, ai_summary, progress_percent, xp_earned)
  SELECT
    sd.id,
    test_user_id,
    sd.scenario_id,
    CASE 
      WHEN sd.rn <= 5 THEN 'completed'
      WHEN sd.rn = 6 THEN 'in-progress'
      ELSE 'completed'
    END,
    now() - (random() * interval '30 days'),
    CASE 
      WHEN sd.rn <= 5 THEN now() - (random() * interval '7 days')
      ELSE NULL
    END,
    CASE 
      WHEN sd.rn <= 5 THEN 65 + (random() * 35)::integer
      ELSE NULL
    END,
    CASE 
      WHEN sd.rn <= 5 THEN '+5% vs Last'
      ELSE NULL
    END,
    CASE 
      WHEN sd.rn <= 5 THEN 'You demonstrated strong communication skills. Focus on objection handling techniques.'
      ELSE NULL
    END,
    CASE 
      WHEN sd.rn = 6 THEN 45
      ELSE NULL
    END,
    CASE 
      WHEN sd.rn <= 5 THEN 80 + (random() * 70)::integer
      ELSE 0
    END
  FROM session_data sd;
  
  -- Get session IDs after insert
  SELECT ARRAY_AGG(id) INTO test_session_ids FROM sessions WHERE user_id = test_user_id ORDER BY created_at DESC LIMIT 8;

  -- Get session IDs (after insert)
  SELECT ARRAY_AGG(id) INTO test_session_ids FROM sessions WHERE user_id = test_user_id ORDER BY created_at DESC LIMIT 8;

  -- ============================================
  -- 3. Create Session Competencies
  -- ============================================

  INSERT INTO session_competencies (session_id, competency_name, score, feedback, feedback_type, icon)
  SELECT
    session_id,
    competency,
    CASE competency
      WHEN 'Empathy' THEN 75 + (random() * 20)::integer
      WHEN 'Clarity' THEN 80 + (random() * 15)::integer
      WHEN 'Objection Handling' THEN 60 + (random() * 30)::integer
      WHEN 'Rapport Building' THEN 85 + (random() * 10)::integer
      WHEN 'Pacing' THEN 70 + (random() * 25)::integer
      ELSE 70 + (random() * 25)::integer
    END,
    CASE competency
      WHEN 'Empathy' THEN 'Good use of empathetic language'
      WHEN 'Clarity' THEN 'Clear and concise communication'
      WHEN 'Objection Handling' THEN 'Needs improvement in handling objections'
      WHEN 'Rapport Building' THEN 'Excellent rapport building skills'
      WHEN 'Pacing' THEN 'Good pacing throughout'
      ELSE 'Solid performance'
    END,
    CASE 
      WHEN random() > 0.6 THEN 'positive'
      WHEN random() > 0.3 THEN 'neutral'
      ELSE 'negative'
    END,
    CASE competency
      WHEN 'Empathy' THEN 'favorite'
      WHEN 'Clarity' THEN 'record_voice_over'
      WHEN 'Objection Handling' THEN 'psychology_alt'
      WHEN 'Rapport Building' THEN 'handshake'
      WHEN 'Pacing' THEN 'speed'
      ELSE 'star'
    END
  FROM unnest(test_session_ids) AS session_id,
  unnest(ARRAY['Empathy', 'Clarity', 'Objection Handling', 'Rapport Building', 'Pacing']) AS competency
  WHERE EXISTS (SELECT 1 FROM sessions WHERE id = session_id AND status = 'completed');

  -- ============================================
  -- 4. Create User Performance Snapshots
  -- ============================================

  INSERT INTO user_performance_snapshots (
    user_id, snapshot_date, overall_score, performance_rating, 
    time_trained_hours, time_trained_change_percent, key_strength,
    top_competencies, ai_message, ai_message_detail, period_start, period_end
  )
  VALUES
    (
      test_user_id,
      CURRENT_DATE,
      87.5,
      'EXCELLENT',
      8.2,
      5.2,
      'Clarity',
      '[{"name": "Clarity", "score": 92, "trend": "improving", "icon": "record_voice_over"}, {"name": "Rapport Building", "score": 90, "trend": "stable", "icon": "handshake"}, {"name": "Empathy", "score": 88, "trend": "improving", "icon": "favorite"}]'::jsonb,
      '"You are on track for Q2 objectives!"',
      'Your empathy score in recent simulations has improved by 12%. Keep focusing on active listening techniques.',
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE
    ),
    (
      test_user_id,
      CURRENT_DATE - INTERVAL '7 days',
      82.3,
      'GOOD',
      6.5,
      -2.1,
      'Rapport Building',
      '[{"name": "Rapport Building", "score": 88, "trend": "stable", "icon": "handshake"}, {"name": "Clarity", "score": 85, "trend": "improving", "icon": "record_voice_over"}]'::jsonb,
      '"Good progress! Keep practicing."',
      'Your rapport building skills are strong. Consider focusing on objection handling.',
      CURRENT_DATE - INTERVAL '37 days',
      CURRENT_DATE - INTERVAL '7 days'
    );

  -- ============================================
  -- 5. Create User Stats
  -- ============================================

  INSERT INTO user_stats (
    user_id, period_start, period_end, period_type,
    sessions_count, avg_score, time_trained_hours, xp_earned, current_streak_days, leaderboard_rank
  )
  VALUES
    (
      test_user_id,
      CURRENT_DATE - INTERVAL '7 days',
      CURRENT_DATE,
      'week',
      5,
      87.5,
      2.5,
      450,
      7,
      12
    ),
    (
      test_user_id,
      DATE_TRUNC('month', CURRENT_DATE),
      CURRENT_DATE,
      'month',
      12,
      85.2,
      8.2,
      1200,
      7,
      15
    );

  -- ============================================
  -- 6. Create User Competency Gaps
  -- ============================================

  INSERT INTO user_competency_gaps (
    user_id, competency_name, current_average_score, target_score,
    gap_size, recent_trend, sessions_analyzed
  )
  VALUES
    (test_user_id, 'Objection Handling', 65.5, 80.0, 14.5, 'improving', 8),
    (test_user_id, 'Pacing', 72.0, 80.0, 8.0, 'stable', 8),
    (test_user_id, 'Active Listening', 78.0, 80.0, 2.0, 'improving', 6)
  ON CONFLICT (user_id, competency_name) DO UPDATE
  SET current_average_score = EXCLUDED.current_average_score,
      gap_size = EXCLUDED.gap_size,
      recent_trend = EXCLUDED.recent_trend,
      sessions_analyzed = EXCLUDED.sessions_analyzed,
      last_analyzed_at = now();

  -- ============================================
  -- 7. Create AI Recommendations
  -- ============================================

  INSERT INTO ai_recommendations (
    user_id, recommendation_type, title, description, icon, tags,
    priority, reason, related_scenario_id, related_competency, confidence_score, expires_at
  )
  SELECT
    test_user_id,
    'focus_area',
    'Improve Objection Handling',
    'Your Objection Handling score is 65.5%, which is below your target of 80%. Focus on this area to improve your overall performance.',
    'psychology_alt',
    ARRAY['OBJECTION HANDLING', 'RECOMMENDED'],
    15,
    'Gap of 14.5% below target',
    test_scenario_ids[1],
    'Objection Handling',
    0.85,
    now() + INTERVAL '7 days'
  WHERE EXISTS (SELECT 1 FROM scenarios WHERE id = test_scenario_ids[1])
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- 8. Create User Scenario Progress
  -- ============================================

  -- Create user scenario progress
  INSERT INTO user_scenario_progress (
    user_id, scenario_id, status, last_session_id, best_score, attempts_count, last_accessed_at, completed_at
  )
  SELECT
    test_user_id,
    s.id,
    CASE 
      WHEN row_number() OVER (ORDER BY s.id) = 1 THEN 'completed'
      WHEN row_number() OVER (ORDER BY s.id) = 2 THEN 'in-progress'
      ELSE 'not-started'
    END,
    CASE 
      WHEN row_number() OVER (ORDER BY s.id) <= 2 THEN (
        SELECT id FROM sessions 
        WHERE scenario_id = s.id AND user_id = test_user_id 
        ORDER BY created_at DESC LIMIT 1
      )
      ELSE NULL
    END,
    CASE 
      WHEN row_number() OVER (ORDER BY s.id) = 1 THEN 92
      ELSE NULL
    END,
    CASE 
      WHEN row_number() OVER (ORDER BY s.id) <= 2 THEN 1
      ELSE 0
    END,
    CASE 
      WHEN row_number() OVER (ORDER BY s.id) <= 2 THEN now() - (random() * interval '5 days')
      ELSE NULL
    END,
    CASE 
      WHEN row_number() OVER (ORDER BY s.id) = 1 THEN now() - INTERVAL '2 days'
      ELSE NULL
    END
  FROM (SELECT id FROM scenarios WHERE is_active = true AND created_by = test_user_id LIMIT 5) s
  ON CONFLICT (user_id, scenario_id) DO UPDATE
  SET status = EXCLUDED.status,
      best_score = COALESCE(GREATEST(user_scenario_progress.best_score, EXCLUDED.best_score), EXCLUDED.best_score),
      attempts_count = CASE WHEN EXCLUDED.attempts_count > user_scenario_progress.attempts_count THEN EXCLUDED.attempts_count ELSE user_scenario_progress.attempts_count END,
      last_accessed_at = EXCLUDED.last_accessed_at;

  -- ============================================
  -- 9. Create User Achievements
  -- ============================================

  -- Get achievement IDs
  SELECT ARRAY_AGG(id) INTO test_achievement_ids FROM achievements LIMIT 3;

  INSERT INTO user_achievements (user_id, achievement_id, earned_at, metadata_jsonb)
  SELECT
    test_user_id,
    achievement_id,
    now() - (random() * interval '10 days'),
    '{}'::jsonb
  FROM unnest(test_achievement_ids) AS achievement_id
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  -- ============================================
  -- 10. Create Activity Feed
  -- ============================================

  INSERT INTO activity_feed (
    user_id, activity_type, title, description, icon,
    related_session_id, related_goal_id, related_achievement_id
  )
  VALUES
    (
      test_user_id,
      'session_completed',
      'Completed: High-Value Client Negotiation',
      'Achieved a score of 92%',
      'check_circle',
      (SELECT id FROM sessions WHERE user_id = test_user_id AND status = 'completed' LIMIT 1),
      NULL,
      NULL
    ),
    (
      test_user_id,
      'achievement_earned',
      'Earned: 10 Sessions Milestone',
      'Complete 10 training sessions',
      'emoji_events',
      NULL,
      NULL,
      (SELECT id FROM achievements WHERE code = '10_sessions' LIMIT 1)
    ),
    (
      test_user_id,
      'session_started',
      'Started: Managing an Escalated Complaint',
      'Session in progress',
      'play_circle',
      (SELECT id FROM sessions WHERE user_id = test_user_id AND status = 'in-progress' LIMIT 1),
      NULL,
      NULL
    ),
    (
      test_user_id,
      'milestone_reached',
      'Reached 7-Day Streak!',
      'Keep up the great work',
      'local_fire_department',
      NULL,
      NULL,
      NULL
    )
  WHERE EXISTS (SELECT 1 FROM sessions WHERE user_id = test_user_id LIMIT 1);

  -- ============================================
  -- 11. Create Development Goals (if table exists)
  -- ============================================

  -- Check if development_goals table exists and create test goals
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'development_goals') THEN
      INSERT INTO development_goals (
        user_id, title, description, target_date, progress, status, icon
      )
      VALUES
        (
          test_user_id,
          'Advanced Negotiation',
          'Master complex negotiation tactics focusing on win-win outcomes in high-stakes corporate accounts.',
          CURRENT_DATE + INTERVAL '30 days',
          72,
          'active',
          'handshake'
        ),
        (
          test_user_id,
          'Customer Empathy',
          'Consistently demonstrate empathy in 90% of customer interactions, specifically handling complaints.',
          CURRENT_DATE + INTERVAL '45 days',
          45,
          'active',
          'support_agent'
        )
      ON CONFLICT DO NOTHING
      RETURNING id INTO test_goal_ids;

      -- Update activity feed with goal activities
      INSERT INTO activity_feed (user_id, activity_type, title, description, icon, related_goal_id)
      SELECT
        test_user_id,
        'goal_created',
        'Created: ' || title,
        description,
        'flag',
        id
      FROM development_goals
      WHERE user_id = test_user_id
      AND id NOT IN (SELECT related_goal_id FROM activity_feed WHERE related_goal_id IS NOT NULL)
      LIMIT 2;
    ELSE
      RAISE NOTICE 'development_goals table does not exist. Skipping goal creation.';
    END IF;
  END $$;

  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '   User ID: %', test_user_id;
  RAISE NOTICE '   Scenarios: %', array_length(test_scenario_ids, 1);
  RAISE NOTICE '   Sessions: %', array_length(test_session_ids, 1);

END $$;

