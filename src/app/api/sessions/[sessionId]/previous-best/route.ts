import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    // Get current session
    const { data: currentSession } = await supabase
      .from('sessions')
      .select('id, scenario_id, overall_score')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!currentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get current competencies
    const { data: currentCompetencies } = await supabase
      .from('session_competencies')
      .select('competency_name, score')
      .eq('session_id', sessionId)

    // Get previous best session for this scenario
    const { data: previousSessions } = await supabase
      .from('sessions')
      .select('id, overall_score')
      .eq('user_id', user.id)
      .eq('scenario_id', currentSession.scenario_id)
      .eq('status', 'completed')
      .neq('id', sessionId)
      .order('overall_score', { ascending: false })
      .limit(1)

    if (!previousSessions || previousSessions.length === 0) {
      return NextResponse.json([])
    }

    const previousSessionId = previousSessions[0].id
    const previousOverallScore = previousSessions[0].overall_score || 0

    // Get previous competencies
    const { data: previousCompetencies } = await supabase
      .from('session_competencies')
      .select('competency_name, score')
      .eq('session_id', previousSessionId)

    const previousMap = new Map(
      (previousCompetencies || []).map((c) => [c.competency_name, c.score || 0])
    )

    const currentOverallScore = currentSession.overall_score || 0
    const currentMap = new Map(
      (currentCompetencies || []).map((c) => [c.competency_name, c.score || 0])
    )

    const metrics: any[] = []

    // Overall score comparison
    const overallChange = currentOverallScore - previousOverallScore
    metrics.push({
      name: 'Overall Score',
      current: currentOverallScore,
      previous: previousOverallScore,
      change: Math.abs(overallChange),
      changeType: overallChange > 0 ? 'increase' : overallChange < 0 ? 'decrease' : 'stable',
    })

    // Competency comparisons
    const allCompetencies = new Set([
      ...Array.from(currentMap.keys()),
      ...Array.from(previousMap.keys()),
    ])

    allCompetencies.forEach((competencyName) => {
      const current = currentMap.get(competencyName) || 0
      const previous = previousMap.get(competencyName) || 0
      const change = current - previous

      if (Math.abs(change) > 0) {
        metrics.push({
          name: competencyName,
          current,
          previous,
          change: Math.abs(change),
          changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
        })
      }
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching previous best:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


