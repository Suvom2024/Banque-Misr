'use client'

interface SkillTag {
  id: string
  label: string
  isRecommended?: boolean
}

interface AISkillFocusSidebarProps {
  skills: SkillTag[]
  onViewAnalysis?: () => void
}

export function AISkillFocusSidebar({ skills, onViewAnalysis }: AISkillFocusSidebarProps) {
  return (
    <div className="bg-gradient-to-br from-bm-maroon to-bm-maroon-dark rounded-2xl shadow-card p-4 text-white relative overflow-hidden w-full">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-bm-gold rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
      <h3 className="font-bold text-sm mb-0.5 relative z-10">AI Skill Focus</h3>
      <p className="text-[10px] text-white/60 mb-4 relative z-10">Recommended based on your recent simulations.</p>
      <div className="flex flex-wrap gap-1.5 relative z-10">
        {skills.map((skill) => (
          <button
            key={skill.id}
            className={`skill-tag px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
              skill.isRecommended
                ? 'bg-white/20 backdrop-blur-sm border-white/20 text-bm-gold hover:bg-bm-gold hover:text-bm-maroon-dark shadow-sm'
                : 'bg-white/10 backdrop-blur-sm border-white/10 hover:bg-bm-gold hover:text-bm-maroon-dark'
            }`}
          >
            {skill.label}
            {skill.isRecommended && ' ★'}
          </button>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/10 text-center">
        <button
          onClick={onViewAnalysis}
          className="text-[10px] font-bold text-bm-gold hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          View Full Analysis <span className="material-symbols-outlined text-xs">bar_chart</span>
        </button>
      </div>
    </div>
  )
}

