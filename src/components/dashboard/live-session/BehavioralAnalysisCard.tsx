'use client'

interface BehavioralAnalysisCardProps {
  empathy: number
  directness: number
  onViewFullAnalytics?: () => void
}

export function BehavioralAnalysisCard({
  empathy,
  directness,
  onViewFullAnalytics,
}: BehavioralAnalysisCardProps) {
  const getEmpathyLevel = (value: number) => {
    if (value >= 75) return { label: 'High', color: 'text-feedback-positive' }
    if (value >= 50) return { label: 'Moderate', color: 'text-feedback-neutral' }
    return { label: 'Low', color: 'text-feedback-negative' }
  }

  const getDirectnessLevel = (value: number) => {
    if (value >= 75) return { label: 'High', color: 'text-feedback-positive' }
    if (value >= 50) return { label: 'Moderate', color: 'text-feedback-neutral' }
    return { label: 'Low', color: 'text-feedback-negative' }
  }

  const empathyLevel = getEmpathyLevel(empathy)
  const directnessLevel = getDirectnessLevel(directness)

  return (
    <div className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-bm-maroon text-xl">psychology</span>
        <h3 className="font-bold text-bm-text-primary text-sm">Behavioral Analysis</h3>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-bm-light-grey rounded-lg border border-bm-grey/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-bm-text-secondary">Empathy</span>
            <span className={`text-xs font-bold ${empathyLevel.color}`}>{empathyLevel.label}</span>
          </div>
          <div className="h-1.5 w-full bg-bm-grey rounded-full">
            <div className="h-full bg-feedback-positive rounded-full" style={{ width: `${empathy}%` }}></div>
          </div>
        </div>
        <div className="p-3 bg-bm-light-grey rounded-lg border border-bm-grey/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-bm-text-secondary">Directness</span>
            <span className={`text-xs font-bold ${directnessLevel.color}`}>{directnessLevel.label}</span>
          </div>
          <div className="h-1.5 w-full bg-bm-grey rounded-full">
            <div className="h-full bg-feedback-neutral rounded-full" style={{ width: `${directness}%` }}></div>
          </div>
        </div>
      </div>
      <button
        onClick={onViewFullAnalytics}
        className="mt-4 w-full py-2 border border-bm-grey rounded-lg text-xs font-bold text-bm-text-secondary hover:bg-bm-light-grey transition-colors"
      >
        View Full Analytics
      </button>
    </div>
  )
}



