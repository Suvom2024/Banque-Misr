'use client'

import { memo } from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import type { TrendDataPoint } from '@/types/dashboard'

interface LineChartProps {
  data: TrendDataPoint[]
  height?: number
  showArea?: boolean
}

function LineChartComponent({ data, height = 250, showArea = true }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-bm-text-subtle">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl mb-2">show_chart</span>
          <p className="text-sm">No trend data available</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFC72C" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#7A1A25" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECF0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#4B5563', fontSize: 11 }}
            stroke="#E9ECF0"
            axisLine={false}
            height={30}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#4B5563', fontSize: 11 }}
            stroke="#E9ECF0"
            tickFormatter={(value) => `${value}%`}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E9ECF0',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: number) => [`${value}%`, 'Score']}
            labelFormatter={(label) => formatDate(label)}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#7A1A25"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#475569', fontSize: 11 }}
          stroke="#E2E8F0"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#475569', fontSize: 11 }}
          stroke="#E2E8F0"
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${value}%`, 'Score']}
          labelFormatter={(label) => formatDate(label)}
        />
        <Line type="monotone" dataKey="score" stroke="#7A1A25" strokeWidth={2} dot={{ fill: '#7A1A25', r: 4 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export const LineChart = memo(LineChartComponent)

