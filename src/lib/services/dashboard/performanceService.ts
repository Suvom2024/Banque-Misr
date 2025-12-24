import { createClient } from '@/lib/supabase/server'
import type { UserPerformance, PerformanceRating, TrendDataPoint, TopCompetency } from '@/types/dashboard'

/**
 * Calculate performance rating from score
 */
export function calculatePerformanceRating(score: number): PerformanceRating {
  if (score >= 90) return 'EXCELLENT'
  if (score >= 80) return 'GOOD'
  if (score >= 70) return 'FAIR'
  return 'NEEDS_IMPROVEMENT'
}

/**
 * Format time trained hours to display string
 */
export function formatTimeTrained(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }
  return `${hours.toFixed(1)} hrs`
}

/**
 * Get user's overall performance data
 */
export async function getUserOverallPerformance(
  userId: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<UserPerformance | null> {
  const supabase = await createClient()

  // Calculate period dates
  const now = new Date()
  const periodStart = new Date(now)
  const periodEnd = new Date(now)

  switch (period) {
    case 'week':
      periodStart.setDate(now.getDate() - 7)
      break
    case 'month':
      periodStart.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      periodStart.setMonth(now.getMonth() - 3)
      break
  }

  // Try to get cached snapshot first
  const { data: snapshot } = await supabase
    .from('user_performance_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .eq('period_end', periodEnd.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  if (snapshot) {
    return {
      performanceScore: Number(snapshot.overall_score),
      performanceRating: snapshot.performance_rating as PerformanceRating,
      timeTrained: formatTimeTrained(Number(snapshot.time_trained_hours)),
      timeTrainedChange: snapshot.time_trained_change_percent
        ? `${snapshot.time_trained_change_percent > 0 ? '+' : ''}${snapshot.time_trained_change_percent.toFixed(1)}%`
        : '0%',
      keyStrength: snapshot.key_strength || 'N/A',
      aiMessage: snapshot.ai_message || '',
      aiMessageDetail: snapshot.ai_message_detail || '',
      topCompetencies: (snapshot.top_competencies as TopCompetency[]) || [],
    }
  }

  // Calculate from sessions if no snapshot exists
  const { data: sessions } = await supabase
    .from('sessions')
    .select('overall_score, started_at, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', periodStart.toISOString())
    .order('completed_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return null
  }

  // Calculate average score
  const scores = sessions.filter((s) => s.overall_score !== null).map((s) => Number(s.overall_score))
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // Calculate time trained
  let totalHours = 0
  sessions.forEach((session) => {
    if (session.started_at && session.completed_at) {
      const start = new Date(session.started_at)
      const end = new Date(session.completed_at)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      totalHours += hours
    }
  })

  // Get top competencies
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('competency_name, score')
    .in(
      'session_id',
      sessions.map((s) => s.id)
    )

  const competencyMap = new Map<string, number[]>()
  competencies?.forEach((c) => {
    const name = c.competency_name
    const score = Number(c.score)
    if (!competencyMap.has(name)) {
      competencyMap.set(name, [])
    }
    competencyMap.get(name)?.push(score)
  })

  const topCompetencies: TopCompetency[] = Array.from(competencyMap.entries())
    .map(([name, scores]) => ({
      name,
      score: scores.reduce((a, b) => a + b, 0) / scores.length,
      trend: 'stable' as const,
      icon: getCompetencyIcon(name),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const keyStrength = topCompetencies[0]?.name || 'N/A'

  // Get previous period for comparison
  const previousPeriodStart = new Date(periodStart)
  switch (period) {
    case 'week':
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
      break
    case 'month':
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
      break
    case 'quarter':
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3)
      break
  }

  const { data: previousSessions } = await supabase
    .from('sessions')
    .select('overall_score')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', previousPeriodStart.toISOString())
    .lt('completed_at', periodStart.toISOString())

  const previousScores =
    previousSessions?.filter((s) => s.overall_score !== null).map((s) => Number(s.overall_score)) || []
  const previousAvg = previousScores.length > 0 ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length : 0
  const timeChange = previousAvg > 0 ? ((avgScore - previousAvg) / previousAvg) * 100 : 0

  return {
    performanceScore: Math.round(avgScore),
    performanceRating: calculatePerformanceRating(avgScore),
    timeTrained: formatTimeTrained(totalHours),
    timeTrainedChange: `${timeChange > 0 ? '+' : ''}${timeChange.toFixed(1)}%`,
    keyStrength,
    aiMessage: generateDefaultAIMessage(avgScore, keyStrength),
    aiMessageDetail: generateDefaultAIDetail(avgScore, keyStrength, timeChange),
    topCompetencies,
  }
}

/**
 * Get performance trend data
 */
export async function getPerformanceTrend(
  userId: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<TrendDataPoint[]> {
  const supabase = await createClient()

  const now = new Date()
  const periodStart = new Date(now)

  switch (period) {
    case 'week':
      periodStart.setDate(now.getDate() - 7)
      break
    case 'month':
      periodStart.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      periodStart.setMonth(now.getMonth() - 3)
      break
  }

  // Get snapshots or calculate from sessions
  const { data: snapshots } = await supabase
    .from('user_performance_snapshots')
    .select('snapshot_date, overall_score')
    .eq('user_id', userId)
    .gte('snapshot_date', periodStart.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true })

  if (snapshots && snapshots.length > 0) {
    // Get session counts per day
    const { data: sessions } = await supabase
      .from('sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', periodStart.toISOString())

    const sessionCounts = new Map<string, number>()
    sessions?.forEach((s) => {
        const date = new Date(s.completed_at).toISOString().split('T')[0]
        sessionCounts.set(date, (sessionCounts.get(date) || 0) + 1)
      })

    return snapshots.map((snapshot) => ({
      date: snapshot.snapshot_date,
      score: Number(snapshot.overall_score),
      sessionsCount: sessionCounts.get(snapshot.snapshot_date) || 0,
    }))
  }

  // Fallback: calculate from sessions grouped by day
  const { data: sessions } = await supabase
    .from('sessions')
    .select('overall_score, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', periodStart.toISOString())
    .order('completed_at', { ascending: true })

  if (!sessions || sessions.length === 0) {
    return []
  }

  const dailyData = new Map<string, { scores: number[]; count: number }>()

  sessions.forEach((session) => {
    if (session.completed_at && session.overall_score !== null) {
      const date = new Date(session.completed_at).toISOString().split('T')[0]
      if (!dailyData.has(date)) {
        dailyData.set(date, { scores: [], count: 0 })
      }
      const dayData = dailyData.get(date)!
      dayData.scores.push(Number(session.overall_score))
      dayData.count += 1
    }
  })

  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      sessionsCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Generate AI performance message (placeholder - will be replaced with LLM call)
 */
function generateDefaultAIMessage(score: number, keyStrength: string): string {
  if (score >= 90) {
    return `"You're performing exceptionally well! Keep up the excellent work."`
  }
  if (score >= 80) {
    return `"You're on track for your objectives! Your ${keyStrength} skills are strong."`
  }
  return `"Focus on improving your ${keyStrength} skills to reach the next level."`
}

/**
 * Generate AI detail message (placeholder - will be replaced with LLM call)
 */
function generateDefaultAIDetail(score: number, keyStrength: string, change: number): string {
  const changeText = change > 0 ? `improved by ${change.toFixed(1)}%` : change < 0 ? `decreased by ${Math.abs(change).toFixed(1)}%` : 'remained stable'
  return `Your ${keyStrength} score has ${changeText} in recent simulations. Keep focusing on active listening techniques.`
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
  }
  return iconMap[name] || 'star'
}

