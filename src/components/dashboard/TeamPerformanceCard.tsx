'use client'

import { useMemo, memo } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TeamPerformanceCardProps {
  overallScore?: number
  trend?: string
  simulationsCount?: number
  aiSummary?: string
  isLoading?: boolean
}

export function TeamPerformanceCard({
  overallScore = 87,
  trend = '+5% vs Target',
  simulationsCount = 124,
  aiSummary = "Excellent progress. The team has shown a significant uptick in Empathy scores following last week's new curriculum. However, Objection Handling remains a bottleneck in high-pressure scenarios.",
  isLoading = false,
}: TeamPerformanceCardProps) {
  const gaugeOptions = useMemo(() => ({
    series: [overallScore],
    chart: {
      height: 280,
      type: 'radialBar' as const,
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 15,
          size: '65%',
        },
        track: {
          background: '#F8FAFC',
          strokeWidth: '100%',
          margin: 0,
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: 20,
            show: true,
            color: '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
          },
          value: {
            offsetY: -10,
            color: '#7A1A25',
            fontSize: '36px',
            fontWeight: 800,
            show: true,
            formatter: function (val: number) {
              return val + '%'
            },
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#FFC72C'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      lineCap: 'round' as const,
    },
    colors: ['#7A1A25'],
    labels: ['Overall Score'],
  }), [overallScore])

  // Memoize expensive string operations
  const formattedSummary = useMemo(() => {
    if (!aiSummary.includes('Empathy') || !aiSummary.includes('Objection Handling')) {
      return null
    }
    const empathyParts = aiSummary.split('Empathy')
    const objectionParts = empathyParts[1].split('Objection Handling')
    return {
      before: empathyParts[0],
      afterEmpathy: objectionParts[0],
      afterObjection: objectionParts[1],
    }
  }, [aiSummary])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-0 border border-bm-grey/60 overflow-hidden animate-pulse">
        <div className="p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
          <div className="flex-grow space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-0 border border-bm-grey/60 overflow-hidden">
      <div className="p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
        {/* Gauge Chart */}
        <div className="flex-shrink-0 relative">
          <div className="relative z-10">
            <Chart options={gaugeOptions} series={gaugeOptions.series} type="radialBar" height={240} />
          </div>
          <div className="absolute inset-0 bg-bm-gold/10 rounded-full z-0 scale-90"></div>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-3 text-center md:text-left">
          <div>
            <h2 className="text-base font-bold text-bm-text-primary tracking-tight leading-tight">Team Performance Score</h2>
            <div className="flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                {trend}
              </span>
              <span className="text-xs text-bm-text-secondary">Based on {simulationsCount} simulations</span>
            </div>
          </div>

          {/* AI Summary Box */}
          <div className="bg-bm-light-grey rounded-xl p-3 border border-bm-grey relative">
            <div className="absolute -top-2.5 -left-1.5 bg-gradient-to-r from-bm-maroon to-bm-maroon-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">psychology</span>
              AI SUMMARY
            </div>
            <p className="text-xs text-bm-text-secondary leading-relaxed mt-0.5">
              <span className="font-bold text-bm-maroon">Excellent progress.</span>{' '}
              {formattedSummary ? (
                <>
                  {formattedSummary.before}
                  <span className="font-semibold text-bm-text-primary">Empathy</span>
                  {formattedSummary.afterEmpathy}
                  <span className="font-semibold text-bm-text-primary">Objection Handling</span>
                  {formattedSummary.afterObjection}
                </>
              ) : (
                aiSummary
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(TeamPerformanceCard)

