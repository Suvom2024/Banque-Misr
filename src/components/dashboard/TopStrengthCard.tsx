'use client'

interface TopStrengthCardProps {
  name: string
  description: string
  masteredAt: string
  peerRanking: string
}

export function TopStrengthCard({ name, description, masteredAt, peerRanking }: TopStrengthCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-bm-grey/60 flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-bm-maroon/20 transition-all">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-feedback-positive/10 to-transparent rounded-bl-full"></div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-feedback-positive-bg rounded-lg text-feedback-positive">
          <span className="material-symbols-outlined">hearing</span>
        </div>
        <span className="text-xs font-bold text-bm-text-subtle uppercase tracking-wider">Top Strength</span>
      </div>
      <h3 className="text-lg font-bold text-bm-text-primary mb-1">{name}</h3>
      <p className="text-sm text-bm-text-secondary leading-snug">{description}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-feedback-positive font-bold">
        <span className="material-symbols-outlined text-sm">trending_up</span>
        {peerRanking}
      </div>
    </div>
  )
}

