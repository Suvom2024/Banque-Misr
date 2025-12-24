-- ============================================
-- SEED DATA FOR DASHBOARD TABLES
-- Run this AFTER running 001_dashboard_tables.sql
-- ============================================

-- Get the first user ID (you can replace this with your actual user ID)
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
  v_achievement_id_2 uuid;
  v_goal_id_1 uuid;
  v_goal_id_2 uuid;
BEGIN
  -- Get first user from profiles (or use auth.users if profiles is empty)
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  END IF;

  -- If still no user, create a test user profile entry
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found. Please create a user first or replace v_user_id with your actual user ID.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using user_id: %', v_user_id;

  -- Check if scenarios table exists, if not create test scenarios
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

  -- Create test sessions (only if sessions table exists and we have scenarios)
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

  -- Create session competencies (only if sessions exist)
  IF v_session_id_1 IS NOT NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'session_competencies') THEN
  INSERT INTO session_competencies (session_id, competency_name, score, feedback, feedback_type, icon)
  VALUES
    -- Session 1 competencies
    (v_session_id_1, 'Empathy', 95, 'Consistently validated feelings using phrases like "I understand why..."', 'positive', 'favorite'),
    (v_session_id_1, 'Clarity', 90, 'Instructions were direct. Minimal filler words used.', 'positive', 'record_voice_over'),
    (v_session_id_1, 'Objection Handling', 88, 'Handled objections smoothly with the A-R-C method.', 'positive', 'psychology_alt'),
    (v_session_id_1, 'Rapport Building', 92, 'Opened with genuine interest in the client''s needs.', 'positive', 'handshake'),
    -- Session 2 competencies
    (v_session_id_2, 'Empathy', 88, 'Strong validation of customer concerns.', 'positive', 'favorite'),
    (v_session_id_2, 'Clarity', 85, 'Clear communication throughout.', 'positive', 'record_voice_over'),
    (v_session_id_2, 'Objection Handling', 82, 'Good handling of complaints.', 'neutral', 'psychology_alt'),
    (v_session_id_2, 'Rapport Building', 87, 'Built good rapport quickly.', 'positive', 'handshake');
  END IF;

  -- Create user scenario progress (only if scenarios exist)
  IF v_scenario_id_1 IS NOT NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_scenario_progress') THEN
  INSERT INTO user_scenario_progress (user_id, scenario_id, status, last_session_id, best_score, attempts_count, last_accessed_at, completed_at)
  VALUES
    (v_user_id, v_scenario_id_1, 'completed', v_session_id_1, 92, 1, (now() - interval '2 days')::timestamptz, (now() - interval '2 days')::timestamptz),
    (v_user_id, v_scenario_id_2, 'completed', v_session_id_2, 85, 1, (now() - interval '1 day')::timestamptz, (now() - interval '1 day')::timestamptz),
    (v_user_id, v_scenario_id_3, 'in-progress', v_session_id_3, NULL, 1, (now() - interval '2 hours')::timestamptz, NULL)
  ON CONFLICT (user_id, scenario_id) DO UPDATE
  SET status = EXCLUDED.status,
      last_session_id = EXCLUDED.last_session_id,
      best_score = GREATEST(user_scenario_progress.best_score, EXCLUDED.best_score),
      attempts_count = user_scenario_progress.attempts_count + 1,
      last_accessed_at = EXCLUDED.last_accessed_at,
      completed_at = EXCLUDED.completed_at;
  END IF;

  -- Create user performance snapshot
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_performance_snapshots') THEN
  INSERT INTO user_performance_snapshots (
    user_id,
    snapshot_date,
    overall_score,
    performance_rating,
    time_trained_hours,
    time_trained_change_percent,
    key_strength,
    top_competencies,
    ai_message,
    ai_message_detail,
    period_start,
    period_end
  )
  VALUES (
    v_user_id,
    CURRENT_DATE,
    87.5,
    'EXCELLENT',
    0.67,
    5.2,
    'Empathy',
    '[
      {"name": "Empathy", "score": 91.5, "trend": "improving", "icon": "favorite"},
      {"name": "Rapport Building", "score": 89.5, "trend": "stable", "icon": "handshake"},
      {"name": "Clarity", "score": 87.5, "trend": "improving", "icon": "record_voice_over"},
      {"name": "Objection Handling", "score": 85.0, "trend": "stable", "icon": "psychology_alt"}
    ]'::jsonb,
    '"You are on track for Q2 objectives!"',
    'Your empathy score in recent simulations has improved by 12%. Keep focusing on active listening techniques.',
    (CURRENT_DATE - interval '30 days')::date,
    CURRENT_DATE
  )
  ON CONFLICT (user_id, snapshot_date, period_start, period_end) DO NOTHING;
  END IF;

  -- Create user stats
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats') THEN
  INSERT INTO user_stats (
    user_id,
    period_start,
    period_end,
    period_type,
    sessions_count,
    avg_score,
    time_trained_hours,
    xp_earned,
    current_streak_days,
    leaderboard_rank
  )
  VALUES
    (
      v_user_id,
      (CURRENT_DATE - interval '7 days')::date,
      CURRENT_DATE,
      'week',
      2,
      88.5,
      0.67,
      250,
      2,
      12
    ),
    (
      v_user_id,
      (CURRENT_DATE - interval '30 days')::date,
      CURRENT_DATE,
      'month',
      5,
      85.2,
      2.5,
      650,
      2,
      15
    )
  ON CONFLICT (user_id, period_start, period_end, period_type) DO NOTHING;
  END IF;

  -- Create competency gaps
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_competency_gaps') THEN
  INSERT INTO user_competency_gaps (
    user_id,
    competency_name,
    current_average_score,
    target_score,
    gap_size,
    recent_trend,
    sessions_analyzed,
    last_analyzed_at
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
    user_id,
    recommendation_type,
    title,
    description,
    icon,
    tags,
    priority,
    reason,
    related_scenario_id,
    related_competency,
    confidence_score,
    expires_at,
    is_dismissed
  )
  VALUES (
    v_user_id,
    'focus_area',
    'Improve Active Listening',
    'Your Active Listening score is 75%, which is below your target of 80%. Focus on this area to improve your overall performance.',
    'hearing',
    ARRAY['ACTIVE LISTENING', 'RECOMMENDED'],
    5,
    'Gap of 5.0% below target',
    NULL,
    'Active Listening',
    0.75,
    (now() + interval '7 days')::timestamptz,
    false
  )
  ON CONFLICT DO NOTHING;
  END IF;

  -- Get achievement IDs
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievements') THEN
  SELECT id INTO v_achievement_id_1 FROM achievements WHERE code = '10_sessions';
  SELECT id INTO v_achievement_id_2 FROM achievements WHERE code = 'perfect_score';

    -- Create user achievements (if achievements exist)
    IF v_achievement_id_1 IS NOT NULL AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at, metadata_jsonb)
      VALUES (v_user_id, v_achievement_id_1, (now() - interval '5 days')::timestamptz, '{"sessions_completed": 10}'::jsonb)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END IF;

  -- Create activity feed entries
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_feed') THEN
  INSERT INTO activity_feed (
    user_id,
    activity_type,
    title,
    description,
    icon,
    related_session_id,
    metadata_jsonb
  )
  VALUES
    (
      v_user_id,
      'session_completed',
      'Completed: High-Value Client Negotiation',
      'Achieved a score of 92%',
      'check_circle',
      v_session_id_1,
      '{"score": 92, "duration": 25}'::jsonb
    ),
    (
      v_user_id,
      'session_completed',
      'Completed: Managing an Escalated Complaint',
      'Achieved a score of 85%',
      'check_circle',
      v_session_id_2,
      '{"score": 85, "duration": 15}'::jsonb
    ),
    (
      v_user_id,
      'session_started',
      'Started: Performance Review Discussion',
      'Session in progress',
      'play_circle',
      v_session_id_3,
      '{}'::jsonb
    ),
    (
      v_user_id,
      'achievement_earned',
      'Achievement Unlocked: 10 Sessions Milestone',
      'Complete 10 training sessions',
      'emoji_events',
      NULL,
      '{"achievement_code": "10_sessions"}'::jsonb
    )
  ON CONFLICT DO NOTHING;
  END IF;

  -- Create development goals (if table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'development_goals') THEN
    BEGIN
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

      -- Add activity feed entries for goals
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
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error creating development goals: %', SQLERRM;
    END;
  END IF;

  RAISE NOTICE 'Seed data created successfully for user: %', v_user_id;
  RAISE NOTICE 'Scenarios created: %, %, %', v_scenario_id_1, v_scenario_id_2, v_scenario_id_3;
  RAISE NOTICE 'Sessions created: %, %, %', v_session_id_1, v_session_id_2, v_session_id_3;

END $$;

