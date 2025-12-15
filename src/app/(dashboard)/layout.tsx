import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

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
      <div className="flex h-full w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-bm-light-grey pattern-bg relative">
          {/* Optimized: Reduced blur intensity from blur-3xl to blur-2xl */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bm-maroon/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <main className="flex-grow overflow-y-auto scroll-optimized w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

