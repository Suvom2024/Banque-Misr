import { getUserDisplayName } from '@/lib/utils/profile'
import dynamic from 'next/dynamic'

// Dynamically import ReactFlow-heavy component to reduce initial bundle size
const AgentMeshOrchestratorClient = dynamic(() => import('./AgentMeshOrchestratorClient').then(mod => ({ default: mod.AgentMeshOrchestratorClient })), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
        <p className="text-bm-text-primary">Loading Agent Mesh...</p>
      </div>
    </div>
  ),
  ssr: false,
})

export default async function AgentMeshOrchestratorPage() {
  const userName = await getUserDisplayName()
  return <AgentMeshOrchestratorClient userName={userName} />
}

