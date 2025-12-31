import { createClient } from '@/lib/supabase/server'
import { getSessionTurns } from './turnService'
import { getUserThresholds } from './dynamicThresholdService'
import { getTurnAnalysis } from './turnAnalysisService'

export interface AssessmentTriggerResult {
  shouldTrigger: boolean
  reason?: string
  assessmentId?: string
}

/**
 * Agentic logic to determine if assessment should be triggered
 * Uses dynamic thresholds based on user's performance history
 * Uses AI-generated metrics from turn analysis
 */
export async function shouldTriggerAssessment(
  sessionId: string,
  userId: string,
  minTurns?: number,
  maxTurns?: number
): Promise<AssessmentTriggerResult> {
  const supabase = await createClient()

  // Get dynamic thresholds for this user
  const thresholds = await getUserThresholds(userId)
  
  // Get default config values if minTurns/maxTurns not provided
  const { data: config } = await supabase
    .from('performance_analysis_config')
    .select('config_value')
    .eq('config_key', 'assessment_trigger')
    .eq('is_active', true)
    .single()

  const defaultConfig = config?.config_value as any
  const effectiveMinTurns = minTurns ?? defaultConfig?.min_turns ?? 3
  const effectiveMaxTurns = maxTurns ?? defaultConfig?.max_turns ?? 5
  const recentTurnsAnalyzed = defaultConfig?.recent_turns_analyzed ?? 3

  // Get current turns
  const turns = await getSessionTurns(sessionId)
  const userTurns = turns.filter((t) => t.speaker === 'user')
  const totalTurns = turns.length

  // Rule 1: Minimum turns check
  if (userTurns.length < effectiveMinTurns) {
    return { shouldTrigger: false, reason: 'Not enough interactions yet' }
  }

  // Rule 2: Maximum turns check (don't wait too long)
  if (userTurns.length >= effectiveMaxTurns) {
    // Get scenario to find assessment questions
    const { data: session } = await supabase
      .from('sessions')
      .select('scenario_id')
      .eq('id', sessionId)
      .single()

    if (session?.scenario_id) {
      const { data: assessment } = await supabase
        .from('scenario_assessments')
        .select('id')
        .eq('scenario_id', session.scenario_id)
        .limit(1)
        .maybeSingle()

      return {
        shouldTrigger: true,
        reason: 'Reached maximum interaction threshold',
        assessmentId: assessment?.id,
      }
    }
  }

  // Rule 3: Quality-based trigger using AI-generated metrics and dynamic thresholds
  if (userTurns.length >= effectiveMinTurns) {
    const recentUserTurns = userTurns.slice(-recentTurnsAnalyzed)
    const avgMetrics = await calculateAverageMetricsFromAI(recentUserTurns)

    // Use dynamic thresholds instead of hardcoded values
    const clarityThreshold = thresholds.assessmentTriggerClarity
    const empathyThreshold = thresholds.assessmentTriggerEmpathy

    // If user is performing well according to their own thresholds, trigger assessment
    if (avgMetrics.clarity > clarityThreshold && avgMetrics.empathy > empathyThreshold) {
      const { data: session } = await supabase
        .from('sessions')
        .select('scenario_id')
        .eq('id', sessionId)
        .single()

      if (session?.scenario_id) {
        const { data: assessment } = await supabase
          .from('scenario_assessments')
          .select('id')
          .eq('scenario_id', session.scenario_id)
          .limit(1)
          .maybeSingle()

        return {
          shouldTrigger: true,
          reason: `User demonstrating strong performance (clarity: ${avgMetrics.clarity.toFixed(1)} > ${clarityThreshold}, empathy: ${avgMetrics.empathy.toFixed(1)} > ${empathyThreshold}) - testing knowledge`,
          assessmentId: assessment?.id,
        }
      }
    }
  }

  return { shouldTrigger: false, reason: 'Conditions not met' }
}

/**
 * Calculate average metrics from AI-generated turn analyses
 * Falls back to turn.metrics if AI analysis not available
 */
async function calculateAverageMetricsFromAI(turns: Array<{ id?: string; metrics?: any }>) {
  const metrics = {
    clarity: 0,
    empathy: 0,
    directness: 0,
    pacing: 0,
  }

  let count = 0
  for (const turn of turns) {
    // Try to get AI analysis first
    if (turn.id) {
      const aiAnalysis = await getTurnAnalysis(turn.id)
      if (aiAnalysis && aiAnalysis.metrics) {
        metrics.clarity += aiAnalysis.metrics.clarity
        metrics.empathy += aiAnalysis.metrics.empathy
        metrics.directness += aiAnalysis.metrics.directness
        metrics.pacing += aiAnalysis.metrics.pacing
        count++
        continue
      }
    }

    // Fallback to turn.metrics if AI analysis not available
    if (turn.metrics) {
      if (turn.metrics.clarity !== undefined) {
        metrics.clarity += turn.metrics.clarity
        count++
      }
      if (turn.metrics.empathy !== undefined) {
        metrics.empathy += turn.metrics.empathy
      }
      if (turn.metrics.directness !== undefined) {
        metrics.directness += turn.metrics.directness
      }
      if (turn.metrics.pacing !== undefined) {
        metrics.pacing += turn.metrics.pacing
      }
    }
  }

  if (count > 0) {
    metrics.clarity = metrics.clarity / count
    metrics.empathy = metrics.empathy / count
    metrics.directness = metrics.directness / count
    metrics.pacing = metrics.pacing / count
  }

  return metrics
}

