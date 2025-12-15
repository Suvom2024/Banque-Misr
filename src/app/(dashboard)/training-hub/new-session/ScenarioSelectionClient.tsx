'use client'

import { useState } from 'react'
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

// Hard-coded scenario data
const defaultScenarios: ScenarioSelection[] = [
  {
    id: '1',
    title: 'Underperformance Discussion',
    subtitle: 'Management · High Priority',
    description: 'Master the art of addressing performance gaps with team members while maintaining morale and setting clear, actionable goals.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4A4A4xJL8QB2EOTOfOYyZHt_K0DCwaKc5Om5GpkV-W_l_DluB42LyECrEOXD8x1NBa-NquaqdGw8BF_ge5CiIwfWyTBCmUDcv7XU3FMLJOOWIblH1jhAc-GQzF-MGYD0v9-osyNFEZZnUHdiMU9hdJ1b6MrBFExF7pWF79SH3e03At9EuA-Ry6xVHwuudxNYAAsC7Su_INTxZ2SENYtoWs7q-bbAzP4ng7-J1bSu4DewNTdbdfNGY3l86foQ9_J1suZEF-3XXbY8',
    duration: '12 Min',
    difficulty: 'Advanced',
    skill: 'Conflict Res.',
    aiCoach: 'Active',
    isRecommended: true,
    isSelected: true,
  },
  {
    id: '2',
    title: 'Recognizing Improvement',
    subtitle: 'Coaching · Positive Reinforcement',
    description: 'Learn to effectively deliver positive feedback to employees who have shown significant progress, reinforcing good behaviors.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuT6LCCA4zQS7tyavAfyZVjLKstqzuP1h7vJsAEfK862-5Rzf0_SyYwgMxlTvsUOhQH-cvCc36xI7Brs9CrYhedDn2Ee2wKA1KOLtoApMl6-6n89NwxzRm01JdOCB9hYIxNZD461dNzW0gKxT4k06k7f8BLB2fWkzOYVtOmouA99gV7mhuOzh8fKfDpkqakmGuHJQj87CQWNNl4uDDnYo2aWKB6oejzrurEVeX-WBAsXqs_2obUvt2JeeS0n5SHYLK8C7q-6XTMMU',
    duration: '8 Min',
    difficulty: 'Intermediate',
    skill: 'Empathy',
    aiCoach: 'Standard',
  },
  {
    id: '3',
    title: 'Client Negotiation',
    subtitle: 'Sales · Negotiation',
    description: 'Practice high-stakes negotiation techniques with a hesitant client to close a deal without compromising value.',
    icon: 'handshake',
    duration: '15 Min',
    difficulty: 'Advanced',
    skill: 'Closing',
    aiCoach: 'Active',
  },
]

// Hard-coded session details for selected scenario
const defaultSessionDetails: SessionDetails = {
  scenarioId: '1',
  title: 'Underperformance Discussion',
  id: '#4205',
  description:
    "This scenario simulates a delicate conversation with a tenured employee. You'll practice separating personal feelings from professional standards.",
  skills: [
    { icon: 'star', label: 'Empathy' },
    { icon: 'balance', label: 'Fairness' },
    { icon: 'record_voice_over', label: 'Clarity' },
  ],
  tone: 'Neutral',
  difficulty: 'Medium',
  estimatedXP: 150,
}

export function ScenarioSelectionClient({ userName, userRole, userAvatar }: ScenarioSelectionClientProps) {
  const router = useRouter()
  const [scenarios, setScenarios] = useState<ScenarioSelection[]>(defaultScenarios)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('1')
  const [sessionDetails, setSessionDetails] = useState<SessionDetails>(defaultSessionDetails)
  const [activeCategory, setActiveCategory] = useState<'all' | 'customer-service' | 'compliance' | 'leadership'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const handleSelectScenario = (id: string) => {
    setScenarios((prev) => prev.map((s) => ({ ...s, isSelected: s.id === id })))
    setSelectedScenarioId(id)
    // Update session details based on selected scenario
    const selected = scenarios.find((s) => s.id === id)
    if (selected) {
      setSessionDetails({
        ...defaultSessionDetails,
        scenarioId: id,
        title: selected.title,
      })
    }
  }

  const handleToneChange = (tone: 'Supportive' | 'Neutral' | 'Direct') => {
    setSessionDetails((prev) => ({ ...prev, tone }))
  }

  const handleBeginSession = () => {
    // Navigate to live session
    router.push(`/training-hub/session/${selectedScenarioId}/live`)
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    } else if (direction === 'next' && currentPage < 4) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <ScenarioSelectionHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow overflow-y-auto w-full p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
          {/* Left Column - Scenarios */}
          <div className="xl:col-span-8 flex flex-col h-full space-y-6">
            <CategoryFilters
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              currentPage={currentPage}
              totalPages={4}
              totalScenarios={12}
              showingCount={3}
              onPageChange={handlePageChange}
            />

            {/* Scenario Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 pb-6">
              {scenarios.map((scenario) => (
                <ScenarioSelectionCard key={scenario.id} scenario={scenario} onSelect={handleSelectScenario} />
              ))}
            </div>
          </div>

          {/* Right Column - Session Details */}
          <SessionDetailsPanel
            details={sessionDetails}
            onToneChange={handleToneChange}
            onBeginSession={handleBeginSession}
          />
        </div>
      </main>
    </div>
  )
}


