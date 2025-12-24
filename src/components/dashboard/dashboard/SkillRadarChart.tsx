'use client'

import { memo } from 'react'
import type { Competency } from '@/types/dashboard'

interface SkillRadarChartProps {
  competencies: Competency[]
  isLoading?: boolean
}

function SkillRadarChartComponent({ competencies, isLoading }: SkillRadarChartProps) {
  if (isLoading) {
    return (
      <div className="lg:col-span-4 bg-white rounded-2xl shadow-card border border-white p-6 relative flex flex-col h-full animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-bm-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-maroon">analytics</span>
            Competency Profile
          </h3>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    )
  }

  const topCompetency = competencies.length > 0 
    ? competencies.reduce((max, comp) => comp.score > max.score ? comp : max, competencies[0])
    : null

  const getTrendIcon = (trend?: string) => {
    if (trend === 'improving') return 'trending_up'
    if (trend === 'declining') return 'trending_down'
    return 'remove'
  }

  const getTrendColor = (trend?: string) => {
    if (trend === 'improving') return 'text-green-600'
    if (trend === 'declining') return 'text-red-500'
    return 'text-bm-text-subtle'
  }

  return (
    <div className="lg:col-span-4 bg-white rounded-2xl shadow-card border border-white p-6 relative flex flex-col h-full transition-all hover:shadow-card-hover group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-bm-text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-bm-maroon">analytics</span>
          Competency Profile
        </h3>
        <button className="text-bm-text-subtle hover:text-bm-maroon transition-colors p-1 rounded-full hover:bg-bm-light-grey">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      <div className="flex-1 space-y-6">
        {competencies.slice(0, 4).map((comp) => (
          <div key={comp.name} className="space-y-2 group/bar">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-bm-text-primary">{comp.name}</span>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-bm-maroon">{comp.score}%</span>
                {comp.trend && (
                  <span className={`text-[10px] ${getTrendColor(comp.trend)} flex items-center gap-0.5 font-semibold`}>
                    <span className="material-symbols-outlined text-[10px]">{getTrendIcon(comp.trend)}</span>
                    {comp.trend === 'improving' && '+'}
                    {comp.trend === 'declining' && '-'}
                    {Math.abs(comp.scoreChange || 0)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2.5 w-full bg-bm-grey rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-bm-gold to-bm-maroon rounded-full shadow-sm group-hover/bar:brightness-110 transition-all"
                style={{ width: `${comp.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {topCompetency && (
        <div className="mt-6 pt-6 border-t border-bm-grey">
          <div className="p-4 bg-bm-light-grey/50 rounded-xl flex gap-3 items-start border border-bm-grey/50">
            <span className="material-symbols-outlined text-bm-gold-dark text-xl mt-0.5 animate-pulse-slow">auto_awesome</span>
            <div>
              <p className="text-xs font-bold text-bm-text-secondary uppercase mb-1">AI Insight</p>
              <p className="text-sm text-bm-text-primary leading-relaxed font-medium">
                "Consistently strong in <span className="text-bm-maroon font-bold">{topCompetency.name}</span>. Focus on <span className="text-bm-text-primary font-bold underline decoration-bm-gold decoration-2 underline-offset-2">Objection Handling</span> scenarios to balance your profile."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const SkillRadarChart = memo(SkillRadarChartComponent)

