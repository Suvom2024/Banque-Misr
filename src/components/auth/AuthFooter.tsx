'use client'

import { memo } from 'react'

/**
 * Memoized footer component for auth screens
 * Prevents re-renders when parent components update
 */
export const AuthFooter = memo(function AuthFooter() {
  return (
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
  )
})

