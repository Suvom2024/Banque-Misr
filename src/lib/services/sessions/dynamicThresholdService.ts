import { createClient } from '@/lib/supabase/server'

export interface UserThresholds {
  excellent: number
  good: number
  fair: number
  needsImprovement: number
  peerTop1: number
  peerTop5: number
  peerTop10: number
  peerTop25: number
  weakCompetency: number
  strongCompetency: number
  assessmentTriggerClarity: number
  assessmentTriggerEmpathy: number
}

/**
 * Get user-specific performance thresholds, calculating them dynamically if needed
 */
export async function getUserThresholds(
  userId: string,
  competencyName?: string
): Promise<UserThresholds> {
  const supabase = await createClient()

  // Try to get cached thresholds first
  const { data: cachedThresholds } = await supabase
    .from('user_performance_thresholds')
    .select('threshold_type, threshold_value')
    .eq('user_id', userId)
    .eq('competency_name', competencyName || null)
    .is('expires_at', null)
    .or('expires_at.gt.' + new Date().toISOString())

  // If we have all thresholds cached, return them
  if (cachedThresholds && cachedThresholds.length >= 10) {
    const thresholds: Partial<UserThresholds> = {}
    cachedThresholds.forEach((t) => {
      const key = t.threshold_type as keyof UserThresholds
      thresholds[key] = Number(t.threshold_value)
    })
    return thresholds as UserThresholds
  }

  // Calculate thresholds dynamically
  const thresholds = await calculateDynamicThresholds(userId, competencyName)

  // Cache the calculated thresholds
  await cacheThresholds(userId, thresholds, competencyName)

  return thresholds
}

/**
 * Calculate dynamic thresholds based on user's performance history
 */
async function calculateDynamicThresholds(
  userId: string,
  competencyName?: string
): Promise<UserThresholds> {
  const supabase = await createClient()

  // Get user's historical performance
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, overall_score, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('overall_score', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(50) // Last 50 sessions

  if (!sessions || sessions.length < 5) {
    // Not enough data - return defaults
    return await getDefaultThresholds()
  }

  const scores = sessions.map((s) => Number(s.overall_score))

  // Calculate percentile-based thresholds
  const sortedScores = [...scores].sort((a, b) => a - b)
  const percentile = (arr: number[], p: number) => {
    const index = Math.ceil((p / 100) * arr.length) - 1
    return arr[Math.max(0, Math.min(index, arr.length - 1))]
  }

  // If competency-specific, get competency scores
  let competencyScores: number[] = []
  if (competencyName) {
    const { data: competencies } = await supabase
      .from('session_competencies')
      .select('score')
      .eq('competency_name', competencyName)
      .in(
        'session_id',
        sessions.map((s) => s.id)
      )
      .not('score', 'is', null)

    competencyScores = (competencies || []).map((c) => Number(c.score))
  }

  const scoresToUse = competencyName && competencyScores.length >= 5 ? competencyScores : scores

  // Calculate thresholds using percentiles
  const excellent = percentile(sortedScores, 90) // Top 10%
  const good = percentile(sortedScores, 75) // Top 25%
  const fair = percentile(sortedScores, 50) // Median
  const needsImprovement = percentile(sortedScores, 25) // Bottom 25%

  // Peer ranking thresholds (based on user's own performance distribution)
  const peerTop1 = percentile(sortedScores, 99)
  const peerTop5 = percentile(sortedScores, 95)
  const peerTop10 = percentile(sortedScores, 90)
  const peerTop25 = percentile(sortedScores, 75)

  // Competency thresholds
  const weakCompetency = Math.min(75, fair) // Weak is below median or 75, whichever is lower
  const strongCompetency = Math.max(85, good) // Strong is above 75th percentile or 85, whichever is higher

  // Assessment trigger thresholds (adaptive based on user's average performance)
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const assessmentTriggerClarity = Math.max(70, Math.min(85, avgScore - 5)) // 5 points below average, but min 70, max 85
  const assessmentTriggerEmpathy = Math.max(65, Math.min(80, avgScore - 10)) // 10 points below average, but min 65, max 80

  return {
    excellent: Math.round(excellent),
    good: Math.round(good),
    fair: Math.round(fair),
    needsImprovement: Math.round(needsImprovement),
    peerTop1: Math.round(peerTop1),
    peerTop5: Math.round(peerTop5),
    peerTop10: Math.round(peerTop10),
    peerTop25: Math.round(peerTop25),
    weakCompetency: Math.round(weakCompetency),
    strongCompetency: Math.round(strongCompetency),
    assessmentTriggerClarity: Math.round(assessmentTriggerClarity),
    assessmentTriggerEmpathy: Math.round(assessmentTriggerEmpathy),
  }
}

/**
 * Get default thresholds from configuration
 */
async function getDefaultThresholds(): Promise<UserThresholds> {
  const supabase = await createClient()

  const { data: config } = await supabase
    .from('performance_analysis_config')
    .select('config_value')
    .eq('config_key', 'default_thresholds')
    .eq('is_active', true)
    .single()

  if (config?.config_value) {
    const defaults = config.config_value as any
    return {
      excellent: defaults.excellent || 90,
      good: defaults.good || 80,
      fair: defaults.fair || 70,
      needsImprovement: defaults.needs_improvement || 60,
      peerTop1: defaults.peer_top_1 || 95,
      peerTop5: defaults.peer_top_5 || 90,
      peerTop10: defaults.peer_top_10 || 85,
      peerTop25: defaults.peer_top_25 || 80,
      weakCompetency: defaults.weak_competency || 75,
      strongCompetency: defaults.strong_competency || 85,
      assessmentTriggerClarity: 80,
      assessmentTriggerEmpathy: 70,
    }
  }

  // Ultimate fallback
  return {
    excellent: 90,
    good: 80,
    fair: 70,
    needsImprovement: 60,
    peerTop1: 95,
    peerTop5: 90,
    peerTop10: 85,
    peerTop25: 80,
    weakCompetency: 75,
    strongCompetency: 85,
    assessmentTriggerClarity: 80,
    assessmentTriggerEmpathy: 70,
  }
}

/**
 * Cache calculated thresholds in database
 */
async function cacheThresholds(
  userId: string,
  thresholds: UserThresholds,
  competencyName?: string
): Promise<void> {
  const supabase = await createClient()

  const thresholdEntries = [
    { type: 'excellent', value: thresholds.excellent },
    { type: 'good', value: thresholds.good },
    { type: 'fair', value: thresholds.fair },
    { type: 'needs_improvement', value: thresholds.needsImprovement },
    { type: 'peer_top_1', value: thresholds.peerTop1 },
    { type: 'peer_top_5', value: thresholds.peerTop5 },
    { type: 'peer_top_10', value: thresholds.peerTop10 },
    { type: 'peer_top_25', value: thresholds.peerTop25 },
    { type: 'weak_competency', value: thresholds.weakCompetency },
    { type: 'strong_competency', value: thresholds.strongCompetency },
    { type: 'assessment_trigger_clarity', value: thresholds.assessmentTriggerClarity },
    { type: 'assessment_trigger_empathy', value: thresholds.assessmentTriggerEmpathy },
  ]

  // Calculate expiration (7 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  for (const entry of thresholdEntries) {
    await supabase
      .from('user_performance_thresholds')
      .upsert(
        {
          user_id: userId,
          threshold_type: entry.type,
          competency_name: competencyName || null,
          threshold_value: entry.value,
          calculation_method: 'percentile',
          samples_used: 50, // We used last 50 sessions
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,threshold_type,competency_name',
        }
      )
  }
}

/**
 * Get a specific threshold value for a user
 */
export async function getUserThreshold(
  userId: string,
  thresholdType: keyof UserThresholds,
  competencyName?: string
): Promise<number> {
  const thresholds = await getUserThresholds(userId, competencyName)
  return thresholds[thresholdType]
}

/**
 * Recalculate and update user thresholds (call periodically)
 */
export async function recalculateUserThresholds(userId: string): Promise<UserThresholds> {
  const supabase = await createClient()

  // Mark existing thresholds as expired
  await supabase
    .from('user_performance_thresholds')
    .update({ expires_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('expires_at', null)

  // Recalculate
  return await calculateDynamicThresholds(userId)
}

