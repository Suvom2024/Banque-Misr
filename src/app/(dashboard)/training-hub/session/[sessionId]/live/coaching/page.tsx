import { getUserDisplayName } from '@/lib/utils/profile'
import { MultiAgenticCoachingClient } from './MultiAgenticCoachingClient'

export default async function MultiAgenticCoachingPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = params

  return <MultiAgenticCoachingClient userName={userName} sessionId={sessionId} />
}



