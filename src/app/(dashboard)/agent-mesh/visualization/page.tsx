import { getUserDisplayName } from '@/lib/utils/profile'
import dynamic from 'next/dynamic'

// Dynamically import ReactFlow-heavy component to reduce initial bundle size
const MeshVisualizationClient = dynamic(() => import('./MeshVisualizationClient').then(mod => ({ default: mod.MeshVisualizationClient })), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
        <p className="text-bm-text-primary">Loading Visualization...</p>
      </div>
    </div>
  ),
  ssr: false,
})

export default async function MeshVisualizationPage() {
  const userName = await getUserDisplayName()
  return <MeshVisualizationClient userName={userName} />
}

