import { createClient } from '@/lib/supabase/server'

/**
 * Bookmark a scenario
 */
export async function bookmarkScenario(
  userId: string,
  scenarioId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.from('user_scenario_bookmarks').insert({
    user_id: userId,
    scenario_id: scenarioId,
  })

  if (error) {
    // Ignore duplicate key errors (already bookmarked)
    if (error.code !== '23505') {
      console.error('Error bookmarking scenario:', error)
      return false
    }
  }

  return true
}

/**
 * Remove bookmark from a scenario
 */
export async function unbookmarkScenario(
  userId: string,
  scenarioId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_scenario_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)

  if (error) {
    console.error('Error unbookmarking scenario:', error)
    return false
  }

  return true
}

/**
 * Check if scenario is bookmarked
 */
export async function isScenarioBookmarked(
  userId: string,
  scenarioId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_scenario_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

/**
 * Get user's bookmarked scenarios
 */
export async function getUserBookmarks(
  userId: string,
  limit: number = 20
): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_scenario_bookmarks')
    .select('scenario_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }

  return data?.map((b) => b.scenario_id) || []
}


