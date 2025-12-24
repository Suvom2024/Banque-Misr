'use client'

export interface ComparisonMetric {
  name: string
  current: number
  previous: number
  change: number
  changeType: 'increase' | 'decrease'
}

interface PreviousBestComparisonProps {
  metrics: ComparisonMetric[]
}

export function PreviousBestComparison({ metrics }: PreviousBestComparisonProps) {
  return (
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-5">
      <h3 className="text-xs font-bold text-bm-text-subtle uppercase tracking-wider mb-4 border-b border-bm-grey/50 pb-1.5">
        Vs. Previous Best
      </h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-xs font-semibold text-bm-text-primary">{metric.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-bm-text-subtle">Prev: {metric.previous}%</span>
              <div
                className={`flex items-center ${
                  metric.changeType === 'increase'
                    ? 'text-feedback-positive bg-feedback-positive-bg'
                    : 'text-feedback-negative bg-feedback-negative-bg'
                } px-1.5 py-0.5 rounded-md`}
              >
                <span className="material-symbols-filled text-xs">
                  {metric.changeType === 'increase' ? 'arrow_upward' : 'arrow_downward'}
                </span>
                <span className="font-black text-xs ml-0.5">{Math.abs(metric.change)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

