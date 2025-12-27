import { createClient } from '@/lib/supabase/server'
import { getSessionTurns } from './turnService'

export interface AssessmentTriggerResult {
  shouldTrigger: boolean
  reason?: string
  assessmentId?: string
}

/**
 * Agentic logic to determine if assessment should be triggered
 * Triggers after N interactions (default: 3-5 turns)
 * Also considers conversation quality and user performance
 */
export async function shouldTriggerAssessment(
  sessionId: string,
  minTurns: number = 3,
  maxTurns: number = 5
): Promise<AssessmentTriggerResult> {
  const supabase = await createClient()

  // Get current turns
  const turns = await getSessionTurns(sessionId)
  const userTurns = turns.filter((t) => t.speaker === 'user')
  const totalTurns = turns.length

  // Rule 1: Minimum turns check
  if (userTurns.length < minTurns) {
    return { shouldTrigger: false, reason: 'Not enough interactions yet' }
  }

  // Rule 2: Maximum turns check (don't wait too long)
  if (userTurns.length >= maxTurns) {
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

  // Rule 3: Quality-based trigger (if user is doing well, test knowledge)
  if (userTurns.length >= minTurns) {
    const recentTurns = userTurns.slice(-3) // Last 3 user turns
    const avgMetrics = calculateAverageMetrics(recentTurns)

    // If user is performing well (high clarity, empathy, etc.), trigger assessment
    if (avgMetrics.clarity > 80 && avgMetrics.empathy > 70) {
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
          reason: 'User demonstrating strong performance - testing knowledge',
          assessmentId: assessment?.id,
        }
      }
    }
  }

  return { shouldTrigger: false, reason: 'Conditions not met' }
}

/**
 * Calculate average metrics from turns
 */
function calculateAverageMetrics(turns: Array<{ metrics?: any }>) {
  const metrics = {
    clarity: 0,
    empathy: 0,
    directness: 0,
    pacing: 0,
  }

  let count = 0
  for (const turn of turns) {
    if (turn.metrics) {
      if (turn.metrics.clarity) {
        metrics.clarity += turn.metrics.clarity
        count++
      }
      if (turn.metrics.empathy) {
        metrics.empathy += turn.metrics.empathy
      }
      if (turn.metrics.directness) {
        metrics.directness += turn.metrics.directness
      }
      if (turn.metrics.pacing) {
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

