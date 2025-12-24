import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * GET /api/sessions/[sessionId]/realtime
 * Creates a connection token for OpenAI Realtime API
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

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, scenario_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get scenario details separately
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('title, description, skills_covered')
      .eq('id', session.scenario_id)
      .single()

    if (scenarioError) {
      console.error('Scenario error:', scenarioError)
    }

    return NextResponse.json({
      sessionId,
      scenarioId: session.scenario_id,
      scenarioTitle: scenario?.title || 'Training Session',
      scenarioDescription: scenario?.description || '',
      skillsCovered: scenario?.skills_covered || [],
    })
  } catch (error) {
    console.error('Error in realtime route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

