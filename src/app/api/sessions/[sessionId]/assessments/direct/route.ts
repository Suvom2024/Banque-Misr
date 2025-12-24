import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/sessions/[sessionId]/assessments/direct
 * Get assessments directly for a session (bypass trigger logic)
 * Used when agent explicitly wants to show an assessment
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
      .select('scenario_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get assessments directly for this scenario
    const { data: assessments } = await supabase
      .from('scenario_assessments')
      .select('*')
      .eq('scenario_id', session.scenario_id)
      .order('created_at', { ascending: true })
      .limit(5) // Get first 5 questions

    return NextResponse.json({
      assessments: assessments || [],
      count: assessments?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching assessments directly:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

