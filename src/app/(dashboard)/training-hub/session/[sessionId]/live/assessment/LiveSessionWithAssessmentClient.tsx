'use client'

import { useRouter } from 'next/navigation'
import { LiveSessionHeader } from '@/components/dashboard/live-session/LiveSessionHeader'
import { ScenarioProgressBar } from '@/components/dashboard/live-session/ScenarioProgressBar'
import { RealTimeMetricsBar } from '@/components/dashboard/live-session/RealTimeMetricsBar'
import { ChatInterface, ChatMessageData } from '@/components/dashboard/live-session/ChatInterface'
import { AssessmentActiveIndicator } from '@/components/dashboard/live-session/AssessmentActiveIndicator'
import { LiveAssessmentPanel } from '@/components/dashboard/live-session/LiveAssessmentPanel'
import { BehavioralAnalysisCard } from '@/components/dashboard/live-session/BehavioralAnalysisCard'
import { SessionControls } from '@/components/dashboard/live-session/SessionControls'

interface LiveSessionWithAssessmentClientProps {
  userName: string
  sessionId: string
}

// Hard-coded session data with assessment
const defaultSessionData = {
  scenarioTitle: 'Performance Review Practice',
  currentTurn: 3,
  totalTurns: 10,
  isQuizActive: true,
  quizNumber: 1,
  totalQuizzes: 2,
  metrics: {
    sentiment: 'positive' as const,
    pacing: 85,
    clarity: 92,
    quizScore: -1,
  },
  messages: [
    {
      id: '1',
      speaker: 'ai' as const,
      message:
        "Great start, Ahmed. Now, let's talk about Maria. She's shown significant improvement in her project management skills this past quarter. How would you begin acknowledging her growth?",
      timestamp: '10:31 AM',
      speakerName: 'AI Coach',
    },
    {
      id: '2',
      speaker: 'user' as const,
      message:
        '"Maria, I\'ve been really impressed with your work lately, especially on the recent Alpha project. Your planning and execution were top-notch."',
      timestamp: '10:32 AM',
      status: 'read' as const,
    },
    {
      id: '3',
      speaker: 'ai' as const,
      message:
        "Excellent specific praise. Now, before we move to goal setting, I'm detecting a potential hesitation in Maria's file history regarding taking on leadership roles. \n\nI've paused the simulation for a quick assessment on how to handle this. Please see the panel on the right.",
      timestamp: '10:33 AM',
      speakerName: 'AI Coach',
    },
  ] as ChatMessageData[],
  assessment: {
    question:
      "Based on Maria's file, she tends to withdraw when pushed into leadership. What is the most effective psychological approach to encourage her without triggering defense?",
    options: [
      {
        id: '1',
        text: "Directly assign her a team lead role for next month to show confidence.",
        isCorrect: false,
      },
      {
        id: '2',
        text: 'Ask her to mentor a junior peer first, framing it as sharing her expertise.',
        isCorrect: true,
      },
      {
        id: '3',
        text: "Ignore the history and treat it as a fresh start.",
        isCorrect: false,
      },
    ],
    timeLimit: 45,
    hint: "Recall the 'Gradual Exposure' technique discussed in Module 2. Small steps reduce anxiety.",
  },
  behavioralAnalysis: {
    empathy: 75,
    directness: 50,
  },
}

export function LiveSessionWithAssessmentClient({ userName, sessionId }: LiveSessionWithAssessmentClientProps) {
  const router = useRouter()
  const sessionData = defaultSessionData

  const handleRestartTurn = () => {
    console.log('Restart turn')
  }

  const handlePause = () => {
    console.log('Pause session')
  }

  const handleEndSession = () => {
    router.push(`/training-hub/session/${sessionId}`)
  }

  const handleSubmitAssessment = (selectedOptionId: string) => {
    console.log('Submit assessment:', selectedOptionId)
    // In a real app, this would submit the answer and continue the session
  }

  const handleViewFullAnalytics = () => {
    router.push(`/training-hub/session/${sessionId}/agents`)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-bm-grey/50 to-transparent pointer-events-none"></div>
      <LiveSessionHeader userName={userName} scenarioTitle={sessionData.scenarioTitle} />

      <main className="flex-grow overflow-y-auto flex flex-col max-w-[1920px] mx-auto w-full">
        <div className="p-6 pb-2">
          <ScenarioProgressBar
            currentTurn={sessionData.currentTurn}
            totalTurns={sessionData.totalTurns}
            isQuizActive={sessionData.isQuizActive}
            quizNumber={sessionData.quizNumber}
            totalQuizzes={sessionData.totalQuizzes}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
            {/* Main Chat Area */}
            <div className="lg:col-span-8 flex flex-col min-h-[600px] bg-white rounded-2xl shadow-card border border-bm-grey/60 relative overflow-hidden">
              <RealTimeMetricsBar
                sentiment={sessionData.metrics.sentiment}
                pacing={sessionData.metrics.pacing}
                clarity={sessionData.metrics.clarity}
                quizScore={sessionData.metrics.quizScore}
              />

              <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gradient-to-b from-bm-light-grey/30 to-white relative">
                <ChatInterface messages={sessionData.messages} />
                <AssessmentActiveIndicator />
              </div>

              <SessionControls
                onRestartTurn={handleRestartTurn}
                onPause={handlePause}
                onEndSession={handleEndSession}
                isRestartDisabled={true}
              />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <LiveAssessmentPanel
                question={sessionData.assessment.question}
                options={sessionData.assessment.options}
                timeLimit={sessionData.assessment.timeLimit}
                hint={sessionData.assessment.hint}
                onSubmit={handleSubmitAssessment}
              />
              <BehavioralAnalysisCard
                empathy={sessionData.behavioralAnalysis.empathy}
                directness={sessionData.behavioralAnalysis.directness}
                onViewFullAnalytics={handleViewFullAnalytics}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



