import { createClient } from '@/lib/supabase/server'

export interface SessionData {
  id: string
  userId: string
  scenarioId: string
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'abandoned'
  startedAt: string | null
  completedAt: string | null
  overallScore: number | null
  progressPercent: number
  xpEarned: number
  scenarioTitle?: string
  scenarioCategory?: string
}

/**
 * Create a new session for a user and scenario
 */
export async function createSession(
  userId: string,
  scenarioId: string
): Promise<SessionData | null> {
  const supabase = await createClient()

  // Check if there's an existing in-progress session for this scenario
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .eq('status', 'in-progress')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingSession) {
    // Return existing session instead of creating a new one
    return getSessionById(existingSession.id, userId)
  }

  // Get scenario details
  const { data: scenario } = await supabase
    .from('scenarios')
    .select('title, category, estimated_xp')
    .eq('id', scenarioId)
    .single()

  if (!scenario) {
    throw new Error('Scenario not found')
  }

  // Create new session
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      status: 'in-progress',
      started_at: new Date().toISOString(),
      progress_percent: 0,
      xp_earned: 0,
    })
    .select('*')
    .single()

  if (error || !session) {
    console.error('Error creating session:', error)
    return null
  }

  // Update user_scenario_progress
  await supabase
    .from('user_scenario_progress')
    .upsert({
      user_id: userId,
      scenario_id: scenarioId,
      status: 'in-progress',
      last_accessed_at: new Date().toISOString(),
      attempts_count: 1,
    }, {
      onConflict: 'user_id,scenario_id',
    })

  return {
    id: session.id,
    userId: session.user_id,
    scenarioId: session.scenario_id,
    status: session.status as SessionData['status'],
    startedAt: session.started_at,
    completedAt: session.completed_at,
    overallScore: session.overall_score,
    progressPercent: session.progress_percent || 0,
    xpEarned: session.xp_earned || 0,
    scenarioTitle: scenario.title,
    scenarioCategory: scenario.category || undefined,
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(
  sessionId: string,
  userId?: string
): Promise<SessionData | null> {
  const supabase = await createClient()

  let query = supabase
    .from('sessions')
    .select('*, scenarios(title, category)')
    .eq('id', sessionId)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: session, error } = await query.single()

  if (error || !session) {
    return null
  }

  const scenario = session.scenarios as { title: string; category: string } | null

  return {
    id: session.id,
    userId: session.user_id,
    scenarioId: session.scenario_id,
    status: session.status as SessionData['status'],
    startedAt: session.started_at,
    completedAt: session.completed_at,
    overallScore: session.overall_score,
    progressPercent: session.progress_percent || 0,
    xpEarned: session.xp_earned || 0,
    scenarioTitle: scenario?.title,
    scenarioCategory: scenario?.category,
  }
}

/**
 * Update session progress
 */
export async function updateSessionProgress(
  sessionId: string,
  userId: string,
  updates: {
    progressPercent?: number
    status?: SessionData['status']
    overallScore?: number
    xpEarned?: number
    completedAt?: string
    currentTurn?: number
    totalTurns?: number
    transcript?: any[]
    realTimeMetrics?: Record<string, any>
  }
): Promise<boolean> {
  const supabase = await createClient()

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (updates.progressPercent !== undefined) {
    updateData.progress_percent = updates.progressPercent
  }
  if (updates.status) {
    updateData.status = updates.status
  }
  if (updates.overallScore !== undefined) {
    updateData.overall_score = updates.overallScore
  }
  if (updates.xpEarned !== undefined) {
    updateData.xp_earned = updates.xpEarned
  }
  if (updates.completedAt) {
    updateData.completed_at = updates.completedAt
  }
  if (updates.currentTurn !== undefined) {
    updateData.current_turn = updates.currentTurn
  }
  if (updates.totalTurns !== undefined) {
    updateData.total_turns = updates.totalTurns
  }
  if (updates.transcript) {
    updateData.transcript = updates.transcript
  }
  if (updates.realTimeMetrics) {
    updateData.real_time_metrics = updates.realTimeMetrics
  }

  const { error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating session:', error)
    return false
  }

  // If session is completed, update user_scenario_progress
  if (updates.status === 'completed' && updates.overallScore !== undefined) {
    const { data: session } = await supabase
      .from('sessions')
      .select('scenario_id, overall_score')
      .eq('id', sessionId)
      .single()

    if (session) {
      // Get current progress
      const { data: currentProgress } = await supabase
        .from('user_scenario_progress')
        .select('best_score, attempts_count')
        .eq('user_id', userId)
        .eq('scenario_id', session.scenario_id)
        .single()

      await supabase
        .from('user_scenario_progress')
        .upsert({
          user_id: userId,
          scenario_id: session.scenario_id,
          status: 'completed',
          last_session_id: sessionId,
          best_score: Math.max(
            session.overall_score,
            currentProgress?.best_score || 0
          ),
          attempts_count: (currentProgress?.attempts_count || 0) + 1,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,scenario_id',
        })
    }
  }

  return true
}

