'use client'

import { useState } from 'react'
import { DevelopmentGoalsHeader } from '@/components/dashboard/DevelopmentGoalsHeader'
import { DefineNewGoalCard } from '@/components/dashboard/DefineNewGoalCard'
import { GoalCard } from '@/components/dashboard/GoalCard'
import { RecommendedTrainingPathCard } from '@/components/dashboard/RecommendedTrainingPathCard'
import { CompletedGoalsSection } from '@/components/dashboard/CompletedGoalsSection'

interface DevelopmentGoalsClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

const defaultGoals = [
  {
    id: '1',
    title: 'Advanced Negotiation',
    targetDate: 'Oct 30, 2023',
    description: 'Master complex negotiation tactics focusing on win-win outcomes in high-stakes corporate accounts.',
    progress: 72,
    aiInsight: 'Keep practicing the "Anchor & Adjust" technique. Your recent scores show a 12% improvement!',
    trend: [60, 65, 68, 70, 72],
    icon: 'handshake',
  },
  {
    id: '2',
    title: 'Customer Empathy',
    targetDate: 'Nov 15, 2023',
    description: 'Consistently demonstrate empathy in 90% of customer interactions, specifically handling complaints.',
    progress: 45,
    aiInsight: 'You tend to rush solutions. Try the "Pause & Validate" method in your next 3 scenarios.',
    trend: [40, 42, 43, 44, 45],
    icon: 'support_agent',
  },
]

const defaultTrainingModules = [
  {
    id: '1',
    type: 'scenario' as const,
    title: 'High-Stakes Negotiation',
    description: 'Practice anchoring techniques with a simulated corporate client.',
    duration: '15 min',
    difficulty: 'Advanced',
    isHighImpact: true,
  },
  {
    id: '2',
    type: 'micro-learning' as const,
    title: 'The Art of Active Listening',
    description: 'A quick interactive module on the 3 levels of listening.',
    duration: '5 min',
    difficulty: 'Intermediate',
  },
  {
    id: '3',
    type: 'drill' as const,
    title: 'Complaint Handling Drill',
    description: 'Rapid-fire responses to common customer complaints.',
    duration: '10 min',
    difficulty: 'All Levels',
  },
]

const defaultCompletedGoals = [
  { id: '1', title: 'Basic Compliance', completedDate: 'Feb 12' },
  { id: '2', title: 'Cross-Selling Intro', completedDate: 'Mar 20' },
  { id: '3', title: 'System Onboarding', completedDate: 'Jan 15' },
]

export function DevelopmentGoalsClient({ userName, userRole, userAvatar }: DevelopmentGoalsClientProps) {
  const [goals, setGoals] = useState(defaultGoals)

  const handleGenerateGoal = (goalText: string) => {
    console.log('Generating goal from:', goalText)
    // In a real app, this would call an API to generate a S.M.A.R.T. goal
  }

  const handleEditGoal = (id: string) => {
    console.log('Editing goal:', id)
  }

  const handleViewProgress = (id: string) => {
    console.log('Viewing progress for goal:', id)
  }

  const handleCustomizePath = () => {
    console.log('Customizing training path')
  }

  const handleStartModule = (id: string) => {
    console.log('Starting module:', id)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-bm-grey/50 to-transparent pointer-events-none"></div>
      <DevelopmentGoalsHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow p-8 overflow-y-auto custom-scrollbar max-w-[1600px] mx-auto w-full space-y-8">
        {/* Define New Goal */}
        <DefineNewGoalCard onGenerateGoal={handleGenerateGoal} />

        {/* Active Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animate-delay-100">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              {...goal}
              onEdit={handleEditGoal}
              onViewProgress={handleViewProgress}
            />
          ))}
        </div>

        {/* Recommended Training Path */}
        <RecommendedTrainingPathCard
          modules={defaultTrainingModules}
          onCustomizePath={handleCustomizePath}
          onStartModule={handleStartModule}
        />

        {/* Completed Goals */}
        <CompletedGoalsSection goals={defaultCompletedGoals} />
      </main>
    </div>
  )
}

