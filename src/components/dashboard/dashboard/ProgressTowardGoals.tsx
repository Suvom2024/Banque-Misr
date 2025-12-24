'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import type { DevelopmentGoal } from '@/types/dashboard'

interface ProgressTowardGoalsProps {
  goals: DevelopmentGoal[]
  isLoading?: boolean
}

function ProgressTowardGoalsComponent({ goals, isLoading }: ProgressTowardGoalsProps) {
  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active').slice(0, 3), [goals])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getDaysUntil = (dateStr: string): number => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-white p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-bm-text-primary tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-maroon text-base">flag</span>
            Active Development Goals
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeGoals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-bm-text-primary tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-maroon text-base">flag</span>
            Active Development Goals
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="material-symbols-outlined text-4xl text-bm-text-subtle mb-2">flag</span>
          <p className="text-sm text-bm-text-secondary mb-2">No active goals</p>
          <Link
            href="/development-goals"
            className="text-xs font-medium text-bm-maroon hover:text-bm-maroon-light transition-colors"
          >
            Create a goal →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-bm-text-primary tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-bm-maroon text-base">flag</span>
          Active Development Goals
        </h2>
        <Link
          href="/development-goals"
          className="text-xs font-medium text-bm-maroon hover:text-bm-maroon-light transition-colors"
        >
          View All →
        </Link>
      </div>
      <div className="space-y-4">
        {activeGoals.map((goal) => {
          const daysUntil = getDaysUntil(goal.targetDate)
          const isOverdue = daysUntil < 0

          return (
            <div key={goal.id} className="p-3 rounded-xl bg-bm-light-grey/50 border border-bm-grey/60">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  {goal.icon && (
                    <span className="material-symbols-outlined text-bm-gold text-lg mt-0.5">{goal.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-bm-text-primary mb-0.5">{goal.title}</h4>
                    <p className="text-xs text-bm-text-secondary line-clamp-1">{goal.description}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isOverdue
                      ? 'bg-red-100 text-red-700'
                      : daysUntil <= 7
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {isOverdue ? 'Overdue' : `${daysUntil}d left`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-bm-maroon to-bm-maroon-light transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-bold text-bm-text-primary">{goal.progress}%</span>
              </div>
              <p className="text-[10px] text-bm-text-subtle mt-2">Target: {formatDate(goal.targetDate)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const ProgressTowardGoals = memo(ProgressTowardGoalsComponent)

