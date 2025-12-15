'use client'

import { useState, useMemo } from 'react'
import { BreadcrumbHeader } from '@/components/dashboard/BreadcrumbHeader'
import { CategoryTabs, Category } from '@/components/dashboard/CategoryTabs'
import { ScenarioSelectionCard, ScenarioSelection } from '@/components/dashboard/ScenarioSelectionCard'
import { SessionDetailsPanel } from '@/components/dashboard/SessionDetailsPanel'

interface TrainingHubClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

const defaultScenarios: ScenarioSelection[] = [
  {
    id: '1',
    title: 'Underperformance Discussion',
    subtitle: 'High Priority',
    category: 'Management',
    subcategory: 'High Priority',
    description: 'Master the art of addressing performance gaps with team members while maintaining morale and setting clear, actionable goals.',
    // Removed external image URL for performance - component will use placeholder/icon
    duration: '12 Min',
    difficulty: 'Advanced',
    skill: 'Conflict Res.',
    isRecommended: true,
    aiCoach: 'Active',
    sessionId: '4205',
  },
  {
    id: '2',
    title: 'Recognizing Improvement',
    subtitle: 'Positive Reinforcement',
    category: 'Coaching',
    subcategory: 'Positive Reinforcement',
    description: 'Learn to effectively deliver positive feedback to employees who have shown significant progress, reinforcing good behaviors.',
    // Removed external image URL for performance - component will use placeholder/icon
    duration: '8 Min',
    difficulty: 'Intermediate',
    skill: 'Empathy',
    aiCoach: 'Standard',
  },
  {
    id: '3',
    title: 'Client Negotiation',
    subtitle: 'Negotiation',
    category: 'Sales',
    subcategory: 'Negotiation',
    description: 'Practice high-stakes negotiation techniques with a hesitant client to close a deal without compromising value.',
    duration: '15 Min',
    difficulty: 'Advanced',
    skill: 'Closing',
    aiCoach: 'Active',
  },
]

export function TrainingHubClient({ userName, userRole, userAvatar }: TrainingHubClientProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSelection | null>(defaultScenarios[0])
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Memoize filtered scenarios to avoid recalculation on every render
  const filteredScenarios = useMemo(() => {
    return activeCategory === 'all'
      ? defaultScenarios
      : defaultScenarios.filter((s) => s.category?.toLowerCase() === activeCategory)
  }, [activeCategory])

  const handleSelectScenario = (id: string) => {
    const scenario = defaultScenarios.find((s) => s.id === id)
    setSelectedScenario(scenario || null)
  }

  const handleBeginSession = () => {
    // Handle begin session logic - navigate to session page
    if (selectedScenario?.sessionId) {
      window.location.href = `/training-hub/session/${selectedScenario.sessionId}`
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <BreadcrumbHeader
        breadcrumbs={[
          { label: 'Training Hub', href: '/training-hub' },
          { label: 'New Session' },
        ]}
        title="Scenario Selection Hub"
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
      />

      <main className="flex-grow overflow-y-auto w-full p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
          {/* Left Column - Scenarios */}
          <div className="xl:col-span-8 flex flex-col h-full space-y-6">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              currentPage={currentPage}
              totalPages={1}
              totalItems={12}
              showingItems={filteredScenarios.length}
              onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => p + 1)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 pb-6">
              {filteredScenarios.map((scenario) => (
                <ScenarioSelectionCard
                  key={scenario.id}
                  scenario={{ ...scenario, isSelected: selectedScenario?.id === scenario.id }}
                  onSelect={handleSelectScenario}
                />
              ))}
            </div>
          </div>

          {/* Right Column - Session Details */}
          <div className="xl:col-span-4 h-full">
            <SessionDetailsPanel
              details={
                selectedScenario
                  ? {
                      scenarioId: selectedScenario.id,
                      title: selectedScenario.title,
                      id: selectedScenario.sessionId || selectedScenario.id,
                      description: selectedScenario.description,
                      skills: [
                        { icon: 'star', label: selectedScenario.skill },
                        { icon: 'balance', label: 'Fairness' },
                        { icon: 'record_voice_over', label: 'Clarity' },
                      ],
                      tone: 'Neutral',
                      difficulty: selectedScenario.difficulty,
                      estimatedXP: 150,
                    }
                  : undefined
              }
              onBeginSession={handleBeginSession}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

