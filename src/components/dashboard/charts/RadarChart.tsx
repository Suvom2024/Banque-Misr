'use client'

import { memo } from 'react'
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Competency } from '@/types/dashboard'

interface RadarChartProps {
  data: Competency[]
  size?: number
}

function RadarChartComponent({ data, size = 300 }: RadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-bm-text-subtle">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
          <p className="text-sm">No competency data available</p>
        </div>
      </div>
    )
  }

  const chartData = data.map((c) => ({
    competency: c.name,
    score: c.score,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RechartsRadarChart data={chartData}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis
          dataKey="competency"
          tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
          tickLine={false}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#7A1A25"
          fill="#7A1A25"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value}%`, 'Score']}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}

export const RadarChart = memo(RadarChartComponent)

