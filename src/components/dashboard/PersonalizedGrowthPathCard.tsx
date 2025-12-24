'use client'

interface GrowthPathItem {
  id: string
  type: 'micro-drill' | 'scenario' | 'knowledge'
  title: string
  description: string
  duration?: string
  difficulty?: string
}

interface PersonalizedGrowthPathCardProps {
  items: GrowthPathItem[]
  onStartAction?: (id: string, type: string) => void
}

export function PersonalizedGrowthPathCard({ items, onStartAction }: PersonalizedGrowthPathCardProps) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'micro-drill':
        return 'Micro-Drill'
      case 'scenario':
        return 'New Scenario'
      case 'knowledge':
        return 'Knowledge Base'
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'micro-drill':
        return 'model_training'
      case 'scenario':
        return 'diversity_3'
      case 'knowledge':
        return 'menu_book'
      default:
        return 'arrow_forward'
    }
  }

  const getButtonClass = (type: string) => {
    switch (type) {
      case 'micro-drill':
        return 'bg-bm-gold text-bm-maroon hover:bg-bm-gold-dark'
      case 'scenario':
        return 'bg-white border-2 border-bm-gold text-bm-maroon hover:bg-bm-gold/10'
      case 'knowledge':
        return 'bg-bm-light-grey text-bm-text-secondary hover:bg-bm-grey hover:text-bm-maroon'
      default:
        return 'bg-white border border-bm-grey text-bm-text-secondary hover:bg-bm-light-grey'
    }
  }

  const getButtonText = (type: string, duration?: string) => {
    switch (type) {
      case 'micro-drill':
        return `Start Drill${duration ? ` (${duration})` : ''}`
      case 'scenario':
        return 'Explore Scenario'
      case 'knowledge':
        return 'Read Document'
      default:
        return 'Start'
    }
  }

  const getButtonIcon = (type: string) => {
    switch (type) {
      case 'micro-drill':
        return 'play_arrow'
      case 'scenario':
        return 'arrow_forward'
      case 'knowledge':
        return 'description'
      default:
        return 'arrow_forward'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-bm-gold/30 overflow-hidden animate-fade-in-up animate-delay-200">
      <div className="bg-gradient-to-r from-bm-light-grey to-white p-4 border-b border-bm-grey/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-bm-maroon/10 rounded-lg">
            <span className="material-symbols-outlined text-bm-maroon text-lg">alt_route</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-bm-text-primary">Your Personalized Growth Path</h3>
            <p className="text-xs text-bm-text-secondary">AI-curated recommendations based on today's session</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-bm-maroon bg-bm-gold/20 px-2 py-0.5 rounded-full border border-bm-gold/30">
          Priority Actions
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-bm-grey rounded-xl p-4 hover:shadow-lg hover:border-bm-gold/50 transition-all group flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-bm-text-subtle bg-bm-light-grey px-1.5 py-0.5 rounded">
                {getTypeLabel(item.type)}
              </span>
              <span className="material-symbols-outlined text-bm-maroon/40 group-hover:text-bm-gold transition-colors text-base">
                {getTypeIcon(item.type)}
              </span>
            </div>
            <h4 className="font-bold text-xs text-bm-text-primary mb-1.5">{item.title}</h4>
            <p className="text-xs text-bm-text-secondary leading-relaxed mb-3 flex-grow">{item.description}</p>
            <button
              onClick={() => onStartAction?.(item.id, item.type)}
              className={`w-full mt-auto py-2 ${getButtonClass(item.type)} font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5`}
            >
              <span>{getButtonText(item.type, item.duration)}</span>
              <span className="material-symbols-outlined text-sm">{getButtonIcon(item.type)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

