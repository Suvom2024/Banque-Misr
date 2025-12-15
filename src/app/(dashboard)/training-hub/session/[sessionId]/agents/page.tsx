import { getUserDisplayName } from '@/lib/utils/profile'
import { MultiAgenticReportClient } from './MultiAgenticReportClient'

export default async function MultiAgenticReportPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = params

  return <MultiAgenticReportClient userName={userName} sessionId={sessionId} />
}

