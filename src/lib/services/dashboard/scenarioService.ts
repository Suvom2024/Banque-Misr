import { createClient } from '@/lib/supabase/server'
import type { ScenarioWithProgress, ScenarioStatus } from '@/types/dashboard'

/**
 * Get user training scenarios with progress
 */
export async function getUserTrainingScenarios(
  userId: string,
  filter: 'all' | 'recommended' = 'recommended',
  limit: number = 6
): Promise<ScenarioWithProgress[]> {
  const supabase = await createClient()

  // Get active scenarios
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit * 2) // Get more to filter

  if (!scenarios || scenarios.length === 0) {
    return []
  }

  // Get user progress for all scenarios
  const scenarioIds = scenarios.map((s) => s.id)
  const { data: progress } = await supabase
    .from('user_scenario_progress')
    .select('*, last_session_id')
    .eq('user_id', userId)
    .in('scenario_id', scenarioIds)

  const progressMap = new Map<string, typeof progress[0]>()
  progress?.forEach((p) => {
    progressMap.set(p.scenario_id, p)
  })

  // Get active sessions for in-progress status
  const { data: activeSessions } = await supabase
    .from('sessions')
    .select('id, scenario_id, progress_percent')
    .eq('user_id', userId)
    .eq('status', 'in-progress')
    .in('scenario_id', scenarioIds)

  const activeSessionMap = new Map<string, typeof activeSessions[0]>()
  activeSessions?.forEach((s) => {
    activeSessionMap.set(s.scenario_id, s)
  })

  // Build result
  const result: ScenarioWithProgress[] = scenarios
    .map((scenario) => {
      const userProgress = progressMap.get(scenario.id)
      const activeSession = activeSessionMap.get(scenario.id)

      let status: ScenarioStatus = 'not-started'
      let score: number | undefined
      let progress: number | undefined

      if (activeSession) {
        status = 'in-progress'
        progress = activeSession.progress_percent || 0
      } else if (userProgress) {
        status = userProgress.status as ScenarioStatus
        score = userProgress.best_score || undefined
      }

      const duration = scenario.duration_minutes
        ? `${scenario.duration_minutes} min${scenario.duration_minutes > 1 ? 's' : ''}`
        : 'N/A'

      return {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description || '',
        status,
        tags: scenario.tags || [],
        duration,
        score,
        progress,
        bestScore: userProgress?.best_score || undefined,
        attemptsCount: userProgress?.attempts_count || 0,
        lastSessionId: userProgress?.last_session_id || activeSession?.id || undefined,
      }
    })
    .filter((s) => {
      if (filter === 'recommended') {
        return s.status !== 'not-started'
      }
      return true
    })
    .slice(0, limit)

  return result
}

/**
 * Get scenario status for user
 */
export async function getScenarioStatus(userId: string, scenarioId: string): Promise<ScenarioStatus> {
  const supabase = await createClient()

  // Check for active session
  const { data: activeSession } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .eq('status', 'in-progress')
    .limit(1)
    .single()

  if (activeSession) {
    return 'in-progress'
  }

  // Check user progress
  const { data: progress } = await supabase
    .from('user_scenario_progress')
    .select('status')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .single()

  if (progress) {
    return progress.status as ScenarioStatus
  }

  return 'not-started'
}

