import { createClient } from '@/lib/supabase/server'

export interface DevelopmentGoal {
  id: string
  title: string
  description: string | null
  targetDate: string | null
  progress: number
  status: 'active' | 'completed' | 'cancelled'
  aiInsight: string | null
  trend: number[]
  icon: string | null
  createdAt: string
  updatedAt: string
}

export interface TrainingModule {
  id: string
  type: 'scenario' | 'micro-learning' | 'drill' | 'knowledge'
  title: string
  description: string
  duration?: string
  difficulty?: string
  isHighImpact?: boolean
  scenarioId?: string
}

/**
 * Get user's development goals
 */
export async function getUserGoals(
  userId: string,
  status?: 'active' | 'completed' | 'cancelled'
): Promise<DevelopmentGoal[]> {
  const supabase = await createClient()

  let query = supabase
    .from('development_goals')
    .select('*')
    .eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: goals, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
    return []
  }

  return (goals || []).map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetDate: goal.target_date,
    progress: goal.progress || 0,
    status: goal.status as DevelopmentGoal['status'],
    aiInsight: goal.ai_insight,
    trend: (goal.trend_data as number[]) || [],
    icon: goal.icon,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  }))
}

/**
 * Create a new development goal
 */
export async function createGoal(
  userId: string,
  goalData: {
    title: string
    description?: string
    targetDate?: string
    icon?: string
  }
): Promise<DevelopmentGoal | null> {
  const supabase = await createClient()

  const { data: goal, error } = await supabase
    .from('development_goals')
    .insert({
      user_id: userId,
      title: goalData.title,
      description: goalData.description || null,
      target_date: goalData.targetDate || null,
      icon: goalData.icon || null,
      status: 'active',
      progress: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    return null
  }

  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetDate: goal.target_date,
    progress: goal.progress || 0,
    status: goal.status as DevelopmentGoal['status'],
    aiInsight: goal.ai_insight,
    trend: (goal.trend_data as number[]) || [],
    icon: goal.icon,
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  }
}

/**
 * Update a development goal
 */
export async function updateGoal(
  goalId: string,
  userId: string,
  updates: {
    title?: string
    description?: string
    targetDate?: string
    progress?: number
    status?: 'active' | 'completed' | 'cancelled'
  }
): Promise<boolean> {
  const supabase = await createClient()

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate
  if (updates.progress !== undefined) updateData.progress = updates.progress
  if (updates.status !== undefined) updateData.status = updates.status

  const { error } = await supabase
    .from('development_goals')
    .update(updateData)
    .eq('id', goalId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating goal:', error)
    return false
  }

  return true
}

/**
 * Delete a development goal
 */
export async function deleteGoal(goalId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('development_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting goal:', error)
    return false
  }

  return true
}

/**
 * Generate AI goal from text input
 */
export async function generateAIGoal(
  userId: string,
  goalText: string
): Promise<DevelopmentGoal | null> {
  // For now, create a simple goal from text
  // In production, this would call an AI service to generate SMART goals
  const title = goalText.trim()
  
  return createGoal(userId, {
    title,
    description: `AI-generated goal: ${title}`,
    icon: 'flag',
  })
}

/**
 * Get recommended training path for a goal
 */
export async function getRecommendedTrainingPath(
  goalId: string,
  userId: string
): Promise<TrainingModule[]> {
  const supabase = await createClient()

  // Get goal details
  const { data: goal } = await supabase
    .from('development_goals')
    .select('title, description')
    .eq('id', goalId)
    .eq('user_id', userId)
    .single()

  if (!goal) {
    return []
  }

  // Find related scenarios based on goal title/description
  const searchTerms = `${goal.title} ${goal.description || ''}`.toLowerCase()
  
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('id, title, description, duration_minutes, difficulty')
    .eq('is_active', true)
    .or(`title.ilike.%${goal.title}%,description.ilike.%${goal.title}%`)
    .limit(3)

  const modules: TrainingModule[] = (scenarios || []).map((scenario) => ({
    id: scenario.id,
    type: 'scenario' as const,
    title: scenario.title,
    description: scenario.description || '',
    duration: scenario.duration_minutes ? `${scenario.duration_minutes} min` : undefined,
    difficulty: scenario.difficulty || undefined,
    isHighImpact: true,
    scenarioId: scenario.id,
  }))

  // Add micro-learning and drill modules
  modules.push(
    {
      id: 'micro-1',
      type: 'micro-learning',
      title: 'The Art of Active Listening',
      description: 'A quick interactive module on the 3 levels of listening.',
      duration: '5 min',
      difficulty: 'Intermediate',
    },
    {
      id: 'drill-1',
      type: 'drill',
      title: 'Complaint Handling Drill',
      description: 'Rapid-fire responses to common customer complaints.',
      duration: '10 min',
      difficulty: 'All Levels',
    }
  )

  return modules
}


