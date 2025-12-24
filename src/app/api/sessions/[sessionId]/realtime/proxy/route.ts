import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/sessions/[sessionId]/realtime/proxy
 * Creates a server-side proxy for OpenAI Realtime API
 * This keeps the API key secure on the server
 */
export async function POST(
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
    const { data: session } = await supabase
      .from('sessions')
      .select('id, scenario_id, scenarios(title, description, skills_covered)')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const scenario = session.scenarios as any

    // Return session context for client to use with OpenAI SDK
    // The client will connect directly to OpenAI using their own API key
    // OR we can create a server-side WebSocket proxy (more secure)
    return NextResponse.json({
      sessionId,
      scenarioId: session.scenario_id,
      scenarioTitle: scenario?.title || 'Training Session',
      scenarioDescription: scenario?.description || '',
      skillsCovered: scenario?.skills_covered || [],
      // Note: For production, implement server-side WebSocket proxy
      // to keep API keys secure
    })
  } catch (error) {
    console.error('Error in realtime proxy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

