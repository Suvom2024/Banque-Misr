import { getUserDisplayName } from '@/lib/utils/profile'
import { TrainingLibraryClient } from './TrainingLibraryClient'

export default async function TrainingHubPage() {
  const userName = await getUserDisplayName()
  return <TrainingLibraryClient userName={userName} />
}

