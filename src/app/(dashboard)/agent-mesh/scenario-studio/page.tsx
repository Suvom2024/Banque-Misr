import { getUserDisplayName } from '@/lib/utils/profile'
import { ScenarioStudioClient } from './ScenarioStudioClient'

export default async function ScenarioStudioPage() {
  const userName = await getUserDisplayName()
  return <ScenarioStudioClient userName={userName} />
}

