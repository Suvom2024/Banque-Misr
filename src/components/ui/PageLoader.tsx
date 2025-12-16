'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Reset loading state when pathname changes
    setLoading(true)
    setProgress(0)

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        // Increment progress with easing (slower as it approaches 90%)
        const increment = (90 - prev) * 0.1
        return Math.min(prev + increment, 90)
      })
    }, 50)

    // Complete loading after a short delay to allow page to render
    const completeTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }, 300)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimer)
    }
  }, [pathname])

  if (!loading && progress === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-bm-gold"
        style={{
          width: `${progress}%`,
          transition: 'width 0.2s ease-out',
        }}
      />
    </div>
  )
}

