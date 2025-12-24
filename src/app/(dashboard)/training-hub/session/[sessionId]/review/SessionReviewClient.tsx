'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SessionReviewHeader } from '@/components/dashboard/SessionReviewHeader'
import { SessionPlayback } from '@/components/dashboard/SessionPlayback'
import { ExecutiveSummaryCard } from '@/components/dashboard/ExecutiveSummaryCard'
import { PersonalBestCard, PersonalBestMetric } from '@/components/dashboard/PersonalBestCard'
import { DetailedCompetencyAnalysis, DetailedCompetency } from '@/components/dashboard/DetailedCompetencyAnalysis'
import { ConversationTranscriptReview, TranscriptEntry } from '@/components/dashboard/ConversationTranscriptReview'
import { AICoachingReview, AICoachingRecommendation } from '@/components/dashboard/AICoachingReview'
import { ManagerFeedback, ManagerComment } from '@/components/dashboard/ManagerFeedback'
import type { SessionReviewData } from '@/lib/services/sessions/sessionReviewService'

interface SessionReviewClientProps {
  userName: string
  sessionId: string
}

export function SessionReviewClient({ userName, sessionId }: SessionReviewClientProps) {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionReviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/sessions/${sessionId}/review`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found')
          } else {
            setError('Failed to load review data')
          }
          return
        }

        const data = await response.json()
        setSessionData(data)
      } catch (err) {
        console.error('Error fetching review data:', err)
        setError('Failed to load review data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviewData()
  }, [sessionId])

  const handleRedoSession = useCallback(async () => {
    try {
      // Get session to find scenarioId
      const sessionResponse = await fetch(`/api/sessions/${sessionId}`)
      if (sessionResponse.ok) {
        const session = await sessionResponse.json()
        const createResponse = await fetch('/api/training-hub/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId: session.scenarioId }),
        })

        if (createResponse.ok) {
          const newSession = await createResponse.json()
          router.push(`/training-hub/session/${newSession.id}/live`)
        }
      }
    } catch (error) {
      console.error('Error redoing session:', error)
    }
  }, [router, sessionId])

  const handleSetGoal = useCallback(() => {
    router.push('/development-goals')
  }, [router])

  const handleViewHistory = useCallback(() => {
    router.push(`/training-hub/session/${sessionId}/snapshot`)
  }, [router, sessionId])

  const handleStartDrill = useCallback((id: string) => {
    console.log('Start drill:', id)
    // TODO: Implement drill functionality
  }, [])

  const handleViewResource = useCallback((id: string) => {
    console.log('View resource:', id)
    // TODO: Implement resource viewing
  }, [])

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return time.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
        <SessionReviewHeader userName={userName} sessionTitle="Loading..." />
        <main className="flex-grow overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
            <p className="text-bm-text-secondary">Loading session review...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
        <SessionReviewHeader userName={userName} sessionTitle="Error" />
        <main className="flex-grow overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-bm-text-primary font-medium mb-2">{error || 'Review not found'}</p>
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

  // Transform manager feedback to match component interface
  const managerFeedback: ManagerComment[] = sessionData.managerFeedback.map((f) => ({
    id: f.id,
    managerName: f.managerName,
    comment: f.comment,
    timestamp: formatTimeAgo(f.createdAt),
  }))

  // Transform AI coaching to match component interface
  const aiCoaching: AICoachingRecommendation[] = sessionData.aiCoaching.map((c) => ({
    id: c.id,
    icon: 'lightbulb',
    title: c.title,
    description: c.description,
    actionType: 'drill' as const,
    actionLabel: 'Start Micro-Drill',
  }))

  // Transform transcript to match component interface
  const transcript: TranscriptEntry[] = sessionData.transcript.map((t) => ({
    id: t.id,
    speaker: t.speaker,
    speakerName: t.speakerName,
    message: t.message,
  }))
  title: 'High-Value Negotiation',
  date: 'Oct 24, 2023',
  time: '14:30 PM',
  duration: '05:42 Total',
  overallScore: 85,
  trend: '+12% vs Last Session',
  executiveSummary:
    "Impressive progress, Ahmed. The AI analysis indicates you've significantly improved your empathy markers during objection handling. While your tone remained professional, there were moments where pacing accelerated under pressure. Focusing on pause utilization will push this score into the 90s.",
  keyTakeaways: ['Strong Tone', 'Clear Articulation', 'Pace Regulation Needed'],
  personalBest: {
    sessionNumber: 'Session #42',
    metrics: [
      {
        name: 'Overall Score',
        current: 85,
        change: 2,
        changeType: 'increase' as const,
      },
      {
        name: 'Tone Control',
        current: 92,
        change: 5,
        changeType: 'increase' as const,
      },
      {
        name: 'Pacing',
        current: 65,
        change: 8,
        changeType: 'decrease' as const,
      },
    ] as PersonalBestMetric[],
  },
  competencies: [
    {
      id: '1',
      name: 'Tone',
      subtitle: 'Confidence & Warmth',
      score: 92,
      feedback: 'Maintained calm authority during client pushback.',
      scoreType: 'green' as const,
    },
    {
      id: '2',
      name: 'Clarity',
      subtitle: 'Articulation & Structure',
      score: 88,
      feedback: 'Explained value proposition without jargon.',
      scoreType: 'green' as const,
    },
    {
      id: '3',
      name: 'Empathy',
      subtitle: 'Active Listening',
      score: 75,
      feedback: 'Opportunity to validate feelings before solving.',
      scoreType: 'yellow' as const,
    },
    {
      id: '4',
      name: 'Pace',
      subtitle: 'Speed & Pausing',
      score: 60,
      feedback: 'Spoke >180wpm during price negotiation.',
      scoreType: 'red' as const,
    },
  ] as DetailedCompetency[],
  transcript: [
    {
      id: '1',
      speaker: 'user',
      speakerName: 'Ahmed Hassan',
      message: 'Good morning. Thank you for making the time. I wanted to discuss the renewal of our service agreement.',
    },
    {
      id: '2',
      speaker: 'client',
      speakerName: 'Client',
      message:
        "Good morning. Yes, about that. We've received a competitive offer from another provider, and I must say it's quite compelling.",
    },
    {
      id: '3',
      speaker: 'user',
      speakerName: 'Ahmed Hassan',
      message:
        'I understand. We value your partnership immensely, and I\'m confident we can find a solution that works for you. Could you tell me more about what aspects of their offer are most attractive?',
      highlights: [
        {
          type: 'positive',
          text: 'We value your partnership immensely, and I\'m confident we can find a solution that works for you.',
          tooltip: 'Great validation',
        },
      ],
    },
    {
      id: '4',
      speaker: 'client',
      speakerName: 'Client',
      message: "Mainly the price. It's about 15% lower than our current rate.",
    },
    {
      id: '5',
      speaker: 'user',
      speakerName: 'Ahmed Hassan',
      message:
        "I see. While I can't just match that price, what I can do is review the value we provide. Our dedicated support and proven uptime are industry-leading.",
      highlights: [
        {
          type: 'improvement',
          text: "While I can't just match that price, what I can do is review the value we provide.",
          tooltip: 'Avoid abrupt transitions',
        },
      ],
    },
  ] as TranscriptEntry[],
  aiCoaching: [
    {
      id: '1',
      icon: 'speed',
      title: 'Pace Regulation',
      description: 'Your speech speed spiked to 190wpm when discussing price. Slower speech signals confidence.',
      actionType: 'drill' as const,
      actionLabel: 'Start Micro-Drill',
    },
    {
      id: '2',
      icon: 'handshake',
      title: 'Objection Pivots',
      description: 'Practice the "Feel, Felt, Found" method to smooth out price rejections.',
      actionType: 'resource' as const,
      actionLabel: 'View Resource',
    },
  ] as AICoachingRecommendation[],
  managerFeedback: [
    {
      id: '1',
      managerName: 'Fatma Ali',
      managerAvatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCdv6KtYTA2AQT-VVfbXqQ4-agFKa8wer2pojJU5TQv3vOfe2H3L-avZB2Q2yXgcpFaDkwhVqpf46aUkoZDh0fdaDfWZHEpvtoc954OAJXia__r7NHQadj_d9yG_lRBWIFn3JbewfsAM8IoD5YWb1Nvy552LT-A6OFSu9lIKQPgaSdd17Efv6IoMzlLZDKxoFBP-qcEuQpzPoRLu-28fTa1DTKmWwDHPr8A4XLdIE81NhTUGglpTJy9qirvza-362Gd0FFnTLZVJdQ',
      comment: "Great recovery on the value prop! Just watch the speed when you get excited.",
      timestamp: '2h ago',
    },
  ] as ManagerComment[],
}

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <SessionReviewHeader userName={userName} sessionTitle={sessionData.title} />

      <main className="flex-grow overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8 pb-20">
        {/* Session Playback */}
        <div className="space-y-4">
          <SessionPlayback
            date={sessionData.date}
            time={sessionData.time}
            duration={sessionData.duration}
            onRedoSession={handleRedoSession}
            onSetGoal={handleSetGoal}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href={`/training-hub/session/${sessionId}/snapshot`}
              className="bg-bm-maroon text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-bm-maroon-dark hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">insights</span>
              Performance Snapshot
            </Link>
            <Link
              href={`/training-hub/session/${sessionId}/agents`}
              className="bg-bm-maroon-dark text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-bm-maroon hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">psychology</span>
              Agent Breakdown
            </Link>
          </div>
        </div>

        {/* Executive Summary and Personal Best */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExecutiveSummaryCard
              overallScore={sessionData.overallScore}
              trend={sessionData.trend}
              executiveSummary={sessionData.executiveSummary}
              keyTakeaways={sessionData.keyTakeaways}
            />
          </div>
          <div className="lg:col-span-1">
            <PersonalBestCard
              sessionNumber={sessionData.personalBest.sessionNumber}
              metrics={sessionData.personalBest.metrics}
              onViewHistory={handleViewHistory}
            />
          </div>
        </div>

        {/* Detailed Competency Analysis */}
        <DetailedCompetencyAnalysis competencies={sessionData.competencies} />

        {/* Transcript and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConversationTranscriptReview entries={transcript} userInitials="AH" />
          </div>
          <div className="space-y-6">
            <AICoachingReview
              recommendations={aiCoaching}
              onStartDrill={handleStartDrill}
              onViewResource={handleViewResource}
            />
            <ManagerFeedback comments={managerFeedback} />
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}

