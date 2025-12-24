'use client'

export interface CoachingRecommendation {
  id: string
  title: string
  description: string
  actionType: 'scenario' | 'resource'
  actionLabel: string
}

interface RecommendedCoachingProps {
  recommendations: CoachingRecommendation[]
  onStartScenario?: (id: string) => void
  onViewResource?: (id: string) => void
}

export function RecommendedCoaching({
  recommendations,
  onStartScenario,
  onViewResource,
}: RecommendedCoachingProps) {
  return (
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-5 bg-gradient-to-br from-white to-bm-light-grey">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="material-symbols-outlined text-bm-gold text-lg">auto_awesome</span>
        <h3 className="text-sm font-bold text-bm-text-primary tracking-tight leading-tight">Recommended Coaching</h3>
      </div>
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-white p-3 rounded-xl border border-bm-grey shadow-sm hover:shadow-md transition-shadow"
          >
            <h4 className="font-bold text-bm-maroon mb-1 text-xs">{recommendation.title}</h4>
            <p className="text-[10px] text-bm-text-secondary mb-2.5 leading-relaxed">{recommendation.description}</p>
            {recommendation.actionType === 'scenario' ? (
              <button
                onClick={() => onStartScenario?.(recommendation.id)}
                className="w-full py-1.5 bg-bm-gold/10 text-bm-maroon-dark text-[10px] font-bold rounded-lg hover:bg-bm-gold hover:text-bm-maroon-dark transition-colors flex items-center justify-center gap-1.5"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => onViewResource?.(recommendation.id)}
                className="w-full py-1.5 bg-bm-light-grey text-bm-text-secondary text-[10px] font-bold rounded-lg hover:bg-bm-grey hover:text-bm-text-primary transition-colors flex items-center justify-center gap-1.5"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-xs">menu_book</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

