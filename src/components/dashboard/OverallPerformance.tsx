'use client'

import { memo, useMemo } from 'react'
import type { UserPerformance } from '@/types/dashboard'

interface OverallPerformanceProps {
  performance?: UserPerformance | null
  isLoading?: boolean
  onRefresh?: () => void
}

function OverallPerformanceComponent({
  performance,
  isLoading = false,
  onRefresh,
}: OverallPerformanceProps) {
  const performanceScore = performance?.performanceScore ?? 0
  const performanceRating = performance?.performanceRating ?? 'FAIR'
  const timeTrained = performance?.timeTrained ?? '0 hrs'
  const timeTrainedChange = performance?.timeTrainedChange ?? '0%'
  const keyStrength = performance?.keyStrength ?? 'N/A'
  const aiMessage = performance?.aiMessage ?? ''
  const aiMessageDetail = performance?.aiMessageDetail ?? ''
  // Calculate stroke-dashoffset for circular progress
  const circumference = 2 * Math.PI * 42 // radius = 42
  const offset = circumference - (performanceScore / 100) * circumference
  const innerOffset = circumference * 0.7 - ((performanceScore - 10) / 100) * circumference * 0.7

  // Memoize expensive string operations
  const formattedMessageDetail = useMemo<{ before: string; after: string } | null>(() => {
    if (!aiMessageDetail) return null
    // Try to find percentage patterns
    const percentMatch = aiMessageDetail.match(/(\d+(?:\.\d+)?%)/g)
    if (!percentMatch || percentMatch.length === 0) return null
    const percent = percentMatch[0]
    const parts = aiMessageDetail.split(percent)
    return { before: parts[0], after: parts[1] || '' }
  }, [aiMessageDetail])

  if (isLoading) {
    return (
      <div className="xl:col-span-7 bg-white rounded-2xl shadow-card border border-white p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="xl:col-span-7 bg-white rounded-2xl shadow-card border border-white p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="material-symbols-outlined text-4xl text-bm-text-subtle mb-2">bar_chart</span>
          <p className="text-sm text-bm-text-secondary">No performance data available</p>
          <p className="text-xs text-bm-text-subtle mt-1">Complete a training session to see your performance</p>
        </div>
      </div>
    )
  }

  return (
    <div className="xl:col-span-7 bg-white rounded-2xl shadow-card border border-white p-0 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-bm-text-subtle text-xs font-medium flex items-center gap-1 hover:text-bm-maroon transition-colors"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        )}
        <button className="text-bm-text-subtle text-xs font-medium flex items-center gap-1 hover:text-bm-maroon transition-colors">
          View Full Report <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
      <div className="p-6 h-full flex flex-col relative z-0">
        <div className="mb-4">
          <h2 className="text-base font-bold text-bm-text-primary tracking-tight leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-maroon text-base">monitoring</span>
            Overall Performance
          </h2>
          <p className="text-bm-text-secondary text-xs mt-0.5">AI-driven analysis of your simulation metrics.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 flex-grow">
          {/* Circular Progress Indicator */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[10px] border-bm-light-grey"></div>
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                className="text-bm-grey/20"
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
              ></circle>
              {/* Main progress circle */}
              <circle
                className="text-bm-maroon"
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                strokeWidth="8"
              ></circle>
              {/* Inner gold circle */}
              <circle
                className="text-bm-gold opacity-80"
                cx="50"
                cy="50"
                fill="none"
                r="34"
                stroke="currentColor"
                strokeDasharray={circumference * 0.7}
                strokeDashoffset={innerOffset}
                strokeLinecap="round"
                strokeWidth="4"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-bm-text-primary">
                {performanceScore}
                <span className="text-lg">%</span>
              </span>
              <span className="text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider mt-0.5">{performanceRating}</span>
            </div>
          </div>

          {/* Right Side Content */}
          <div className="flex-grow space-y-4 w-full">
            {/* AI Message Box */}
            <div className="bg-gradient-to-r from-bm-light-grey to-white p-3 rounded-xl border-l-4 border-bm-gold shadow-sm">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-bm-gold-dark mt-0.5 text-base">auto_awesome</span>
                <div>
                  <p className="text-xs font-medium text-bm-text-primary italic">{aiMessage}</p>
                  <p className="text-[10px] text-bm-text-secondary mt-0.5 leading-relaxed">
                    {formattedMessageDetail ? (
                      <>
                        {formattedMessageDetail.before}
                        <span className="font-bold text-green-600">
                          {aiMessageDetail.match(/(\d+(?:\.\d+)?%)/g)?.[0] || ''}
                        </span>
                        {formattedMessageDetail.after}
                      </>
                    ) : (
                      aiMessageDetail || 'Keep practicing to improve your skills!'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Time Trained */}
              <div className="bg-bm-light-grey/50 p-2.5 rounded-xl border border-bm-grey">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm text-bm-maroon">
                    <span className="material-symbols-outlined text-base">timer</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-bm-text-subtle font-semibold uppercase">Time Trained</p>
                    <p className="text-sm font-bold text-bm-text-primary">
                      {timeTrained}{' '}
                      <span className="text-[10px] font-medium text-green-600 bg-green-100 px-1 py-0.5 rounded-full ml-1">
                        {timeTrainedChange}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Strength */}
              <div className="bg-bm-light-grey/50 p-2.5 rounded-xl border border-bm-grey">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm text-bm-gold-dark">
                    <span className="material-symbols-outlined text-base">psychology</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-bm-text-subtle font-semibold uppercase">Key Strength</p>
                    <p className="text-sm font-bold text-bm-text-primary">{keyStrength}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const OverallPerformance = memo(OverallPerformanceComponent)

