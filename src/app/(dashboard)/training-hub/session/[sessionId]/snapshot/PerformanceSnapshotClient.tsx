'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PerformanceSnapshotHeader } from '@/components/dashboard/PerformanceSnapshotHeader'
import { AIAnalysisCard } from '@/components/dashboard/AIAnalysisCard'
import { TopStrengthCard } from '@/components/dashboard/TopStrengthCard'
import { AhaMomentCard } from '@/components/dashboard/AhaMomentCard'
import { AssessmentResultsCard } from '@/components/dashboard/AssessmentResultsCard'
import { SkillTrendAnalysisCard } from '@/components/dashboard/SkillTrendAnalysisCard'
import { PersonalizedGrowthPathCard } from '@/components/dashboard/PersonalizedGrowthPathCard'
import type { PerformanceSnapshotData } from '@/lib/services/sessions/performanceSnapshotService'

interface PerformanceSnapshotClientProps {
  userName: string
  sessionId: string
}

export function PerformanceSnapshotClient({ userName, sessionId }: PerformanceSnapshotClientProps) {
  const router = useRouter()
  const [snapshotData, setSnapshotData] = useState<PerformanceSnapshotData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSnapshotData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/sessions/${sessionId}/snapshot`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found')
          } else {
            setError('Failed to load snapshot data')
          }
          return
        }

        const data = await response.json()
        setSnapshotData(data)
      } catch (err) {
        console.error('Error fetching snapshot data:', err)
        setError('Failed to load snapshot data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSnapshotData()
  }, [sessionId])

  const handleShareReport = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Performance Snapshot: ${snapshotData?.sessionTitle}`,
        text: `Check out my performance snapshot!`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href)
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [snapshotData])

  const handleAddReflection = useCallback(() => {
    console.log('Add reflection:', sessionId)
    // TODO: Implement reflection feature
  }, [sessionId])

  const handleReviewAnswers = useCallback(() => {
    router.push(`/training-hub/session/${sessionId}/review`)
  }, [router, sessionId])

  const handleTimePeriodChange = useCallback((period: string) => {
    console.log('Time period changed:', period)
    // TODO: Refetch data with new period
  }, [])

  const handleStartAction = useCallback(async (id: string, type: string) => {
    if (type === 'scenario') {
      // Extract scenario ID from path ID
      const scenarioId = id.replace('path-', '')
      try {
        const response = await fetch('/api/training-hub/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId }),
        })
        if (response.ok) {
          const session = await response.json()
          router.push(`/training-hub/session/${session.id}/live`)
        }
      } catch (error) {
        console.error('Error starting scenario:', error)
      }
    } else {
      console.log('Start action:', id, type)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <PerformanceSnapshotHeader userName={userName} sessionId={sessionId} />
        <main className="flex-grow p-6 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
            <p className="text-bm-text-secondary">Loading performance snapshot...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !snapshotData) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <PerformanceSnapshotHeader userName={userName} sessionId={sessionId} />
        <main className="flex-grow p-6 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-bm-text-primary font-medium mb-2">{error || 'Snapshot not found'}</p>
            <button
              onClick={() => router.push(`/training-hub/session/${sessionId}`)}
              className="mt-4 px-4 py-2 bg-bm-maroon text-white rounded-lg hover:bg-bm-maroon-dark transition-colors"
            >
              Back to Session Report
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-bm-grey/50 to-transparent pointer-events-none"></div>
      <PerformanceSnapshotHeader userName={userName} sessionId={sessionId} />

      <main className="flex-grow p-6 overflow-y-auto custom-scrollbar max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-fade-in-up">
          {/* AI Analysis Card */}
          <AIAnalysisCard
            userName={userName}
            grade={snapshotData.grade}
            message={snapshotData.aiMessage}
            currentGoal={snapshotData.currentGoal}
          />

          {/* Top Strength and Aha Moment */}
          <div className="space-y-3 lg:col-span-1 flex flex-col h-full">
            {snapshotData.topStrength && <TopStrengthCard {...snapshotData.topStrength} />}
            {snapshotData.ahaMoment && <AhaMomentCard {...snapshotData.ahaMoment} />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-fade-in-up animate-delay-100">
          {/* Assessment Results */}
          {snapshotData.assessmentResults && (
            <AssessmentResultsCard
              {...snapshotData.assessmentResults}
              onReviewAnswers={handleReviewAnswers}
            />
          )}

          {/* Skill Trend Analysis */}
          <SkillTrendAnalysisCard
            skills={snapshotData.skillTrends}
            onTimePeriodChange={handleTimePeriodChange}
          />
        </div>

        {/* Personalized Growth Path */}
        <PersonalizedGrowthPathCard items={snapshotData.growthPath} onStartAction={handleStartAction} />

        {/* Link to Development Goals */}
        <div className="mt-6 animate-fade-in-up animate-delay-300">
          <Link
            href="/development-goals"
            className="bg-white border-2 border-bm-gold rounded-xl p-4 hover:bg-bm-gold/5 transition-all flex items-center justify-center gap-2 text-bm-maroon font-bold group shadow-card text-xs"
          >
            <span className="material-symbols-outlined text-lg">flag</span>
            <span>View Development Goals</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

