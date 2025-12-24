'use client'

interface AhaMomentCardProps {
  title: string
  description: string
  technique?: string
}

export function AhaMomentCard({ title, description, technique }: AhaMomentCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-bm-grey/60 flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-bm-maroon/20 transition-all">
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-bm-gold/20 to-transparent rounded-bl-full"></div>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="p-1.5 bg-bm-gold/10 rounded-lg text-bm-gold-dark">
          <span className="material-symbols-outlined text-base">lightbulb</span>
        </div>
        <span className="text-[10px] font-bold text-bm-text-subtle uppercase tracking-wider">Aha Moment</span>
      </div>
      <h3 className="text-sm font-bold text-bm-text-primary mb-1">{title}</h3>
      <p className="text-xs text-bm-text-secondary leading-snug">{description}</p>
      {technique && (
        <p className="text-[10px] text-bm-text-subtle mt-1.5 italic">Technique: {technique}</p>
      )}
    </div>
  )
}

