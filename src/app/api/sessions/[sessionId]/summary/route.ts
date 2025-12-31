import { createClient } from '@/lib/supabase/server'
import { generateSessionSummary } from '@/lib/services/sessions/sessionSummaryService'
import { NextResponse } from 'next/server'

/**
 * POST /api/sessions/[sessionId]/summary
 * Generate AI summary for a completed session
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

    // Verify session belongs to user and is completed
    const { data: session } = await supabase
      .from('sessions')
      .select('id, status, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'completed') {
      return NextResponse.json({ error: 'Session must be completed' }, { status: 400 })
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('session_ai_summary')
      .select('id')
      .eq('session_id', sessionId)
      .single()

    if (existingSummary) {
      return NextResponse.json({ message: 'Summary already exists', summaryId: existingSummary.id })
    }

    // Mark analysis as in progress
    await supabase
      .from('sessions')
      .update({ ai_analysis_status: 'in_progress' })
      .eq('id', sessionId)

    // Generate summary (this may take a while)
    const summary = await generateSessionSummary(sessionId, user.id)

    if (!summary) {
      await supabase
        .from('sessions')
        .update({ ai_analysis_status: 'failed' })
        .eq('id', sessionId)
      return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating session summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/sessions/[sessionId]/summary
 * Get existing session summary
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

    const { getSessionSummary } = await import('@/lib/services/sessions/sessionSummaryService')
    const summary = await getSessionSummary(sessionId)

    if (!summary) {
      return NextResponse.json({ error: 'Summary not found' }, { status: 404 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error fetching session summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

