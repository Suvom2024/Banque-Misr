'use client'

import { useRouter } from 'next/navigation'
import { LiveSessionHeader } from '@/components/dashboard/live-session/LiveSessionHeader'
import { ScenarioProgressBar } from '@/components/dashboard/live-session/ScenarioProgressBar'
import { ChatMessage } from '@/components/dashboard/live-session/ChatMessage'
import { CircularListeningVisualization } from '@/components/dashboard/live-session/CircularListeningVisualization'
import { MultiAgentFeedbackSidebar } from '@/components/dashboard/live-session/MultiAgentFeedbackSidebar'
import { AgentAssistPanel } from '@/components/dashboard/live-session/AgentAssistPanel'

interface MultiAgenticCoachingClientProps {
  userName: string
  sessionId: string
}

// Hard-coded multi-agentic coaching data
const defaultSessionData = {
  scenarioTitle: 'High-Value Client Negotiation',
  scenarioNumber: '#241',
  currentTurn: 3,
  totalTurns: 5,
  messages: [
    {
      id: '1',
      speaker: 'ai' as const,
      message:
        "I understand your position on the renewal costs. However, our competitors often exclude maintenance fees from their base price. Have you verified if their quote is all-inclusive?",
      timestamp: '10:42 AM',
      speakerName: 'AI Coach',
    },
    {
      id: '2',
      speaker: 'user' as const,
      message:
        '"That\'s a valid point. I haven\'t checked the fine print on maintenance specifically. I\'ll need to double check that."',
      timestamp: '10:43 AM',
      status: 'read' as const,
    },
  ],
  agentAssist: {
    suggestion: 'The client seems uncertain about the "fine print." This is an opportunity to offer a comparative breakdown.',
    suggestedResponses: [
      '"Let\'s review the specs side-by-side..."',
      '"I can send you a cost-benefit analysis..."',
    ],
  },
  agents: [
    {
      agentType: 'empathy' as const,
      title: 'Missed Opportunity',
      description: "Consider acknowledging the client's frustration before offering a solution.",
      badge: {
        text: 'Hint',
        type: 'hint' as const,
      },
    },
    {
      agentType: 'policy' as const,
      title: 'Disclosure Warning',
      description: 'Reminder: Avoid discussing specific interest rates without full disclosure. Refer to Policy #304.',
      badge: {
        text: 'Critical',
        type: 'critical' as const,
      },
    },
    {
      agentType: 'pacing' as const,
      title: 'Optimal Rate',
      description: 'Your speaking rate is currently optimal for clarity.',
      badge: {
        text: 'Good',
        type: 'success' as const,
      },
    },
    {
      agentType: 'tone' as const,
      title: 'Tone Analyzer',
      description: 'Good job maintaining a professional yet warm tone during the opening greeting.',
      timestamp: '2 mins ago',
    },
  ],
}

export function MultiAgenticCoachingClient({ userName, sessionId }: MultiAgenticCoachingClientProps) {
  const router = useRouter()
  const sessionData = defaultSessionData

  const handleSelectResponse = (response: string) => {
    console.log('Select response:', response)
  }

  const handleDismissAssist = () => {
    console.log('Dismiss agent assist')
  }

  const handleEndSession = () => {
    router.push(`/training-hub/session/${sessionId}`)
  }

  return (
    <div className="flex-1 flex flex-col bg-bm-light-grey overflow-hidden">
      <LiveSessionHeader
        userName={userName}
        scenarioTitle={sessionData.scenarioTitle}
        showLiveBadge={true}
      />

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col relative bg-bm-light-grey">
          {/* Progress Bar in Header */}
          <div className="bg-bm-white border-b border-bm-grey px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="font-bold text-bm-text-primary">Scenario Progress:</span>
              <div className="flex items-center gap-2">
                <ScenarioProgressBar currentTurn={sessionData.currentTurn} totalTurns={sessionData.totalTurns} />
                <span className="text-bm-text-secondary font-medium ml-2">
                  Turn {sessionData.currentTurn}/{sessionData.totalTurns}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold text-bm-text-secondary bg-bm-grey/50 rounded hover:bg-bm-grey transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-base">pause</span>
                Pause
              </button>
              <button
                onClick={handleEndSession}
                className="px-3 py-1.5 text-xs font-semibold text-bm-maroon bg-red-50 rounded hover:bg-red-100 transition-colors flex items-center gap-1 border border-red-100"
              >
                <span className="material-symbols-outlined text-base">stop_circle</span>
                End Session
              </button>
            </div>
          </div>

          {/* Listening Visualization */}
          <CircularListeningVisualization />

          {/* Chat Interface */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-4 space-y-6">
            {sessionData.messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                speaker={message.speaker}
                message={message.message}
                timestamp={message.timestamp}
                status={message.status}
                speakerName={message.speakerName}
              />
            ))}
            <div className="flex justify-start gap-4 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]" style={{ animationDelay: '1s' }}>
              <div className="w-10 h-10 rounded-full bg-bm-maroon/20 text-bm-maroon flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl animate-pulse">more_horiz</span>
              </div>
            </div>
          </div>

          {/* Agent Assist Panel and Input Controls */}
          <div className="bg-bm-white border-t border-bm-grey p-6">
            <AgentAssistPanel
              suggestion={sessionData.agentAssist.suggestion}
              suggestedResponses={sessionData.agentAssist.suggestedResponses}
              onSelectResponse={handleSelectResponse}
              onDismiss={handleDismissAssist}
            />
            <div className="flex items-center justify-center gap-6">
              <button
                className="p-3 text-bm-text-secondary rounded-full"
                title="Restart Turn"
              >
                <span className="material-symbols-outlined text-2xl">replay</span>
              </button>
              <button className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-bm-maroon text-bm-white shadow-lg">
                <span className="material-symbols-outlined text-3xl group-hover:hidden">mic</span>
                <span className="material-symbols-outlined text-3xl hidden group-hover:block">mic_none</span>
                <span className="absolute inline-flex h-full w-full rounded-full bg-bm-maroon opacity-20 animate-ping"></span>
              </button>
              <button
                className="p-3 text-bm-text-secondary rounded-full"
                title="Keyboard Input"
              >
                <span className="material-symbols-outlined text-2xl">keyboard</span>
              </button>
            </div>
            <p className="text-center text-xs text-bm-text-subtle mt-3 font-medium">Press Spacebar to Speak</p>
          </div>
        </div>

        {/* Multi-Agent Feedback Sidebar */}
        <MultiAgentFeedbackSidebar agents={sessionData.agents} />
      </main>
    </div>
  )
}



