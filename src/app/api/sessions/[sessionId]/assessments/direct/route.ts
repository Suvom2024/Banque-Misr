import { createClient } from '@/lib/supabase/server'
import { generateDynamicAssessment } from '@/lib/services/sessions/dynamicAssessmentService'
import { NextResponse } from 'next/server'

/**
 * GET /api/sessions/[sessionId]/assessments/direct
 * Get assessments directly for a session (bypass trigger logic)
 * Used when agent explicitly wants to show an assessment
 * 
 * Now generates dynamic assessments based on conversation context
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
      .select('scenario_id, scenarios(title)')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // PRIORITY 1: Generate dynamic assessment based on conversation context
    const scenarioTitle = (session.scenarios as any)?.title
    const dynamicAssessment = await generateDynamicAssessment(sessionId, scenarioTitle)

    if (dynamicAssessment) {
      console.log('[Assessment Direct] ✅ Generated dynamic assessment based on conversation')
      
      // Format as expected by the frontend (matching scenario_assessments structure)
      const formattedAssessment = {
        id: `dynamic-${Date.now()}`, // Temporary ID for dynamic assessments
        scenario_id: session.scenario_id,
        question_text: dynamicAssessment.question_text,
        question_type: dynamicAssessment.question_type,
        options: dynamicAssessment.options,
        correct_answer: dynamicAssessment.correct_answer,
        explanation: dynamicAssessment.explanation || '',
        points: 1,
        order_index: 0,
        is_dynamic: true, // Flag to indicate this is dynamically generated
      }

      return NextResponse.json({
        assessments: [formattedAssessment],
        count: 1,
      })
    }

    // FALLBACK: Use pre-defined assessments if dynamic generation fails
    console.log('[Assessment Direct] ⚠️ Dynamic generation failed, falling back to pre-defined assessments')
    
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

