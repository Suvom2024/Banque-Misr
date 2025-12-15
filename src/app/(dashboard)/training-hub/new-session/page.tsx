import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ScenarioSelectionClient } from './ScenarioSelectionClient'

export default async function NewSessionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased selection:bg-bm-gold selection:text-bm-maroon-dark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeItem="training-hub" />
        <ScenarioSelectionClient userName={userName} />
      </div>
    </div>
  )
}


