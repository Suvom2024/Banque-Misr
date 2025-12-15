'use client'

import { SessionReportHeader } from '@/components/dashboard/SessionReportHeader'
import { AIExecutiveSummary } from '@/components/dashboard/AIExecutiveSummary'
import { CompetencyBreakdown, Competency } from '@/components/dashboard/CompetencyBreakdown'
import { RecommendedCoaching, CoachingRecommendation } from '@/components/dashboard/RecommendedCoaching'
import { PreviousBestComparison, ComparisonMetric } from '@/components/dashboard/PreviousBestComparison'
import { ConversationTranscript, TranscriptMessage } from '@/components/dashboard/ConversationTranscript'
import { SessionActionButtons } from '@/components/dashboard/SessionActionButtons'

interface SessionReportClientProps {
  userName: string
  sessionId: string
}

// Hard-coded session data
const defaultSessionData = {
  title: 'Performance Review Practice',
  overallScore: 85,
  trend: '+5% vs Last',
  aiSummary:
    "You demonstrated exceptional empathy and rapport building. Your ability to acknowledge the employee's feelings created a safe environment for feedback. While your clarity was strong, focusing on objection handling techniques like the A-R-C model will refine your approach to resistance.",
  competencies: [
    {
      id: '1',
      name: 'Empathy',
      icon: 'favorite',
      score: 92,
      feedback: 'Consistently validated feelings using phrases like "I understand why..."',
      feedbackType: 'positive' as const,
    },
    {
      id: '2',
      name: 'Clarity',
      icon: 'record_voice_over',
      score: 88,
      feedback: 'Instructions were direct. Minimal filler words used.',
      feedbackType: 'positive' as const,
    },
    {
      id: '3',
      name: 'Objection Handling',
      icon: 'psychology_alt',
      score: 65,
      feedback: 'Avoid dismissing concerns immediately. Pause before responding.',
      feedbackType: 'neutral' as const,
    },
    {
      id: '4',
      name: 'Rapport Building',
      icon: 'handshake',
      score: 95,
      feedback: "Opened with genuine interest in the employee's project status.",
      feedbackType: 'positive' as const,
    },
  ] as Competency[],
  recommendedCoaching: [
    {
      id: '1',
      title: 'Collaborative Goal Setting',
      description: 'You jumped to solutions quickly. Practice asking "What do you think creates a solution?" to engage the employee.',
      actionType: 'scenario' as const,
      actionLabel: 'Start Scenario',
    },
    {
      id: '2',
      title: 'The A-R-C Method',
      description: 'Learn the Acknowledge, Respond, Confirm framework to handle objections gracefully.',
      actionType: 'resource' as const,
      actionLabel: 'View Resource',
    },
  ] as CoachingRecommendation[],
  previousBest: [
    {
      name: 'Overall Score',
      current: 85,
      previous: 78,
      change: 7,
      changeType: 'increase' as const,
    },
    {
      name: 'Empathy',
      current: 92,
      previous: 87,
      change: 5,
      changeType: 'increase' as const,
    },
    {
      name: 'Objection Handling',
      current: 65,
      previous: 68,
      change: 3,
      changeType: 'decrease' as const,
    },
  ] as ComparisonMetric[],
  transcript: [
    {
      id: '1',
      speaker: 'ai-coach',
      speakerLabel: 'AI Coach (Intro)',
      timestamp: '00:05',
      message:
        "Let's begin. Imagine Maria just expressed frustration about her workload. How do you respond to acknowledge her feelings without overcommitting?",
    },
    {
      id: '2',
      speaker: 'user',
      speakerLabel: 'You',
      timestamp: '00:15',
      message:
        "Maria, I hear you. It sounds like the current project timeline is putting a lot of pressure on you, and I appreciate you being honest about it.",
      feedback: {
        type: 'strength' as const,
        text: 'Excellent validation technique.',
      },
      audioAvailable: true,
    },
    {
      id: '3',
      speaker: 'user',
      speakerLabel: 'You',
      timestamp: '00:42',
      message: "Maybe we can just move the deadline. I'll tell the client tomorrow.",
      feedback: {
        type: 'coaching' as const,
        text: 'Too quick to solve. Explore options with her first.',
      },
      audioAvailable: true,
    },
  ] as TranscriptMessage[],
}

export function SessionReportClient({ userName, sessionId }: SessionReportClientProps) {
  const sessionData = defaultSessionData

  const handleViewFullMetrics = () => {
    // Handle view full metrics
    console.log('View full metrics')
  }

  const handleStartScenario = (id: string) => {
    // Handle start scenario
    console.log('Start scenario:', id)
  }

  const handleViewResource = (id: string) => {
    // Handle view resource
    console.log('View resource:', id)
  }

  const handleRedoSession = () => {
    // Handle redo session
    console.log('Redo session')
  }

  const handleSetGoal = () => {
    // Handle set goal
    console.log('Set goal')
  }

  const handleExploreScenarios = () => {
    // Handle explore scenarios
    console.log('Explore scenarios')
  }

  const handleShareReport = () => {
    // Handle share report
    console.log('Share report')
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bm-light-grey">
      <SessionReportHeader userName={userName} sessionTitle={sessionData.title} />

      <main className="flex-grow overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* AI Executive Summary */}
            <AIExecutiveSummary
              overallScore={sessionData.overallScore}
              trend={sessionData.trend}
              aiSummary={sessionData.aiSummary}
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
      </main>
    </div>
  )
}

