import { createClient } from '@/lib/supabase/server'

export interface ScenarioReview {
  id: string
  scenarioId: string
  userId: string
  userName?: string
  userAvatar?: string
  rating: number
  reviewText: string | null
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Create or update a review
 */
export async function createOrUpdateReview(
  userId: string,
  scenarioId: string,
  rating: number,
  reviewText?: string
): Promise<ScenarioReview | null> {
  const supabase = await createClient()

  // Check if review exists
  const { data: existingReview } = await supabase
    .from('scenario_reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .single()

  if (existingReview) {
    // Update existing review
    const { data: review, error } = await supabase
      .from('scenario_reviews')
      .update({
        rating,
        review_text: reviewText || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingReview.id)
      .select('*')
      .single()

    if (error || !review) {
      console.error('Error updating review:', error)
      return null
    }

    return transformReview(review)
  } else {
    // Create new review
    const { data: review, error } = await supabase
      .from('scenario_reviews')
      .insert({
        user_id: userId,
        scenario_id: scenarioId,
        rating,
        review_text: reviewText || null,
      })
      .select('*')
      .single()

    if (error || !review) {
      console.error('Error creating review:', error)
      return null
    }

    return transformReview(review)
  }
}

/**
 * Get reviews for a scenario
 */
export async function getScenarioReviews(
  scenarioId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ reviews: ScenarioReview[]; total: number }> {
  const supabase = await createClient()

  const { data: reviews, error, count } = await supabase
    .from('scenario_reviews')
    .select('*, profiles(full_name, avatar_url)', { count: 'exact' })
    .eq('scenario_id', scenarioId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching reviews:', error)
    return { reviews: [], total: 0 }
  }

  const transformedReviews: ScenarioReview[] =
    reviews?.map((review) => {
      const profile = review.profiles as { full_name?: string; avatar_url?: string } | null
      return transformReview(review, profile)
    }) || []

  return {
    reviews: transformedReviews,
    total: count || 0,
  }
}

/**
 * Get user's review for a scenario
 */
export async function getUserReview(
  userId: string,
  scenarioId: string
): Promise<ScenarioReview | null> {
  const supabase = await createClient()

  const { data: review, error } = await supabase
    .from('scenario_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .single()

  if (error || !review) {
    return null
  }

  return transformReview(review)
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('scenario_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting review:', error)
    return false
  }

  return true
}

/**
 * Transform database review to ScenarioReview
 */
function transformReview(
  review: any,
  profile?: { full_name?: string; avatar_url?: string } | null
): ScenarioReview {
  return {
    id: review.id,
    scenarioId: review.scenario_id,
    userId: review.user_id,
    userName: profile?.full_name || undefined,
    userAvatar: profile?.avatar_url || undefined,
    rating: review.rating,
    reviewText: review.review_text,
    helpfulCount: review.helpful_count || 0,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
  }
}


