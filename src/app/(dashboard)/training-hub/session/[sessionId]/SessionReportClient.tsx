'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SessionReportHeader } from '@/components/dashboard/SessionReportHeader'
import { AIExecutiveSummary } from '@/components/dashboard/AIExecutiveSummary'
import { CompetencyBreakdown, Competency } from '@/components/dashboard/CompetencyBreakdown'
import { RecommendedCoaching, CoachingRecommendation } from '@/components/dashboard/RecommendedCoaching'
import { PreviousBestComparison, ComparisonMetric } from '@/components/dashboard/PreviousBestComparison'
import { ConversationTranscript, TranscriptMessage } from '@/components/dashboard/ConversationTranscript'
import { SessionActionButtons } from '@/components/dashboard/SessionActionButtons'
import type { SessionReportData } from '@/lib/services/sessions/sessionReportService'

interface SessionReportClientProps {
  userName: string
  sessionId: string
}

export function SessionReportClient({ userName, sessionId }: SessionReportClientProps) {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/sessions/${sessionId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found')
          } else {
            setError('Failed to load session data')
          }
          return
        }

        const data = await response.json()
        setSessionData(data)
      } catch (err) {
        console.error('Error fetching session data:', err)
        setError('Failed to load session data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  const handleViewFullMetrics = useCallback(() => {
    router.push(`/training-hub/session/${sessionId}/snapshot`)
  }, [router, sessionId])

  const handleStartScenario = useCallback(async (scenarioId: string) => {
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
  }, [router])

  const handleViewResource = useCallback((id: string) => {
    console.log('View resource:', id)
    // TODO: Implement resource viewing
  }, [])

  const handleRedoSession = useCallback(async () => {
    if (!sessionData) return
    
    try {
      const response = await fetch('/api/training-hub/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: sessionData.scenarioId }),
      })

      if (response.ok) {
        const session = await response.json()
        router.push(`/training-hub/session/${session.id}/live`)
      }
    } catch (error) {
      console.error('Error redoing session:', error)
    }
  }, [router, sessionData])

  const handleSetGoal = useCallback(() => {
    router.push('/development-goals')
  }, [router])

  const handleExploreScenarios = useCallback(() => {
    router.push('/training-hub')
  }, [router])

  const handleShareReport = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Session Report: ${sessionData?.scenarioTitle}`,
        text: `Check out my training session results!`,
        url: window.location.href,
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href)
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }, [sessionData])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
        <SessionReportHeader userName={userName} sessionTitle="Loading..." />
        <main className="flex-grow overflow-y-auto w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
            <p className="text-bm-text-secondary">Loading session report...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
        <SessionReportHeader userName={userName} sessionTitle="Error" />
        <main className="flex-grow overflow-y-auto w-full flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-bm-text-primary font-medium mb-2">{error || 'Session not found'}</p>
            <button
              onClick={() => router.push('/training-hub')}
              className="mt-4 px-4 py-2 bg-bm-maroon text-white rounded-lg hover:bg-bm-maroon-dark transition-colors"
            >
              Back to Training Hub
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <SessionReportHeader userName={userName} sessionTitle={sessionData.scenarioTitle} />

      <main className="flex-grow overflow-y-auto w-full">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* AI Executive Summary */}
            <AIExecutiveSummary
              overallScore={sessionData.overallScore}
              trend={sessionData.trend || ''}
              aiSummary={sessionData.aiSummary || ''}
            />

            {/* Competency Breakdown */}
            <CompetencyBreakdown
              competencies={sessionData.competencies}
              onViewFullMetrics={handleViewFullMetrics}
            />

            {/* Conversation Transcript */}
            <ConversationTranscript messages={sessionData.transcript} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Recommended Coaching */}
            <RecommendedCoaching
              recommendations={sessionData.recommendedCoaching}
              onStartScenario={handleStartScenario}
              onViewResource={handleViewResource}
            />

            {/* Previous Best Comparison */}
            <PreviousBestComparison metrics={sessionData.previousBest} />

            {/* Action Buttons */}
            <SessionActionButtons
              sessionId={sessionId}
              onRedoSession={handleRedoSession}
              onSetGoal={handleSetGoal}
              onExploreScenarios={handleExploreScenarios}
              onShareReport={handleShareReport}
            />
          </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

