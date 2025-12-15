import { getUserDisplayName } from '@/lib/utils/profile'
import { DevelopmentGoalsClient } from './DevelopmentGoalsClient'

export default async function DevelopmentGoalsPage() {
  const userName = await getUserDisplayName()
  return <DevelopmentGoalsClient userName={userName} />
}

