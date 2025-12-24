import { createClient } from '@/lib/supabase/server'

export interface AnalyticsFilters {
  employeeId?: string
  timePeriod?: 'week' | 'month' | 'quarter' | 'year'
  scenarioId?: string
  startDate?: string
  endDate?: string
}

export interface TeamPerformance {
  overallScore: number
  trend: number
  aiSummary: string
  totalSessions: number
  avgScore: number
  timeTrained: number
}

export interface PerformanceTrend {
  date: string
  score: number
  sessions: number
}

export interface CompetencyDistribution {
  competency: string
  averageScore: number
  employeeCount: number
}

export interface AIInsight {
  id: string
  type: 'opportunity' | 'strength' | 'warning'
  title: string
  description: string
  priority: number
}

export interface EmployeeMetric {
  id: string
  name: string
  avatar?: string
  avgScore: number
  completionRate: number
  timeTrained: number
  topSkills: string[]
  needsImprovement: string[]
  sessionsCount: number
}

/**
 * Get team performance summary
 */
export async function getTeamPerformance(
  filters: AnalyticsFilters = {}
): Promise<TeamPerformance | null> {
  const supabase = await createClient()

  // Build query based on filters
  let query = supabase
    .from('sessions')
    .select('overall_score, completed_at, started_at, user_id, profiles(full_name)')
    .eq('status', 'completed')

  if (filters.employeeId) {
    query = query.eq('user_id', filters.employeeId)
  }

  if (filters.scenarioId) {
    query = query.eq('scenario_id', filters.scenarioId)
  }

  if (filters.startDate) {
    query = query.gte('completed_at', filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte('completed_at', filters.endDate)
  }

  const { data: sessions, error } = await query

  if (error || !sessions || sessions.length === 0) {
    return {
      overallScore: 0,
      trend: 0,
      aiSummary: 'No data available for the selected period.',
      totalSessions: 0,
      avgScore: 0,
      timeTrained: 0,
    }
  }

  const scores = sessions.map((s) => s.overall_score || 0).filter((s) => s > 0)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // Calculate time trained
  const timeTrained = sessions.reduce((total, session) => {
    if (session.started_at && session.completed_at) {
      const start = new Date(session.started_at)
      const end = new Date(session.completed_at)
      return total + (end.getTime() - start.getTime()) / 60000 // minutes
    }
    return total
  }, 0)

  // Calculate trend (compare first half vs second half)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.completed_at || a.started_at || 0).getTime() - 
    new Date(b.completed_at || b.started_at || 0).getTime()
  )
  
  const midPoint = Math.floor(sortedSessions.length / 2)
  const firstHalf = sortedSessions.slice(0, midPoint)
  const secondHalf = sortedSessions.slice(midPoint)

  const firstHalfAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, s) => sum + (s.overall_score || 0), 0) / firstHalf.length
    : 0
  const secondHalfAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, s) => sum + (s.overall_score || 0), 0) / secondHalf.length
    : 0

  const trend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

  return {
    overallScore: Math.round(avgScore),
    trend: Math.round(trend * 10) / 10,
    aiSummary: generateAISummary(avgScore, trend, sessions.length),
    totalSessions: sessions.length,
    avgScore: Math.round(avgScore * 10) / 10,
    timeTrained: Math.round(timeTrained * 10) / 10,
  }
}

/**
 * Get performance trend over time
 */
export async function getPerformanceTrend(
  filters: AnalyticsFilters = {}
): Promise<PerformanceTrend[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sessions')
    .select('overall_score, completed_at, user_id')
    .eq('status', 'completed')
    .not('completed_at', 'is', null)

  if (filters.employeeId) {
    query = query.eq('user_id', filters.employeeId)
  }

  if (filters.scenarioId) {
    query = query.eq('scenario_id', filters.scenarioId)
  }

  const { data: sessions } = await query

  if (!sessions || sessions.length === 0) {
    return []
  }

  // Group by date
  const groupedByDate = new Map<string, { scores: number[]; count: number }>()

  sessions.forEach((session) => {
    const date = new Date(session.completed_at || '').toISOString().split('T')[0]
    if (!groupedByDate.has(date)) {
      groupedByDate.set(date, { scores: [], count: 0 })
    }
    const group = groupedByDate.get(date)!
    if (session.overall_score) {
      group.scores.push(session.overall_score)
      group.count++
    }
  })

  const trends: PerformanceTrend[] = Array.from(groupedByDate.entries())
    .map(([date, data]) => ({
      date,
      score: data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0,
      sessions: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return trends
}

/**
 * Get competency distribution
 */
export async function getCompetencyDistribution(
  filters: AnalyticsFilters = {}
): Promise<CompetencyDistribution[]> {
  const supabase = await createClient()

  // Get sessions based on filters
  let sessionQuery = supabase
    .from('sessions')
    .select('id, user_id')
    .eq('status', 'completed')

  if (filters.employeeId) {
    sessionQuery = sessionQuery.eq('user_id', filters.employeeId)
  }

  if (filters.scenarioId) {
    sessionQuery = sessionQuery.eq('scenario_id', filters.scenarioId)
  }

  const { data: sessions } = await sessionQuery

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

  // Group by competency
  const competencyMap = new Map<string, { scores: number[]; employees: Set<string> }>()

  sessions.forEach((session) => {
    const sessionComps = competencies.filter((c) => c.session_id === session.id)
    sessionComps.forEach((comp) => {
      if (!competencyMap.has(comp.competency_name)) {
        competencyMap.set(comp.competency_name, { scores: [], employees: new Set() })
      }
      const group = competencyMap.get(comp.competency_name)!
      group.scores.push(comp.score || 0)
      group.employees.add(session.user_id)
    })
  })

  const distribution: CompetencyDistribution[] = Array.from(competencyMap.entries()).map(
    ([competency, data]) => ({
      competency,
      averageScore: Math.round(
        (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10
      ) / 10,
      employeeCount: data.employees.size,
    })
  )

  return distribution.sort((a, b) => b.averageScore - a.averageScore)
}

/**
 * Get AI insights
 */
export async function getAIInsights(
  filters: AnalyticsFilters = {}
): Promise<AIInsight[]> {
  const teamPerformance = await getTeamPerformance(filters)
  const competencyDistribution = await getCompetencyDistribution(filters)

  const insights: AIInsight[] = []

  if (teamPerformance && teamPerformance.trend > 5) {
    insights.push({
      id: 'insight-1',
      type: 'strength',
      title: 'Strong Performance Trend',
      description: `Team performance has improved by ${teamPerformance.trend}% over the selected period.`,
      priority: 1,
    })
  }

  if (teamPerformance && teamPerformance.avgScore < 70) {
    insights.push({
      id: 'insight-2',
      type: 'warning',
      title: 'Below Target Performance',
      description: `Average score is ${teamPerformance.avgScore}%. Consider additional training support.`,
      priority: 2,
    })
  }

  if (competencyDistribution.length > 0) {
    const topCompetency = competencyDistribution[0]
    const weakCompetency = competencyDistribution[competencyDistribution.length - 1]

    insights.push({
      id: 'insight-3',
      type: 'strength',
      title: `Strong ${topCompetency.competency}`,
      description: `${topCompetency.competency} is the team's strongest area with an average score of ${topCompetency.averageScore}%.`,
      priority: 3,
    })

    if (weakCompetency.averageScore < 70) {
      insights.push({
        id: 'insight-4',
        type: 'opportunity',
        title: `Focus on ${weakCompetency.competency}`,
        description: `${weakCompetency.competency} shows the most room for improvement at ${weakCompetency.averageScore}%.`,
        priority: 2,
      })
    }
  }

  return insights.sort((a, b) => a.priority - b.priority)
}

/**
 * Get employee metrics
 */
export async function getEmployeeMetrics(
  filters: AnalyticsFilters = {}
): Promise<EmployeeMetric[]> {
  const supabase = await createClient()

  // Get all users with sessions
  let sessionQuery = supabase
    .from('sessions')
    .select('user_id, overall_score, completed_at, started_at, profiles(full_name, avatar_url)')
    .eq('status', 'completed')

  if (filters.employeeId) {
    sessionQuery = sessionQuery.eq('user_id', filters.employeeId)
  }

  if (filters.scenarioId) {
    sessionQuery = sessionQuery.eq('scenario_id', filters.scenarioId)
  }

  const { data: sessions } = await sessionQuery

  if (!sessions || sessions.length === 0) {
    return []
  }

  // Group by user
  const userMap = new Map<
    string,
    {
      name: string
      avatar?: string
      scores: number[]
      sessions: any[]
      timeTrained: number
    }
  >()

  sessions.forEach((session) => {
    const userId = session.user_id
    const profile = session.profiles as { full_name: string; avatar_url?: string } | null

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        name: profile?.full_name || 'Unknown User',
        avatar: profile?.avatar_url || undefined,
        scores: [],
        sessions: [],
        timeTrained: 0,
      })
    }

    const user = userMap.get(userId)!
    if (session.overall_score) {
      user.scores.push(session.overall_score)
    }
    user.sessions.push(session)

    if (session.started_at && session.completed_at) {
      const start = new Date(session.started_at)
      const end = new Date(session.completed_at)
      user.timeTrained += (end.getTime() - start.getTime()) / 60000 // minutes
    }
  })

  // Get competencies for each user
  const userIds = Array.from(userMap.keys())
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('session_id, competency_name, score, sessions!inner(user_id)')
    .in('sessions.user_id', userIds)

  // Process employee metrics
  const employees: EmployeeMetric[] = Array.from(userMap.entries()).map(([userId, userData]) => {
    const userSessions = userData.sessions.map((s) => s.id)
    const userCompetencies = (competencies || []).filter((c) =>
      userSessions.includes((c as any).session_id)
    )

    // Get top skills and needs improvement
    const competencyMap = new Map<string, number[]>()
    userCompetencies.forEach((comp) => {
      if (!competencyMap.has(comp.competency_name)) {
        competencyMap.set(comp.competency_name, [])
      }
      competencyMap.get(comp.competency_name)!.push(comp.score || 0)
    })

    const competencyAverages = Array.from(competencyMap.entries()).map(([name, scores]) => ({
      name,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))

    const topSkills = competencyAverages
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map((c) => c.name)

    const needsImprovement = competencyAverages
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2)
      .map((c) => c.name)

    const avgScore =
      userData.scores.length > 0
        ? Math.round((userData.scores.reduce((a, b) => a + b, 0) / userData.scores.length) * 10) / 10
        : 0

    const completionRate = 100 // Simplified - would calculate based on assigned vs completed

    return {
      id: userId,
      name: userData.name,
      avatar: userData.avatar,
      avgScore,
      completionRate,
      timeTrained: Math.round(userData.timeTrained * 10) / 10,
      topSkills,
      needsImprovement,
      sessionsCount: userData.sessions.length,
    }
  })

  return employees.sort((a, b) => b.avgScore - a.avgScore)
}

/**
 * Generate AI summary
 */
function generateAISummary(avgScore: number, trend: number, sessionCount: number): string {
  if (sessionCount === 0) {
    return 'No sessions completed in the selected period.'
  }

  let summary = `Team average score is ${Math.round(avgScore)}%`

  if (trend > 5) {
    summary += ` with a strong upward trend of ${Math.round(trend)}%.`
  } else if (trend < -5) {
    summary += ` with a declining trend of ${Math.abs(Math.round(trend))}%. Consider additional support.`
  } else {
    summary += ' with stable performance.'
  }

  summary += ` ${sessionCount} session${sessionCount !== 1 ? 's' : ''} completed.`

  return summary
}


