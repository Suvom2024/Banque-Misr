import { createClient } from '@/lib/supabase/server'
import type { LibraryScenario } from '@/components/dashboard/LibraryScenarioCard'

export type ScenarioFilter = 'all' | 'customer-service' | 'sales-retention' | 'leadership' | 'recommended'

export interface ScenarioFilters {
  category?: ScenarioFilter
  difficulty?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedScenarios {
  scenarios: LibraryScenario[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Get scenarios with filters and pagination
 */
export async function getScenarios(
  userId: string,
  filters: ScenarioFilters = {}
): Promise<PaginatedScenarios> {
  const supabase = await createClient()
  const { category, difficulty, search, page = 1, limit = 20 } = filters

  // Build query
  let query = supabase
    .from('scenarios')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // Apply filters
  if (category && category !== 'all' && category !== 'recommended') {
    // Map category filter to database category
    const categoryMap: Record<string, string> = {
      'customer-service': 'Customer Service',
      'sales-retention': 'Sales',
      leadership: 'Management',
    }
    const dbCategory = categoryMap[category] || category
    query = query.eq('category', dbCategory)
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Ordering
  if (category === 'recommended') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query
      .order('is_featured', { ascending: false })
      .order('featured_priority', { ascending: false })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data: scenarios, error, count } = await query

  if (error) {
    console.error('Error fetching scenarios:', error)
    return {
      scenarios: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }

  // Get user progress and bookmarks
  const scenarioIds = scenarios?.map((s) => s.id) || []
  
  const [progressResult, bookmarksResult] = await Promise.all([
    supabase
      .from('user_scenario_progress')
      .select('scenario_id, status, best_score')
      .eq('user_id', userId)
      .in('scenario_id', scenarioIds),
    supabase
      .from('user_scenario_bookmarks')
      .select('scenario_id')
      .eq('user_id', userId)
      .in('scenario_id', scenarioIds),
  ])

  const progressMap = new Map(
    progressResult.data?.map((p) => [p.scenario_id, p]) || []
  )
  const bookmarkedIds = new Set(bookmarksResult.data?.map((b) => b.scenario_id) || [])

  // Transform to LibraryScenario format
  const libraryScenarios: LibraryScenario[] =
    scenarios?.map((scenario) => {
      const progress = progressMap.get(scenario.id)
      const isBookmarked = bookmarkedIds.has(scenario.id)

      // Determine if recommended (high rating or user hasn't started)
      const isRecommended =
        category === 'recommended' ||
        (scenario.rating && scenario.rating >= 4.0) ||
        !progress ||
        progress.status === 'not-started'

      return {
        id: scenario.id,
        title: scenario.title,
        category: scenario.category || 'Uncategorized',
        rating: scenario.rating ? Number(scenario.rating) : 0,
        reviewCount: scenario.review_count || 0,
        difficulty: scenario.difficulty || 'intermediate',
        duration: scenario.duration_minutes
          ? `${scenario.duration_minutes} min${scenario.duration_minutes > 1 ? 's' : ''}`
          : 'N/A',
        description: scenario.description || '',
        tags: scenario.tags || [],
        isFeatured: scenario.is_featured || false,
        isRecommended,
        imageUrl: scenario.hero_image_url || scenario.image_url || undefined,
        aiCoach: scenario.ai_coach_level || undefined,
      }
    }) || []

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    scenarios: libraryScenarios,
    total,
    page,
    limit,
    totalPages,
  }
}

/**
 * Get featured scenario
 */
export async function getFeaturedScenario(): Promise<LibraryScenario | null> {
  const supabase = await createClient()

  const { data: scenario, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('featured_priority', { ascending: false })
    .order('last_featured_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !scenario) {
    return null
  }

  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category || 'Featured',
    rating: scenario.rating ? Number(scenario.rating) : 0,
    reviewCount: scenario.review_count || 0,
    difficulty: scenario.difficulty || 'intermediate',
    duration: scenario.duration_minutes
      ? `${scenario.duration_minutes} min${scenario.duration_minutes > 1 ? 's' : ''}`
      : 'N/A',
    description: scenario.description || '',
    tags: scenario.tags || [],
    isFeatured: true,
    isRecommended: true,
    imageUrl: scenario.hero_image_url || scenario.image_url || undefined,
    aiCoach: scenario.ai_coach_level || undefined,
  }
}

/**
 * Get single scenario by ID
 */
export async function getScenarioById(
  scenarioId: string,
  userId?: string
): Promise<LibraryScenario | null> {
  const supabase = await createClient()

  const { data: scenario, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', scenarioId)
    .single()

  if (error || !scenario) {
    return null
  }

  // Get user progress if userId provided
  let progress = null
  let isBookmarked = false

  if (userId) {
    const [progressResult, bookmarkResult] = await Promise.all([
      supabase
        .from('user_scenario_progress')
        .select('status, best_score')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .single(),
      supabase
        .from('user_scenario_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId)
        .single(),
    ])

    progress = progressResult.data
    isBookmarked = !!bookmarkResult.data
  }

  return {
    id: scenario.id,
    title: scenario.title,
    category: scenario.category || 'Uncategorized',
    rating: scenario.rating ? Number(scenario.rating) : 0,
    reviewCount: scenario.review_count || 0,
    difficulty: scenario.difficulty || 'intermediate',
    duration: scenario.duration_minutes
      ? `${scenario.duration_minutes} min${scenario.duration_minutes > 1 ? 's' : ''}`
      : 'N/A',
    description: scenario.description || '',
    tags: scenario.tags || [],
    isFeatured: scenario.is_featured || false,
    isRecommended: (scenario.rating && scenario.rating >= 4.0) || !progress,
    imageUrl: scenario.hero_image_url || scenario.image_url || undefined,
    aiCoach: scenario.ai_coach_level || undefined,
  }
}

/**
 * Get recommended scenarios for user
 */
export async function getRecommendedScenarios(
  userId: string,
  limit: number = 6
): Promise<LibraryScenario[]> {
  const supabase = await createClient()

  // Get user's competency gaps to recommend scenarios
  const { data: gaps } = await supabase
    .from('user_competency_gaps')
    .select('competency_name')
    .eq('user_id', userId)
    .order('gap_size', { ascending: false })
    .limit(3)

  // Get scenarios that match user's gaps or have high ratings
  let query = supabase
    .from('scenarios')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .order('completion_count', { ascending: false })
    .limit(limit * 2)

  const { data: scenarios } = await query

  if (!scenarios || scenarios.length === 0) {
    return []
  }

  // Get user progress to filter out completed scenarios
  const scenarioIds = scenarios.map((s) => s.id)
  const { data: progress } = await supabase
    .from('user_scenario_progress')
    .select('scenario_id, status')
    .eq('user_id', userId)
    .in('scenario_id', scenarioIds)

  const completedIds = new Set(
    progress?.filter((p) => p.status === 'completed').map((p) => p.scenario_id) || []
  )

  // Transform and filter
  const recommended: LibraryScenario[] = scenarios
    .filter((s) => !completedIds.has(s.id))
    .slice(0, limit)
    .map((scenario) => ({
      id: scenario.id,
      title: scenario.title,
      category: scenario.category || 'Uncategorized',
      rating: scenario.rating ? Number(scenario.rating) : 0,
      reviewCount: scenario.review_count || 0,
      difficulty: scenario.difficulty || 'intermediate',
      duration: scenario.duration_minutes
        ? `${scenario.duration_minutes} min${scenario.duration_minutes > 1 ? 's' : ''}`
        : 'N/A',
      description: scenario.description || '',
      tags: scenario.tags || [],
      isFeatured: scenario.is_featured || false,
      isRecommended: true,
      imageUrl: scenario.hero_image_url || scenario.image_url || undefined,
      aiCoach: scenario.ai_coach_level || undefined,
    }))

  return recommended
}


