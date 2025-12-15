import { getUserDisplayName } from '@/lib/utils/profile'
import { PerformanceSnapshotClient } from './PerformanceSnapshotClient'

export default async function PerformanceSnapshotPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = params

  return <PerformanceSnapshotClient userName={userName} sessionId={sessionId} />
}

