import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ScenarioStudioClient } from './ScenarioStudioClient'

export default async function ScenarioStudioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased overflow-hidden h-screen flex">
      <div className="flex h-screen">
        <Sidebar activeItem="agent-mesh" />
        <ScenarioStudioClient userName={userName} />
      </div>
    </div>
  )
}

