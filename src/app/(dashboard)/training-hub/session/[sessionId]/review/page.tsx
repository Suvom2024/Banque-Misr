import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SessionReviewClient } from './SessionReviewClient'

export default async function SessionReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()
  const { sessionId } = await params

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased h-screen overflow-hidden flex flex-col selection:bg-bm-gold selection:text-bm-maroon-dark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeItem="training-hub" />
        <SessionReviewClient userName={userName} sessionId={sessionId} />
      </div>
    </div>
  )
}

