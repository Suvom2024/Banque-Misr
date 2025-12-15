import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserDisplayName } from '@/lib/utils/profile'
import { OnboardingFlow } from './OnboardingFlow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = await getUserDisplayName()

  return <OnboardingFlow userName={userName} />
}
