'use client'

import { usePasswordStrength } from '@/hooks/usePasswordStrength'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { strength, label, color } = usePasswordStrength(password)

  if (!password) return null

  const bars = Array.from({ length: 4 })
  const activeBars = strength === 'weak' ? 1 : strength === 'medium' ? 2 : strength === 'strong' ? 3 : 4

  return (
    <div className="flex items-center gap-1.5 mt-2 px-1">
      {bars.map((_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < activeBars ? color : 'bg-slate-200'
          }`}
        />
      ))}
      <span className="text-[9px] font-bold ml-1 uppercase tracking-wider">
        {strength === 'weak' && <span className="text-red-600">{label}</span>}
        {strength === 'medium' && <span className="text-yellow-600">{label}</span>}
        {strength === 'strong' && <span className="text-green-600">{label}</span>}
        {strength === 'very-strong' && <span className="text-green-700">{label}</span>}
      </span>
    </div>
  )
}







