import { AuthBackground } from '@/components/auth/AuthBackground'
import { AuthFooter } from '@/components/auth/AuthFooter'

/**
 * Shared layout for all auth screens (login, signup, forgot-password)
 * Prevents full page re-renders when navigating between auth pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans h-screen w-screen overflow-hidden flex items-center justify-center bg-slate-900 relative">
      <AuthBackground />
      <main className="relative z-10 w-full max-w-[440px] mx-4 animate-fade-in-up py-2">
        {children}
        <AuthFooter />
      </main>
    </div>
  )
}

