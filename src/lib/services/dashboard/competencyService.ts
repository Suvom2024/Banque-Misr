import { createClient } from '@/lib/supabase/server'
import type { Competency, CompetencyTrend } from '@/types/dashboard'

/**
 * Get user competencies with scores and trends
 */
export async function getUserCompetencies(userId: string): Promise<Competency[]> {
  const supabase = await createClient()

  // Get recent completed sessions (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', thirtyDaysAgo.toISOString())
    .order('completed_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return []
  }

  const sessionIds = sessions.map((s) => s.id)

  // Get competencies for these sessions
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('competency_name, score, session_id')
    .in('session_id', sessionIds)

  if (!competencies || competencies.length === 0) {
    return []
  }

  // Group by competency name and calculate averages
  const competencyMap = new Map<string, number[]>()

  competencies.forEach((c) => {
    const name = c.competency_name
    const score = Number(c.score)
    if (!competencyMap.has(name)) {
      competencyMap.set(name, [])
    }
    competencyMap.get(name)?.push(score)
  })

  // Calculate trends by comparing recent vs older sessions
  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - 15)

  const recentSessionIds = sessions
    .filter((s) => s.completed_at && new Date(s.completed_at) >= recentCutoff)
    .map((s) => s.id)
  const olderSessionIds = sessions
    .filter((s) => s.completed_at && new Date(s.completed_at) < recentCutoff)
    .map((s) => s.id)

  const result: Competency[] = []

  competencyMap.forEach((scores, name) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length

    // Calculate trend
    const recentScores = competencies
      .filter((c) => c.competency_name === name && recentSessionIds.includes(c.session_id))
      .map((c) => Number(c.score))
    const olderScores = competencies
      .filter((c) => c.competency_name === name && olderSessionIds.includes(c.session_id))
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

    result.push({
      name,
      score: Math.round(avgScore),
      trend,
      icon: getCompetencyIcon(name),
    })
  })

  // Sort by score descending
  return result.sort((a, b) => b.score - a.score)
}

/**
 * Calculate competency trends
 */
export async function calculateCompetencyTrends(userId: string): Promise<Map<string, CompetencyTrend>> {
  const competencies = await getUserCompetencies(userId)
  const trendMap = new Map<string, CompetencyTrend>()

  competencies.forEach((c) => {
    trendMap.set(c.name, c.trend)
  })

  return trendMap
}

/**
 * Get icon for competency
 */
function getCompetencyIcon(name: string): string {
  const iconMap: Record<string, string> = {
    Empathy: 'favorite',
    Clarity: 'record_voice_over',
    'Objection Handling': 'psychology_alt',
    'Rapport Building': 'handshake',
    Pacing: 'speed',
    'Active Listening': 'hearing',
    'Conflict Resolution': 'gavel',
    'Product Knowledge': 'menu_book',
    'Closing': 'check_circle',
  }
  return iconMap[name] || 'star'
}

