import React, { memo } from 'react'
import { cn } from '@/lib/utils/cn'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

function AuthCardComponent({ children, title, subtitle, className }: AuthCardProps) {
  return (
    <div className={cn('glass-panel rounded-2xl p-5 md:p-6 lg:p-8 relative overflow-hidden group', className)}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bm-maroon via-bm-gold to-bm-maroon"></div>
      <div className="mb-5 md:mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-slate-500 text-xs md:text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export const AuthCard = memo(AuthCardComponent)

