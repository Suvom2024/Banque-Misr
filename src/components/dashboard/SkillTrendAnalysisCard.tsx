'use client'

import { useState } from 'react'

interface SkillTrend {
  skill: string
  trend: number[]
  change: number
  color: string
}

interface SkillTrendAnalysisCardProps {
  skills: SkillTrend[]
  timePeriod?: string
  onTimePeriodChange?: (period: string) => void
}

export function SkillTrendAnalysisCard({
  skills,
  timePeriod = 'Last 5 Sessions',
  onTimePeriodChange,
}: SkillTrendAnalysisCardProps) {
  const generateSparklinePath = (trend: number[]) => {
    const maxValue = Math.max(...trend)
    const minValue = Math.min(...trend)
    const range = maxValue - minValue || 1
    const width = 100
    const height = 50
    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * width
      const y = height - ((value - minValue) / range) * height
      return `${x},${y}`
    })
    return `M ${points.join(' L ')}`
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return 'trending_up'
    if (change < 0) return 'trending_down'
    return 'remove'
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-feedback-positive'
    if (change < 0) return 'text-feedback-negative'
    return 'text-feedback-neutral'
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-bm-grey/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-bm-text-primary text-lg">Skill Trend Analysis</h3>
          <p className="text-xs text-bm-text-secondary mt-1">Performance over last 5 sessions</p>
        </div>
        <select
          className="text-xs border-bm-grey rounded-lg text-bm-text-secondary focus:ring-bm-gold focus:border-bm-gold bg-white px-3 py-1.5"
          value={timePeriod}
          onChange={(e) => onTimePeriodChange?.(e.target.value)}
        >
          <option>Last 5 Sessions</option>
          <option>Last 10 Sessions</option>
          <option>Last Month</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {skills.map((skill) => {
          const pathData = generateSparklinePath(skill.trend)
          return (
            <div key={skill.skill} className="relative">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-bm-text-secondary">{skill.skill}</span>
                <div className={`flex items-center gap-1 ${getChangeColor(skill.change)}`}>
                  <span className="material-symbols-outlined text-sm">{getChangeIcon(skill.change)}</span>
                  <span className="text-sm font-bold">
                    {skill.change > 0 ? '+' : ''}
                    {skill.change}%
                  </span>
                </div>
              </div>
              <div className="h-24 w-full bg-bm-light-grey/30 rounded-lg border border-bm-grey/30 relative overflow-hidden p-2">
                <svg className="w-full h-full overflow-visible sparkline" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d={pathData} fill="none" stroke={skill.color} strokeLinecap="round" strokeWidth="2"></path>
                  {skill.trend.map((value, index) => {
                    const maxValue = Math.max(...skill.trend)
                    const minValue = Math.min(...skill.trend)
                    const range = maxValue - minValue || 1
                    const x = (index / (skill.trend.length - 1)) * 100
                    const y = 50 - ((value - minValue) / range) * 50
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        fill={skill.color}
                        r={index === skill.trend.length - 1 ? 3 : 2}
                      ></circle>
                    )
                  })}
                </svg>
                <div
                  className={`absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-${skill.color}/5 to-transparent pointer-events-none`}
                  style={{
                    background: `linear-gradient(to top, ${skill.color}08, transparent)`,
                  }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

