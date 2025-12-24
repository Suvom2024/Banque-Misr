'use client'

import { memo } from 'react'
import type { QuickStats } from '@/types/dashboard'

interface QuickStatsBarProps {
  stats: QuickStats
  isLoading?: boolean
}

interface StatItem {
  label: string
  value: string | number
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  iconBg: string
  iconColor: string
}

function QuickStatsBarComponent({ stats, isLoading }: QuickStatsBarProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-bm-grey-dark/20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-bm-grey-dark/20 overflow-hidden animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5">
            <div className="h-12 bg-gray-200 rounded-xl mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  const statItems: StatItem[] = [
    {
      label: 'Sessions',
      value: stats.sessionsThisWeek,
      icon: 'play_circle',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trendValue: stats.sessionsThisWeek > 0 ? 'this week' : undefined,
    },
    {
      label: 'Avg Score',
      value: `${stats.avgScore}%`,
      icon: 'star',
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      trend: stats.scoreChange && stats.scoreChange > 0 ? 'up' : stats.scoreChange && stats.scoreChange < 0 ? 'down' : 'neutral',
      trendValue: stats.scoreChange ? `${stats.scoreChange > 0 ? '+' : ''}${stats.scoreChange.toFixed(1)}%` : undefined,
    },
    {
      label: 'Streak',
      value: stats.streak,
      icon: 'local_fire_department',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trendValue: 'days',
    },
    {
      label: 'Time',
      value: stats.timeThisWeek,
      icon: 'timer',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Rank',
      value: stats.rank ? `#${stats.rank}` : 'N/A',
      icon: 'emoji_events',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: stats.rankChange && stats.rankChange > 0 ? 'up' : undefined,
      trendValue: stats.rankChange && stats.rankChange > 0 ? `+${stats.rankChange}` : undefined,
    },
    {
      label: 'XP Earned',
      value: stats.xpEarned,
      icon: 'workspace_premium',
      iconBg: 'bg-bm-maroon/5',
      iconColor: 'text-bm-maroon',
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-card border border-bm-grey-dark/20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-bm-grey-dark/20 overflow-hidden">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="p-5 flex items-center gap-4 group hover:bg-bm-light-grey/30 transition-colors"
        >
          <div className={`${item.iconBg} ${item.iconColor} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-bm-text-secondary font-bold uppercase tracking-wider">
              {item.label}
            </p>
            <div className="flex items-baseline gap-1 flex-wrap">
              <p className="text-2xl font-bold text-bm-text-primary leading-none mt-0.5">
                {typeof item.value === 'number' ? item.value : item.value}
              </p>
              {item.trendValue && (
                <span className="text-xs font-medium text-bm-text-subtle lowercase align-top ml-0.5">
                  {item.trend === 'up' || item.trend === 'down' ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
                      item.trend === 'up'
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}>
                      {item.trendValue}
                    </span>
                  ) : (
                    item.trendValue
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const QuickStatsBar = memo(QuickStatsBarComponent)

