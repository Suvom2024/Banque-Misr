import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AgentMeshOrchestratorClient } from './AgentMeshOrchestratorClient'

export default async function AgentMeshOrchestratorPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased h-screen flex overflow-hidden">
      <Sidebar activeItem="agent-mesh" />
      <AgentMeshOrchestratorClient userName={userName} />
    </div>
  )
}

