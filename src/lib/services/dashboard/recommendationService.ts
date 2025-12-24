import { createClient } from '@/lib/supabase/server'
import type { Recommendation, UserCompetencyGap } from '@/types/dashboard'
import { analyzeCompetencyGaps as analyzeGaps } from './competencyGapService'

/**
 * Get user's recommended focus area
 */
export async function getUserRecommendedFocus(userId: string): Promise<Recommendation | null> {
  const supabase = await createClient()

  // Get active, non-dismissed recommendations
  const { data: recommendations } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (recommendations) {
    return {
      id: recommendations.id,
      recommendationType: recommendations.recommendation_type as Recommendation['recommendationType'],
      title: recommendations.title,
      description: recommendations.description,
      icon: recommendations.icon,
      tags: recommendations.tags || [],
      priority: recommendations.priority,
      reason: recommendations.reason || undefined,
      relatedScenarioId: recommendations.related_scenario_id || undefined,
      relatedCompetency: recommendations.related_competency || undefined,
      confidenceScore: recommendations.confidence_score ? Number(recommendations.confidence_score) : undefined,
      expiresAt: recommendations.expires_at || undefined,
      isDismissed: recommendations.is_dismissed,
    }
  }

  // Generate new recommendation if none exists
  return await generateAIRecommendation(userId)
}

/**
 * Analyze user competency gaps
 */
export async function analyzeCompetencyGaps(userId: string): Promise<UserCompetencyGap[]> {
  const supabase = await createClient()

  // Get cached gaps
  const { data: cachedGaps } = await supabase
    .from('user_competency_gaps')
    .select('*')
    .eq('user_id', userId)
    .order('gap_size', { ascending: false })

  if (cachedGaps && cachedGaps.length > 0) {
    // Check if analysis is recent (within 24 hours)
    const lastAnalyzed = new Date(cachedGaps[0].last_analyzed_at)
    const hoursSinceAnalysis = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60)

    if (hoursSinceAnalysis < 24) {
      return cachedGaps.map((gap) => ({
        competencyName: gap.competency_name,
        currentAverageScore: Number(gap.current_average_score),
        targetScore: Number(gap.target_score),
        gapSize: Number(gap.gap_size),
        recentTrend: gap.recent_trend as UserCompetencyGap['recentTrend'],
        sessionsAnalyzed: gap.sessions_analyzed,
      }))
    }
  }

  // Re-analyze gaps
  return await analyzeGaps(userId)
}

/**
 * Generate AI recommendation based on gaps
 */
export async function generateAIRecommendation(userId: string): Promise<Recommendation | null> {
  const gaps = await analyzeCompetencyGaps(userId)

  if (gaps.length === 0) {
    return null
  }

  // Find the largest gap
  const topGap = gaps[0]

  const supabase = await createClient()

  // Find scenarios that target this competency
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('id, title, description, skills_covered')
    .eq('is_active', true)
    .limit(10)

  // Find scenario that matches the gap
  let matchingScenario = scenarios?.find((s) => {
    const skills = (s.skills_covered as Array<{ label: string }>) || []
    return skills.some((skill) => skill.label === topGap.competencyName)
  })

  if (!matchingScenario && scenarios && scenarios.length > 0) {
    matchingScenario = scenarios[0] // Fallback to first scenario
  }

  // Generate recommendation
  const recommendation: Omit<Recommendation, 'id' | 'isDismissed'> = {
    recommendationType: 'focus_area',
    title: `Improve ${topGap.competencyName}`,
    description: `Your ${topGap.competencyName} score is ${topGap.currentAverageScore.toFixed(0)}%, which is below your target of ${topGap.targetScore}%. Focus on this area to improve your overall performance.`,
    icon: getCompetencyIcon(topGap.competencyName),
    tags: [topGap.competencyName.toUpperCase(), 'RECOMMENDED'],
    priority: Math.round(topGap.gapSize),
    reason: `Gap of ${topGap.gapSize.toFixed(1)}% below target`,
    relatedCompetency: topGap.competencyName,
    relatedScenarioId: matchingScenario?.id,
    confidenceScore: Math.min(0.9, 0.5 + topGap.gapSize / 100),
  }

  // Save to database
  const { data: saved } = await supabase
    .from('ai_recommendations')
    .insert({
      user_id: userId,
      recommendation_type: recommendation.recommendationType,
      title: recommendation.title,
      description: recommendation.description,
      icon: recommendation.icon,
      tags: recommendation.tags,
      priority: recommendation.priority,
      reason: recommendation.reason,
      related_competency: recommendation.relatedCompetency,
      related_scenario_id: recommendation.relatedScenarioId,
      confidence_score: recommendation.confidenceScore,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
    })
    .select()
    .single()

  if (saved) {
    return {
      ...recommendation,
      id: saved.id,
      isDismissed: false,
    }
  }

  return null
}

/**
 * Refresh recommendations for user
 */
export async function refreshRecommendations(userId: string): Promise<Recommendation[]> {
  const supabase = await createClient()

  // Delete old recommendations
  await supabase.from('ai_recommendations').delete().eq('user_id', userId).eq('is_dismissed', false)

  // Generate new recommendations
  const gaps = await analyzeGaps(userId)
  const recommendations: Recommendation[] = []

  // Generate top 3 recommendations
  for (let i = 0; i < Math.min(3, gaps.length); i++) {
    const gap = gaps[i]
    const rec = await generateAIRecommendation(userId)
    if (rec) {
      recommendations.push(rec)
    }
  }

  return recommendations
}

/**
 * Get icon for competency
 */
function getCompetencyIcon(name: string): string {
  const iconMap: Record<string, string> = {
    Empathy: 'favorite',
    Clarity: 'record_voice_over',
    'Objection Handling': 'psychology_alt',
    'Rapport Building': 'handshake',
    Pacing: 'speed',
    'Active Listening': 'hearing',
  }
  return iconMap[name] || 'star'
}

