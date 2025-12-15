import { getUserDisplayName } from '@/lib/utils/profile'
import { LiveSessionWithAssessmentClient } from './LiveSessionWithAssessmentClient'

export default async function LiveSessionWithAssessmentPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const userName = await getUserDisplayName()
  const { sessionId } = params

  return <LiveSessionWithAssessmentClient userName={userName} sessionId={sessionId} />
}



