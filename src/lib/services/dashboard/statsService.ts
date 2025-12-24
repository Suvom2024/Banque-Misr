import { createClient } from '@/lib/supabase/server'
import type { QuickStats } from '@/types/dashboard'

/**
 * Get user quick stats for dashboard
 */
export async function getUserQuickStats(userId: string, period: 'week' | 'month' = 'week'): Promise<QuickStats> {
  const supabase = await createClient()

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
  }

  // Try to get cached stats
  const { data: cachedStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('period_type', period)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .eq('period_end', periodEnd.toISOString().split('T')[0])
    .single()

  if (cachedStats) {
    return {
      sessionsThisWeek: cachedStats.sessions_count,
      avgScore: cachedStats.avg_score ? Number(cachedStats.avg_score) : 0,
      streak: cachedStats.current_streak_days,
      timeThisWeek: formatTime(cachedStats.time_trained_hours),
      rank: cachedStats.leaderboard_rank,
      xpEarned: cachedStats.xp_earned,
    }
  }

  // Calculate from sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('overall_score, started_at, completed_at, xp_earned, status')
    .eq('user_id', userId)
    .gte('started_at', periodStart.toISOString())
    .order('started_at', { ascending: false })

  const completedSessions = sessions?.filter((s) => s.status === 'completed') || []
  const sessionsThisWeek = completedSessions.length

  // Calculate average score
  const scores = completedSessions
    .filter((s) => s.overall_score !== null)
    .map((s) => Number(s.overall_score))
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // Calculate time trained
  let totalHours = 0
  completedSessions.forEach((session) => {
    if (session.started_at && session.completed_at) {
      const start = new Date(session.started_at)
      const end = new Date(session.completed_at)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      totalHours += hours
    }
  })

  // Calculate XP earned
  const xpEarned = completedSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0)

  // Calculate streak
  const streak = await calculateStreak(userId)

  // Get leaderboard rank (placeholder - implement if leaderboard feature exists)
  const rank = null

  return {
    sessionsThisWeek,
    avgScore: Math.round(avgScore),
    streak,
    timeThisWeek: formatTime(totalHours),
    rank,
    xpEarned,
  }
}

/**
 * Calculate user's current training streak
 */
export async function calculateStreak(userId: string): Promise<number> {
  const supabase = await createClient()

  // Get all completed sessions ordered by date
  const { data: sessions } = await supabase
    .from('sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return 0
  }

  // Get unique dates
  const dates = new Set<string>()
  sessions.forEach((s) => {
    if (s.completed_at) {
      const date = new Date(s.completed_at).toISOString().split('T')[0]
      dates.add(date)
    }
  })

  const sortedDates = Array.from(dates).sort((a, b) => b.localeCompare(a))

  // Calculate consecutive days
  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Check if trained today or yesterday (to account for timezone)
  if (sortedDates[0] === today || sortedDates[0] === yesterdayStr) {
    streak = 1
    let checkDate = new Date(sortedDates[0])
    checkDate.setDate(checkDate.getDate() - 1)

    for (let i = 1; i < sortedDates.length; i++) {
      const expectedDate = checkDate.toISOString().split('T')[0]
      if (sortedDates[i] === expectedDate) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  return streak
}

/**
 * Get leaderboard rank (placeholder - implement if needed)
 */
export async function getLeaderboardRank(userId: string, period: 'week' | 'month' = 'week'): Promise<number | null> {
  // TODO: Implement leaderboard ranking logic
  // This would require comparing user's stats with all other users
  return null
}

/**
 * Format time hours to display string
 */
function formatTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
  return `${hours.toFixed(1)}h`
}

