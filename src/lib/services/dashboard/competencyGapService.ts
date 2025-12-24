import { createClient } from '@/lib/supabase/server'
import type { UserCompetencyGap, CompetencyTrend } from '@/types/dashboard'

/**
 * Analyze user competency gaps
 */
export async function analyzeCompetencyGaps(userId: string): Promise<UserCompetencyGap[]> {
  const supabase = await createClient()

  // Get recent completed sessions (last 60 days)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', sixtyDaysAgo.toISOString())
    .order('completed_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return []
  }

  const sessionIds = sessions.map((s) => s.id)

  // Get competencies
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('competency_name, score, session_id')
    .in('session_id', sessionIds)

  if (!competencies || competencies.length === 0) {
    return []
  }

  // Group by competency
  const competencyMap = new Map<string, { scores: number[]; sessionIds: string[] }>()

  competencies.forEach((c) => {
    const name = c.competency_name
    const score = Number(c.score)
    if (!competencyMap.has(name)) {
      competencyMap.set(name, { scores: [], sessionIds: [] })
    }
    const data = competencyMap.get(name)!
    data.scores.push(score)
    if (!data.sessionIds.includes(c.session_id)) {
      data.sessionIds.push(c.session_id)
    }
  })

  // Calculate trends (compare recent 30 days vs older)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentSessionIds = sessions
    .filter((s) => s.completed_at && new Date(s.completed_at) >= thirtyDaysAgo)
    .map((s) => s.id)

  const gaps: UserCompetencyGap[] = []
  const targetScore = 80.0

  competencyMap.forEach((data, name) => {
    const currentAvg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
    const gapSize = targetScore - currentAvg

    // Calculate trend
    const recentScores = competencies
      .filter((c) => c.competency_name === name && recentSessionIds.includes(c.session_id))
      .map((c) => Number(c.score))
    const olderScores = competencies
      .filter((c) => c.competency_name === name && !recentSessionIds.includes(c.session_id))
      .map((c) => Number(c.score))

    let trend: CompetencyTrend = 'stable'
    if (recentScores.length > 0 && olderScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length
      const diff = recentAvg - olderAvg

      if (diff > 3) {
        trend = 'improving'
      } else if (diff < -3) {
        trend = 'declining'
      }
    }

    gaps.push({
      competencyName: name,
      currentAverageScore: currentAvg,
      targetScore,
      gapSize,
      recentTrend: trend,
      sessionsAnalyzed: data.sessionIds.length,
    })

    // Update or insert in database
    supabase
      .from('user_competency_gaps')
      .upsert({
        user_id: userId,
        competency_name: name,
        current_average_score: currentAvg,
        target_score: targetScore,
        gap_size: gapSize,
        recent_trend: trend,
        sessions_analyzed: data.sessionIds.length,
        last_analyzed_at: new Date().toISOString(),
      })
      .then(() => {
        // Silently handle - this is background update
      })
  })

  // Sort by gap size (largest first)
  return gaps.sort((a, b) => b.gapSize - a.gapSize)
}

