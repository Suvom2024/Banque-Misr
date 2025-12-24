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

    // Get assessment question
    const { data: assessment, error: assessmentError } = await supabase
      .from('scenario_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Check if answer is correct
    let isCorrect = false
    let score = 0
    let feedback = ''

    if (assessment.question_type === 'multiple_choice') {
      const options = assessment.options as any[]
      const selectedOption = options.find((opt: any) => {
        const optId = typeof opt === 'string' ? opt : opt.text || opt
        return optId === body.answer || opt.is_correct
      })
      isCorrect = selectedOption?.is_correct || false
      score = isCorrect ? 100 : 0
      feedback = isCorrect
        ? 'Correct! Well done.'
        : `Incorrect. The correct answer was: ${options.find((opt: any) => opt.is_correct)?.text || 'N/A'}`
    } else if (assessment.question_type === 'true_false') {
      isCorrect = body.answer === assessment.correct_answer
      score = isCorrect ? 100 : 0
      feedback = isCorrect
        ? 'Correct!'
        : `Incorrect. The correct answer was: ${assessment.correct_answer}`
    } else if (assessment.question_type === 'short_answer') {
      // For short answer, we'll do a simple comparison (can be enhanced with LLM)
      isCorrect = body.answer.toLowerCase().trim() === assessment.correct_answer?.toLowerCase().trim()
      score = isCorrect ? 100 : 50 // Partial credit for short answers
      feedback = isCorrect ? 'Correct!' : 'Your answer is close, but not quite right.'
    }

    // Save assessment answer
    const { data: existingAnswer } = await supabase
      .from('session_assessments')
      .select('id')
      .eq('session_id', sessionId)
      .eq('scenario_assessment_id', assessmentId)
      .single()

    if (existingAnswer) {
      // Update existing answer
      await supabase
        .from('session_assessments')
        .update({
          user_answer: body.answer,
          is_correct: isCorrect,
          score,
          feedback,
          answered_at: new Date().toISOString(),
        })
        .eq('id', existingAnswer.id)
    } else {
      // Create new answer
      await supabase.from('session_assessments').insert({
        session_id: sessionId,
        scenario_assessment_id: assessmentId,
        user_answer: body.answer,
        is_correct: isCorrect,
        score,
        feedback,
      })
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

