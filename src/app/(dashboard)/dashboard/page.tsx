import dynamic from 'next/dynamic'
import { getUserDisplayName } from '@/lib/utils/profile'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

// Dynamic imports for better code splitting and initial load performance
const OverallPerformance = dynamic(() => import('@/components/dashboard/OverallPerformance').then(mod => ({ default: mod.OverallPerformance })), {
  loading: () => <div className="xl:col-span-7 bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-48 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const RecommendedFocus = dynamic(() => import('@/components/dashboard/RecommendedFocus').then(mod => ({ default: mod.RecommendedFocus })), {
  loading: () => <div className="xl:col-span-5 bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse"><div className="h-48 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

const TrainingScenarios = dynamic(() => import('@/components/dashboard/TrainingScenarios').then(mod => ({ default: mod.TrainingScenarios })), {
  loading: () => <div className="animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: true,
})

export default async function DashboardPage() {
  const userName = await getUserDisplayName()

  return (
    <>
      <DashboardHeader userName={userName} />
      <div className="px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-screen-2xl mx-auto space-y-10 pb-10">
          {/* Performance Section */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <OverallPerformance />
            <RecommendedFocus />
          </section>

          {/* Training Scenarios Section */}
          <TrainingScenarios />
        </div>
      </div>
    </>
  )
}

