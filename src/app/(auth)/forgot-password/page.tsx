'use client'

import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/utils/validations'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { AuthCard } from '@/components/auth/AuthCard'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = useCallback(async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message || 'Failed to send reset link')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }, [supabase])

  return (
    <>
        <div className="flex flex-col items-center justify-center gap-3 mb-6">
          <Logo />
          <p className="text-bm-gold font-bold tracking-[0.2em] text-[8px] md:text-[9px] uppercase opacity-90">
            AI Voice Training Platform
          </p>
        </div>

        <AuthCard
          title="Forgot Password?"
          subtitle="Don't worry, it happens to the best of us. Enter your email below to recover your password."
        >
          {success ? (
            <div className="space-y-4 md:space-y-5">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                Password reset link has been sent to your email. Please check your inbox.
              </div>
              <Link href="/login">
                <Button icon="arrow_back">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm">
                  {error}
                </div>
              )}

              <div className="input-group">
                <label
                  className="block text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 md:mb-2 transition-colors"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  icon="alternate_email"
                  placeholder="name@banquemisr.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <Button type="submit" isLoading={isLoading} icon="send">
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-5 md:mt-6 text-center border-t border-slate-100 pt-4">
            <p className="text-xs md:text-sm text-slate-500">
              Remember your password?{' '}
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

