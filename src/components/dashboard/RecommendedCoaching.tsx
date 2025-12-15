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
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-6 bg-gradient-to-br from-white to-bm-light-grey">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-bm-gold text-2xl">auto_awesome</span>
        <h3 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight">Recommended Coaching</h3>
      </div>
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="bg-white p-4 rounded-xl border border-bm-grey shadow-sm hover:shadow-md transition-shadow"
          >
            <h4 className="font-bold text-bm-maroon mb-1 text-sm">{recommendation.title}</h4>
            <p className="text-xs text-bm-text-secondary mb-3 leading-relaxed">{recommendation.description}</p>
            {recommendation.actionType === 'scenario' ? (
              <button
                onClick={() => onStartScenario?.(recommendation.id)}
                className="w-full py-2 bg-bm-gold/10 text-bm-maroon-dark text-xs font-bold rounded-lg hover:bg-bm-gold hover:text-bm-maroon-dark transition-colors flex items-center justify-center gap-2"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => onViewResource?.(recommendation.id)}
                className="w-full py-2 bg-bm-light-grey text-bm-text-secondary text-xs font-bold rounded-lg hover:bg-bm-grey hover:text-bm-text-primary transition-colors flex items-center justify-center gap-2"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-sm">menu_book</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

