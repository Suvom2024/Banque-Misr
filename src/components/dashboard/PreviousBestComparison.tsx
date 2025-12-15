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
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-6">
      <h3 className="text-sm font-bold text-bm-text-subtle uppercase tracking-wider mb-5 border-b border-bm-grey/50 pb-2">
        Vs. Previous Best
      </h3>
      <div className="space-y-5">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-semibold text-bm-text-primary">{metric.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-bm-text-subtle">Prev: {metric.previous}%</span>
              <div
                className={`flex items-center ${
                  metric.changeType === 'increase'
                    ? 'text-feedback-positive bg-feedback-positive-bg'
                    : 'text-feedback-negative bg-feedback-negative-bg'
                } px-2 py-1 rounded-md`}
              >
                <span className="material-symbols-filled text-sm">
                  {metric.changeType === 'increase' ? 'arrow_upward' : 'arrow_downward'}
                </span>
                <span className="font-black text-sm ml-0.5">{Math.abs(metric.change)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

