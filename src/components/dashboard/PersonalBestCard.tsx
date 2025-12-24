'use client'

export interface PersonalBestMetric {
  name: string
  current: number
  change: number
  changeType: 'increase' | 'decrease'
}

interface PersonalBestCardProps {
  sessionNumber: string
  metrics: PersonalBestMetric[]
  onViewHistory?: () => void
}

export function PersonalBestCard({
  sessionNumber = 'Session #42',
  metrics,
  onViewHistory,
}: PersonalBestCardProps) {
  return (
    <div className="bg-gradient-to-br from-bm-maroon to-[#500f15] rounded-2xl p-6 shadow-card text-white relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="font-bold text-base flex items-center gap-2 tracking-tight leading-tight">
          <span className="material-symbols-outlined text-bm-gold text-lg">emoji_events</span>
          Vs. Personal Best
        </h3>
        <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded">{sessionNumber}</span>
      </div>
      <div className="space-y-4 relative z-10">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`flex items-center justify-between ${index < metrics.length - 1 ? 'border-b border-white/10 pb-2.5' : ''}`}
          >
            <span className="text-xs font-medium text-white/80">{metric.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{metric.current}%</span>
              <span
                className={`text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded ${
                  metric.changeType === 'increase'
                    ? 'text-green-400 bg-green-400/10'
                    : 'text-red-300 bg-red-400/10'
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {metric.changeType === 'increase' ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {Math.abs(metric.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="mt-5 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-colors flex items-center justify-center gap-2 relative z-10"
        >
          View Detailed History
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      )}
    </div>
  )
}

