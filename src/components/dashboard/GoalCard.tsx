'use client'

import { memo } from 'react'

interface GoalCardProps {
  id: string
  title: string
  targetDate: string
  description: string
  progress: number
  aiInsight: string
  trend: number[]
  icon?: string
  onEdit?: (id: string) => void
  onViewProgress?: (id: string) => void
}

function GoalCardComponent({
  id,
  title,
  targetDate,
  description,
  progress,
  aiInsight,
  trend,
  icon = 'flag',
  onEdit,
  onViewProgress,
}: GoalCardProps) {
  const progressColor = progress >= 70 ? 'bg-bm-gold' : 'bg-bm-maroon'
  const trendColor = trend[trend.length - 1] > trend[0] ? '#10B981' : '#F59E0B'

  // Generate sparkline path
  const maxValue = Math.max(...trend)
  const minValue = Math.min(...trend)
  const range = maxValue - minValue || 1
  const width = 50
  const height = 20
  const points = trend.map((value, index) => {
    const x = (index / (trend.length - 1)) * width
    const y = height - ((value - minValue) / range) * height
    return `${x},${y}`
  })
  const pathData = `M ${points.join(' L ')}`

  return (
    <div className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-6 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-bm-light-grey to-transparent rounded-bl-full -mr-4 -mt-4"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bm-maroon/10 flex items-center justify-center text-bm-maroon">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-bm-text-primary text-lg leading-tight">{title}</h3>
            <p className="text-xs text-bm-text-secondary">Target: {targetDate}</p>
          </div>
        </div>
        <button
          onClick={() => onEdit?.(id)}
          className="text-bm-text-subtle"
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      <p className="text-sm text-bm-text-secondary mb-5 line-clamp-2">{description}</p>
      <div className="mb-5">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-bm-text-primary">{progress}% Achieved</span>
          <span className="text-xs text-bm-text-subtle">{100 - progress}% Remaining</span>
        </div>
        <div className="h-2.5 w-full bg-bm-light-grey rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} w-[${progress}%] rounded-full shadow-[0_0_10px_rgba(255,199,44,0.4)] relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
          </div>
        </div>
      </div>
      <div className="bg-bm-light-grey/50 rounded-xl p-3 border border-bm-grey/50 mb-4">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-bm-gold-dark text-sm mt-0.5">auto_awesome</span>
          <p className="text-xs text-bm-text-secondary leading-relaxed">
            <span className="font-bold text-bm-maroon">AI Insight:</span> {aiInsight}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-bm-grey/40">
        <div className="flex flex-col">
          <span className="text-[10px] text-bm-text-subtle font-bold uppercase">Trend</span>
          <div className="h-8 w-20">
            <svg className="w-full h-full overflow-visible sparkline" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
              <path d={pathData} fill="none" stroke={trendColor} strokeLinecap="round" strokeWidth="2"></path>
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(id)}
            className="px-3 py-2 rounded-lg text-xs font-bold text-bm-text-secondary"
          >
            Edit
          </button>
          <button
            onClick={() => onViewProgress?.(id)}
            className="px-4 py-2 rounded-lg bg-bm-maroon text-white text-xs font-bold shadow-sm"
          >
            View Progress
          </button>
        </div>
      </div>
    </div>
  )
}

export const GoalCard = memo(GoalCardComponent)

