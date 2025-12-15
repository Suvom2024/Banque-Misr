import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  full_name: string | null
  created_at: string
  updated_at: string
}

/**
 * Fetches the user's profile from the database
 * @returns User profile with full_name, or null if not found
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return null
  }

  return profile as UserProfile
}

/**
 * Gets the display name for a user
 * Falls back to email if full_name is not available
 * Optimized to avoid duplicate database calls
 */
export async function getUserDisplayName(): Promise<string> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 'User'
  }

  // Fetch profile in the same call to avoid duplicate getUser() calls
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (!error && profile?.full_name) {
    return profile.full_name
  }

  // Fallback to email if no full_name
  return user.email?.split('@')[0] || 'User'
}

