'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface CompetencyBreakdownCardProps {
  data?: {
    skills: string[]
    proficient: number[]
    developing: number[]
    needsImprovement: number[]
  }
  topMover?: string
  needsFocus?: string
}

const defaultData = {
  skills: ['Empathy', 'Clarity', 'Pacing', 'Object. Handling'],
  proficient: [65, 50, 30, 80],
  developing: [25, 30, 45, 15],
  needsImprovement: [10, 20, 25, 5],
}

export function CompetencyBreakdownCard({
  data = defaultData,
  topMover = 'Empathy',
  needsFocus = 'Pacing',
}: CompetencyBreakdownCardProps) {
  const chartOptions = useMemo(() => ({
    series: [
      {
        name: 'Proficient',
        data: data.proficient,
      },
      {
        name: 'Developing',
        data: data.developing,
      },
      {
        name: 'Needs Improvement',
        data: data.needsImprovement,
      },
    ],
    chart: {
      type: 'bar' as const,
      height: 300,
      stacked: true,
      stackType: '100%' as const,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '40%',
        borderRadius: 4,
      },
    },
    colors: ['#7A1A25', '#FFC72C', '#E2E8F0'],
    stroke: {
      width: 0,
    },
    xaxis: {
      categories: data.skills,
      labels: {
        formatter: function (val: number) {
          return val + '%'
        },
        style: { colors: '#64748B', fontFamily: 'Manrope', fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#0F172A', fontFamily: 'Manrope', fontWeight: 600, fontSize: '13px' },
      },
    },
    fill: { opacity: 1 },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      fontFamily: 'Manrope',
      itemMargin: { horizontal: 10, vertical: 0 },
      markers: { size: 12 },
    },
    grid: {
      borderColor: '#F1F5F9',
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 10, bottom: 0, left: 0 },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + '%'
        },
      },
    },
  }), [data])

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-bm-grey/60 card-transition h-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-bm-text-primary tracking-tight leading-tight">Competency Breakdown</h2>
        <button className="p-1 text-bm-text-secondary hover:text-bm-maroon rounded transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
      <p className="text-sm text-bm-text-secondary mb-6">Proficiency distribution across key skills.</p>

      {/* Chart */}
      <div className="-ml-2">
        <Chart options={chartOptions} series={chartOptions.series} type="bar" height={300} />
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-bm-grey/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-green-50 text-green-600">
            <span className="material-symbols-outlined text-sm font-bold">trending_up</span>
          </div>
          <div>
            <p className="text-xs text-bm-text-secondary">Top Mover</p>
            <p className="text-sm font-bold text-bm-text-primary">{topMover}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-red-50 text-red-600">
            <span className="material-symbols-outlined text-sm font-bold">trending_down</span>
          </div>
          <div>
            <p className="text-xs text-bm-text-secondary">Needs Focus</p>
            <p className="text-sm font-bold text-bm-text-primary">{needsFocus}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

