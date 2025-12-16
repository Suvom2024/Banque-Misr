import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { PageLoader } from '@/components/ui/PageLoader'

/**
 * Shared layout for all dashboard pages
 * Prevents full page re-renders and Sidebar re-mounting when navigating between dashboard pages
 * Note: DashboardHeader is NOT included here - each page renders its own header
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased h-screen overflow-hidden flex flex-col">
      <PageLoader />
      <div className="flex h-full w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-bm-light-grey relative">
          <main className="flex-grow overflow-y-auto scroll-optimized w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

