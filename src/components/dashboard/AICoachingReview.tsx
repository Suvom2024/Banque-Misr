'use client'

export interface AICoachingRecommendation {
  id: string
  icon: string
  title: string
  description: string
  actionType: 'drill' | 'resource'
  actionLabel: string
}

interface AICoachingReviewProps {
  recommendations: AICoachingRecommendation[]
  onStartDrill?: (id: string) => void
  onViewResource?: (id: string) => void
}

export function AICoachingReview({
  recommendations,
  onStartDrill,
  onViewResource,
}: AICoachingReviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-bm-gold text-xl">auto_awesome</span>
        <h3 className="font-bold text-base text-bm-text-primary tracking-tight leading-tight">AI Coaching</h3>
      </div>
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-bm-gold/50 transition-all group"
          >
            <div className="flex items-start gap-2.5">
              <div className="bg-white p-1.5 rounded-lg shadow-sm text-bm-maroon border border-gray-100">
                <span className="material-symbols-outlined text-base">{recommendation.icon}</span>
              </div>
              <div>
                <h4 className="font-semibold text-xs text-bm-text-primary">{recommendation.title}</h4>
                <p className="text-[10px] text-bm-text-secondary mt-1 leading-snug">{recommendation.description}</p>
              </div>
            </div>
            {recommendation.actionType === 'drill' ? (
              <button
                onClick={() => onStartDrill?.(recommendation.id)}
                className="mt-2.5 w-full py-1.5 bg-bm-gold/10 text-bm-maroon hover:bg-bm-gold hover:text-bm-maroon-dark text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={() => onViewResource?.(recommendation.id)}
                className="mt-2.5 w-full py-1.5 bg-bm-gold/10 text-bm-maroon hover:bg-bm-gold hover:text-bm-maroon-dark text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                {recommendation.actionLabel}
                <span className="material-symbols-outlined text-xs">visibility</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

