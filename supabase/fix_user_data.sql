-- ============================================
-- FIX USER DATA - Run this to link seed data to your user
-- ============================================

-- Step 1: Get your user ID from auth.users
SELECT 
  'Your User ID' as info,
  id::text as user_id,
  email
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- Step 2: Create profile entry if missing
-- Replace 'YOUR_USER_ID_HERE' with the ID from Step 1
DO $$
DECLARE
  v_user_id uuid;
  v_profile_exists boolean;
BEGIN
  -- Get the most recent user
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found in auth.users. Please create an account first.';
    RETURN;
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = v_user_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    -- Create profile entry
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (
      v_user_id,
      COALESCE((SELECT email FROM auth.users WHERE id = v_user_id), 'User'),
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE '✅ Created profile for user: %', v_user_id;
  ELSE
    RAISE NOTICE '✅ Profile already exists for user: %', v_user_id;
  END IF;
  
  -- Step 3: Update all seed data to use this user_id
  -- Update sessions
  UPDATE sessions 
  SET user_id = v_user_id 
  WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM profiles);
  
  -- Update user_performance_snapshots
  UPDATE user_performance_snapshots 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update ai_recommendations
  UPDATE ai_recommendations 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update user_competency_gaps
  UPDATE user_competency_gaps 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update user_scenario_progress
  UPDATE user_scenario_progress 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update user_stats
  UPDATE user_stats 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update user_achievements
  UPDATE user_achievements 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update activity_feed
  UPDATE activity_feed 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  -- Update development_goals
  UPDATE development_goals 
  SET user_id = v_user_id 
  WHERE user_id NOT IN (SELECT id FROM profiles);
  
  RAISE NOTICE '✅ Updated all seed data to use user_id: %', v_user_id;
  RAISE NOTICE '📊 Run the verification script again to confirm: npm run verify-db';
  
END $$;

-- Step 4: Verify the fix
SELECT 
  'Verification' as check_type,
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 'Verification', 'user_stats', COUNT(*) FROM user_stats
UNION ALL
SELECT 'Verification', 'user_performance_snapshots', COUNT(*) FROM user_performance_snapshots
UNION ALL
SELECT 'Verification', 'activity_feed', COUNT(*) FROM activity_feed;

