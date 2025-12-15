import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AnalyticsClient } from './AnalyticsClient'

export default async function AnalyticsPage() {
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
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased overflow-hidden">
      <div className="flex h-screen">
        <Sidebar activeItem="analytics" />
        <AnalyticsClient userName={userName} userRole={userRole} userAvatar={userAvatar} />
      </div>
    </div>
  )
}

