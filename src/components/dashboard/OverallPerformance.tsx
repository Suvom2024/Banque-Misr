'use client'

import { memo, useMemo } from 'react'

interface OverallPerformanceProps {
  performanceScore?: number
  performanceRating?: string
  timeTrained?: string
  timeTrainedChange?: string
  keyStrength?: string
  aiMessage?: string
  aiMessageDetail?: string
}

function OverallPerformanceComponent({
  performanceScore = 87,
  performanceRating = 'EXCELLENT',
  timeTrained = '8.2 hrs',
  timeTrainedChange = '+1.5%',
  keyStrength = 'Clarity',
  aiMessage = '"You are on track for Q2 objectives!"',
  aiMessageDetail = 'Your empathy score in recent simulations has improved by 12%. Keep focusing on active listening techniques.',
}: OverallPerformanceProps) {
  // Calculate stroke-dashoffset for circular progress
  const circumference = 2 * Math.PI * 42 // radius = 42
  const offset = circumference - (performanceScore / 100) * circumference
  const innerOffset = circumference * 0.7 - ((performanceScore - 10) / 100) * circumference * 0.7

  // Memoize expensive string operations
  const formattedMessageDetail = useMemo<{ before: string; after: string } | null>(() => {
    if (!aiMessageDetail.includes('12%')) return null
    const parts = aiMessageDetail.split('12%')
    return { before: parts[0], after: parts[1] || '' }
  }, [aiMessageDetail])

  return (
    <div className="xl:col-span-7 bg-white rounded-2xl shadow-card border border-white p-0 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-6 z-10">
        <button className="text-bm-text-subtle hover:text-bm-maroon transition-colors text-sm font-medium flex items-center gap-1">
          View Full Report <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
      <div className="p-8 h-full flex flex-col relative z-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-bm-text-primary tracking-tight leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-maroon">monitoring</span>
            Overall Performance
          </h2>
          <p className="text-bm-text-secondary text-sm mt-1">AI-driven analysis of your simulation metrics.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 flex-grow">
          {/* Circular Progress Indicator */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-[12px] border-bm-light-grey"></div>
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
                className="text-bm-maroon transition-all duration-1000 ease-out"
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
              <span className="text-4xl font-extrabold text-bm-text-primary">
                {performanceScore}
                <span className="text-xl">%</span>
              </span>
              <span className="text-xs font-bold text-bm-text-subtle uppercase tracking-wider mt-1">{performanceRating}</span>
            </div>
          </div>

          {/* Right Side Content */}
          <div className="flex-grow space-y-6 w-full">
            {/* AI Message Box */}
            <div className="bg-gradient-to-r from-bm-light-grey to-white p-4 rounded-xl border-l-4 border-bm-gold shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-bm-gold-dark mt-0.5">auto_awesome</span>
                <div>
                  <p className="text-sm font-medium text-bm-text-primary italic">{aiMessage}</p>
                  <p className="text-xs text-bm-text-secondary mt-1 leading-relaxed">
                    {formattedMessageDetail ? (
                      <>
                        {formattedMessageDetail.before}
                        <span className="font-bold text-green-600">12%</span>
                        {formattedMessageDetail.after}
                      </>
                    ) : (
                      aiMessageDetail
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Time Trained */}
              <div className="bg-bm-light-grey/50 p-3 rounded-xl border border-bm-grey hover:border-bm-maroon/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-bm-maroon">
                    <span className="material-symbols-outlined text-xl">timer</span>
                  </div>
                  <div>
                    <p className="text-xs text-bm-text-subtle font-semibold uppercase">Time Trained</p>
                    <p className="text-lg font-bold text-bm-text-primary">
                      {timeTrained}{' '}
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full ml-1">
                        {timeTrainedChange}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Strength */}
              <div className="bg-bm-light-grey/50 p-3 rounded-xl border border-bm-grey hover:border-bm-maroon/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-bm-gold-dark">
                    <span className="material-symbols-outlined text-xl">psychology</span>
                  </div>
                  <div>
                    <p className="text-xs text-bm-text-subtle font-semibold uppercase">Key Strength</p>
                    <p className="text-lg font-bold text-bm-text-primary">{keyStrength}</p>
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

