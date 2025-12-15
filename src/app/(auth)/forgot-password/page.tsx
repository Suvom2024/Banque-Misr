'use client'

import { useState } from 'react'
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
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
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

