import { createClient } from '@/lib/supabase/server'
import { shouldTriggerAssessment } from '@/lib/services/sessions/assessmentTriggerService'
import { NextResponse } from 'next/server'

/**
 * GET /api/sessions/[sessionId]/assessments/trigger
 * Check if assessment should be triggered (agentic decision)
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

    // Check if assessment should be triggered
    const result = await shouldTriggerAssessment(sessionId)

    // If should trigger, get assessment questions
    if (result.shouldTrigger) {
      // Get scenario_id to fetch assessments
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('scenario_id')
        .eq('id', sessionId)
        .single()

      if (sessionData?.scenario_id) {
        // Get all assessments for this scenario
        const { data: allAssessments, error: assessmentError } = await supabase
          .from('scenario_assessments')
          .select('*')
          .eq('scenario_id', sessionData.scenario_id)
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

        // Filter out already-answered assessments
        const availableAssessments = (allAssessments || []).filter(
          (assessment: any) => !answeredIds.has(assessment.id)
        )

        // Get first unanswered assessment (limit to 1 for now)
        const assessments = availableAssessments.slice(0, 1)

        if (assessments.length > 0) {
          console.log(`[Assessment Trigger] Found ${assessments.length} available assessment(s)`)
        } else {
          console.warn(`[Assessment Trigger] No unanswered assessments available for session ${sessionId}`)
        }

        // Return result with assessments (even if empty array)
        return NextResponse.json({
          ...result,
          assessments: assessments,
        })
      } else {
        console.warn(`[Assessment Trigger] Session ${sessionId} has no scenario_id`)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking assessment trigger:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

