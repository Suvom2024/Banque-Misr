import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface TurnAnalysisMetrics {
  clarity: number // 0-100
  empathy: number // 0-100
  pacing: number // words per minute
  directness: number // 0-100
  sentiment: 'positive' | 'negative' | 'neutral'
  professionalism?: number // 0-100
  engagement?: number // 0-100
}

export interface TurnAnalysisResult {
  metrics: TurnAnalysisMetrics
  feedback: string
  recommendations: string[]
  confidenceScore: number
}

/**
 * Analyze a conversation turn using AI to extract performance metrics
 */
export async function analyzeTurn(
  turnId: string,
  sessionId: string,
  speaker: 'user' | 'ai-coach' | 'client' | 'system',
  message: string,
  conversationContext?: Array<{ speaker: string; message: string }> // Last 5 turns for context
): Promise<TurnAnalysisResult | null> {
  // Only analyze user turns
  if (speaker !== 'user') {
    return null
  }

  try {
    // Keep env var aligned with dynamicAssessmentService.ts (uses NEXT_PUBLIC_GEMINI_API_KEY)
    // Prefer server-only var if present, but support current project convention.
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.error(
        '[TurnAnalysis] Missing Gemini API key (expected GOOGLE_GENERATIVE_AI_API_KEY, GEMINI_API_KEY, or NEXT_PUBLIC_GEMINI_API_KEY)'
      )
      return null
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build context string
    const contextString = conversationContext
      ? conversationContext
          .slice(-5)
          .map((t) => `${t.speaker}: ${t.message}`)
          .join('\n')
      : 'No previous context available.'

    const prompt = `You are an expert communication and negotiation skills coach analyzing a training conversation turn.

CONVERSATION CONTEXT (last 5 turns):
${contextString}

CURRENT USER TURN TO ANALYZE:
${message}

Analyze this user turn and provide a detailed performance assessment. Consider:
1. **Clarity** (0-100): How clear and understandable is the message? Is it well-structured?
2. **Empathy** (0-100): Does the user show understanding of the other party's perspective?
3. **Pacing** (words per minute): Estimate speaking pace - is it appropriate?
4. **Directness** (0-100): How direct and straightforward is the communication? (0 = too indirect/beating around the bush, 100 = very direct)
5. **Sentiment** (positive/negative/neutral): Overall emotional tone
6. **Professionalism** (0-100): How professional is the language and approach?
7. **Engagement** (0-100): How engaged and active is the user in the conversation?

IMPORTANT: 
- Base your analysis ONLY on the actual content of the message
- Be objective and fair
- Consider the conversation context when relevant
- Provide specific, actionable feedback

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, just pure JSON):
{
  "metrics": {
    "clarity": <number 0-100>,
    "empathy": <number 0-100>,
    "pacing": <number, estimated words per minute>,
    "directness": <number 0-100>,
    "sentiment": "<positive|negative|neutral>",
    "professionalism": <number 0-100>,
    "engagement": <number 0-100>
  },
  "feedback": "<2-3 sentences of specific, constructive feedback about what the user did well and what could be improved>",
  "recommendations": ["<specific recommendation 1>", "<specific recommendation 2>"],
  "confidenceScore": <number 0-1, how confident you are in this analysis>
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let analysis: TurnAnalysisResult
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[TurnAnalysis] Failed to parse AI response:', parseError)
      console.error('[TurnAnalysis] Raw response:', text)
      return null
    }

    // Validate metrics
    if (!analysis.metrics || typeof analysis.metrics.clarity !== 'number') {
      console.error('[TurnAnalysis] Invalid metrics in AI response')
      return null
    }

    // Ensure all required metrics are present
    const metrics: TurnAnalysisMetrics = {
      clarity: Math.max(0, Math.min(100, analysis.metrics.clarity || 0)),
      empathy: Math.max(0, Math.min(100, analysis.metrics.empathy || 0)),
      pacing: Math.max(0, analysis.metrics.pacing || 0),
      directness: Math.max(0, Math.min(100, analysis.metrics.directness || 0)),
      sentiment: analysis.metrics.sentiment || 'neutral',
      professionalism: Math.max(0, Math.min(100, analysis.metrics.professionalism || 0)),
      engagement: Math.max(0, Math.min(100, analysis.metrics.engagement || 0)),
    }

    // Save analysis to database
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('turn_ai_analysis')
      .insert({
        turn_id: turnId,
        session_id: sessionId,
        ai_metrics: metrics,
        ai_feedback: analysis.feedback || '',
        ai_recommendations: analysis.recommendations || [],
        confidence_score: Math.max(0, Math.min(1, analysis.confidenceScore || 0.8)),
        model_version: 'gemini-2.5-flash',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[TurnAnalysis] Failed to save analysis to database:', error)
      return null
    }

    // Update turn with analysis reference
    await supabase
      .from('session_turns')
      .update({ ai_analysis_id: data.id })
      .eq('id', turnId)

    console.log('[TurnAnalysis] ✅ Successfully analyzed turn:', turnId, {
      clarity: metrics.clarity,
      empathy: metrics.empathy,
      confidence: analysis.confidenceScore,
    })

    return {
      metrics,
      feedback: analysis.feedback || '',
      recommendations: analysis.recommendations || [],
      confidenceScore: analysis.confidenceScore || 0.8,
    }
  } catch (error: any) {
    console.error('[TurnAnalysis] Error analyzing turn:', error)
    return null
  }
}

/**
 * Get AI analysis for a turn
 */
export async function getTurnAnalysis(turnId: string): Promise<TurnAnalysisResult | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('turn_ai_analysis')
    .select('*')
    .eq('turn_id', turnId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    metrics: data.ai_metrics as TurnAnalysisMetrics,
    feedback: data.ai_feedback || '',
    recommendations: (data.ai_recommendations as string[]) || [],
    confidenceScore: Number(data.confidence_score) || 0,
  }
}

/**
 * Get all analyses for a session
 */
export async function getSessionAnalyses(sessionId: string): Promise<TurnAnalysisResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('turn_ai_analysis')
    .select('*')
    .eq('session_id', sessionId)
    .order('analyzed_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((analysis) => ({
    metrics: analysis.ai_metrics as TurnAnalysisMetrics,
    feedback: analysis.ai_feedback || '',
    recommendations: (analysis.ai_recommendations as string[]) || [],
    confidenceScore: Number(analysis.confidence_score) || 0,
  }))
}

