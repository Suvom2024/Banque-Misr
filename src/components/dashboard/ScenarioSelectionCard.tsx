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
  // Safety check
  if (!scenario || !scenario.id || !scenario.title) {
    return null
  }

  const difficultyIcon = useMemo(() => {
    const diff = scenario.difficulty || 'Intermediate'
    switch (diff) {
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
        scenario.isSelected ? 'selected' : ''
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
              className="w-full h-full object-cover"
              src={scenario.imageUrl}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-bm-mint/50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10 text-bm-green-dark"></div>
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
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2 py-0.5 rounded-full bg-bm-gold text-bm-maroon-dark text-[10px] font-bold uppercase tracking-wide shadow-sm">
              Recommended
            </span>
          </div>
        )}

        {/* Bookmark Button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            className="p-1.5 rounded-full bg-bm-white/20 backdrop-blur-md text-white"
            onClick={(e) => {
              e.stopPropagation()
              // Handle bookmark
            }}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              bookmark_border
            </span>
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-3 left-3 z-20 text-white">
          <h3 className="text-base font-bold leading-tight tracking-tight">{scenario.title}</h3>
          <p className="text-bm-white/80 text-xs mt-0.5 leading-relaxed">{scenario.subtitle}</p>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Metadata Badges */}
        <div className="flex items-center gap-2 mb-3 text-[10px] font-semibold text-bm-text-secondary">
          <div className="flex items-center gap-1 bg-bm-light-grey px-1.5 py-0.5 rounded-md">
            <span className="material-symbols-outlined text-xs text-bm-maroon">timer</span>
            <span>{scenario.duration}</span>
          </div>
          <div className="flex items-center gap-1 bg-bm-light-grey px-1.5 py-0.5 rounded-md">
            <span className={`material-symbols-outlined text-xs ${scenario.isSelected ? 'text-bm-maroon' : 'text-bm-text-subtle'}`}>
              {difficultyIcon}
            </span>
            <span>{scenario.difficulty || 'Intermediate'}</span>
          </div>
          <div className="flex items-center gap-1 bg-bm-light-grey px-1.5 py-0.5 rounded-md">
            <span className={`material-symbols-outlined text-xs ${scenario.isSelected ? 'text-bm-maroon' : 'text-bm-text-subtle'}`}>
              {skillIcon}
            </span>
            <span>{scenario.skill}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-bm-text-secondary leading-relaxed mb-3 line-clamp-2">{scenario.description}</p>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-bm-grey flex justify-between items-center">
          <span className="text-[10px] font-medium text-bm-text-subtle">
            AI Coach: <span className={scenario.aiCoach === 'Active' ? 'text-bm-maroon' : 'text-bm-text-secondary'}>{scenario.aiCoach}</span>
          </span>
          {scenario.isSelected ? (
            <span className="text-bm-maroon text-xs font-bold flex items-center gap-1 opacity-100">
              Selected <span className="material-symbols-outlined text-sm">check_circle</span>
            </span>
          ) : (
            <span className="text-bm-text-subtle text-xs font-medium flex items-center gap-1">
              Select <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export const ScenarioSelectionCard = memo(ScenarioSelectionCardComponent)
