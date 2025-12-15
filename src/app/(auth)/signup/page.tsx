'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupFormData } from '@/lib/utils/validations'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { AuthCard } from '@/components/auth/AuthCard'
import Link from 'next/link'
import { useWatch } from 'react-hook-form'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms: false,
    },
  })

  const password = useWatch({ control, name: 'password' })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="font-sans min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 relative py-4 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-bm-maroon-dark via-[#4a0e16] to-slate-900 z-0">
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

      <main className="relative z-10 w-full max-w-[480px] mx-4 animate-fade-in-up py-2">
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <Image
            src="/logo.png"
            alt="Banque Misr"
            width={140}
            height={47}
            className="h-12 md:h-14 w-auto object-contain"
            priority
            unoptimized
          />
          <p className="text-bm-gold font-bold tracking-[0.2em] text-[8px] md:text-[9px] uppercase opacity-90">
            AI Voice Training Platform
          </p>
        </div>

        <AuthCard title="Create Account" subtitle="Begin your simulation journey today.">
          <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="input-group">
              <label
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 transition-colors"
                htmlFor="fullname"
              >
                Full Name
              </label>
              <Input
                id="fullname"
                type="text"
                icon="badge"
                iconSize="lg"
                padding="sm"
                placeholder="e.g. Ahmed Hassan"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
            </div>

            <div className="input-group">
              <label
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 transition-colors"
                htmlFor="email"
              >
                Work Email
              </label>
              <Input
                id="email"
                type="email"
                icon="mail"
                iconSize="lg"
                padding="sm"
                placeholder="employee@banquemisr.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div className="input-group">
              <label
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 transition-colors"
                htmlFor="password"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                iconName="lock"
                iconSize="lg"
                padding="sm"
                placeholder="Create a strong password"
                {...register('password')}
                error={errors.password?.message}
              />
              {password && <PasswordStrength password={password} />}
            </div>

            <div className="input-group">
              <label
                className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 transition-colors"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <PasswordInput
                id="confirm-password"
                iconName="lock_reset"
                iconSize="lg"
                padding="sm"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  className="w-4 h-4 border-slate-300 rounded text-bm-maroon focus:ring-bm-maroon/20 custom-checkbox transition-all cursor-pointer"
                  id="terms"
                  type="checkbox"
                  {...register('terms')}
                />
              </div>
              <div className="text-xs">
                <label className="font-medium text-slate-600 cursor-pointer" htmlFor="terms">
                  I agree to the{' '}
                  <a href="#" className="text-bm-maroon font-bold hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-bm-maroon font-bold hover:underline">
                    Privacy Policy
                  </a>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs text-red-500">{errors.terms.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon font-bold py-2.5 md:py-3 rounded-xl shadow-lg shadow-bm-gold/20 hover:shadow-bm-gold/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm"
            >
              <span className="relative z-10">{isLoading ? 'Loading...' : 'Create Account'}</span>
              {!isLoading && (
                <span className="material-symbols-outlined relative z-10 text-base md:text-lg transition-transform duration-300 group-hover/btn:translate-x-1">rocket_launch</span>
              )}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
            </button>
          </form>

          <div className="mt-5 text-center border-t border-slate-100 pt-4">
            <p className="text-xs md:text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-bm-maroon hover:text-bm-maroon-light hover:underline transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>
        </AuthCard>

        <div className="mt-6 text-center text-white/30 text-[9px] font-medium tracking-wide">
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

