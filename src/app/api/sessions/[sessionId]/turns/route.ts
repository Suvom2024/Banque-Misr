import { createClient } from '@/lib/supabase/server'
import { saveTurn, getNextTurnNumber } from '@/lib/services/sessions/turnService'
import { shouldTriggerAssessment } from '@/lib/services/sessions/assessmentTriggerService'
import { NextResponse } from 'next/server'

/**
 * POST /api/sessions/[sessionId]/turns
 * Save a conversation turn
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
    const body = await request.json()

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get next turn number
    const turnNumber = await getNextTurnNumber(sessionId)

    // Save turn
    const turnId = await saveTurn({
      sessionId,
      turnNumber,
      speaker: body.speaker,
      message: body.message,
      metrics: body.metrics,
      audioChunkId: body.audioChunkId,
    })

    if (!turnId) {
      return NextResponse.json({ error: 'Failed to save turn' }, { status: 500 })
    }

    // Update session progress
    await supabase
      .from('sessions')
      .update({
        current_turn: turnNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    // Check if assessment should be triggered (agentic logic)
    const assessmentCheck = await shouldTriggerAssessment(sessionId)

    return NextResponse.json({
      turnId,
      turnNumber,
      assessmentTrigger: assessmentCheck,
    })
  } catch (error) {
    console.error('Error saving turn:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/sessions/[sessionId]/turns
 * Get all turns for a session
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
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { getSessionTurns } = await import('@/lib/services/sessions/turnService')
    const turns = await getSessionTurns(sessionId)

    return NextResponse.json({ turns })
  } catch (error) {
    console.error('Error fetching turns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

