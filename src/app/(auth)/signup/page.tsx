'use client'

import { useState, useMemo, useCallback } from 'react'
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

  const onSubmit = useCallback(async (data: SignupFormData) => {
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
  }, [supabase, router])

  return (
    <>
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
    </>
  )
}

