-- ============================================
-- VERIFICATION SCRIPT - Run this to check everything
-- ============================================

-- 1. Check all tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles',
    'scenarios',
    'sessions',
    'session_competencies',
    'development_goals',
    'user_performance_snapshots',
    'ai_recommendations',
    'user_competency_gaps',
    'user_scenario_progress',
    'user_stats',
    'achievements',
    'user_achievements',
    'activity_feed'
  )
ORDER BY table_name;

-- 2. Check table row counts
SELECT 
  'Data Check' as check_type,
  'profiles' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END as status
FROM profiles
UNION ALL
SELECT 'Data Check', 'scenarios', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM scenarios
UNION ALL
SELECT 'Data Check', 'sessions', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM sessions
UNION ALL
SELECT 'Data Check', 'session_competencies', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM session_competencies
UNION ALL
SELECT 'Data Check', 'user_performance_snapshots', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM user_performance_snapshots
UNION ALL
SELECT 'Data Check', 'ai_recommendations', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM ai_recommendations
UNION ALL
SELECT 'Data Check', 'user_competency_gaps', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM user_competency_gaps
UNION ALL
SELECT 'Data Check', 'user_scenario_progress', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM user_scenario_progress
UNION ALL
SELECT 'Data Check', 'user_stats', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM user_stats
UNION ALL
SELECT 'Data Check', 'achievements', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM achievements
UNION ALL
SELECT 'Data Check', 'user_achievements', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM user_achievements
UNION ALL
SELECT 'Data Check', 'activity_feed', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM activity_feed
UNION ALL
SELECT 'Data Check', 'development_goals', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️ EMPTY' END FROM development_goals
ORDER BY table_name;

-- 3. Check foreign key relationships
SELECT 
  'Foreign Keys' as check_type,
  tc.table_name || ' -> ' || ccu.table_name AS relationship,
  tc.constraint_name,
  CASE WHEN tc.constraint_name IS NOT NULL THEN '✅ LINKED' ELSE '❌ MISSING' END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    tc.table_name IN (
      'user_performance_snapshots',
      'ai_recommendations',
      'user_competency_gaps',
      'user_scenario_progress',
      'user_stats',
      'user_achievements',
      'activity_feed',
      'sessions',
      'session_competencies',
      'scenarios',
      'development_goals'
    )
  )
ORDER BY tc.table_name, ccu.table_name;

-- 4. Check indexes
SELECT 
  'Indexes' as check_type,
  tablename,
  indexname,
  CASE WHEN indexname IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'user_performance_snapshots',
    'ai_recommendations',
    'user_competency_gaps',
    'user_scenario_progress',
    'user_stats',
    'achievements',
    'user_achievements',
    'activity_feed'
  )
ORDER BY tablename, indexname;

-- 5. Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  schemaname || '.' || tablename as table_name,
  policyname,
  CASE WHEN policyname IS NOT NULL THEN '✅ ENABLED' ELSE '⚠️ NO POLICY' END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_performance_snapshots',
    'ai_recommendations',
    'user_competency_gaps',
    'user_scenario_progress',
    'user_stats',
    'achievements',
    'user_achievements',
    'activity_feed'
  )
ORDER BY tablename, policyname;

-- 6. Check RLS is enabled on tables
SELECT 
  'RLS Status' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_performance_snapshots',
    'ai_recommendations',
    'user_competency_gaps',
    'user_scenario_progress',
    'user_stats',
    'achievements',
    'user_achievements',
    'activity_feed'
  )
ORDER BY tablename;

-- 7. Sample data verification - Check if user has data
SELECT 
  'User Data Sample' as check_type,
  'User ID' as field,
  id::text as value,
  '✅' as status
FROM profiles
LIMIT 1;

-- 8. Check scenarios data
SELECT 
  'Scenarios Sample' as check_type,
  title,
  category,
  difficulty,
  '✅' as status
FROM scenarios
LIMIT 5;

-- 9. Check sessions data
SELECT 
  'Sessions Sample' as check_type,
  s.id::text as session_id,
  s.status,
  s.overall_score,
  sc.title as scenario_title,
  '✅' as status
FROM sessions s
LEFT JOIN scenarios sc ON s.scenario_id = sc.id
LIMIT 5;

-- 10. Check user stats
SELECT 
  'User Stats Sample' as check_type,
  period_type,
  sessions_count,
  avg_score,
  current_streak_days,
  '✅' as status
FROM user_stats
LIMIT 5;

-- 11. Summary report
SELECT 
  '📊 SUMMARY' as report_section,
  'Total Tables Created' as metric,
  COUNT(*)::text as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'scenarios', 'sessions', 'session_competencies', 'development_goals',
    'user_performance_snapshots', 'ai_recommendations', 'user_competency_gaps',
    'user_scenario_progress', 'user_stats', 'achievements', 'user_achievements', 'activity_feed'
  );

SELECT 
  '📊 SUMMARY' as report_section,
  'Total Foreign Keys' as metric,
  COUNT(*)::text as value
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public'
  AND table_name IN (
    'user_performance_snapshots', 'ai_recommendations', 'user_competency_gaps',
    'user_scenario_progress', 'user_stats', 'achievements', 'user_achievements', 'activity_feed',
    'sessions', 'session_competencies', 'scenarios', 'development_goals'
  );

SELECT 
  '📊 SUMMARY' as report_section,
  'Total Indexes' as metric,
  COUNT(*)::text as value
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'user_performance_snapshots', 'ai_recommendations', 'user_competency_gaps',
    'user_scenario_progress', 'user_stats', 'achievements', 'user_achievements', 'activity_feed'
  );

SELECT 
  '📊 SUMMARY' as report_section,
  'Tables with RLS Enabled' as metric,
  COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'user_performance_snapshots', 'ai_recommendations', 'user_competency_gaps',
    'user_scenario_progress', 'user_stats', 'achievements', 'user_achievements', 'activity_feed'
  );

