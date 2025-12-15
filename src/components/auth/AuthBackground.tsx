'use client'

import { memo } from 'react'

/**
 * Memoized background component for auth screens
 * Prevents re-renders when parent components update
 */
export const AuthBackground = memo(function AuthBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-bm-maroon-dark via-[#4a0e16] to-slate-900 z-0">
      {/* Optimized: Reduced blur intensity from blur-3xl to blur-2xl for better performance */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-bm-maroon mix-blend-screen filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-bm-gold mix-blend-overlay filter blur-[80px] opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-bm-maroon-light mix-blend-screen filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
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
  )
})

