import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/utils/profile'
import { IntegrationsClient } from './IntegrationsClient'

export default async function IntegrationsPage() {
  // Layout already handles auth, so we can safely fetch user data
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile once and derive both userName and userRole from it
  const userProfile = await getUserProfile()
  const userName = userProfile?.full_name || user?.email?.split('@')[0] || 'User'
  const userRole = userProfile?.full_name?.includes('Manager') ? 'Branch Manager' : 'Employee'
  const userAvatar = user?.user_metadata?.avatar_url

  return <IntegrationsClient userName={userName} userRole={userRole} userAvatar={userAvatar} />
}

