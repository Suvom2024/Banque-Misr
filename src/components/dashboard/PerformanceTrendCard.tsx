'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface PerformanceTrendCardProps {
  actualData?: number[]
  targetData?: number[]
  forecastData?: (number | null)[]
  categories?: string[]
}

const defaultActualData = [78, 81, 85, 84, 88, 91, 89]
const defaultTargetData = [80, 80, 80, 80, 80, 80, 80]
const defaultForecastData: (number | null)[] = [null, null, null, null, null, null, 89, 92, 93, 95]
const defaultCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']

export function PerformanceTrendCard({
  actualData = defaultActualData,
  targetData = defaultTargetData,
  forecastData = defaultForecastData,
  categories = defaultCategories,
}: PerformanceTrendCardProps) {
  const chartOptions = useMemo(() => ({
    series: [
      {
        name: 'Actual Score',
        data: actualData,
      },
      {
        name: 'Target',
        data: targetData,
      },
      {
        name: 'Forecast',
        data: forecastData,
      },
    ],
    chart: {
      height: 320,
      type: 'area' as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif',
    },
    colors: ['#7A1A25', '#FFC72C', '#94A3B8'],
    fill: {
      type: ['gradient', 'solid', 'solid'],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 100],
      },
      solid: { opacity: 0.1 },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth' as const,
      width: [3, 2, 2],
      dashArray: [0, 0, 5],
    },
    annotations: {
      points: [
        {
          x: 3, // Apr
          y: 84,
          marker: { size: 0 },
          label: {
            borderColor: '#FFC72C',
            style: { color: '#7A1A25', background: '#FFC72C', fontFamily: 'Manrope', fontWeight: 'bold' },
            text: 'New Curriculum',
          },
        },
        {
          x: 5, // Jun
          y: 91,
          marker: { size: 6, fillColor: '#fff', strokeColor: '#7A1A25', strokeWidth: 2 },
          label: {
            borderColor: '#7A1A25',
            style: { color: '#fff', background: '#7A1A25', fontFamily: 'Manrope' },
            text: 'Coaching Session',
          },
        },
      ],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: '#64748B', fontFamily: 'Manrope', fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 60,
      max: 100,
      labels: {
        formatter: (value: number) => {
          return value.toFixed(0) + '%'
        },
        style: { colors: '#64748B', fontFamily: 'Manrope', fontSize: '12px' },
      },
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 4,
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    legend: { show: false },
    tooltip: {
      theme: 'light',
      x: { show: true },
    },
  }), [actualData, targetData, forecastData, categories])

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-bm-grey/60">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-bm-text-primary tracking-tight leading-tight">Performance Trend</h2>
          <p className="text-sm text-bm-text-secondary mt-0.5 leading-relaxed">Historical data & AI forecast</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bm-maroon"></span>
            Actual
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bm-gold"></span>
            Target
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 border-t-2 border-dashed border-bm-text-subtle"></span>
            Forecast
          </div>
        </div>
      </div>
      <div className="w-full">
        <Chart options={chartOptions} series={chartOptions.series} type="area" height={320} />
      </div>
    </div>
  )
}

