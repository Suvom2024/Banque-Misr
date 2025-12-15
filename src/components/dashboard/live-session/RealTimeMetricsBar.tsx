'use client'

import { useState } from 'react'

interface RealTimeMetricsBarProps {
  sentiment: 'positive' | 'negative' | 'neutral'
  pacing: number
  clarity: number
  quizScore?: number
}

export function RealTimeMetricsBar({ sentiment, pacing, clarity, quizScore }: RealTimeMetricsBarProps) {
  const [isRecapOpen, setIsRecapOpen] = useState(false)

  const getSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return 'sentiment_satisfied'
      case 'negative':
        return 'sentiment_dissatisfied'
      default:
        return 'sentiment_neutral'
    }
  }

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive':
        return 'text-feedback-positive'
      case 'negative':
        return 'text-feedback-negative'
      default:
        return 'text-feedback-neutral'
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-bm-grey z-20 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-bm-text-subtle mb-0.5">Sentiment</span>
          <div className={`flex items-center gap-1.5 ${getSentimentColor()}`}>
            <span className="material-symbols-outlined text-lg">{getSentimentIcon()}</span>
            <span className="text-xs font-bold capitalize">{sentiment}</span>
          </div>
        </div>
        <div className="h-8 w-px bg-bm-grey"></div>
        <div className="flex flex-col w-24">
          <span className="text-[10px] uppercase font-bold text-bm-text-subtle mb-0.5">Pacing</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-full bg-bm-grey rounded-full overflow-hidden">
              <div className="h-full bg-bm-gold rounded-full" style={{ width: `${pacing}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-bm-text-secondary">{pacing}%</span>
          </div>
        </div>
        <div className="h-8 w-px bg-bm-grey"></div>
        <div className="flex flex-col w-24">
          <span className="text-[10px] uppercase font-bold text-bm-text-subtle mb-0.5">Clarity</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-full bg-bm-grey rounded-full overflow-hidden">
              <div className="h-full bg-feedback-positive rounded-full" style={{ width: `${clarity}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-bm-text-secondary">{clarity}%</span>
          </div>
        </div>
        {quizScore !== undefined && (
          <>
            <div className="h-8 w-px bg-bm-grey"></div>
            <div className="flex flex-col w-24">
              <span className="text-[10px] uppercase font-bold text-bm-text-subtle mb-0.5 text-bm-maroon">Quiz Score</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-bm-gold text-lg">stars</span>
                <span className="text-[10px] font-bold text-bm-text-secondary">
                  {quizScore === -1 ? '--' : quizScore} / 100
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <details
        className="group relative"
        open={isRecapOpen}
        onToggle={(e) => setIsRecapOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-bold text-bm-maroon bg-bm-light-grey hover:bg-bm-grey/70 px-3 py-1.5 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-lg">summarize</span>
          Recap
          <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
        </summary>
        <div className="absolute right-0 top-full mt-2 w-80 bg-white p-4 rounded-xl shadow-card-hover border border-bm-grey/80 z-30 animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-bm-text-primary text-sm mb-2 border-b border-bm-grey pb-2">Current Context</h4>
          <p className="text-xs text-bm-text-secondary leading-relaxed mb-2">
            You are discussing Maria's recent performance improvements. You have successfully acknowledged her work on the Alpha project.
          </p>
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-feedback-positive-bg text-feedback-positive rounded-full font-bold">
              Praise given
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-bm-light-grey text-bm-text-subtle rounded-full font-bold">
              Goal setting pending
            </span>
          </div>
        </div>
      </details>
    </div>
  )
}



