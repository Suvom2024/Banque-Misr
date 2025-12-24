import { createClient } from '@/lib/supabase/server'

export interface SessionReviewData {
  title: string
  date: string
  time: string
  duration: string
  overallScore: number
  trend: string
  executiveSummary: string
  keyTakeaways: string[]
  personalBest: {
    sessionNumber: string
    metrics: Array<{
      name: string
      current: number
      change: number
      changeType: 'increase' | 'decrease' | 'stable'
    }>
  }
  competencies: Array<{
    id: string
    name: string
    subtitle: string
    score: number
    feedback: string | null
    scoreType: 'green' | 'yellow' | 'red'
  }>
  transcript: Array<{
    id: string
    speaker: 'user' | 'client' | 'ai-coach'
    speakerName: string
    message: string
  }>
  aiCoaching: Array<{
    id: string
    title: string
    description: string
    priority: number
  }>
  managerFeedback: Array<{
    id: string
    managerName: string
    comment: string
    rating: number | null
    createdAt: string
  }>
  audioUrl: string | null
}

/**
 * Get session review data
 */
export async function getSessionReview(
  sessionId: string,
  userId: string
): Promise<SessionReviewData | null> {
  const supabase = await createClient()

  // Get session with scenario
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, scenarios(title)')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error || !session) {
    return null
  }

  const scenario = session.scenarios as { title: string } | null

  // Get competencies
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('*')
    .eq('session_id', sessionId)
    .order('score', { ascending: false })

  // Get transcript from session_turns
  const { data: turns } = await supabase
    .from('session_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true })

  // Get manager feedback
  const { data: feedback } = await supabase
    .from('manager_feedback')
    .select('*, profiles(full_name)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  // Get AI coaching recommendations (from agent analysis or generate)
  const aiCoaching = await generateAICoachingRecommendations(sessionId, competencies || [])

  // Calculate personal best
  const personalBest = await calculatePersonalBest(userId, session.scenario_id, sessionId, session.overall_score || 0)

  // Format date and time
  const sessionDate = session.completed_at || session.started_at
  const date = sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
  const time = sessionDate ? new Date(sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
  
  // Calculate duration
  const duration = session.completed_at && session.started_at
    ? calculateDuration(session.started_at, session.completed_at)
    : 'N/A'

  // Format competencies with score types
  const formattedCompetencies = (competencies || []).map((c) => ({
    id: c.id,
    name: c.competency_name,
    subtitle: getCompetencySubtitle(c.competency_name),
    score: c.score || 0,
    feedback: c.feedback,
    scoreType: getScoreType(c.score || 0),
  }))

  // Format transcript
  const transcript = (turns || []).map((turn) => ({
    id: turn.id,
    speaker: turn.speaker === 'user' ? 'user' : turn.speaker === 'client' ? 'client' : 'ai-coach',
    speakerName: turn.speaker === 'user' ? 'You' : turn.speaker === 'client' ? 'Client' : 'AI Coach',
    message: turn.message,
  }))

  // Format manager feedback
  const managerFeedback = (feedback || []).map((f) => ({
    id: f.id,
    managerName: (f.profiles as { full_name: string } | null)?.full_name || 'Manager',
    comment: f.comment,
    rating: f.rating,
    createdAt: f.created_at,
  }))

  // Extract key takeaways from AI summary
  const keyTakeaways = extractKeyTakeaways(session.ai_summary || '')

  return {
    title: scenario?.title || 'Unknown Session',
    date,
    time,
    duration,
    overallScore: session.overall_score || 0,
    trend: session.trend || '',
    executiveSummary: session.ai_summary || '',
    keyTakeaways,
    personalBest,
    competencies: formattedCompetencies,
    transcript,
    aiCoaching,
    managerFeedback,
    audioUrl: session.audio_recording_url || null,
  }
}

/**
 * Calculate duration string
 */
function calculateDuration(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt)
  const end = new Date(completedAt)
  const diffMs = end.getTime() - start.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')} Total`
}

/**
 * Get competency subtitle
 */
function getCompetencySubtitle(competencyName: string): string {
  const subtitles: Record<string, string> = {
    'Tone': 'Confidence & Warmth',
    'Clarity': 'Articulation & Structure',
    'Empathy': 'Active Listening',
    'Pace': 'Speed & Pausing',
    'Objection Handling': 'Response Strategy',
    'Rapport Building': 'Connection & Trust',
  }
  return subtitles[competencyName] || competencyName
}

/**
 * Get score type based on score
 */
function getScoreType(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 80) return 'green'
  if (score >= 70) return 'yellow'
  return 'red'
}

/**
 * Extract key takeaways from AI summary
 */
function extractKeyTakeaways(summary: string): string[] {
  // Simple extraction - look for capitalized phrases or key terms
  const takeaways: string[] = []
  
  // Look for common patterns
  const patterns = [
    /(?:strong|excellent|good)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
    /(?:focus|improve|work on)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  ]

  patterns.forEach((pattern) => {
    const matches = summary.match(pattern)
    if (matches) {
      matches.slice(0, 3).forEach((match) => {
        const cleaned = match.replace(/^(?:strong|excellent|good|focus|improve|work on)\s+/i, '').trim()
        if (cleaned && !takeaways.includes(cleaned)) {
          takeaways.push(cleaned)
        }
      })
    }
  })

  // Fallback: extract first 3 capitalized words/phrases
  if (takeaways.length === 0) {
    const words = summary.split(/\s+/)
    const capitalized = words.filter((w) => /^[A-Z]/.test(w)).slice(0, 3)
    takeaways.push(...capitalized)
  }

  return takeaways.slice(0, 3)
}

/**
 * Generate AI coaching recommendations
 */
async function generateAICoachingRecommendations(
  sessionId: string,
  competencies: any[]
): Promise<Array<{ id: string; title: string; description: string; priority: number }>> {
  const recommendations: Array<{ id: string; title: string; description: string; priority: number }> = []

  // Find competencies that need improvement
  const weakCompetencies = competencies.filter((c) => (c.score || 0) < 75).slice(0, 3)

  weakCompetencies.forEach((competency, index) => {
    recommendations.push({
      id: `coaching-${competency.id}`,
      title: `Improve ${competency.competency_name}`,
      description: competency.feedback || `Focus on developing your ${competency.competency_name.toLowerCase()} skills.`,
      priority: index + 1,
    })
  })

  return recommendations
}

/**
 * Calculate personal best comparison
 */
async function calculatePersonalBest(
  userId: string,
  scenarioId: string,
  currentSessionId: string,
  currentScore: number
): Promise<SessionReviewData['personalBest']> {
  const supabase = await createClient()

  // Get all sessions for this scenario
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, overall_score, created_at')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .eq('status', 'completed')
    .order('overall_score', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return {
      sessionNumber: 'Session #1',
      metrics: [],
    }
  }

  const bestSession = sessions[0]
  const currentSessionIndex = sessions.findIndex((s) => s.id === currentSessionId)
  const sessionNumber = `Session #${currentSessionIndex >= 0 ? currentSessionIndex + 1 : sessions.length + 1}`

  // Get competencies for best and current session
  const [bestCompetencies, currentCompetencies] = await Promise.all([
    supabase
      .from('session_competencies')
      .select('competency_name, score')
      .eq('session_id', bestSession.id),
    supabase
      .from('session_competencies')
      .select('competency_name, score')
      .eq('session_id', currentSessionId),
  ])

  const bestMap = new Map(
    (bestCompetencies.data || []).map((c) => [c.competency_name, c.score || 0])
  )
  const currentMap = new Map(
    (currentCompetencies.data || []).map((c) => [c.competency_name, c.score || 0])
  )

  const metrics: SessionReviewData['personalBest']['metrics'] = []

  // Overall score comparison
  const overallChange = currentScore - (bestSession.overall_score || 0)
  metrics.push({
    name: 'Overall Score',
    current: currentScore,
    change: Math.abs(overallChange),
    changeType: overallChange > 0 ? 'increase' : overallChange < 0 ? 'decrease' : 'stable',
  })

  // Competency comparisons
  const allCompetencies = new Set([...Array.from(bestMap.keys()), ...Array.from(currentMap.keys())])

  allCompetencies.forEach((competencyName) => {
    const current = currentMap.get(competencyName) || 0
    const best = bestMap.get(competencyName) || 0
    const change = current - best

    if (Math.abs(change) > 0) {
      metrics.push({
        name: competencyName,
        current,
        change: Math.abs(change),
        changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
      })
    }
  })

  return {
    sessionNumber,
    metrics: metrics.slice(0, 5), // Limit to top 5 metrics
  }
}


