import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSessionTurns } from './turnService'
import { getSessionAnalyses } from './turnAnalysisService'

export interface SessionSummaryData {
  overallAnalysis: string
  overallScore: number
  keyStrengths: Array<{
    competency: string
    score: number
    examples: string[]
  }>
  improvementAreas: Array<{
    competency: string
    score: number
    recommendations: string[]
  }>
  personalizedFeedback: string
  nextSteps: Array<{
    type: 'scenario' | 'micro-drill' | 'knowledge'
    title: string
    reason: string
  }>
  conversationHighlights: Array<{
    moment: string
    significance: string
  }>
}

/**
 * Generate comprehensive AI summary for a completed session
 */
export async function generateSessionSummary(
  sessionId: string,
  userId: string
): Promise<SessionSummaryData | null> {
  try {
    const supabase = await createClient()

    // Get session data
    const { data: session } = await supabase
      .from('sessions')
      .select('*, scenarios(title, description)')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (!session) {
      return null
    }

    // Get all turns
    const turns = await getSessionTurns(sessionId)
    const userTurns = turns.filter((t) => t.speaker === 'user')

    // Get AI analyses for all turns
    const analyses = await getSessionAnalyses(sessionId)

    // Get competencies
    const { data: competencies } = await supabase
      .from('session_competencies')
      .select('*')
      .eq('session_id', sessionId)

    // Build conversation context
    const conversationContext = turns
      .map((t) => `${t.speaker}: ${t.message}`)
      .join('\n')

    // Calculate average metrics from AI analyses
    const avgMetrics = analyses.length > 0
      ? {
          clarity: analyses.reduce((sum, a) => sum + a.metrics.clarity, 0) / analyses.length,
          empathy: analyses.reduce((sum, a) => sum + a.metrics.empathy, 0) / analyses.length,
          directness: analyses.reduce((sum, a) => sum + a.metrics.directness, 0) / analyses.length,
          pacing: analyses.reduce((sum, a) => sum + a.metrics.pacing, 0) / analyses.length,
        }
      : null

    // Generate AI summary using Gemini
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error('[SessionSummary] Missing GOOGLE_GENERATIVE_AI_API_KEY')
      return null
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const scenario = session.scenarios as { title: string; description?: string } | null
    const competencySummary = (competencies || [])
      .map((c) => `${c.competency_name}: ${c.score}% - ${c.feedback || 'No feedback'}`)
      .join('\n')

    const prompt = `You are an expert training coach analyzing a completed negotiation/communication training session.

SCENARIO: ${scenario?.title || 'Unknown'}
${scenario?.description ? `Description: ${scenario.description}` : ''}

CONVERSATION TRANSCRIPT:
${conversationContext}

COMPETENCY SCORES:
${competencySummary || 'No competency scores available'}

${avgMetrics ? `AVERAGE PERFORMANCE METRICS:
- Clarity: ${avgMetrics.clarity.toFixed(1)}/100
- Empathy: ${avgMetrics.empathy.toFixed(1)}/100
- Directness: ${avgMetrics.directness.toFixed(1)}/100
- Pacing: ${avgMetrics.pacing.toFixed(1)} words/min` : ''}

Analyze this session and provide a comprehensive performance summary. Consider:
1. Overall performance and engagement level
2. Key strengths demonstrated (with specific examples from the conversation)
3. Areas needing improvement (with specific examples and actionable recommendations)
4. Notable moments or "aha" moments in the conversation
5. Personalized feedback tailored to this user's performance
6. Next steps for continued improvement (scenarios, micro-drills, or knowledge resources)

Calculate an overall score (0-100) based on:
- Competency scores
- Conversation quality
- Engagement and participation
- Application of techniques discussed

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, just pure JSON):
{
  "overallAnalysis": "<2-3 paragraph comprehensive analysis of the session>",
  "overallScore": <number 0-100>,
  "keyStrengths": [
    {
      "competency": "<competency name>",
      "score": <number 0-100>,
      "examples": ["<specific example 1 from conversation>", "<example 2>"]
    }
  ],
  "improvementAreas": [
    {
      "competency": "<competency name>",
      "score": <number 0-100>,
      "recommendations": ["<specific recommendation 1>", "<recommendation 2>"]
    }
  ],
  "personalizedFeedback": "<2-3 paragraph personalized feedback message>",
  "nextSteps": [
    {
      "type": "<scenario|micro-drill|knowledge>",
      "title": "<title>",
      "reason": "<why this is recommended>"
    }
  ],
  "conversationHighlights": [
    {
      "moment": "<specific moment from conversation>",
      "significance": "<why this moment was notable>"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    let summary: SessionSummaryData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      summary = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('[SessionSummary] Failed to parse AI response:', parseError)
      console.error('[SessionSummary] Raw response:', text)
      return null
    }

    // Validate and ensure overallScore is calculated
    if (!summary.overallScore && session.overall_score) {
      summary.overallScore = session.overall_score
    } else if (!summary.overallScore) {
      // Calculate from competencies if not provided
      const avgCompetencyScore =
        competencies && competencies.length > 0
          ? competencies.reduce((sum, c) => sum + (c.score || 0), 0) / competencies.length
          : 0
      summary.overallScore = Math.round(avgCompetencyScore)
    }

    // Save to database
    const { data: summaryData, error } = await supabase
      .from('session_ai_summary')
      .insert({
        session_id: sessionId,
        overall_analysis: summary.overallAnalysis,
        overall_score: summary.overallScore,
        key_strengths: summary.keyStrengths,
        improvement_areas: summary.improvementAreas,
        personalized_feedback: summary.personalizedFeedback,
        next_steps: summary.nextSteps,
        conversation_highlights: summary.conversationHighlights,
        model_version: 'gemini-2.5-flash',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[SessionSummary] Failed to save summary:', error)
      return summary // Return even if save fails
    }

    // Update session with summary reference and overall score
    await supabase
      .from('sessions')
      .update({
        ai_summary_id: summaryData.id,
        overall_score: summary.overallScore,
        ai_analysis_status: 'completed',
      })
      .eq('id', sessionId)

    console.log('[SessionSummary] ✅ Successfully generated session summary:', sessionId, {
      overallScore: summary.overallScore,
      strengthsCount: summary.keyStrengths.length,
      improvementsCount: summary.improvementAreas.length,
    })

    return summary
  } catch (error: any) {
    console.error('[SessionSummary] Error generating summary:', error)
    return null
  }
}

/**
 * Get existing session summary
 */
export async function getSessionSummary(sessionId: string): Promise<SessionSummaryData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_ai_summary')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    overallAnalysis: data.overall_analysis,
    overallScore: Number(data.overall_score) || 0,
    keyStrengths: (data.key_strengths as SessionSummaryData['keyStrengths']) || [],
    improvementAreas: (data.improvement_areas as SessionSummaryData['improvementAreas']) || [],
    personalizedFeedback: data.personalized_feedback || '',
    nextSteps: (data.next_steps as SessionSummaryData['nextSteps']) || [],
    conversationHighlights: (data.conversation_highlights as SessionSummaryData['conversationHighlights']) || [],
  }
}

