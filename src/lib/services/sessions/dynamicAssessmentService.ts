import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSessionTurns } from './turnService'
import { createClient } from '@/lib/supabase/server'

export interface DynamicAssessment {
  question_text: string
  question_type: 'multiple-choice'
  options: string[]
  correct_answer: string
  explanation?: string
}

/**
 * Generate a dynamic assessment question based on recent conversation context
 */
export async function generateDynamicAssessment(
  sessionId: string,
  scenarioTitle?: string
): Promise<DynamicAssessment | null> {
  try {
    // Get recent conversation turns (last 10 turns for context)
    const allTurns = await getSessionTurns(sessionId)
    const recentTurns = allTurns.slice(-10) // Last 10 turns

    if (recentTurns.length === 0) {
      console.warn('[DynamicAssessment] No conversation turns found')
      return null
    }

    // Build conversation context
    const conversationContext = recentTurns
      .map((turn) => {
        const speaker = turn.speaker === 'ai-coach' ? 'AI Coach' : 'User'
        return `${speaker}: ${turn.message}`
      })
      .join('\n')

    // Get scenario details if available
    const supabase = await createClient()
    const { data: session } = await supabase
      .from('sessions')
      .select('scenario_id, scenarios(title)')
      .eq('id', sessionId)
      .single()

    const scenarioName = scenarioTitle || (session?.scenarios as any)?.title || 'the training scenario'

    // Initialize Gemini AI
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.error('[DynamicAssessment] Gemini API key not found')
      return null
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Use gemini-pro which is widely available, or gemini-1.5-pro if available
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create prompt for generating assessment
    const prompt = `You are an expert training coach creating a knowledge check assessment question.

Context:
- Training Scenario: ${scenarioName}
- Recent Conversation:
${conversationContext}

Task: Generate ONE multiple-choice assessment question that tests the user's understanding of the key concepts discussed in the recent conversation. 

Requirements:
1. The question MUST be directly relevant to the specific topics, strategies, or techniques discussed in the conversation above
2. Focus on practical application or understanding of negotiation/communication skills mentioned in the conversation
3. Make it challenging but fair - test real understanding, not trivia
4. Have exactly 4 answer options (A, B, C, D)
5. One clearly correct answer based on what was discussed
6. Include 3 plausible distractors (wrong answers that seem reasonable)
7. Provide a brief explanation (1-2 sentences) explaining why the correct answer is right

IMPORTANT: Generate ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text, just pure JSON):
{
  "question_text": "The actual question text here",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correct_answer": "The exact text of the correct option (must match one of the options exactly)",
  "explanation": "Brief explanation of why this answer is correct (1-2 sentences)"
}

Return ONLY the JSON object, nothing else.`

    console.log('[DynamicAssessment] Generating assessment based on conversation context...')

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // Parse JSON response (handle markdown code blocks if present)
    let jsonText = text
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim()
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim()
    }

    const assessment = JSON.parse(jsonText) as DynamicAssessment

    // Validate assessment structure
    if (
      !assessment.question_text ||
      !Array.isArray(assessment.options) ||
      assessment.options.length !== 4 ||
      !assessment.correct_answer
    ) {
      console.error('[DynamicAssessment] Invalid assessment structure:', assessment)
      return null
    }

    // Ensure correct_answer matches one of the options
    if (!assessment.options.includes(assessment.correct_answer)) {
      console.warn('[DynamicAssessment] Correct answer not in options, using first option')
      assessment.correct_answer = assessment.options[0]
    }

    assessment.question_type = 'multiple-choice'

    console.log('[DynamicAssessment] ✅ Successfully generated dynamic assessment')
    return assessment
  } catch (error) {
    console.error('[DynamicAssessment] ❌ Error generating assessment:', error)
    return null
  }
}

