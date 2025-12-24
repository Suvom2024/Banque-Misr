'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ScenarioSelectionHeader } from '@/components/dashboard/ScenarioSelectionHeader'
import { CategoryFilters } from '@/components/dashboard/CategoryFilters'
import { ScenarioSelectionCard, ScenarioSelection } from '@/components/dashboard/ScenarioSelectionCard'
import { SessionDetailsPanel, SessionDetails } from '@/components/dashboard/SessionDetailsPanel'

interface ScenarioSelectionClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

export function ScenarioSelectionClient({ userName, userRole, userAvatar }: ScenarioSelectionClientProps) {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<ScenarioSelection[]>([])
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('')
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'customer-service' | 'compliance' | 'leadership'>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchScenarios()
  }, [activeCategory])

  useEffect(() => {
    if (selectedScenarioId) {
      fetchSessionDetails(selectedScenarioId)
    }
  }, [selectedScenarioId])

  const fetchScenarios = async () => {
    try {
      setIsLoading(true)
      const category = activeCategory === 'all' ? undefined : activeCategory
      const response = await fetch(`/api/training-hub/scenarios/selection${category ? `?category=${category}` : ''}`)
      
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array and filter out invalid items
        const validScenarios = Array.isArray(data) 
          ? data.filter((s: any) => s && s.id && s.title && s.difficulty !== undefined)
          : []
        setScenarios(validScenarios)
        // Auto-select first scenario if none selected
        if (!selectedScenarioId && validScenarios.length > 0) {
          setSelectedScenarioId(validScenarios[0].id)
        }
      } else {
        console.error('Failed to fetch scenarios:', response.status, response.statusText)
        setScenarios([])
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error)
      setScenarios([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessionDetails = async (scenarioId: string) => {
    try {
      const response = await fetch(`/api/training-hub/scenarios/${scenarioId}/session-details`)
      
      if (response.ok) {
        const details = await response.json()
        setSessionDetails(details)
      }
    } catch (error) {
      console.error('Error fetching session details:', error)
    }
  }

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id)
    setScenarios((prev) => prev.map((s) => ({ ...s, isSelected: s.id === id })))
  }

  const handleToneChange = (tone: 'Supportive' | 'Neutral' | 'Direct') => {
    if (sessionDetails) {
      setSessionDetails({ ...sessionDetails, tone })
    }
  }

  const handleBeginSession = async () => {
    if (!selectedScenarioId) return

    try {
      const response = await fetch('/api/training-hub/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenarioId: selectedScenarioId,
          tone: sessionDetails?.tone || 'Neutral',
        }),
      })

      if (response.ok) {
        const session = await response.json()
        router.push(`/training-hub/session/${session.id}/live`)
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Failed to start session. Please try again.')
    }
  }

  const handleCategoryChange = (category: 'all' | 'customer-service' | 'compliance' | 'leadership') => {
    setActiveCategory(category)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <ScenarioSelectionHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow overflow-y-auto">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Scenario Selection */}
              <div className="lg:col-span-8 space-y-6">
                <CategoryFilters activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : scenarios.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarios
                      .filter((s) => s && s.id && s.title) // Filter out invalid scenarios
                      .map((scenarioData) => (
                        <ScenarioSelectionCard
                          key={scenarioData.id}
                          scenario={{
                            ...scenarioData,
                            isSelected: scenarioData.id === selectedScenarioId,
                          }}
                          onSelect={() => handleSelectScenario(scenarioData.id)}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-card border border-bm-grey/60">
                    <span className="material-symbols-outlined text-6xl text-bm-text-subtle mb-4">inbox</span>
                    <p className="text-bm-text-secondary font-medium">No scenarios available</p>
                    <p className="text-sm text-bm-text-subtle mt-2">Try adjusting your filters</p>
                  </div>
                )}
              </div>

              {/* Right Column - Session Details */}
              <div className="lg:col-span-4">
                {sessionDetails ? (
                  <SessionDetailsPanel
                    {...sessionDetails}
                    onToneChange={handleToneChange}
                    onBeginSession={handleBeginSession}
                  />
                ) : (
                  <div className="bg-white rounded-xl p-6 shadow-card border border-bm-grey/60">
                    <p className="text-bm-text-secondary text-sm">Select a scenario to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
