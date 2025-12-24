'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MultiAgenticReportHeader } from '@/components/dashboard/MultiAgenticReportHeader'
import { MultiAgenticExecutiveSummary } from '@/components/dashboard/MultiAgenticExecutiveSummary'
import { EmpathyAgentCard } from '@/components/dashboard/EmpathyAgentCard'
import { PolicyComplianceCard } from '@/components/dashboard/PolicyComplianceCard'
import { PacingCoachCard } from '@/components/dashboard/PacingCoachCard'
import { MultiAgenticAnnotatedTranscript, AnnotatedTranscriptEntry } from '@/components/dashboard/MultiAgenticAnnotatedTranscript'
import { MultiAgenticNextSteps } from '@/components/dashboard/MultiAgenticNextSteps'
import type { MultiAgenticReportData } from '@/lib/services/sessions/multiAgenticReportService'

interface MultiAgenticReportClientProps {
  userName: string
  sessionId: string
}

export function MultiAgenticReportClient({ userName, sessionId }: MultiAgenticReportClientProps) {
  const router = useRouter()
  const [reportData, setReportData] = useState<MultiAgenticReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/sessions/${sessionId}/agents`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found')
          } else {
            setError('Failed to load agent report')
          }
          return
        }

        const data = await response.json()
        setReportData(data)
      } catch (err) {
        console.error('Error fetching agent report:', err)
        setError('Failed to load agent report')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [sessionId])

  const handleRedoSession = useCallback(async () => {
    if (!reportData) return
    
    // Get scenario ID from session
    try {
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
  }, [router, sessionId, reportData])

  const handleTakeQuiz = useCallback(() => {
    router.push(`/training-hub/session/${sessionId}/live/assessment`)
  }, [router, sessionId])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-bm-light-grey overflow-hidden">
        <MultiAgenticReportHeader
          userName={userName}
          sessionTitle="Loading..."
          sessionDate=""
          sessionTime=""
          sessionNumber=""
        />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
            <p className="text-bm-text-secondary">Loading agent report...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="flex-1 flex flex-col bg-bm-light-grey overflow-hidden">
        <MultiAgenticReportHeader
          userName={userName}
          sessionTitle="Error"
          sessionDate=""
          sessionTime=""
          sessionNumber=""
        />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-bm-text-primary font-medium mb-2">{error || 'Report not found'}</p>
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

  // Transform transcript to match component interface
  const transcript: AnnotatedTranscriptEntry[] = reportData.transcript.map((t) => ({
    id: t.id,
    speaker: t.speaker,
    message: t.message,
    timestamp: t.timestamp,
    highlights: t.highlights,
  }))

  // Default resources (can be enhanced later)
  const resources = [
    {
      id: '1',
      title: 'Policy #304: Interest Rates',
      type: 'document' as const,
      duration: '5 mins read',
      icon: 'description',
    },
  ]
  title: 'High-Value Client Negotiation',
  date: 'Oct 24, 2023',
  time: '10:45 AM',
  sessionNumber: 'Scenario #241',
  overallScore: 92,
  rating: 'Exceptional!',
  description: 'Top 5% of branch managers',
  executiveSummary:
    "Ahmed, you demonstrated exceptional command over the negotiation process. Your ability to maintain a professional tone while navigating client objections was a standout strength. The system noted a high adherence to compliance protocols, though there was a minor friction point regarding fee disclosure timing. Your empathy scores peaked during the objection handling phase, which directly contributed to de-escalating the client's concerns about cost.",
  topStrength: 'Objection Handling',
  keyOpportunity: 'Active Listening',
  duration: '12m 45s (Optimal)',
  empathyAgent: {
    score: 88,
    findings: [
      { type: 'positive' as const, text: 'Strong validation of client concerns in the first 3 minutes.' },
      { type: 'warning' as const, text: 'Missed cue to empathize with "budget cuts" mention at 05:22.' },
    ],
    recommendation:
      'Practice active listening by paraphrasing client statements about financial constraints before pivoting to value proposition.',
    empathyChart: [40, 55, 70, 90, 60, 45, 75],
  },
  complianceAgent: {
    criticalAlerts: 1,
    findings: [
      { type: 'positive' as const, text: 'Correctly identified verification questions for high-value transaction.' },
      {
        type: 'critical' as const,
        text: '<strong>Critical:</strong> Discussed specific interest rates without the mandatory disclaimer (Policy #304).',
      },
    ],
    recommendation:
      "Review 'Interest Rate Disclosure Protocols' in the Knowledge Base. Always use the standard disclaimer before quoting rates.",
    adherenceMetrics: [
      { label: 'Mandatory Disclosures', current: 2, total: 3 },
      { label: 'Product Features', current: 5, total: 5 },
      { label: 'Closing Statement', current: 1, total: 1 },
    ],
  },
  pacingCoach: {
    status: 'Optimal',
    averageWPM: 145,
    description: 'You used effective pauses after key questions, allowing the client time to think.',
  },
  transcript: [
    {
      id: '1',
      speaker: 'user' as const,
      message: 'Good morning, Mr. Barakat. Thank you for taking the time to meet with me today regarding your account renewal.',
      timestamp: '00:15',
    },
    {
      id: '2',
      speaker: 'client' as const,
      message:
        "Morning Ahmed. Look, I'll be honest, I'm thinking of moving my business. Your fees are just too high compared to the offer from CIB.",
      timestamp: '00:22',
    },
    {
      id: '3',
      speaker: 'user' as const,
      message:
        'I see. Well, we have the best service in the market, so the fees reflect that quality.',
      timestamp: '00:35',
      highlights: [
        {
          text: 'Well, we have the best service in the market, so the fees reflect that quality.',
          type: 'empathy' as const,
          tooltip: 'Defensive response. Try: "I understand cost is a major factor for you right now."',
        },
      ],
    },
    {
      id: '4',
      speaker: 'client' as const,
      message: "Service is great, but my bottom line is suffering. I need to cut costs by 15% this quarter.",
      timestamp: '00:48',
    },
    {
      id: '5',
      speaker: 'user' as const,
      message: "Understood. We can actually offer you a preferential rate of 12.5% on the new credit line to help with that.",
      timestamp: '00:55',
      complianceAlert: 'Compliance Violation: Missing Disclosure',
    },
    {
      id: '6',
      speaker: 'user' as const,
      message:
        "However, let's look at the comprehensive value. Our package includes free international transfers, which you use frequently.",
      timestamp: '01:10',
      highlights: [
        {
          text: 'Our package includes free international transfers',
          type: 'positive' as const,
        },
      ],
    },
  ] as AnnotatedTranscriptEntry[],
  resources: [
    {
      id: '1',
      title: 'Policy #304: Interest Rates',
      type: 'document' as const,
      duration: '5 mins read',
      icon: 'description',
    },
    {
      id: '2',
      title: 'Mastering Empathy',
      type: 'video' as const,
      duration: '12 mins',
      icon: 'play_circle',
    },
  ],
}

  return (
    <div className="flex-1 flex flex-col bg-bm-light-grey overflow-hidden">
      <MultiAgenticReportHeader
        userName={userName}
        sessionTitle={reportData.title}
        sessionDate={reportData.date}
        sessionTime={reportData.time}
        sessionNumber={reportData.sessionNumber}
      />

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Executive Summary */}
          <MultiAgenticExecutiveSummary
            overallScore={reportData.overallScore}
            rating={reportData.rating}
            description={reportData.description}
            executiveSummary={reportData.executiveSummary}
            topStrength={reportData.topStrength}
            keyOpportunity={reportData.keyOpportunity}
            duration={reportData.duration}
          />

          {/* Agent Breakdown */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <h3 className="text-lg font-bold text-bm-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-bm-maroon">psychology</span>
                Agent Breakdown
              </h3>
              <div className="space-y-6">
                <EmpathyAgentCard
                  score={reportData.empathyAgent.score}
                  findings={reportData.empathyAgent.findings}
                  recommendation={reportData.empathyAgent.recommendation}
                  empathyChart={reportData.empathyAgent.empathyChart}
                />
                <PolicyComplianceCard
                  criticalAlerts={reportData.complianceAgent.criticalAlerts}
                  findings={reportData.complianceAgent.findings}
                  recommendation={reportData.complianceAgent.recommendation}
                  adherenceMetrics={reportData.complianceAgent.adherenceMetrics}
                />
                <PacingCoachCard
                  status={reportData.pacingCoach.status}
                  averageWPM={reportData.pacingCoach.averageWPM}
                  description={reportData.pacingCoach.description}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-8 flex flex-col">
              <MultiAgenticAnnotatedTranscript entries={transcript} />
              <MultiAgenticNextSteps
                onRedoSession={handleRedoSession}
                onTakeQuiz={handleTakeQuiz}
                resources={resources}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

