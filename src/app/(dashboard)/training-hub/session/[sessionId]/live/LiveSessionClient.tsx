'use client'

import { useRouter } from 'next/navigation'
import { LiveSessionHeader } from '@/components/dashboard/live-session/LiveSessionHeader'
import { ScenarioProgressBar } from '@/components/dashboard/live-session/ScenarioProgressBar'
import { RealTimeMetricsBar } from '@/components/dashboard/live-session/RealTimeMetricsBar'
import { ChatInterface, ChatMessageData } from '@/components/dashboard/live-session/ChatInterface'
import { ListeningPanel } from '@/components/dashboard/live-session/ListeningPanel'
import { BehavioralAnalysisCard } from '@/components/dashboard/live-session/BehavioralAnalysisCard'
import { SessionControls } from '@/components/dashboard/live-session/SessionControls'

interface LiveSessionClientProps {
  userName: string
  sessionId: string
}

// Hard-coded live session data
const defaultSessionData = {
  scenarioTitle: 'Performance Review Practice',
  currentTurn: 3,
  totalTurns: 10,
  metrics: {
    sentiment: 'positive' as const,
    pacing: 85,
    clarity: 92,
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
        "Excellent. That's a very specific and positive way to open. Now, how would you transition from this praise to setting new, collaborative goals with her?",
      timestamp: '10:33 AM',
      speakerName: 'AI Coach',
      aiSuggestion:
        'Try asking an open-ended question like: "Where do you see yourself taking these skills in the next quarter?"',
    },
  ] as ChatMessageData[],
  behavioralAnalysis: {
    empathy: 75,
    directness: 50,
  },
}

export function LiveSessionClient({ userName, sessionId }: LiveSessionClientProps) {
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

  const handleViewFullAnalytics = () => {
    router.push(`/training-hub/session/${sessionId}/agents`)
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-bm-grey/50 to-transparent pointer-events-none"></div>
      <LiveSessionHeader userName={userName} scenarioTitle={sessionData.scenarioTitle} />

      <main className="flex-grow overflow-y-auto flex flex-col w-full">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1920px] mx-auto">
            <div>
          <ScenarioProgressBar
            currentTurn={sessionData.currentTurn}
            totalTurns={sessionData.totalTurns}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-8 flex flex-col min-h-[600px] bg-white rounded-2xl shadow-card border border-bm-grey/60 relative overflow-hidden">
              <RealTimeMetricsBar
                sentiment={sessionData.metrics.sentiment}
                pacing={sessionData.metrics.pacing}
                clarity={sessionData.metrics.clarity}
              />

              <ChatInterface messages={sessionData.messages} />

              <SessionControls
                onRestartTurn={handleRestartTurn}
                onPause={handlePause}
                onEndSession={handleEndSession}
              />
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <ListeningPanel />
              <BehavioralAnalysisCard
                empathy={sessionData.behavioralAnalysis.empathy}
                directness={sessionData.behavioralAnalysis.directness}
                onViewFullAnalytics={handleViewFullAnalytics}
              />
            </div>
          </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}



