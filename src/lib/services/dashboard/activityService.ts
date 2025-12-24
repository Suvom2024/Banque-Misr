import { createClient } from '@/lib/supabase/server'
import type { Activity } from '@/types/dashboard'

/**
 * Get recent activity feed for user
 */
export async function getRecentActivity(userId: string, limit: number = 10): Promise<Activity[]> {
  const supabase = await createClient()

  const { data: activities, error } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !activities) {
    return []
  }

  return activities.map((a) => {
    const metadata = (a.metadata_jsonb as Record<string, unknown>) || {}
    return {
      id: a.id,
      type: a.activity_type as Activity['type'],
      activityType: a.activity_type,
      title: a.title,
      description: a.description || undefined,
      icon: a.icon,
      timestamp: a.created_at,
      relatedSessionId: a.related_session_id || undefined,
      relatedGoalId: a.related_goal_id || undefined,
      relatedAchievementId: a.related_achievement_id || undefined,
      score: metadata.score ? Number(metadata.score) : undefined,
      metadata: metadata,
    }
  })
}

/**
 * Create activity feed entry
 */
export async function createActivityEntry(
  userId: string,
  activityType: Activity['type'],
  title: string,
  options: {
    description?: string
    icon?: string
    relatedSessionId?: string
    relatedGoalId?: string
    relatedAchievementId?: string
    metadata?: Record<string, unknown>
  } = {}
): Promise<void> {
  const supabase = await createClient()

  const icon = options.icon || getDefaultIcon(activityType)

  const { error } = await supabase.from('activity_feed').insert({
    user_id: userId,
    activity_type: activityType,
    title,
    description: options.description || null,
    icon,
    related_session_id: options.relatedSessionId || null,
    related_goal_id: options.relatedGoalId || null,
    related_achievement_id: options.relatedAchievementId || null,
    metadata_jsonb: options.metadata || {},
  })

  if (error) {
    console.error('Error creating activity entry:', error)
  }
}

/**
 * Get default icon for activity type
 */
function getDefaultIcon(activityType: Activity['type']): string {
  const iconMap: Record<Activity['type'], string> = {
    session_completed: 'check_circle',
    session_started: 'play_circle',
    achievement_earned: 'emoji_events',
    goal_created: 'flag',
    goal_completed: 'check_circle',
    assessment_completed: 'quiz',
    milestone_reached: 'celebration',
  }
  return iconMap[activityType] || 'circle'
}

