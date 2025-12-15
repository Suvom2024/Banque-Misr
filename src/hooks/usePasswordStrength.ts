import { useMemo } from 'react'

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

export function usePasswordStrength(password: string): {
  strength: PasswordStrength
  score: number
  label: string
  color: string
} {
  return useMemo(() => {
    if (!password) {
      return { strength: 'weak', score: 0, label: '', color: 'bg-slate-200' }
    }

    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    if (checks.length) score += 1
    if (checks.lowercase) score += 1
    if (checks.uppercase) score += 1
    if (checks.number) score += 1
    if (checks.special) score += 1

    let strength: PasswordStrength = 'weak'
    let label = 'Weak'
    let color = 'bg-red-500'

    if (score <= 2) {
      strength = 'weak'
      label = 'Weak'
      color = 'bg-red-500'
    } else if (score === 3) {
      strength = 'medium'
      label = 'Medium'
      color = 'bg-yellow-500'
    } else if (score === 4) {
      strength = 'strong'
      label = 'Strong'
      color = 'bg-green-500'
    } else {
      strength = 'very-strong'
      label = 'Very Strong'
      color = 'bg-green-600'
    }

    return { strength, score, label, color }
  }, [password])
}






