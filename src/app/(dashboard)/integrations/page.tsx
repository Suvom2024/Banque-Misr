import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { IntegrationsClient } from './IntegrationsClient'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile once and derive both userName and userRole from it
  const userProfile = await getUserProfile()
  const userName = userProfile?.full_name || user.email?.split('@')[0] || 'User'
  const userRole = userProfile?.full_name?.includes('Manager') ? 'Branch Manager' : 'Employee'
  const userAvatar = user?.user_metadata?.avatar_url

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased h-screen overflow-hidden">
      <div className="flex h-full">
        <Sidebar activeItem="integrations" />
        <IntegrationsClient userName={userName} userRole={userRole} userAvatar={userAvatar} />
      </div>
    </div>
  )
}

