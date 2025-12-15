import { OnboardingBackground } from '@/components/onboarding/OnboardingBackground'

/**
 * Shared layout for onboarding screens
 * Prevents full page re-renders when navigating between onboarding steps
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans h-screen w-full overflow-hidden flex items-center justify-center bg-slate-900 relative selection:bg-bm-gold selection:text-bm-maroon">
      <OnboardingBackground />
      <div className="relative z-10 w-full h-full flex items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-2">
        {children}
      </div>
    </div>
  )
}

