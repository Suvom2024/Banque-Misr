import React, { memo } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
  icon?: string
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'w-full font-bold py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden',
          variant === 'primary' &&
            'bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon shadow-bm-gold/20 hover:shadow-bm-gold/40',
          variant === 'secondary' &&
            'border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 bg-white',
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed hover:translate-y-0',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="relative z-10">Loading...</span>
          </>
        ) : (
          <>
            <span className="relative z-10">{children}</span>
            {icon && (
              <span className="material-symbols-outlined relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1">
                {icon}
              </span>
            )}
          </>
        )}
        <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0"></div>
      </button>
    )
  }
)
ButtonComponent.displayName = 'Button'

export const Button = memo(ButtonComponent)






