'use client'

import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Recommendation } from '@/types/dashboard'

interface RecommendedFocusProps {
  recommendation?: Recommendation | null
  isLoading?: boolean
  onRefresh?: () => void
  onDismiss?: (id: string) => Promise<void>
}

function RecommendedFocusComponent({
  recommendation,
  isLoading = false,
  onRefresh,
  onDismiss,
}: RecommendedFocusProps) {
  const router = useRouter()
  const [isDismissing, setIsDismissing] = useState(false)

  const handleDismiss = async () => {
    if (!recommendation || !onDismiss) return
    setIsDismissing(true)
    try {
      await onDismiss(recommendation.id)
    } catch (error) {
      console.error('Error dismissing recommendation:', error)
    } finally {
      setIsDismissing(false)
    }
  }

  const handleStartTraining = () => {
    if (recommendation?.relatedScenarioId) {
      router.push(`/training-hub/new-session?scenario=${recommendation.relatedScenarioId}`)
    } else {
      router.push('/training-hub/new-session')
    }
  }

  if (isLoading) {
    return (
      <div className="xl:col-span-5 bg-gradient-to-br from-bm-maroon to-bm-maroon-dark rounded-2xl shadow-card text-white p-6 animate-pulse">
        <div className="h-48 bg-white/10 rounded"></div>
      </div>
    )
  }

  if (!recommendation) {
    return (
      <div className="xl:col-span-5 bg-gradient-to-br from-bm-maroon to-bm-maroon-dark rounded-2xl shadow-card text-white p-6 relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h2 className="text-base font-bold tracking-tight leading-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-bm-gold text-base">assistant</span>
              Recommended Focus
            </h2>
            <p className="text-white/70 text-xs mt-0.5">AI-curated based on your recent gaps.</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
          <span className="material-symbols-outlined text-4xl text-white/50 mb-2">lightbulb</span>
          <p className="text-white/80 text-sm">No recommendations at this time</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 text-xs font-medium text-bm-gold hover:text-white transition-colors"
            >
              Refresh recommendations
            </button>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="xl:col-span-5 bg-gradient-to-br from-bm-maroon to-bm-maroon-dark rounded-2xl shadow-card text-white p-6 relative overflow-hidden flex flex-col">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
        <svg className="w-64 h-64" viewBox="0 0 100 100">
          <circle cx="100" cy="0" fill="none" r="80" stroke="white" strokeWidth="20"></circle>
          <circle cx="100" cy="0" fill="none" r="50" stroke="white" strokeWidth="10"></circle>
        </svg>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h2 className="text-base font-bold tracking-tight leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-gold text-base">assistant</span>
            Recommended Focus
          </h2>
          <p className="text-white/70 text-xs mt-0.5">AI-curated based on your recent gaps.</p>
        </div>
        <div className="flex gap-1.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-white/10 text-white rounded-full p-1.5 hover:bg-white/20 transition-colors"
              title="Refresh recommendations"
            >
          <span className="material-symbols-outlined text-base">refresh</span>
        </button>
          )}
          {onDismiss && (
            <button
              onClick={handleDismiss}
              disabled={isDismissing}
              className="bg-white/10 text-white rounded-full p-1.5 hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Dismiss recommendation"
            >
              <span className="material-symbols-outlined text-base">{isDismissing ? 'hourglass_empty' : 'close'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="flex-grow flex flex-col justify-center relative z-10">
        <div
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 cursor-pointer mb-3 hover:bg-white/15 transition-colors"
          onClick={handleStartTraining}
        >
          <div className="flex items-start gap-3">
            <div className="bg-bm-gold text-bm-maroon p-2.5 rounded-lg shadow-lg">
              <span className="material-symbols-outlined text-lg">{recommendation.icon}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white mb-1">
                {recommendation.title}
              </h4>
              <p className="text-white/80 text-xs leading-relaxed mb-2">{recommendation.description}</p>
              <div className="flex items-center gap-1.5">
                {recommendation.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-[9px] font-bold bg-black/20 px-1.5 py-0.5 rounded text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="material-symbols-outlined text-white/50 text-base">
              chevron_right
            </span>
          </div>
        </div>
      </div>

      {/* Footer with Indicators and Link */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex -space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-bm-gold"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 ml-2"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/30 ml-2"></div>
        </div>
        <button
          onClick={handleStartTraining}
          className="text-[10px] font-bold text-bm-gold flex items-center gap-1 uppercase tracking-wide hover:text-white transition-colors"
        >
          Start Training <span className="material-symbols-outlined text-xs">arrow_right_alt</span>
        </button>
      </div>
    </div>
  )
}

export const RecommendedFocus = memo(RecommendedFocusComponent)



