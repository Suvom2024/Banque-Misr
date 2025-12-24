import { createClient } from '@/lib/supabase/server'

export interface SessionReportData {
  id: string
  scenarioId: string
  scenarioTitle: string
  overallScore: number
  trend: string | null
  aiSummary: string | null
  competencies: Competency[]
  recommendedCoaching: CoachingRecommendation[]
  previousBest: ComparisonMetric[]
  transcript: TranscriptMessage[]
  startedAt: string
  completedAt: string | null
  duration: number // in minutes
  xpEarned: number
}

export interface Competency {
  id: string
  name: string
  icon: string
  score: number
  feedback: string | null
  feedbackType: 'positive' | 'negative' | 'neutral'
}

export interface CoachingRecommendation {
  id: string
  title: string
  description: string
  actionType: 'scenario' | 'resource' | 'micro-drill'
  actionLabel: string
  relatedScenarioId?: string
}

export interface ComparisonMetric {
  name: string
  current: number
  previous: number
  change: number
  changeType: 'increase' | 'decrease' | 'stable'
}

export interface TranscriptMessage {
  id: string
  speaker: 'user' | 'ai-coach' | 'client' | 'system'
  speakerLabel?: string
  message: string
  timestamp: string
}

/**
 * Get complete session report data
 */
export async function getSessionReport(
  sessionId: string,
  userId: string
): Promise<SessionReportData | null> {
  const supabase = await createClient()

  // Get session with scenario details
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*, scenarios(title)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (sessionError || !session) {
    console.error('Error fetching session:', sessionError)
    return null
  }

  const scenario = session.scenarios as { title: string } | null

  // Get competencies
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('*')
    .eq('session_id', sessionId)
    .order('score', { ascending: false })

  // Get transcript from session_turns or sessions.transcript
  let transcript: TranscriptMessage[] = []
  
  // Try to get from session_turns first (more detailed)
  const { data: turns } = await supabase
    .from('session_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true })

  if (turns && turns.length > 0) {
    transcript = turns.map((turn, index) => ({
      id: turn.id,
      speaker: turn.speaker as TranscriptMessage['speaker'],
      speakerLabel: turn.speaker === 'ai-coach' ? 'AI Coach' : turn.speaker === 'client' ? 'Client' : undefined,
      message: turn.message,
      timestamp: turn.timestamp || new Date().toISOString(),
    }))
  } else if (session.transcript) {
    // Fallback to JSONB transcript
    const transcriptData = session.transcript as any[]
    transcript = transcriptData.map((msg, index) => ({
      id: msg.id || `msg-${index}`,
      speaker: msg.speaker || 'user',
      speakerLabel: msg.speakerLabel,
      message: msg.message || msg.text || '',
      timestamp: msg.timestamp || session.started_at || new Date().toISOString(),
    }))
  }

  // Get previous best scores for comparison
  const previousBest = await getPreviousBestComparison(userId, session.scenario_id, sessionId)

  // Generate recommended coaching
  const recommendedCoaching = await generateCoachingRecommendations(
    sessionId,
    competencies || [],
    session.overall_score || 0
  )

  // Calculate duration
  const duration = session.completed_at && session.started_at
    ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
    : 0

  return {
    id: session.id,
    scenarioId: session.scenario_id,
    scenarioTitle: scenario?.title || 'Unknown Scenario',
    overallScore: session.overall_score || 0,
    trend: session.trend || null,
    aiSummary: session.ai_summary || null,
    competencies: (competencies || []).map((c) => ({
      id: c.id,
      name: c.competency_name,
      icon: c.icon || 'star',
      score: c.score || 0,
      feedback: c.feedback || null,
      feedbackType: (c.feedback_type as Competency['feedbackType']) || 'neutral',
    })),
    recommendedCoaching,
    previousBest,
    transcript,
    startedAt: session.started_at || new Date().toISOString(),
    completedAt: session.completed_at || null,
    duration,
    xpEarned: session.xp_earned || 0,
  }
}

/**
 * Get previous best comparison metrics
 */
async function getPreviousBestComparison(
  userId: string,
  scenarioId: string,
  currentSessionId: string
): Promise<ComparisonMetric[]> {
  const supabase = await createClient()

  // Get current session competencies
  const { data: currentCompetencies } = await supabase
    .from('session_competencies')
    .select('competency_name, score')
    .eq('session_id', currentSessionId)

  if (!currentCompetencies || currentCompetencies.length === 0) {
    return []
  }

  // Get previous sessions for this scenario
  const { data: previousSessions } = await supabase
    .from('sessions')
    .select('id, overall_score')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .eq('status', 'completed')
    .neq('id', currentSessionId)
    .order('completed_at', { ascending: false })
    .limit(1)

  if (!previousSessions || previousSessions.length === 0) {
    // No previous sessions, return empty
    return []
  }

  const previousSessionId = previousSessions[0].id
  const previousOverallScore = previousSessions[0].overall_score || 0

  // Get previous competencies
  const { data: previousCompetencies } = await supabase
    .from('session_competencies')
    .select('competency_name, score')
    .eq('session_id', previousSessionId)

  const previousMap = new Map(
    (previousCompetencies || []).map((c) => [c.competency_name, c.score || 0])
  )

  const currentOverallScore = previousSessions[0].overall_score || 0
  const currentMap = new Map(
    currentCompetencies.map((c) => [c.competency_name, c.score || 0])
  )

  const metrics: ComparisonMetric[] = []

  // Overall score comparison
  const overallChange = currentOverallScore - previousOverallScore
  metrics.push({
    name: 'Overall Score',
    current: currentOverallScore,
    previous: previousOverallScore,
    change: Math.abs(overallChange),
    changeType: overallChange > 0 ? 'increase' : overallChange < 0 ? 'decrease' : 'stable',
  })

  // Competency comparisons
  const allCompetencies = new Set([
    ...Array.from(currentMap.keys()),
    ...Array.from(previousMap.keys()),
  ])

  allCompetencies.forEach((competencyName) => {
    const current = currentMap.get(competencyName) || 0
    const previous = previousMap.get(competencyName) || 0
    const change = current - previous

    if (Math.abs(change) > 0) {
      metrics.push({
        name: competencyName,
        current,
        previous,
        change: Math.abs(change),
        changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
      })
    }
  })

  return metrics
}

/**
 * Generate coaching recommendations based on session performance
 */
async function generateCoachingRecommendations(
  sessionId: string,
  competencies: any[],
  overallScore: number
): Promise<CoachingRecommendation[]> {
  const supabase = await createClient()

  const recommendations: CoachingRecommendation[] = []

  // Find competencies that need improvement (score < 70)
  const weakCompetencies = competencies.filter((c) => (c.score || 0) < 70)

  for (const competency of weakCompetencies.slice(0, 3)) {
    // Find related scenarios for this competency
    const { data: relatedScenarios } = await supabase
      .from('scenarios')
      .select('id, title')
      .contains('tags', [competency.competency_name])
      .eq('is_active', true)
      .limit(1)

    recommendations.push({
      id: `rec-${competency.id}`,
      title: `Improve ${competency.competency_name}`,
      description: competency.feedback || `Your ${competency.competency_name} score is ${competency.score}%. Focus on this area to improve your overall performance.`,
      actionType: relatedScenarios && relatedScenarios.length > 0 ? 'scenario' : 'resource',
      actionLabel: relatedScenarios && relatedScenarios.length > 0 ? 'Start Scenario' : 'View Resource',
      relatedScenarioId: relatedScenarios?.[0]?.id,
    })
  }

  // Add general recommendations if score is low
  if (overallScore < 75 && recommendations.length === 0) {
    recommendations.push({
      id: 'rec-general',
      title: 'Practice More Scenarios',
      description: 'Your overall score suggests more practice would be beneficial. Try completing similar scenarios to build confidence.',
      actionType: 'scenario',
      actionLabel: 'Browse Scenarios',
    })
  }

  return recommendations
}

/**
 * Get session by ID (basic)
 */
export async function getSessionById(
  sessionId: string,
  userId?: string
): Promise<any | null> {
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

  return session
}

