import dynamic from 'next/dynamic'
import { getUserDisplayName } from '@/lib/utils/profile'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

// Dynamic import for client component
const DashboardClient = dynamic(() => import('./DashboardClient').then(mod => ({ default: mod.DashboardClient })), {
  loading: () => (
    <div className="px-6 lg:px-8 py-6 lg:py-8">
      <div className="max-w-screen-2xl mx-auto space-y-10 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-bm-grey animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-7 bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <div className="xl:col-span-5 bg-white rounded-2xl shadow-card border border-white p-8 animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
})

export default async function DashboardPage() {
  const userName = await getUserDisplayName()

  return (
    <>
      <DashboardHeader userName={userName} />
      <DashboardClient />
    </>
  )
}

