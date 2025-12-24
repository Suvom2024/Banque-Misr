'use client'

import Link from 'next/link'
import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface LibraryScenario {
  id: string
  title: string
  category: string
  rating: number
  reviewCount: number
  difficulty: string
  duration: string
  description: string
  tags: string[]
  isFeatured?: boolean
  isRecommended?: boolean
  imageUrl?: string
  aiCoach?: string
}

interface LibraryScenarioCardProps {
  scenario: LibraryScenario
}

// Move helper function outside component to prevent re-creation
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-50 text-green-700 border-green-100'
    case 'intermediate':
      return 'bg-yellow-50 text-yellow-700 border-yellow-100'
    case 'advanced':
    case 'difficult':
      return 'bg-red-50 text-red-700 border-red-100'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100'
  }
}

// Start Scenario Button Component
function StartScenarioButton({ scenarioId }: { scenarioId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartScenario = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/training-hub/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start session')
      }

      const session = await response.json()
      
      // Redirect to live session page
      router.push(`/training-hub/session/${session.id}/live`)
    } catch (error) {
      console.error('Error starting session:', error)
      alert(error instanceof Error ? error.message : 'Failed to start session. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleStartScenario}
      disabled={isLoading}
      className="bg-bm-maroon text-white font-bold py-2 px-4 rounded-lg text-xs shadow-lg shadow-bm-maroon/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bm-maroon-dark transition-colors"
    >
      {isLoading ? 'Starting...' : 'Start Scenario'}
    </button>
  )
}

function LibraryScenarioCardComponent({ scenario }: LibraryScenarioCardProps) {

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card group relative h-full">
      {scenario.imageUrl ? (
        <div className="h-48 bg-gradient-to-br from-bm-maroon-light to-bm-maroon relative p-6 flex flex-col justify-between overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <span className="material-symbols-outlined text-[180px] text-white">handshake</span>
          </div>
          <div className="flex justify-between items-start z-10">
            <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
              {scenario.category}
            </span>
            <button className="text-white/70">
              <span className="material-symbols-outlined">bookmark_border</span>
            </button>
          </div>
          <div className="z-10">
            <h3 className="text-lg font-bold text-white mb-1">{scenario.title}</h3>
            <div className="flex items-center gap-1.5 text-white/80 text-xs">
              <span className="material-symbols-outlined text-sm">star</span>
              {scenario.rating} ({scenario.reviewCount} reviews)
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-bm-text-primary to-bm-maroon relative p-6 flex flex-col justify-between overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] opacity-10">
            <span className="material-symbols-outlined text-[180px] text-white">inventory_2</span>
          </div>
          <div className="flex justify-between items-start z-10">
            {scenario.isRecommended && (
              <span className="px-2 py-1 border border-white/20 rounded text-xs font-medium text-white/80">New Arrival</span>
            )}
            <span className="material-symbols-outlined text-bm-gold">new_releases</span>
          </div>
          <div className="z-10">
            <h3 className="text-base font-bold text-white mb-1.5">{scenario.title}</h3>
            {scenario.isRecommended && (
              <div className="flex items-center gap-1 text-bm-gold text-[10px] font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-bm-gold"></span> Intermediate
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${getDifficultyColor(scenario.difficulty)}`}>
            {scenario.difficulty}
          </span>
          <span className="px-2.5 py-0.5 bg-gray-100 rounded-md text-[10px] font-semibold text-gray-600">{scenario.duration}</span>
          {scenario.aiCoach && (
            <span className="px-2.5 py-0.5 bg-bm-gold/10 text-bm-maroon rounded-md text-[10px] font-bold border border-bm-gold/20">
              AI Coach: {scenario.aiCoach}
            </span>
          )}
        </div>
        <p className="text-bm-text-secondary text-xs mb-4 leading-relaxed">{scenario.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
              +{scenario.reviewCount}
            </div>
          </div>
          <div className="flex gap-1.5">
              <StartScenarioButton scenarioId={scenario.id} />
            {/* For demo: Link to a completed session's agent report */}
            {scenario.id === '1' && (
              <Link
                href="/training-hub/session/demo-241/agents"
                className="bg-bm-maroon-dark text-white font-bold py-2 px-3 rounded-lg text-xs shadow-lg shadow-bm-maroon/20 flex items-center gap-1"
                title="View Agent Breakdown"
              >
                <span className="material-symbols-outlined text-sm">psychology</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const LibraryScenarioCard = memo(LibraryScenarioCardComponent)

