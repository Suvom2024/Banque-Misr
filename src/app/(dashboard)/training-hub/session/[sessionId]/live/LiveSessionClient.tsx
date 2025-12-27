'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LiveSessionHeader } from '@/components/dashboard/live-session/LiveSessionHeader'
import { ScenarioProgressBar } from '@/components/dashboard/live-session/ScenarioProgressBar'
import { RealTimeMetricsBar } from '@/components/dashboard/live-session/RealTimeMetricsBar'
import { ChatInterface, ChatMessageData } from '@/components/dashboard/live-session/ChatInterface'
import { VoiceVisualization } from '@/components/dashboard/live-session/VoiceVisualization'
import { BehavioralAnalysisCard } from '@/components/dashboard/live-session/BehavioralAnalysisCard'
import { SessionControls } from '@/components/dashboard/live-session/SessionControls'
import { VoiceSession } from '@/components/dashboard/live-session/VoiceSession'
import { LiveAssessmentPanel } from '@/components/dashboard/live-session/LiveAssessmentPanel'
import { AssessmentActiveIndicator } from '@/components/dashboard/live-session/AssessmentActiveIndicator'

interface LiveSessionClientProps {
  userName: string
  sessionId: string
}

export function LiveSessionClient({ userName, sessionId }: LiveSessionClientProps) {
  const router = useRouter()
  const voiceSessionEndRef = useRef<(() => Promise<void>) | null>(null)
  const [sessionData, setSessionData] = useState<{
    scenarioTitle: string
    currentTurn: number
    totalTurns: number
    metrics: {
      sentiment: 'positive' | 'negative' | 'neutral'
      pacing: number
      clarity: number
    }
  } | null>(null)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [currentAssessment, setCurrentAssessment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [voiceState, setVoiceState] = useState<{
    isListening: boolean
    isSpeaking: boolean
    isConnected: boolean
    isMicMuted: boolean
  }>({
    isListening: false,
    isSpeaking: false,
    isConnected: false,
    isMicMuted: false,
  })
  const voiceAssessmentSubmitRef = useRef<((selectedOptionId: string) => Promise<void>) | null>(null)
  const voiceMicToggleRef = useRef<(() => void) | null>(null)

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/live-data`)
        if (!response.ok) {
          throw new Error('Failed to load session')
        }

        const data = await response.json()
        setSessionData({
          scenarioTitle: data.scenarioTitle || 'Training Session',
          currentTurn: data.currentTurn || 0,
          totalTurns: data.totalTurns || 10,
          metrics: data.metrics || {
            sentiment: 'neutral',
            pacing: 0,
            clarity: 0,
          },
        })

        // Load existing turns as messages
        const turnsResponse = await fetch(`/api/sessions/${sessionId}/turns`)
        if (turnsResponse.ok) {
          const turnsData = await turnsResponse.json()
          const turnMessages: ChatMessageData[] = turnsData.turns.map((turn: any, idx: number) => ({
            id: turn.id || `turn-${idx}`,
            speaker: turn.speaker === 'user' ? 'user' : 'ai',
            message: turn.message,
            timestamp: new Date(turn.timestamp).toLocaleTimeString(),
            speakerName: turn.speaker === 'ai-coach' ? 'AI Coach' : undefined,
          }))
          setMessages(turnMessages)
        }
      } catch (error) {
        console.error('Error fetching session data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  const handleTurnComplete = useCallback((turn: { speaker: string; message: string; metrics?: any }) => {
    // Add new message to chat
    // Use a more unique ID to avoid duplicates
    const messageId = `turn-${turn.speaker}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newMessage: ChatMessageData = {
      id: messageId,
      speaker: turn.speaker === 'user' ? 'user' : 'ai',
      message: turn.message,
      timestamp: new Date().toLocaleTimeString(),
      speakerName: turn.speaker === 'ai-coach' ? 'AI Coach' : undefined,
    }

    // Check if this message already exists to avoid duplicates
    setMessages((prev) => {
      // More robust duplicate checking
      const recentMessages = prev.slice(-5) // Check last 5 messages only
      const isDuplicate = recentMessages.some((msg) => {
        // Exact match on message content and speaker
        const sameContent = msg.message.trim() === turn.message.trim()
        const sameSpeaker = msg.speaker === (turn.speaker === 'user' ? 'user' : 'ai')
        return sameContent && sameSpeaker
      })
      
      if (isDuplicate) {
        console.log('[LiveSessionClient] Skipping duplicate message:', turn.message.substring(0, 30))
        return prev
      }
      
      console.log('[LiveSessionClient] Adding message to chat:', {
        speaker: turn.speaker,
        message: turn.message.substring(0, 50) + '...',
      })
      
      return [...prev, newMessage]
    })

    // Update metrics if provided
    if (turn.metrics) {
      setSessionData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          metrics: {
            sentiment: turn.metrics.sentiment || prev.metrics.sentiment,
            pacing: turn.metrics.pacing || prev.metrics.pacing,
            clarity: turn.metrics.clarity || prev.metrics.clarity,
          },
          currentTurn: prev.currentTurn + 1,
        }
      })
    }
  }, [])

  const handleAssessmentTrigger = useCallback((assessment: any) => {
    const assessmentData = assessment.assessments?.[0] || assessment
    setCurrentAssessment(assessmentData)
    console.log('[LiveSessionClient] 🟢 Assessment triggered in parent:', assessmentData)
  }, [])

  const handleAssessmentStateChange = useCallback((assessment: any | null) => {
    console.log('[LiveSessionClient] 🟢 Assessment state changed:', assessment ? 'Active' : 'Cleared')
    if (assessment) {
      console.log('[LiveSessionClient] 📋 Assessment data received:', {
        id: assessment.id,
        question: assessment.question_text?.substring(0, 50) + '...',
        optionsType: Array.isArray(assessment.options) ? 'array' : typeof assessment.options,
        optionsCount: Array.isArray(assessment.options) ? assessment.options.length : 0,
        questionType: assessment.question_type,
        hasCorrectAnswer: !!assessment.correct_answer
      })
    }
    setCurrentAssessment(assessment)
  }, [])
  
  // Debug effect to verify assessment state
  useEffect(() => {
    if (currentAssessment) {
      console.log('[LiveSessionClient] ✅ currentAssessment state is set - panel should be visible')
    }
  }, [currentAssessment])

  const handleVoiceStateChange = useCallback((state: {
    isListening: boolean
    isSpeaking: boolean
    isConnected: boolean
    isMicMuted: boolean
  }) => {
    setVoiceState(state)
  }, [])

  const handleAssessmentSubmit = async (selectedOptionId: string) => {
    if (!currentAssessment) return

    try {
      console.log('[LiveSessionClient] 🔵 Submitting assessment answer:', selectedOptionId)
      
      // Use VoiceSession's submit handler which handles AI voice response
      if (voiceAssessmentSubmitRef.current) {
        await voiceAssessmentSubmitRef.current(selectedOptionId)
        console.log('[LiveSessionClient] ✅ Assessment submitted via VoiceSession - AI will respond with voice')
      } else {
        // Fallback: submit directly if ref not available
        console.warn('[LiveSessionClient] ⚠️ VoiceSession submit handler not available, submitting directly')
        const response = await fetch(`/api/sessions/${sessionId}/assessments/${currentAssessment.id}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: selectedOptionId }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit answer')
        }

        const data = await response.json()
        setCurrentAssessment(null)
        
        // Add feedback message
        const feedbackMessage: ChatMessageData = {
          id: `feedback-${Date.now()}`,
          speaker: 'ai',
          message: data.feedback || (data.isCorrect ? 'Correct! Great job!' : 'Let\'s continue practicing.'),
          timestamp: new Date().toLocaleTimeString(),
          speakerName: 'AI Coach',
        }
        setMessages((prev) => [...prev, feedbackMessage])
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
    }
  }

  const handleRestartTurn = () => {
    console.log('Restart turn')
    // TODO: Implement turn restart
  }

  const handlePause = () => {
    console.log('Pause session')
    // TODO: Implement pause
  }

  const handleEndSession = useCallback(async () => {
    // First, clean up the voice session if it exists
    if (voiceSessionEndRef.current) {
      try {
        await voiceSessionEndRef.current()
      } catch (error) {
        console.error('Error ending voice session:', error)
      }
    }

    // Update session status to completed
    try {
      await fetch(`/api/sessions/${sessionId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error('Error ending session:', error)
    }

    router.push(`/training-hub/session/${sessionId}`)
  }, [router, sessionId])

  const handleViewFullAnalytics = () => {
    router.push(`/training-hub/session/${sessionId}/agents`)
  }

  if (isLoading || !sessionData) {
    return (
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bm-maroon mx-auto mb-4"></div>
            <p className="text-bm-text-secondary">Loading session...</p>
          </div>
        </div>
      </div>
    )
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
                {/* Main Chat Area (Left - 8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-[700px] bg-white rounded-2xl shadow-card border border-bm-grey/60 relative overflow-hidden">
                  <RealTimeMetricsBar
                    sentiment={sessionData.metrics.sentiment}
                    pacing={sessionData.metrics.pacing}
                    clarity={sessionData.metrics.clarity}
                  />

                  {/* Chat Interface with Messages - Fixed height with scroll */}
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gradient-to-b from-bm-light-grey/30 to-white relative">
                    <ChatInterface messages={messages} />
                    
                    {/* Show Assessment Active Indicator when assessment is active */}
                    {currentAssessment && (
                      <AssessmentActiveIndicator />
                    )}
                  </div>

                  {/* Hidden VoiceSession Component - handles voice logic only */}
                  <VoiceSession
                    sessionId={sessionId}
                    scenarioTitle={sessionData.scenarioTitle}
                    onTurnComplete={handleTurnComplete}
                    onAssessmentTrigger={handleAssessmentTrigger}
                    onSessionEnd={handleEndSession}
                    onEndSessionRef={(endFn) => {
                      voiceSessionEndRef.current = endFn
                    }}
                    onVoiceStateChange={handleVoiceStateChange}
                    onAssessmentStateChange={handleAssessmentStateChange}
                    onAssessmentSubmitRef={(submitFn) => {
                      voiceAssessmentSubmitRef.current = submitFn
                    }}
                    onMicToggleRef={(toggleFn) => {
                      voiceMicToggleRef.current = toggleFn
                    }}
                  />

                  <SessionControls
                    onRestartTurn={handleRestartTurn}
                    onPause={handlePause}
                    onEndSession={handleEndSession}
                    isRestartDisabled={!!currentAssessment}
                  />
                </div>

                {/* Right Sidebar (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Show Assessment Panel when active, otherwise show Voice Visualization */}
                  {currentAssessment ? (
                    <>
                      <LiveAssessmentPanel
                        question={currentAssessment.question_text || 'Assessment Question'}
                        options={(() => {
                          // Transform options from database format to component format
                          const options = currentAssessment.options || []
                          const correctAnswer = currentAssessment.correct_answer
                          
                          // Log for debugging
                          if (!Array.isArray(options) || options.length === 0) {
                            console.warn('[LiveSessionClient] ⚠️ Invalid options format:', {
                              optionsType: typeof options,
                              isArray: Array.isArray(options),
                              optionsValue: options,
                              questionType: currentAssessment.question_type
                            })
                          }
                          
                          if (Array.isArray(options) && options.length > 0) {
                            return options.map((opt: any, idx: number) => {
                              if (typeof opt === 'string') {
                                const isCorrect = opt === correctAnswer || opt.trim() === correctAnswer?.trim()
                                return {
                                  id: `opt-${idx}`,
                                  text: opt,
                                  isCorrect: isCorrect,
                                }
                              }
                              if (typeof opt === 'object' && opt !== null) {
                                return {
                                  id: `opt-${idx}`,
                                  text: opt.text || opt.label || opt.option || String(opt),
                                  isCorrect: opt.is_correct || opt.isCorrect || false,
                                }
                              }
                              return {
                                id: `opt-${idx}`,
                                text: String(opt),
                                isCorrect: false,
                              }
                            })
                          }
                          
                          // For true/false questions
                          if (currentAssessment.question_type === 'true-false' || currentAssessment.question_type === 'true_false') {
                            return [
                              { id: 'opt-true', text: 'True', isCorrect: correctAnswer === 'True' || correctAnswer === 'true' },
                              { id: 'opt-false', text: 'False', isCorrect: correctAnswer === 'False' || correctAnswer === 'false' },
                            ]
                          }
                          
                          return []
                        })()}
                        timeLimit={currentAssessment.estimated_time_seconds || currentAssessment.time_limit_seconds || 60}
                        hint={currentAssessment.explanation || currentAssessment.hint}
                        onSubmit={handleAssessmentSubmit}
                      />
                      <BehavioralAnalysisCard
                        empathy={75}
                        directness={50}
                        onViewFullAnalytics={handleViewFullAnalytics}
                      />
                    </>
                  ) : (
                    <>
                      <VoiceVisualization
                        isListening={voiceState.isListening}
                        isSpeaking={voiceState.isSpeaking}
                        isMicMuted={voiceState.isMicMuted}
                        onMicToggle={() => {
                          if (voiceMicToggleRef.current) {
                            voiceMicToggleRef.current()
                          }
                        }}
                      />
                      <BehavioralAnalysisCard
                        empathy={75}
                        directness={50}
                        onViewFullAnalytics={handleViewFullAnalytics}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
