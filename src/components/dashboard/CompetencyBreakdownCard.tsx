'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface CompetencyBreakdownCardProps {
  competencies?: Array<{ competency: string; averageScore: number; employeeCount: number }>
  isLoading?: boolean
}

const defaultData = {
  skills: ['Empathy', 'Clarity', 'Pacing', 'Object. Handling'],
  proficient: [65, 50, 30, 80],
  developing: [25, 30, 45, 15],
  needsImprovement: [10, 20, 25, 5],
}

export function CompetencyBreakdownCard({
  competencies,
  isLoading = false,
}: CompetencyBreakdownCardProps) {
  // Transform API data to chart format
  const transformedData = competencies && competencies.length > 0
    ? {
        skills: competencies.map((c) => c.competency),
        proficient: competencies.map((c) => {
          // Estimate distribution based on average score
          if (c.averageScore >= 80) return 70
          if (c.averageScore >= 70) return 50
          return 30
        }),
        developing: competencies.map((c) => {
          if (c.averageScore >= 80) return 25
          if (c.averageScore >= 70) return 40
          return 50
        }),
        needsImprovement: competencies.map((c) => {
          if (c.averageScore >= 80) return 5
          if (c.averageScore >= 70) return 10
          return 20
        }),
      }
    : defaultData

  const topMover = competencies && competencies.length > 0
    ? competencies.sort((a, b) => b.averageScore - a.averageScore)[0]?.competency
    : 'Empathy'
  const needsFocus = competencies && competencies.length > 0
    ? competencies.sort((a, b) => a.averageScore - b.averageScore)[0]?.competency
    : 'Pacing'

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-5 border border-bm-grey/60 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }
  const chartOptions = useMemo(() => ({
    series: [
      {
        name: 'Proficient',
        data: transformedData.proficient,
      },
      {
        name: 'Developing',
        data: transformedData.developing,
      },
      {
        name: 'Needs Improvement',
        data: transformedData.needsImprovement,
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
      categories: transformedData.skills,
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
  }), [transformedData])

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 border border-bm-grey/60 h-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-bm-text-primary tracking-tight leading-tight">Competency Breakdown</h2>
        <button className="p-1 text-bm-text-secondary rounded">
          <span className="material-symbols-outlined text-base">more_horiz</span>
        </button>
      </div>
      <p className="text-xs text-bm-text-secondary mb-4">Proficiency distribution across key skills.</p>

      {/* Chart */}
      <div className="-ml-2">
        <Chart options={chartOptions} series={chartOptions.series} type="bar" height={260} />
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-bm-grey/50">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-green-50 text-green-600">
            <span className="material-symbols-outlined text-xs font-bold">trending_up</span>
          </div>
          <div>
            <p className="text-[10px] text-bm-text-secondary">Top Mover</p>
            <p className="text-xs font-bold text-bm-text-primary">{topMover}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-red-50 text-red-600">
            <span className="material-symbols-outlined text-xs font-bold">trending_down</span>
          </div>
          <div>
            <p className="text-[10px] text-bm-text-secondary">Needs Focus</p>
            <p className="text-xs font-bold text-bm-text-primary">{needsFocus}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

