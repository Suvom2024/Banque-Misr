'use client'

import { memo, useState, useMemo } from 'react'
import { LineChart } from '../charts/LineChart'
import type { TrendDataPoint } from '@/types/dashboard'

interface PerformanceTrendChartProps {
  data: TrendDataPoint[]
  isLoading?: boolean
}

type Period = 'week' | 'month' | 'quarter'

function PerformanceTrendChartComponent({ data, isLoading }: PerformanceTrendChartProps) {
  const [period, setPeriod] = useState<Period>('month')

  const currentScore = useMemo(() => {
    if (!data || data.length === 0) return 0
    return data[data.length - 1].score
  }, [data])

  const calculateTrend = (): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 }

    const firstScore = data[0].score
    const lastScore = data[data.length - 1].score
    const diff = lastScore - firstScore
    const percentage = firstScore > 0 ? (diff / firstScore) * 100 : 0

    if (Math.abs(percentage) < 1) {
      return { direction: 'stable', percentage: 0 }
    }

    return {
      direction: percentage > 0 ? 'up' : 'down',
      percentage: Math.abs(percentage),
    }
  }

  const trend = calculateTrend()

  if (isLoading) {
    return (
      <div className="lg:col-span-4 xl:col-span-5 bg-white rounded-2xl shadow-card border border-white p-6 relative flex flex-col h-full animate-pulse">
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-4 xl:col-span-5 bg-white rounded-2xl shadow-card border border-white p-6 relative flex flex-col h-full transition-all hover:shadow-card-hover group">
      <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-bm-text-primary flex items-center gap-2">Performance Trend</h3>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-extrabold text-bm-maroon tracking-tight">{currentScore.toFixed(1)}%</span>
            {trend.direction !== 'stable' && (
              <div className={`flex items-center text-sm font-bold px-2 py-0.5 rounded-full shadow-sm border ${
                trend.direction === 'up'
                  ? 'text-green-700 bg-green-50 border-green-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}>
                <span className="material-symbols-outlined text-base mr-0.5 font-bold">
                  {trend.direction === 'up' ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {trend.percentage.toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-xs text-bm-text-subtle mt-1 font-medium">
            Compared to previous {period === 'week' ? '7' : period === 'month' ? '30' : '90'} day period
          </p>
        </div>
        <div className="bg-bm-light-grey p-1 rounded-lg flex text-xs font-bold self-start">
          {(['week', 'month', 'quarter'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 transition-all ${
                period === p
                  ? 'bg-white text-bm-maroon shadow-sm rounded-md'
                  : 'text-bm-text-secondary hover:bg-white hover:shadow-sm rounded-md'
              }`}
            >
              {p === 'week' ? '7d' : p === 'month' ? '30d' : '90d'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow w-full relative" style={{ minHeight: '250px' }}>
        <LineChart data={data} height={250} showArea={true} />
      </div>
    </div>
  )
}

export const PerformanceTrendChart = memo(PerformanceTrendChartComponent)

