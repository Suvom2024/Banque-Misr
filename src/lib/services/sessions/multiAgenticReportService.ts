import { createClient } from '@/lib/supabase/server'

export interface MultiAgenticReportData {
  title: string
  date: string
  time: string
  sessionNumber: string
  overallScore: number
  rating: string
  description: string
  executiveSummary: string
  topStrength: string
  keyOpportunity: string
  duration: string
  empathyAgent: {
    score: number
    findings: Array<{ type: 'positive' | 'warning' | 'critical'; text: string }>
    recommendation: string
    empathyChart: number[]
  }
  complianceAgent: {
    criticalAlerts: number
    findings: Array<{ type: 'positive' | 'warning' | 'critical'; text: string }>
    recommendation: string
    adherenceMetrics: Array<{ label: string; current: number; total: number }>
  }
  pacingCoach: {
    status: string
    averageWPM: number
    description: string
  }
  transcript: Array<{
    id: string
    speaker: 'user' | 'client' | 'ai-coach'
    message: string
    timestamp: string
    highlights?: Array<{
      text: string
      type: 'empathy' | 'compliance' | 'pacing' | 'tone'
      tooltip: string
    }>
  }>
}

/**
 * Get multi-agentic report data
 */
export async function getMultiAgenticReport(
  sessionId: string,
  userId: string
): Promise<MultiAgenticReportData | null> {
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

  // Get agent analysis
  const { data: agentAnalysis } = await supabase
    .from('session_agent_analysis')
    .select('*')
    .eq('session_id', sessionId)

  const analysisMap = new Map(
    (agentAnalysis || []).map((a) => [a.agent_type, a])
  )

  // Get competencies for top strength
  const { data: competencies } = await supabase
    .from('session_competencies')
    .select('*')
    .eq('session_id', sessionId)
    .order('score', { ascending: false })

  const topCompetency = competencies && competencies.length > 0 ? competencies[0] : null
  const weakCompetency = competencies && competencies.length > 0 
    ? competencies[competencies.length - 1] 
    : null

  // Get transcript with turns
  const { data: turns } = await supabase
    .from('session_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true })

  // Format date and time
  const sessionDate = session.completed_at || session.started_at
  const date = sessionDate ? new Date(sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
  const time = sessionDate ? new Date(sessionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
  
  // Calculate duration
  const duration = session.completed_at && session.started_at
    ? calculateDuration(session.started_at, session.completed_at)
    : 'N/A'

  // Get session number
  const { count } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('scenario_id', session.scenario_id)
    .lte('created_at', session.created_at)

  const sessionNumber = `Scenario #${count || 1}`

  // Build empathy agent data
  const empathyAnalysis = analysisMap.get('empathy')
  const empathyAgent = {
    score: empathyAnalysis?.score || (topCompetency?.competency_name === 'Empathy' ? topCompetency.score : 75),
    findings: empathyAnalysis?.findings as Array<{ type: 'positive' | 'warning' | 'critical'; text: string }> || [
      { type: 'positive' as const, text: 'Strong validation of client concerns.' },
    ],
    recommendation: empathyAnalysis?.recommendations || 'Continue practicing active listening techniques.',
    empathyChart: empathyAnalysis?.chart_data as number[] || [40, 55, 70, 90, 60, 45, 75],
  }

  // Build compliance agent data
  const complianceAnalysis = analysisMap.get('compliance')
  const complianceFindings = complianceAnalysis?.findings as Array<{ type: 'positive' | 'warning' | 'critical'; text: string }> || []
  const complianceAgent = {
    criticalAlerts: complianceFindings.filter((f) => f.type === 'critical').length,
    findings: complianceFindings.length > 0 ? complianceFindings : [
      { type: 'positive' as const, text: 'Correctly identified verification questions.' },
    ],
    recommendation: complianceAnalysis?.recommendations || 'Review compliance protocols regularly.',
    adherenceMetrics: [
      { label: 'Mandatory Disclosures', current: 2, total: 3 },
      { label: 'Product Features', current: 5, total: 5 },
      { label: 'Closing Statement', current: 1, total: 1 },
    ],
  }

  // Build pacing coach data
  const pacingAnalysis = analysisMap.get('pacing')
  const realTimeMetrics = session.real_time_metrics as { pacing?: number } | null
  const pacingCoach = {
    status: pacingAnalysis?.score && pacingAnalysis.score >= 80 ? 'Optimal' : 'Needs Improvement',
    averageWPM: realTimeMetrics?.pacing || pacingAnalysis?.score || 145,
    description: pacingAnalysis?.recommendations || 'You used effective pauses after key questions.',
  }

  // Build transcript with highlights
  const transcript = (turns || []).map((turn, index) => {
    const highlights: Array<{ text: string; type: 'empathy' | 'compliance' | 'pacing' | 'tone'; tooltip: string }> = []

    // Add highlights based on agent analysis
    if (turn.speaker === 'user' && turn.message.toLowerCase().includes('understand')) {
      highlights.push({
        text: turn.message,
        type: 'empathy',
        tooltip: 'Good use of empathetic language.',
      })
    }

    return {
      id: turn.id,
      speaker: turn.speaker as 'user' | 'client' | 'ai-coach',
      message: turn.message,
      timestamp: formatTimestamp(turn.timestamp || turn.created_at),
      highlights: highlights.length > 0 ? highlights : undefined,
    }
  })

  // Generate rating
  const rating = overallScore >= 90 ? 'Exceptional!' : overallScore >= 80 ? 'Great!' : overallScore >= 70 ? 'Good' : 'Needs Improvement'
  const description = overallScore >= 90 ? 'Top 5% of branch managers' : overallScore >= 80 ? 'Above average performance' : 'Room for improvement'

  return {
    title: scenario?.title || 'Unknown Session',
    date,
    time,
    sessionNumber,
    overallScore,
    rating,
    description,
    executiveSummary: session.ai_summary || generateExecutiveSummary(overallScore, topCompetency, weakCompetency),
    topStrength: topCompetency?.competency_name || 'Overall Performance',
    keyOpportunity: weakCompetency?.competency_name || 'Continued Practice',
    duration,
    empathyAgent,
    complianceAgent,
    pacingCoach,
    transcript,
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
  return `${minutes}m ${seconds}s`
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const minutes = Math.floor(date.getMinutes())
  const seconds = Math.floor(date.getSeconds())
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(
  overallScore: number,
  topCompetency: any | null,
  weakCompetency: any | null
): string {
  let summary = `You demonstrated ${overallScore >= 80 ? 'strong' : 'good'} performance with a score of ${overallScore}%.`
  
  if (topCompetency) {
    summary += ` Your ${topCompetency.competency_name} was particularly strong.`
  }
  
  if (weakCompetency) {
    summary += ` Focus on improving ${weakCompetency.competency_name.toLowerCase()} to enhance overall performance.`
  }

  return summary
}


