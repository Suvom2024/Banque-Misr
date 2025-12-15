import React, { memo, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  error?: string
  iconSize?: 'lg' | 'xl'
  padding?: 'sm' | 'md'
}

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, iconSize = 'xl', padding = 'md', ...props }, ref) => {
    const iconClass = useMemo(() => iconSize === 'lg' ? 'text-lg' : 'text-xl', [iconSize])
    const paddingClass = useMemo(() => padding === 'sm' ? 'py-2.5' : 'py-3', [padding])
    
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className={cn('material-symbols-outlined text-slate-400 input-icon transition-colors', iconClass)}>
              {icon}
            </span>
          </div>
        )}
        <input
          className={cn(
            'w-full pl-11 pr-4 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm text-sm font-medium',
            paddingClass,
            error ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 focus:border-bm-maroon focus:ring-1 focus:ring-bm-maroon/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
InputComponent.displayName = 'Input'

export const Input = memo(InputComponent)

