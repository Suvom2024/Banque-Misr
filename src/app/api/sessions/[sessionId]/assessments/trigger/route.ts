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
    if (result.shouldTrigger && result.assessmentId) {
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('scenario_id')
        .eq('id', sessionId)
        .single()

      if (sessionData) {
        const { data: assessments } = await supabase
          .from('scenario_assessments')
          .select('*')
          .eq('scenario_id', sessionData.scenario_id)
          .order('created_at', { ascending: true })
          .limit(5) // Get first 5 questions

        return NextResponse.json({
          ...result,
          assessments: assessments || [],
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking assessment trigger:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

