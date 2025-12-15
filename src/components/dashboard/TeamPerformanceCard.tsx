'use client'

import { useMemo, memo } from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TeamPerformanceCardProps {
  overallScore?: number
  trend?: string
  simulationsCount?: number
  aiSummary?: string
}

export function TeamPerformanceCard({
  overallScore = 87,
  trend = '+5% vs Target',
  simulationsCount = 124,
  aiSummary = "Excellent progress. The team has shown a significant uptick in Empathy scores following last week's new curriculum. However, Objection Handling remains a bottleneck in high-pressure scenarios.",
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

  return (
    <div className="bg-white rounded-2xl shadow-card p-0 border border-bm-grey/60 overflow-hidden card-transition">
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        {/* Gauge Chart */}
        <div className="flex-shrink-0 relative">
          <div className="relative z-10">
            <Chart options={gaugeOptions} series={gaugeOptions.series} type="radialBar" height={280} />
          </div>
          <div className="absolute inset-0 bg-bm-gold/10 blur-2xl rounded-full z-0 transform scale-90"></div>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-bm-text-primary tracking-tighter leading-tight">Team Performance Score</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                {trend}
              </span>
              <span className="text-sm text-bm-text-secondary">Based on {simulationsCount} simulations</span>
            </div>
          </div>

          {/* AI Summary Box */}
          <div className="bg-bm-light-grey rounded-xl p-4 border border-bm-grey relative">
            <div className="absolute -top-3 -left-2 bg-gradient-to-r from-bm-maroon to-bm-maroon-dark text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">psychology</span>
              AI SUMMARY
            </div>
            <p className="text-sm text-bm-text-secondary leading-relaxed mt-1">
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

