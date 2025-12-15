import { getUserDisplayName } from '@/lib/utils/profile'
import { SessionReportClient } from './SessionReportClient'

export default async function SessionReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = await params

  return <SessionReportClient userName={userName} sessionId={sessionId} />
}

