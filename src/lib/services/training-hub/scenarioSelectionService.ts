import { createClient } from '@/lib/supabase/server'

export interface ScenarioSelection {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  icon?: string
  duration: string
  difficulty: string
  skill: string
  aiCoach: string
  isRecommended?: boolean
  isSelected?: boolean
}

export interface SessionDetails {
  scenarioId: string
  title: string
  id: string
  description: string
  skills: Array<{ icon: string; label: string }>
  tone: 'Supportive' | 'Neutral' | 'Direct'
  difficulty: string
  estimatedXP: number
}

/**
 * Get scenarios for selection page
 */
export async function getScenariosForSelection(
  userId: string,
  category?: string
): Promise<ScenarioSelection[]> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('scenarios')
    .select('*')
    .eq('is_active', true)

  // Apply category filter
  if (category && category !== 'all') {
    const categoryMap: Record<string, string> = {
      'customer-service': 'Customer Service',
      'compliance': 'Compliance',
      'leadership': 'Management',
    }
    const dbCategory = categoryMap[category] || category
    query = query.eq('category', dbCategory)
  }

  // Order by featured first, then rating
  query = query
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: scenarios, error } = await query

  if (error || !scenarios) {
    console.error('Error fetching scenarios:', error)
    return []
  }

  return scenarios.map((scenario) => {
    // Normalize difficulty to match component type
    let normalizedDifficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
    if (scenario.difficulty) {
      const diff = String(scenario.difficulty).toLowerCase()
      if (diff.includes('beginner') || diff.includes('easy') || diff === 'beginner') {
        normalizedDifficulty = 'Beginner'
      } else if (diff.includes('advanced') || diff.includes('expert') || diff === 'advanced') {
        normalizedDifficulty = 'Advanced'
      } else {
        normalizedDifficulty = 'Intermediate'
      }
    }

    // Ensure all required fields exist
    return {
      id: scenario.id || '',
      title: scenario.title || 'Untitled Scenario',
      subtitle: `${scenario.category || 'General'} · ${normalizedDifficulty}`,
      description: scenario.description || '',
      imageUrl: scenario.image_url || scenario.hero_image_url || undefined,
      icon: undefined, // Can be set if needed
      duration: scenario.duration_minutes ? `${scenario.duration_minutes} Min` : 'N/A',
      difficulty: normalizedDifficulty,
      skill: (scenario.tags && Array.isArray(scenario.tags) && scenario.tags[0]) || scenario.category || 'General',
      aiCoach: (scenario.ai_coach_level === 'advanced' || scenario.ai_coach_level === 'active') ? 'Active' : 'Standard',
      isRecommended: scenario.is_featured || false,
      isSelected: false, // Will be set by component
    }
  })
}

/**
 * Get session details for a scenario
 */
export async function getSessionDetailsForScenario(
  scenarioId: string
): Promise<SessionDetails | null> {
  const supabase = await createClient()

  const { data: scenario, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', scenarioId)
    .single()

  if (error || !scenario) {
    return null
  }

  // Extract skills from tags or skills_covered
  const skillsCovered = (scenario.skills_covered as string[]) || scenario.tags || []
  const skillIcons: Record<string, string> = {
    'Empathy': 'favorite',
    'Clarity': 'record_voice_over',
    'Fairness': 'balance',
    'Negotiation': 'handshake',
    'Conflict Resolution': 'gavel',
    'Rapport Building': 'handshake',
  }

  const skills = skillsCovered.slice(0, 3).map((skill) => ({
    icon: skillIcons[skill] || 'star',
    label: skill,
  }))

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    id: scenario.id.slice(0, 8),
    description: scenario.description || '',
    skills,
    tone: 'Neutral' as const,
    difficulty: scenario.difficulty || 'Medium',
    estimatedXP: scenario.estimated_xp || 150,
  }
}

