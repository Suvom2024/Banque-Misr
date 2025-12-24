import { createClient } from '@/lib/supabase/server'

export interface LearningPath {
  id: string
  title: string
  description: string | null
  category: string | null
  icon: string | null
  status: 'not_started' | 'in_progress' | 'completed' | 'locked'
  progress: number
  completedModules: number
  totalModules: number
}

export interface LearningPathModule {
  id: string
  scenarioId: string
  scenarioTitle: string
  moduleOrder: number
  isRequired: boolean
  status: 'not_started' | 'in_progress' | 'completed'
  score?: number
}

/**
 * Get user's learning paths with progress
 */
export async function getUserLearningPaths(userId: string): Promise<LearningPath[]> {
  const supabase = await createClient()

  // Get all active learning paths
  const { data: paths, error: pathsError } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (pathsError || !paths) {
    return []
  }

  // Get user progress for all paths
  const pathIds = paths.map((p) => p.id)
  const { data: progress } = await supabase
    .from('user_learning_path_progress')
    .select('*')
    .eq('user_id', userId)
    .in('learning_path_id', pathIds)

  const progressMap = new Map(
    progress?.map((p) => [p.learning_path_id, p]) || []
  )

  // Transform to LearningPath format
  const learningPaths: LearningPath[] = paths.map((path) => {
    const userProgress = progressMap.get(path.id)

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      category: path.category,
      icon: path.icon,
      status: (userProgress?.status as LearningPath['status']) || 'not_started',
      progress: userProgress?.progress_percent || 0,
      completedModules: userProgress?.completed_modules || 0,
      totalModules: userProgress?.total_modules || 0,
    }
  })

  return learningPaths
}

/**
 * Get learning path modules with user progress
 */
export async function getLearningPathModules(
  userId: string,
  learningPathId: string
): Promise<LearningPathModule[]> {
  const supabase = await createClient()

  // Get modules for this learning path
  const { data: modules, error } = await supabase
    .from('learning_path_modules')
    .select('*, scenarios(id, title)')
    .eq('learning_path_id', learningPathId)
    .order('module_order', { ascending: true })

  if (error || !modules) {
    return []
  }

  // Get user progress for scenarios in this path
  const scenarioIds = modules.map((m) => m.scenario_id)
  const { data: progress } = await supabase
    .from('user_scenario_progress')
    .select('scenario_id, status, best_score')
    .eq('user_id', userId)
    .in('scenario_id', scenarioIds)

  const progressMap = new Map(
    progress?.map((p) => [p.scenario_id, p]) || []
  )

  // Transform to LearningPathModule format
  const learningPathModules: LearningPathModule[] = modules.map((module) => {
    const scenario = module.scenarios as { id: string; title: string }
    const userProgress = progressMap.get(module.scenario_id)

    return {
      id: module.id,
      scenarioId: module.scenario_id,
      scenarioTitle: scenario?.title || 'Unknown Scenario',
      moduleOrder: module.module_order,
      isRequired: module.is_required,
      status: (userProgress?.status as LearningPathModule['status']) || 'not_started',
      score: userProgress?.best_score || undefined,
    }
  })

  return learningPathModules
}

/**
 * Update learning path progress (called when user completes a module)
 */
export async function updateLearningPathProgress(
  userId: string,
  learningPathId: string
): Promise<void> {
  const supabase = await createClient()

  // Get all modules in this path
  const { data: modules } = await supabase
    .from('learning_path_modules')
    .select('scenario_id')
    .eq('learning_path_id', learningPathId)

  if (!modules || modules.length === 0) {
    return
  }

  const scenarioIds = modules.map((m) => m.scenario_id)

  // Count completed modules
  const { data: progress } = await supabase
    .from('user_scenario_progress')
    .select('scenario_id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('scenario_id', scenarioIds)

  const completedModules = progress?.length || 0
  const totalModules = modules.length
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  // Update or insert progress
  await supabase
    .from('user_learning_path_progress')
    .upsert({
      user_id: userId,
      learning_path_id: learningPathId,
      progress_percent: progressPercent,
      completed_modules: completedModules,
      total_modules: totalModules,
      status: progressPercent === 100 ? 'completed' : completedModules > 0 ? 'in_progress' : 'not_started',
      started_at: progressPercent > 0 ? new Date().toISOString() : null,
      completed_at: progressPercent === 100 ? new Date().toISOString() : null,
    })
}


