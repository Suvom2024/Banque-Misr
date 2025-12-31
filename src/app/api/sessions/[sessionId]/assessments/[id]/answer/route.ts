import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/sessions/[sessionId]/assessments/[id]/answer
 * Submit an answer to an assessment question
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, id: assessmentId } = await params
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

    // Check if this is a dynamic assessment (ID starts with "dynamic-")
    const isDynamicAssessment = assessmentId.startsWith('dynamic-')
    let assessment: any = null

    if (isDynamicAssessment) {
      // For dynamic assessments, use the assessment data from request body
      if (!body.assessment) {
        return NextResponse.json({ error: 'Assessment data required for dynamic assessments' }, { status: 400 })
      }
      assessment = body.assessment
    } else {
      // Get assessment question from database
      const { data: dbAssessment, error: assessmentError } = await supabase
        .from('scenario_assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (assessmentError || !dbAssessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }
      assessment = dbAssessment
    }

    // Check if answer is correct
    let isCorrect = false
    let score = 0
    let feedback = ''

    // Handle multiple-choice questions (both dynamic and pre-defined)
    if (assessment.question_type === 'multiple-choice' || assessment.question_type === 'multiple_choice') {
      const options = assessment.options as any[]
      
      // For dynamic assessments, options are simple strings
      // For pre-defined assessments, options might be objects with is_correct flag
      if (isDynamicAssessment) {
        // Dynamic assessment: compare answer text directly
        const selectedOptionText = options.find((opt: any, idx: number) => {
          const optId = typeof opt === 'string' ? `opt-${idx}` : opt.id || `opt-${idx}`
          return optId === body.answer
        })
        const selectedText = typeof selectedOptionText === 'string' 
          ? selectedOptionText 
          : selectedOptionText?.text || ''
        
        isCorrect = selectedText === assessment.correct_answer
        score = isCorrect ? 100 : 0
        feedback = isCorrect
          ? assessment.explanation || 'Correct! Well done.'
          : `Incorrect. The correct answer is: ${assessment.correct_answer}. ${assessment.explanation || ''}`
      } else {
        // Pre-defined assessment: check is_correct flag
        const selectedOption = options.find((opt: any) => {
          const optId = typeof opt === 'string' ? opt : opt.text || opt.id || opt
          return optId === body.answer
        })
        isCorrect = selectedOption?.is_correct || false
        score = isCorrect ? 100 : 0
        feedback = isCorrect
          ? 'Correct! Well done.'
          : `Incorrect. The correct answer was: ${options.find((opt: any) => opt.is_correct)?.text || 'N/A'}`
      }
    } else if (assessment.question_type === 'true_false' || assessment.question_type === 'true-false') {
      isCorrect = body.answer === assessment.correct_answer
      score = isCorrect ? 100 : 0
      feedback = isCorrect
        ? 'Correct!'
        : `Incorrect. The correct answer was: ${assessment.correct_answer}`
    } else if (assessment.question_type === 'short_answer' || assessment.question_type === 'open-ended') {
      // For short answer, we'll do a simple comparison (can be enhanced with LLM)
      isCorrect = body.answer.toLowerCase().trim() === assessment.correct_answer?.toLowerCase().trim()
      score = isCorrect ? 100 : 50 // Partial credit for short answers
      feedback = isCorrect ? 'Correct!' : 'Your answer is close, but not quite right.'
    }

    // Save assessment answer (only for pre-defined assessments)
    if (!isDynamicAssessment) {
      const { data: existingAnswer } = await supabase
        .from('session_assessments')
        .select('id')
        .eq('session_id', sessionId)
        .eq('assessment_id', assessmentId)
        .single()

      if (existingAnswer) {
        // Update existing answer
        await supabase
          .from('session_assessments')
          .update({
            user_answer: body.answer,
            is_correct: isCorrect,
            points_earned: score,
            answered_at: new Date().toISOString(),
          })
          .eq('id', existingAnswer.id)
      } else {
        // Create new answer
        await supabase.from('session_assessments').insert({
          session_id: sessionId,
          assessment_id: assessmentId,
          user_answer: body.answer,
          is_correct: isCorrect,
          points_earned: score,
        })
      }
    }

    return NextResponse.json({
      isCorrect,
      score,
      feedback,
    })
  } catch (error) {
    console.error('Error submitting assessment answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

