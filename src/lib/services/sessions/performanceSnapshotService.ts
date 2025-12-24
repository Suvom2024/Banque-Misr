import { createClient } from '@/lib/supabase/server'

export interface PerformanceSnapshotData {
  sessionTitle: string
  grade: string
  aiMessage: string
  aiFullMessage: string
  currentGoal: {
    title: string
    progress: number
    changeFromSession: number
  } | null
  topStrength: {
    name: string
    description: string
    masteredAt: string
    peerRanking: string
  } | null
  ahaMoment: {
    title: string
    description: string
    technique: string
  } | null
  assessmentResults: {
    score: number
    correct: number
    incorrect: number
    quizCount: number
  } | null
  skillTrends: Array<{
    skill: string
    trend: number[]
    change: number
    color: string
  }>
  growthPath: Array<{
    id: string
    type: 'micro-drill' | 'scenario' | 'knowledge'
    title: string
    description: string
    duration?: string
  }>
}

/**
 * Get performance snapshot data for a session
 */
export async function getPerformanceSnapshot(
  sessionId: string,
  userId: string
): Promise<PerformanceSnapshotData | null> {
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
  const overallScore = session.overall_score || 0

  // Calculate grade
  const grade = calculateGrade(overallScore)

  // Get competencies to find top strength
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('*')
    .eq('session_id', sessionId)
    .order('score', { ascending: false })

  const topCompetency = competencies && competencies.length > 0 ? competencies[0] : null

  // Get assessment results
  const assessmentResults = await getAssessmentResults(sessionId)

  // Get current active goal
  const currentGoal = await getCurrentGoal(userId)

  // Get skill trends
  const skillTrends = await getSkillTrends(userId, competencies || [])

  // Generate growth path
  const growthPath = await generateGrowthPath(sessionId, competencies || [], session.scenario_id)

  return {
    sessionTitle: scenario?.title || 'Unknown Session',
    grade,
    aiMessage: `excellent progress in handling ${scenario?.title || 'this session'}!`,
    aiFullMessage: session.ai_summary || `You showed remarkable performance with a score of ${overallScore}%. ${topCompetency ? `Your ${topCompetency.competency_name} was particularly strong.` : ''}`,
    currentGoal: currentGoal ? {
      title: currentGoal.title,
      progress: currentGoal.progress || 0,
      changeFromSession: calculateGoalProgressChange(currentGoal.id, overallScore),
    } : null,
    topStrength: topCompetency ? {
      name: topCompetency.competency_name,
      description: topCompetency.feedback || `Mastered at ${new Date(session.completed_at || session.started_at).toLocaleTimeString()}. ${topCompetency.competency_name} score: ${topCompetency.score}%`,
      masteredAt: new Date(session.completed_at || session.started_at).toLocaleTimeString(),
      peerRanking: calculatePeerRanking(topCompetency.score || 0),
    } : null,
    ahaMoment: generateAhaMoment(competencies || [], session.ai_summary),
    assessmentResults,
    skillTrends,
    growthPath,
  }
}

/**
 * Calculate grade from score
 */
function calculateGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Get assessment results for session
 */
async function getAssessmentResults(sessionId: string): Promise<PerformanceSnapshotData['assessmentResults'] | null> {
  const supabase = await createClient()

  const { data: assessments } = await supabase
    .from('session_assessments')
    .select('is_correct')
    .eq('session_id', sessionId)

  if (!assessments || assessments.length === 0) {
    return null
  }

  const correct = assessments.filter((a) => a.is_correct).length
  const incorrect = assessments.length - correct
  const score = assessments.length > 0 ? Math.round((correct / assessments.length) * 100) : 0

  return {
    score,
    correct,
    incorrect,
    quizCount: assessments.length,
  }
}

/**
 * Get current active goal for user
 */
async function getCurrentGoal(userId: string): Promise<any | null> {
  const supabase = await createClient()

  const { data: goal } = await supabase
    .from('development_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return goal
}

/**
 * Calculate goal progress change from session score
 */
function calculateGoalProgressChange(goalId: string, sessionScore: number): number {
  // This would ideally check previous progress and calculate change
  // For now, return a simple calculation
  return Math.min(5, Math.floor(sessionScore / 20))
}

/**
 * Get skill trends over time
 */
async function getSkillTrends(userId: string, currentCompetencies: any[]): Promise<PerformanceSnapshotData['skillTrends']> {
  const supabase = await createClient()

  const trends: PerformanceSnapshotData['skillTrends'] = []

  // Get last 5 sessions for trend calculation
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5)

  if (!recentSessions || recentSessions.length === 0) {
    return []
  }

  const sessionIds = recentSessions.map((s) => s.id).reverse()

  // For each competency, get trend
  for (const competency of currentCompetencies.slice(0, 3)) {
    const competencyName = competency.competency_name
    const trendScores: number[] = []

    for (const sessionId of sessionIds) {
      const { data: comp } = await supabase
        .from('session_competencies')
        .select('score')
        .eq('session_id', sessionId)
        .eq('competency_name', competencyName)
        .single()

      trendScores.push(comp?.score || 0)
    }

    if (trendScores.length > 0) {
      const firstScore = trendScores[0] || 0
      const lastScore = trendScores[trendScores.length - 1] || 0
      const change = lastScore - firstScore

      trends.push({
        skill: competencyName,
        trend: trendScores,
        change: Math.round(change),
        color: getSkillColor(competencyName),
      })
    }
  }

  return trends
}

/**
 * Get color for skill trend chart
 */
function getSkillColor(skillName: string): string {
  const colors: Record<string, string> = {
    'Empathy': '#10B981',
    'Clarity': '#F59E0B',
    'Objection Handling': '#EF4444',
    'Rapport Building': '#3B82F6',
    'Pacing': '#8B5CF6',
  }
  return colors[skillName] || '#6B7280'
}

/**
 * Calculate peer ranking
 */
function calculatePeerRanking(score: number): string {
  // Simplified calculation - in real app, would query actual peer data
  if (score >= 95) return 'Top 1% of peers'
  if (score >= 90) return 'Top 5% of peers'
  if (score >= 85) return 'Top 10% of peers'
  if (score >= 80) return 'Top 25% of peers'
  return 'Above average'
}

/**
 * Generate Aha Moment from competencies and AI summary
 */
function generateAhaMoment(competencies: any[], aiSummary: string | null): PerformanceSnapshotData['ahaMoment'] | null {
  // Find competency with significant improvement or notable feedback
  const notableCompetency = competencies.find((c) => {
    const feedback = c.feedback?.toLowerCase() || ''
    return feedback.includes('technique') || feedback.includes('method') || feedback.includes('approach')
  })

  if (notableCompetency && notableCompetency.feedback) {
    // Extract technique name from feedback
    const techniqueMatch = notableCompetency.feedback.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:technique|method|approach)/i)
    const technique = techniqueMatch ? techniqueMatch[1] : 'Effective Technique'

    return {
      title: notableCompetency.competency_name,
      description: notableCompetency.feedback,
      technique,
    }
  }

  return null
}

/**
 * Generate personalized growth path
 */
async function generateGrowthPath(
  sessionId: string,
  competencies: any[],
  scenarioId: string
): Promise<PerformanceSnapshotData['growthPath']> {
  const supabase = await createClient()
  const path: PerformanceSnapshotData['growthPath'] = []

  // Find weak competencies
  const weakCompetencies = competencies.filter((c) => (c.score || 0) < 75).slice(0, 2)

  for (const competency of weakCompetencies) {
    // Find related scenarios
    const { data: relatedScenarios } = await supabase
      .from('scenarios')
      .select('id, title, duration_minutes')
      .contains('tags', [competency.competency_name])
      .eq('is_active', true)
      .neq('id', scenarioId)
      .limit(1)

    if (relatedScenarios && relatedScenarios.length > 0) {
      const scenario = relatedScenarios[0]
      path.push({
        id: `path-${scenario.id}`,
        type: 'scenario',
        title: `Redo: ${scenario.title}`,
        description: `Focus on improving ${competency.competency_name}. ${competency.feedback || ''}`,
        duration: scenario.duration_minutes ? `${scenario.duration_minutes} min` : undefined,
      })
    } else {
      path.push({
        id: `path-${competency.id}`,
        type: 'micro-drill',
        title: `Practice: ${competency.competency_name}`,
        description: competency.feedback || `Focus on improving ${competency.competency_name}`,
        duration: '5 min',
      })
    }
  }

  // Add knowledge resource if available
  if (path.length < 3) {
    path.push({
      id: 'path-knowledge-1',
      type: 'knowledge',
      title: 'Policy #402: Leadership Development',
      description: 'Review official guidelines on internal promotions and mentorship tracks.',
    })
  }

  return path
}


