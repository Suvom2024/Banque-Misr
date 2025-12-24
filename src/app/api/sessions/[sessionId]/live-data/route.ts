import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/sessions/[sessionId]/live-data
 * Get basic session data for live session page
 */
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

    // Get session with scenario details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        scenario_id,
        current_turn,
        total_turns,
        status,
        real_time_metrics,
        scenarios (
          title,
          description
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const scenario = session.scenarios as any

    return NextResponse.json({
      id: session.id,
      scenarioId: session.scenario_id,
      scenarioTitle: scenario?.title || 'Training Session',
      currentTurn: session.current_turn || 0,
      totalTurns: session.total_turns || 10,
      status: session.status,
      metrics: session.real_time_metrics || {
        sentiment: 'neutral',
        pacing: 0,
        clarity: 0,
      },
    })
  } catch (error) {
    console.error('Error fetching live session data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

