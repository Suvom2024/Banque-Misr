import { getUserDisplayName } from '@/lib/utils/profile'
import { SessionReviewClient } from './SessionReviewClient'

export default async function SessionReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = await params

  return <SessionReviewClient userName={userName} sessionId={sessionId} />
}

