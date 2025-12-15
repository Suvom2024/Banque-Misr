import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/utils/profile'
import dynamic from 'next/dynamic'
import { Sidebar } from '@/components/dashboard/Sidebar'
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased h-screen overflow-hidden flex flex-col">
      <div className="flex h-full w-full">
        <Sidebar activeItem="dashboard" />
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-bm-light-grey pattern-bg relative">
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bm-maroon/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <DashboardHeader userName={userName} />

          <main className="flex-grow overflow-y-auto px-8 py-8 w-full">
            <div className="max-w-screen-2xl mx-auto space-y-10 pb-10">
              {/* Performance Section */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <OverallPerformance />
                <RecommendedFocus />
              </section>

              {/* Training Scenarios Section */}
              <TrainingScenarios />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

