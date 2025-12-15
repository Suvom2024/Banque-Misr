'use client'

import { useMemo, memo } from 'react'

export interface ScenarioSelection {
  id: string
  title: string
  subtitle?: string
  description: string
  imageUrl?: string
  icon?: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  skill: string
  aiCoach: 'Active' | 'Standard'
  isRecommended?: boolean
  isSelected?: boolean
  category?: string
  subcategory?: string
  sessionId?: string
}

interface ScenarioSelectionCardProps {
  scenario: ScenarioSelection
  onSelect?: (id: string) => void
}

function ScenarioSelectionCardComponent({ scenario, onSelect }: ScenarioSelectionCardProps) {
  const difficultyIcon = useMemo(() => {
    switch (scenario.difficulty) {
      case 'Advanced':
        return 'signal_cellular_alt'
      case 'Intermediate':
        return 'signal_cellular_alt_2_bar'
      default:
        return 'signal_cellular_alt_1_bar'
    }
  }, [scenario.difficulty])

  const skillIcon = useMemo(() => {
    const skill = scenario.skill.toLowerCase()
    if (skill.includes('conflict')) return 'psychology'
    if (skill.includes('empathy') || skill.includes('empa')) return 'favorite'
    if (skill.includes('closing')) return 'trending_up'
    return 'star'
  }, [scenario.skill])

  return (
    <div
      className={`scenario-card group relative bg-bm-white rounded-2xl border border-bm-grey overflow-hidden cursor-pointer h-full flex flex-col ${
        scenario.isSelected ? 'selected' : 'hover:border-bm-maroon/30'
      }`}
      onClick={() => onSelect?.(scenario.id)}
    >
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        {scenario.imageUrl ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img
              alt={scenario.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              src={scenario.imageUrl}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-bm-mint/50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 pattern-bg text-bm-green-dark"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            {scenario.icon && (
              <span className="material-symbols-outlined text-6xl text-bm-green-dark/20 relative z-0">
                {scenario.icon}
              </span>
            )}
          </>
        )}

        {/* Recommended Badge */}
        {scenario.isRecommended && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-full bg-bm-gold text-bm-maroon-dark text-xs font-bold uppercase tracking-wide shadow-sm">
              Recommended
            </span>
          </div>
        )}

        {/* Bookmark Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            className="p-2 rounded-full bg-bm-white/20 backdrop-blur-md text-white hover:bg-bm-white hover:text-bm-maroon transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // Handle bookmark
            }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
              bookmark_border
            </span>
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <h3 className="text-xl font-bold leading-tight tracking-tight">{scenario.title}</h3>
          <p className="text-bm-white/80 text-sm mt-1 leading-relaxed">{scenario.subtitle}</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Metadata Badges */}
        <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-bm-text-secondary">
          <div className="flex items-center gap-1.5 bg-bm-light-grey px-2 py-1 rounded-md">
            <span className="material-symbols-outlined text-base text-bm-maroon">timer</span>
            <span>{scenario.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-bm-light-grey px-2 py-1 rounded-md">
            <span className={`material-symbols-outlined text-base ${scenario.isSelected ? 'text-bm-maroon' : 'text-bm-text-subtle'}`}>
              {difficultyIcon}
            </span>
            <span>{scenario.difficulty}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-bm-light-grey px-2 py-1 rounded-md">
            <span className={`material-symbols-outlined text-base ${scenario.isSelected ? 'text-bm-maroon' : 'text-bm-text-subtle'}`}>
              {skillIcon}
            </span>
            <span>{scenario.skill}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-bm-text-secondary leading-relaxed mb-4 line-clamp-2">{scenario.description}</p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-bm-grey flex justify-between items-center">
          <span className="text-xs font-medium text-bm-text-subtle">
            AI Coach: <span className={scenario.aiCoach === 'Active' ? 'text-bm-maroon' : 'text-bm-text-secondary'}>{scenario.aiCoach}</span>
          </span>
          {scenario.isSelected ? (
            <span className="text-bm-maroon text-sm font-bold flex items-center gap-1 opacity-100 transition-opacity">
              Selected <span className="material-symbols-outlined text-lg">check_circle</span>
            </span>
          ) : (
            <span className="text-bm-text-subtle text-sm font-medium group-hover:text-bm-maroon flex items-center gap-1 transition-colors">
              Select Scenario <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export const ScenarioSelectionCard = memo(ScenarioSelectionCardComponent)
