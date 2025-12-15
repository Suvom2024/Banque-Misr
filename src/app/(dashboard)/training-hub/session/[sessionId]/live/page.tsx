import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDisplayName } from '@/lib/utils/profile'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { LiveSessionClient } from './LiveSessionClient'

export default async function LiveSessionPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()
  const { sessionId } = params

  return (
    <div className="font-display bg-bm-light-grey text-bm-text-primary antialiased overflow-hidden h-screen flex">
      <div className="flex h-screen">
        <Sidebar activeItem="training-hub" />
        <LiveSessionClient userName={userName} sessionId={sessionId} />
      </div>
    </div>
  )
}



