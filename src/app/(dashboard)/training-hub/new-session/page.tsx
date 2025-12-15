import { getUserDisplayName } from '@/lib/utils/profile'
import { ScenarioSelectionClient } from './ScenarioSelectionClient'

export default async function NewSessionPage() {
  const userName = await getUserDisplayName()
  return <ScenarioSelectionClient userName={userName} />
}


