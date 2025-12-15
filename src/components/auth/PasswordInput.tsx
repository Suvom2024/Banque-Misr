'use client'

import React, { useState, forwardRef, memo, useCallback, useMemo } from 'react'
import { InputProps } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean
  iconName?: string
}

const PasswordInputComponent = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ 
    showStrength, 
    className, 
    iconName = 'lock_open',
    iconSize = 'xl',
    padding = 'md',
    error,
    ...props 
  }, ref) {
    const [showPassword, setShowPassword] = useState(false)
    const iconClass = useMemo(() => iconSize === 'lg' ? 'text-lg' : 'text-xl', [iconSize])
    const paddingClass = useMemo(() => padding === 'sm' ? 'py-2.5' : 'py-3', [padding])
    
    const togglePassword = useCallback(() => {
      setShowPassword(prev => !prev)
    }, [])

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className={cn('material-symbols-outlined text-slate-400 input-icon transition-colors', iconClass)}>
            {iconName}
          </span>
        </div>
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'w-full pl-11 pr-11 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-sm text-sm font-medium',
            paddingClass,
            error ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-200 focus:border-bm-maroon focus:ring-1 focus:ring-bm-maroon/20',
            className
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          onClick={togglePassword}
        >
          <span className={cn('material-symbols-outlined', iconClass)}>
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
PasswordInputComponent.displayName = 'PasswordInput'

export const PasswordInput = memo(PasswordInputComponent)

