import { getUserDisplayName } from '@/lib/utils/profile'
import { LiveSessionClient } from './LiveSessionClient'

export default async function LiveSessionPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = params

  return <LiveSessionClient userName={userName} sessionId={sessionId} />
}



