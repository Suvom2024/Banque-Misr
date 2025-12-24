'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DevelopmentGoalsHeader } from '@/components/dashboard/DevelopmentGoalsHeader'
import { DefineNewGoalCard } from '@/components/dashboard/DefineNewGoalCard'
import { GoalCard, Goal } from '@/components/dashboard/GoalCard'
import { RecommendedTrainingPathCard, TrainingModule } from '@/components/dashboard/RecommendedTrainingPathCard'
import { CompletedGoalsSection, CompletedGoal } from '@/components/dashboard/CompletedGoalsSection'
import type { DevelopmentGoal } from '@/lib/services/development-goals/goalsService'

interface DevelopmentGoalsClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

export function DevelopmentGoalsClient({ userName, userRole, userAvatar }: DevelopmentGoalsClientProps) {
  const router = useRouter()
  const [activeGoals, setActiveGoals] = useState<DevelopmentGoal[]>([])
  const [completedGoals, setCompletedGoals] = useState<DevelopmentGoal[]>([])
  const [recommendedModules, setRecommendedModules] = useState<TrainingModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setIsLoading(true)

      const [activeRes, completedRes] = await Promise.all([
        fetch('/api/development-goals?status=active'),
        fetch('/api/development-goals?status=completed'),
      ])

      const active = activeRes.ok ? await activeRes.json() : []
      const completed = completedRes.ok ? await completedRes.json() : []

      setActiveGoals(active)
      setCompletedGoals(completed)

      // Get recommended training path for first active goal
      if (active.length > 0) {
        fetchTrainingPath(active[0].id)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTrainingPath = async (goalId: string) => {
    try {
      const response = await fetch(`/api/development-goals/${goalId}/training-path`)
      if (response.ok) {
        const modules = await response.json()
        setRecommendedModules(modules)
      }
    } catch (error) {
      console.error('Error fetching training path:', error)
    }
  }

  const handleGenerateGoal = useCallback(async (goalText: string) => {
    if (!goalText.trim()) {
      toast.error('Please enter a goal description')
      return
    }

    try {
      setIsGenerating(true)

      const response = await fetch('/api/development-goals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalText }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate goal')
      }

      const newGoal = await response.json()
      setActiveGoals((prev) => [newGoal, ...prev])
      toast.success('Goal created successfully!')
      
      // Fetch training path for new goal
      fetchTrainingPath(newGoal.id)
    } catch (error) {
      console.error('Error generating goal:', error)
      toast.error('Failed to generate goal. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleEditGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch(`/api/development-goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchGoals()
        toast.success('Goal updated successfully!')
      } else {
        throw new Error('Failed to update goal')
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      toast.error('Failed to update goal')
    }
  }, [])

  const handleViewProgress = useCallback((id: string) => {
    router.push(`/training-hub?goal=${id}`)
  }, [router])

  const handleDeleteGoal = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return
    }

    try {
      const response = await fetch(`/api/development-goals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchGoals()
        toast.success('Goal deleted successfully!')
      } else {
        throw new Error('Failed to delete goal')
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Failed to delete goal')
    }
  }, [])

  const handleCustomizePath = useCallback(() => {
    router.push('/training-hub')
  }, [router])

  const handleStartModule = useCallback(async (module: TrainingModule) => {
    if (module.type === 'scenario' && module.scenarioId) {
      try {
        const response = await fetch('/api/training-hub/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId: module.scenarioId }),
        })

        if (response.ok) {
          const session = await response.json()
          router.push(`/training-hub/session/${session.id}/live`)
        } else {
          throw new Error('Failed to start scenario')
        }
      } catch (error) {
        console.error('Error starting module:', error)
        toast.error('Failed to start module')
      }
    } else {
      toast.info('This module type is coming soon!')
    }
  }, [router])

  // Transform DevelopmentGoal to Goal format
  const transformGoal = (goal: DevelopmentGoal): Goal => ({
    id: goal.id,
    title: goal.title,
    description: goal.description || '',
    targetDate: goal.targetDate || '',
    progress: goal.progress,
    status: goal.status,
    aiInsight: goal.aiInsight || '',
    trend: goal.trend,
    icon: goal.icon || undefined,
  })

  // Transform completed goals
  const transformedCompletedGoals: CompletedGoal[] = completedGoals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    completedDate: goal.updatedAt ? new Date(goal.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
  }))

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <DevelopmentGoalsHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />
        <main className="flex-grow overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
            <p className="text-bm-text-secondary">Loading goals...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-bm-grey/50 to-transparent pointer-events-none"></div>
      <DevelopmentGoalsHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow overflow-y-auto custom-scrollbar w-full">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Define New Goal */}
            <DefineNewGoalCard onGenerateGoal={handleGenerateGoal} />

            {/* Active Goals */}
            {activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animate-delay-100">
                {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                    {...transformGoal(goal)}
                    onEdit={(id) => handleEditGoal(id, {})}
                  onViewProgress={handleViewProgress}
                />
              ))}
            </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-card border border-white">
                <span className="material-symbols-outlined text-6xl text-bm-text-subtle mb-4">flag</span>
                <p className="text-bm-text-secondary font-medium">No active goals yet</p>
                <p className="text-sm text-bm-text-subtle mt-2">Create your first goal above to get started!</p>
              </div>
            )}

            {/* Recommended Training Path */}
            {recommendedModules.length > 0 && (
            <RecommendedTrainingPathCard
                modules={recommendedModules}
              onCustomizePath={handleCustomizePath}
              onStartModule={handleStartModule}
            />
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <CompletedGoalsSection goals={transformedCompletedGoals} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
