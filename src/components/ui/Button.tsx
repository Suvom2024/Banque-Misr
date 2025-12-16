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
          'w-full font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 relative overflow-hidden',
          variant === 'primary' &&
            'bg-bm-gold text-bm-maroon shadow-bm-gold/20',
          variant === 'secondary' &&
            'border border-slate-200 rounded-xl bg-white',
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
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
              <span className="material-symbols-outlined relative z-10">
                {icon}
              </span>
            )}
          </>
        )}
      </button>
    )
  }
)
ButtonComponent.displayName = 'Button'

export const Button = memo(ButtonComponent)






