-- ============================================
-- COMPREHENSIVE DIAGNOSTIC AND FIX SCRIPT
-- This will diagnose issues and fix them automatically
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_sessions_count integer;
  v_orphaned_sessions integer;
  v_fixed_count integer;
BEGIN
  -- Step 1: Get the most recent user from auth.users
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ No user found in auth.users. Please create an account first via signup page.';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Found user: % (%)', v_user_email, v_user_id;
  
  -- Step 2: Create/Update profile entry
  INSERT INTO profiles (id, full_name, created_at, updated_at)
  VALUES (
    v_user_id,
    COALESCE(v_user_email, 'User'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET updated_at = now(),
      full_name = COALESCE(profiles.full_name, v_user_email);
  
  RAISE NOTICE '✅ Profile created/updated for user: %', v_user_id;
  
  -- Step 3: Check how many sessions exist and their user_ids
  SELECT COUNT(*) INTO v_sessions_count FROM sessions;
  SELECT COUNT(*) INTO v_orphaned_sessions 
  FROM sessions 
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  RAISE NOTICE '📊 Sessions found: % total, % orphaned (no profile match)', v_sessions_count, v_orphaned_sessions;
  
  -- Step 4: Update ALL sessions to use this user_id
  UPDATE sessions 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % sessions to use user_id: %', v_fixed_count, v_user_id;
  
  -- Step 5: Update user_performance_snapshots
  UPDATE user_performance_snapshots 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % performance snapshots', v_fixed_count;
  END IF;
  
  -- Step 6: Update ai_recommendations
  UPDATE ai_recommendations 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % recommendations', v_fixed_count;
  END IF;
  
  -- Step 7: Update user_competency_gaps
  UPDATE user_competency_gaps 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % competency gaps', v_fixed_count;
  END IF;
  
  -- Step 8: Update user_scenario_progress
  UPDATE user_scenario_progress 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % scenario progress records', v_fixed_count;
  END IF;
  
  -- Step 9: Update user_stats
  UPDATE user_stats 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % user stats records', v_fixed_count;
  END IF;
  
  -- Step 10: Update user_achievements
  UPDATE user_achievements 
  SET user_id = v_user_id
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % user achievements', v_fixed_count;
  END IF;
  
  -- Step 11: Update activity_feed
  UPDATE activity_feed 
  SET user_id = v_user_id
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % activity feed records', v_fixed_count;
  END IF;
  
  -- Step 12: Update development_goals
  UPDATE development_goals 
  SET user_id = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  IF v_fixed_count > 0 THEN
    RAISE NOTICE '✅ Updated % development goals', v_fixed_count;
  END IF;
  
  -- Step 13: If no data exists, create it fresh for this user
  IF NOT EXISTS (SELECT 1 FROM user_stats WHERE user_id = v_user_id) THEN
    RAISE NOTICE '⚠️  No user_stats found. Creating seed data...';
    
    -- Get scenario IDs
    DECLARE
      v_scenario_id_1 uuid;
      v_scenario_id_2 uuid;
      v_scenario_id_3 uuid;
      v_session_id_1 uuid;
      v_session_id_2 uuid;
      v_session_id_3 uuid;
    BEGIN
      -- Get scenario IDs
      SELECT id INTO v_scenario_id_1 FROM scenarios WHERE title LIKE '%High-Value Client%' LIMIT 1;
      SELECT id INTO v_scenario_id_2 FROM scenarios WHERE title LIKE '%Escalated Complaint%' LIMIT 1;
      SELECT id INTO v_scenario_id_3 FROM scenarios WHERE title LIKE '%Performance Review%' LIMIT 1;
      
      -- Create sessions if they don't exist for this user
      IF NOT EXISTS (SELECT 1 FROM sessions WHERE user_id = v_user_id AND scenario_id = v_scenario_id_1) THEN
        INSERT INTO sessions (user_id, scenario_id, status, overall_score, started_at, completed_at, progress_percent, xp_earned, trend, ai_summary)
        VALUES (
          v_user_id, v_scenario_id_1, 'completed', 92,
          (now() - interval '2 days')::timestamptz,
          (now() - interval '2 days' + interval '25 minutes')::timestamptz,
          100, 150, '+5% vs Last', 'Excellent performance in negotiation.'
        ) RETURNING id INTO v_session_id_1;
        
        INSERT INTO sessions (user_id, scenario_id, status, overall_score, started_at, completed_at, progress_percent, xp_earned, trend, ai_summary)
        VALUES (
          v_user_id, v_scenario_id_2, 'completed', 85,
          (now() - interval '1 day')::timestamptz,
          (now() - interval '1 day' + interval '15 minutes')::timestamptz,
          100, 100, '+3% vs Last', 'Good de-escalation skills.'
        ) RETURNING id INTO v_session_id_2;
        
        INSERT INTO sessions (user_id, scenario_id, status, overall_score, started_at, completed_at, progress_percent, xp_earned, trend, ai_summary)
        VALUES (
          v_user_id, v_scenario_id_3, 'in-progress', 0,
          (now() - interval '2 hours')::timestamptz,
          NULL, 45, 0, NULL, NULL
        ) RETURNING id INTO v_session_id_3;
        
        -- Create session competencies
        INSERT INTO session_competencies (session_id, competency_name, score, feedback, feedback_type, icon)
        VALUES
          (v_session_id_1, 'Empathy', 95, 'Consistently validated feelings.', 'positive', 'favorite'),
          (v_session_id_1, 'Clarity', 90, 'Instructions were direct.', 'positive', 'record_voice_over'),
          (v_session_id_1, 'Objection Handling', 88, 'Handled objections smoothly.', 'positive', 'psychology_alt'),
          (v_session_id_1, 'Rapport Building', 92, 'Opened with genuine interest.', 'positive', 'handshake'),
          (v_session_id_2, 'Empathy', 88, 'Strong validation.', 'positive', 'favorite'),
          (v_session_id_2, 'Clarity', 85, 'Clear communication.', 'positive', 'record_voice_over'),
          (v_session_id_2, 'Objection Handling', 82, 'Good handling.', 'neutral', 'psychology_alt'),
          (v_session_id_2, 'Rapport Building', 87, 'Built good rapport.', 'positive', 'handshake');
        
        -- Create user stats
        INSERT INTO user_stats (user_id, period_start, period_end, period_type, sessions_count, avg_score, time_trained_hours, xp_earned, current_streak_days, leaderboard_rank)
        VALUES
          (v_user_id, (CURRENT_DATE - interval '7 days')::date, CURRENT_DATE, 'week', 2, 88.5, 0.67, 250, 2, 12),
          (v_user_id, (CURRENT_DATE - interval '30 days')::date, CURRENT_DATE, 'month', 5, 85.2, 2.5, 650, 2, 15)
        ON CONFLICT (user_id, period_start, period_end, period_type) DO NOTHING;
        
        -- Create performance snapshot
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
          'Your empathy score has improved by 12%.',
          (CURRENT_DATE - interval '30 days')::date, CURRENT_DATE
        )
        ON CONFLICT (user_id, snapshot_date, period_start, period_end) DO NOTHING;
        
        -- Create competency gaps
        INSERT INTO user_competency_gaps (user_id, competency_name, current_average_score, target_score, gap_size, recent_trend, sessions_analyzed, last_analyzed_at)
        VALUES
          (v_user_id, 'Objection Handling', 85.0, 80.0, -5.0, 'stable', 2, now()),
          (v_user_id, 'Active Listening', 75.0, 80.0, 5.0, 'improving', 2, now()),
          (v_user_id, 'Pacing', 78.0, 80.0, 2.0, 'stable', 2, now())
        ON CONFLICT (user_id, competency_name) DO UPDATE
        SET current_average_score = EXCLUDED.current_average_score,
            gap_size = EXCLUDED.gap_size,
            recent_trend = EXCLUDED.recent_trend;
        
        -- Create AI recommendation
        INSERT INTO ai_recommendations (user_id, recommendation_type, title, description, icon, tags, priority, reason, related_competency, confidence_score, expires_at, is_dismissed)
        VALUES (
          v_user_id, 'focus_area', 'Improve Active Listening',
          'Your Active Listening score is 75%, which is below your target of 80%.',
          'hearing', ARRAY['ACTIVE LISTENING', 'RECOMMENDED'], 5,
          'Gap of 5.0% below target', 'Active Listening', 0.75,
          (now() + interval '7 days')::timestamptz, false
        )
        ON CONFLICT DO NOTHING;
        
        -- Create activity feed
        INSERT INTO activity_feed (user_id, activity_type, title, description, icon, related_session_id, metadata_jsonb)
        VALUES
          (v_user_id, 'session_completed', 'Completed: High-Value Client Negotiation', 'Achieved a score of 92%', 'check_circle', v_session_id_1, '{"score": 92}'::jsonb),
          (v_user_id, 'session_completed', 'Completed: Managing an Escalated Complaint', 'Achieved a score of 85%', 'check_circle', v_session_id_2, '{"score": 85}'::jsonb),
          (v_user_id, 'session_started', 'Started: Performance Review Discussion', 'Session in progress', 'play_circle', v_session_id_3, '{}'::jsonb);
        
        -- Create user scenario progress
        INSERT INTO user_scenario_progress (user_id, scenario_id, status, last_session_id, best_score, attempts_count, last_accessed_at, completed_at)
        VALUES
          (v_user_id, v_scenario_id_1, 'completed', v_session_id_1, 92, 1, (now() - interval '2 days')::timestamptz, (now() - interval '2 days')::timestamptz),
          (v_user_id, v_scenario_id_2, 'completed', v_session_id_2, 85, 1, (now() - interval '1 day')::timestamptz, (now() - interval '1 day')::timestamptz),
          (v_user_id, v_scenario_id_3, 'in-progress', v_session_id_3, NULL, 1, (now() - interval '2 hours')::timestamptz, NULL)
        ON CONFLICT (user_id, scenario_id) DO UPDATE
        SET status = EXCLUDED.status,
            last_session_id = EXCLUDED.last_session_id,
            best_score = GREATEST(COALESCE(user_scenario_progress.best_score, 0), COALESCE(EXCLUDED.best_score, 0));
        
        RAISE NOTICE '✅ Created fresh seed data for user: %', v_user_id;
      END IF;
    END;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 FIX COMPLETE!';
  RAISE NOTICE '📊 Verification:';
  RAISE NOTICE '   - Profile: %', (SELECT COUNT(*) FROM profiles WHERE id = v_user_id);
  RAISE NOTICE '   - Sessions: %', (SELECT COUNT(*) FROM sessions WHERE user_id = v_user_id);
  RAISE NOTICE '   - User Stats: %', (SELECT COUNT(*) FROM user_stats WHERE user_id = v_user_id);
  RAISE NOTICE '   - Activity Feed: %', (SELECT COUNT(*) FROM activity_feed WHERE user_id = v_user_id);
  RAISE NOTICE '';
  RAISE NOTICE '✅ Now run: npm run verify-db';
  
END $$;

