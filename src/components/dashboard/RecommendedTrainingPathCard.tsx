'use client'

interface TrainingPathModule {
  id: string
  type: 'scenario' | 'micro-learning' | 'drill'
  title: string
  description: string
  duration: string
  difficulty: string
  isHighImpact?: boolean
}

interface RecommendedTrainingPathCardProps {
  modules: TrainingPathModule[]
  onCustomizePath?: () => void
  onStartModule?: (id: string) => void
}

export function RecommendedTrainingPathCard({
  modules,
  onCustomizePath,
  onStartModule,
}: RecommendedTrainingPathCardProps) {
  const getModuleButtonClass = (type: string) => {
    switch (type) {
      case 'scenario':
        return 'bg-bm-gold text-bm-maroon hover:bg-bm-gold-dark'
      case 'micro-learning':
        return 'bg-white border-2 border-bm-gold text-bm-maroon hover:bg-bm-gold/10'
      case 'drill':
        return 'bg-bm-light-grey text-bm-text-secondary hover:bg-bm-grey hover:text-bm-maroon'
      default:
        return 'bg-white border border-bm-grey text-bm-text-secondary hover:bg-bm-light-grey'
    }
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'scenario':
        return 'play_arrow'
      case 'micro-learning':
        return 'resume'
      case 'drill':
        return 'bolt'
      default:
        return 'arrow_forward'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-bm-gold/30 overflow-hidden animate-fade-in-up animate-delay-200">
      <div className="bg-gradient-to-r from-bm-light-grey to-white p-6 border-b border-bm-grey/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-bm-maroon to-bm-maroon-dark rounded-lg text-white shadow-md">
            <span className="material-symbols-outlined text-2xl">route</span>
          </div>
          <div>
            <h3 className="font-bold text-xl text-bm-text-primary">Recommended Training Path</h3>
            <p className="text-sm text-bm-text-secondary">AI-curated modules to accelerate your active goals</p>
          </div>
        </div>
        <button
          onClick={onCustomizePath}
          className="text-xs font-bold text-bm-maroon hover:text-white bg-white hover:bg-bm-maroon px-4 py-2 rounded-lg border border-bm-grey hover:border-bm-maroon transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">tune</span>
          Customize Path
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-bm-gold to-bm-maroon rounded-xl opacity-0 group-hover:opacity-20 transition duration-300 blur"></div>
            <div className="relative bg-white border border-bm-grey rounded-xl p-5 hover:border-bm-gold/50 transition-all flex flex-col h-full shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-bm-text-subtle bg-bm-light-grey px-2 py-0.5 rounded">
                  {module.type === 'scenario' ? 'Scenario' : module.type === 'micro-learning' ? 'Micro-Learning' : 'Drill'}
                </span>
                {module.isHighImpact && (
                  <div className="flex items-center gap-1 text-feedback-positive text-xs font-bold bg-feedback-positive-bg px-2 py-0.5 rounded-full">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    High Impact
                  </div>
                )}
              </div>
              <h4 className="font-bold text-bm-text-primary mb-2">{module.title}</h4>
              <p className="text-sm text-bm-text-secondary leading-relaxed mb-4 flex-grow">{module.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-bm-text-subtle font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {module.duration}
                </span>
                <span className="text-[10px] text-bm-text-subtle font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
                  {module.difficulty}
                </span>
              </div>
              <button
                onClick={() => onStartModule?.(module.id)}
                className={`w-full mt-auto py-2.5 ${getModuleButtonClass(module.type)} font-bold rounded-lg text-sm transition-colors shadow-sm flex items-center justify-center gap-2`}
              >
                <span>{module.type === 'scenario' ? 'Start Training' : module.type === 'micro-learning' ? 'Resume Module' : 'Start Drill'}</span>
                <span className="material-symbols-outlined text-lg">{getModuleIcon(module.type)}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

