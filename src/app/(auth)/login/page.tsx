'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/utils/validations'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { AuthCard } from '@/components/auth/AuthCard'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    // REMOVED: Blocking fetch calls that were causing performance issues
    // These debug/agent logging calls were blocking user interactions
    // If you need logging, use a proper async queue or background job system

    setIsLoading(true)
    setError(null)

    try {
      // Fail fast if env is missing/misconfigured (otherwise Supabase calls can appear to hang).
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        return
      }

      const signInPromise = supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      const { error: signInError } = await promiseWithTimeout(signInPromise, 15000)

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
        return
      }

      // Verify we actually have a client session after sign-in.
      await supabase.auth.getSession()

      router.replace('/onboarding')
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'SUPABASE_SIGNIN_TIMEOUT'
          ? 'Login is taking too long. Please check your internet connection and that the Supabase project URL is reachable.'
          : 'An unexpected error occurred. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

function promiseWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('SUPABASE_SIGNIN_TIMEOUT')), timeoutMs)
    promise
      .then((result) => {
        clearTimeout(timeout)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}

  return (
    <div className="font-sans h-screen w-screen overflow-hidden flex items-center justify-center bg-slate-900 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bm-maroon-dark via-[#4a0e16] to-slate-900 z-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-bm-maroon mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-bm-gold mix-blend-overlay filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-bm-maroon-light mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute bottom-0 left-0 right-0 h-3/4 opacity-20 pointer-events-none overflow-hidden">
          <svg
            className="absolute bottom-0 w-[200%] h-full animate-wave"
            preserveAspectRatio="none"
            viewBox="0 0 1440 320"
          >
            <path
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill="#FFC72C"
              fillOpacity="0.2"
            ></path>
          </svg>
          <svg
            className="absolute bottom-0 w-[200%] h-full animate-wave"
            preserveAspectRatio="none"
            style={{ animationDuration: '35s', animationDirection: 'reverse' }}
            viewBox="0 0 1440 320"
          >
            <path
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,133.3C960,160,1056,192,1152,186.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill="#ffffff"
              fillOpacity="0.05"
            ></path>
          </svg>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-[440px] mx-4 animate-fade-in-up py-2">
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <Logo />
          <p className="text-bm-gold font-bold tracking-[0.2em] text-[8px] md:text-[9px] uppercase opacity-90">
            AI Voice Training Platform
          </p>
        </div>

        <AuthCard title="Welcome Back" subtitle="Sign in to access the agentic simulation mesh.">
          <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="input-group">
              <label
                className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 transition-colors"
                htmlFor="email"
              >
                Email or Username
              </label>
              <Input
                id="email"
                type="email"
                icon="mail"
                iconSize="xl"
                padding="md"
                placeholder="employee@banquemisr.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider transition-colors"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-bm-maroon hover:text-bm-maroon-light transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                iconName="lock_open"
                iconSize="xl"
                padding="md"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-bold py-2.5 md:py-3 rounded-xl shadow-lg shadow-bm-gold/20 hover:shadow-bm-gold/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm"
            >
              <span className="relative z-10">{isLoading ? 'Loading...' : 'Log In to Platform'}</span>
              {!isLoading && (
                <span className="material-symbols-outlined relative z-10 text-base transition-transform duration-300 group-hover/btn:translate-x-1">arrow_forward</span>
              )}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
            </button>
          </form>

          <div className="relative mt-5 md:mt-6 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group/sso bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#f25022" height="9" width="9" x="1" y="1"></rect>
                <rect fill="#7fba00" height="9" width="9" x="11" y="1"></rect>
                <rect fill="#00a4ef" height="9" width="9" x="1" y="11"></rect>
                <rect fill="#ffb900" height="9" width="9" x="11" y="11"></rect>
              </svg>
              <span className="text-xs font-bold text-slate-600 group-hover/sso:text-slate-800">Microsoft</span>
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group/sso bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg text-slate-500 group-hover/sso:text-slate-800">domain</span>
              <span className="text-xs font-bold text-slate-600 group-hover/sso:text-slate-800">Enterprise ID</span>
            </button>
          </div>

          <div className="mt-5 md:mt-6 text-center border-t border-slate-100 pt-4">
            <p className="text-xs md:text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-bm-maroon hover:text-bm-maroon-light hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </AuthCard>

        <div className="mt-6 md:mt-8 text-center text-white/30 text-[9px] font-medium tracking-wide">
          <p>© 2024 Banque Misr. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3">
            <a href="#" className="hover:text-bm-gold transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-bm-gold transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-bm-gold transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

