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

    // Get all assessments for this scenario
    const { data: allAssessments, error: assessmentError } = await supabase
      .from('scenario_assessments')
      .select('*')
      .eq('scenario_id', session.scenario_id)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true })

    if (assessmentError) {
      console.error('Error fetching assessments:', assessmentError)
    }

    // Get already-answered assessments for this session
    const { data: answeredAssessments } = await supabase
      .from('session_assessments')
      .select('assessment_id')
      .eq('session_id', sessionId)

    const answeredIds = new Set(
      (answeredAssessments || []).map((a: any) => a.assessment_id).filter(Boolean)
    )

    // Filter out already-answered assessments and get the first unanswered one
    const availableAssessments = (allAssessments || []).filter(
      (assessment: any) => !answeredIds.has(assessment.id)
    )

    // Return first unanswered assessment (limit to 1 when AI explicitly requests)
    const assessments = availableAssessments.slice(0, 1)

    return NextResponse.json({
      assessments: assessments || [],
      count: assessments?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching assessments directly:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

