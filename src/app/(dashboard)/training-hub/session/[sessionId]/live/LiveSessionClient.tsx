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
  // Check if we're restarting on initial mount to skip loading spinner
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('restartingSession') !== 'true'
    }
    return true
  })
  const [isRestarting, setIsRestarting] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('restartingSession') === 'true'
    }
    return false
  })
  const scenarioIdRef = useRef<string | null>(null)
  const previousSessionIdRef = useRef<string | null>(null)
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
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:66',message:'fetchSessionData started',data:{sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Check if we're restarting from a previous session
      const isRestartingFromStorage = sessionStorage.getItem('restartingSession') === 'true'
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:69',message:'sessionStorage check',data:{isRestartingFromStorage,sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (isRestartingFromStorage) {
        // Clear the flag
        sessionStorage.removeItem('restartingSession')
        setIsRestarting(true)
        // Keep messages empty (they were cleared before navigation)
        setMessages([])
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:74',message:'Restarting detected, cleared messages',data:{sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
      
      try {
        const response = await fetch(`/api/sessions/${sessionId}/live-data`)
        if (!response.ok) {
          throw new Error('Failed to load session')
        }

        const data = await response.json()
        
        // Store scenario ID for restart functionality
        if (data.scenarioId) {
          scenarioIdRef.current = data.scenarioId
        }
        
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

        // Only load existing turns if we're not restarting AND session has turns
        // Check currentTurn from session data - if it's 0, don't load turns (new session)
        // Also check if there are actually turns in the database
        const shouldLoadTurns = !isRestartingFromStorage && (data.currentTurn || 0) > 0
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:114',message:'Checking if should load turns',data:{sessionId,isRestartingFromStorage,currentTurn:data.currentTurn || 0,shouldLoadTurns},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        if (shouldLoadTurns) {
          const turnsResponse = await fetch(`/api/sessions/${sessionId}/turns`)
          if (turnsResponse.ok) {
            const turnsData = await turnsResponse.json()
            // Only load if there are actually turns
            if (turnsData.turns && turnsData.turns.length > 0) {
              const turnMessages: ChatMessageData[] = turnsData.turns.map((turn: any, idx: number) => {
                // Handle timestamp safely
                let timestamp = new Date().toLocaleTimeString()
                try {
                  if (turn.timestamp) {
                    const date = new Date(turn.timestamp)
                    if (!isNaN(date.getTime())) {
                      timestamp = date.toLocaleTimeString()
                    }
                  }
                } catch (e) {
                  // Use current time if timestamp is invalid
                }
                
                return {
                  id: turn.id || `turn-${idx}`,
                  speaker: turn.speaker === 'user' ? 'user' : 'ai',
                  message: turn.message,
                  timestamp,
                  speakerName: turn.speaker === 'ai-coach' ? 'AI Coach' : undefined,
                }
              })
              setMessages(turnMessages)
            }
          }
        } else {
          // New session - ensure messages array is empty
          setMessages([])
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:147',message:'Clearing messages for new session',data:{sessionId,currentTurn:data.currentTurn || 0,isRestartingFromStorage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
        }
        
        // Always clear messages if currentTurn is 0 (brand new session)
        if ((data.currentTurn || 0) === 0) {
          setMessages([])
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:152',message:'Force clearing messages - currentTurn is 0',data:{sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
        }
      } catch (error) {
        console.error('Error fetching session data:', error)
      } finally {
        setIsLoading(false)
        setIsRestarting(false)
      }
    }

    fetchSessionData()
  }, [sessionId])
  
  // Track sessionId changes to clear messages on component reuse (when Next.js reuses component instead of remounting)
  useEffect(() => {
    if (previousSessionIdRef.current !== null && previousSessionIdRef.current !== sessionId) {
      console.log('[LiveSessionClient] Session ID changed in effect, clearing messages')
      setMessages([])
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:175',message:'Session ID changed, clearing messages',data:{previousSessionId:previousSessionIdRef.current,newSessionId:sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }
    previousSessionIdRef.current = sessionId
  }, [sessionId])

  // Track streaming messages by speaker to update incrementally
  const streamingMessageIdsRef = useRef<{ user?: string; ai?: string }>({})

  const handleMessageStream = useCallback((turn: { speaker: string; message: string; isComplete: boolean }) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:193',message:'handleMessageStream called',data:{sessionId,speaker:turn.speaker,messageLength:turn.message.length,isComplete:turn.isComplete},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    const speakerKey = turn.speaker === 'user' ? 'user' : 'ai'
    const messageId = streamingMessageIdsRef.current[speakerKey] || `stream-${turn.speaker}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Store the ID for this speaker's streaming message
    if (!streamingMessageIdsRef.current[speakerKey]) {
      streamingMessageIdsRef.current[speakerKey] = messageId
    }

    // Update immediately for smooth streaming - React will batch rapid updates
    setMessages((prev) => {
      const existingIndex = prev.findIndex((msg) => msg.id === messageId)
      
      const streamMessage: ChatMessageData = {
        id: messageId,
        speaker: turn.speaker === 'user' ? 'user' : 'ai',
        message: turn.message,
        timestamp: new Date().toLocaleTimeString(),
        speakerName: turn.speaker === 'ai-coach' ? 'AI Coach' : undefined,
      }

      if (existingIndex >= 0) {
        // Update existing streaming message
        const updated = [...prev]
        updated[existingIndex] = streamMessage
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:217',message:'Updating existing streaming message',data:{sessionId,speaker:turn.speaker,messageId,existingIndex,prevLength:prev.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return updated
      } else {
        // Add new streaming message
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:222',message:'Adding new streaming message',data:{sessionId,speaker:turn.speaker,messageId,prevLength:prev.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return [...prev, streamMessage]
      }
    })

    // Clear streaming ID when message is complete
    if (turn.isComplete) {
      delete streamingMessageIdsRef.current[speakerKey]
    }
  }, [])

  const handleTurnComplete = useCallback((turn: { speaker: string; message: string; metrics?: any }) => {
    // Add new message to chat (for final saved turns)
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
    // But only check if we have messages (don't skip if messages array is empty after restart)
    setMessages((prev) => {
      // Only check for duplicates if we have messages
      if (prev.length > 0) {
        // More robust duplicate checking - check last 3 messages only
        const recentMessages = prev.slice(-3)
        const isDuplicate = recentMessages.some((msg) => {
          // Exact match on message content and speaker
          const sameContent = msg.message.trim() === turn.message.trim()
          const sameSpeaker = msg.speaker === (turn.speaker === 'user' ? 'user' : 'ai')
          return sameContent && sameSpeaker
        })
        
        if (isDuplicate) {
          console.log('[LiveSessionClient] Skipping duplicate message:', turn.message.substring(0, 30))
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:254',message:'Skipping duplicate turn complete',data:{sessionId,message:turn.message.substring(0,50),speaker:turn.speaker},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          return prev
        }
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

  // Track if component is unmounting to prevent updates
  const isUnmountingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleRestartTurn = useCallback(async () => {
    if (!scenarioIdRef.current) {
      console.error('Cannot restart: scenario ID not available')
      return
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:336',message:'handleRestartTurn called',data:{currentSessionId:sessionId,hasVoiceSessionEnd:!!voiceSessionEndRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      
      // Mark as unmounting to prevent any pending updates
      isUnmountingRef.current = true
      setIsRestarting(true)
      
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      
      // Immediately clear the UI - clear messages and assessment
      setMessages([])
      setCurrentAssessment(null)
      // Clear streaming message IDs to prevent duplicate detection issues
      streamingMessageIdsRef.current = {}
      
      // Close the current voice session if it exists
      if (voiceSessionEndRef.current) {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:357',message:'Calling voiceSessionEndRef before navigation',data:{currentSessionId:sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          await voiceSessionEndRef.current()
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:360',message:'voiceSessionEndRef completed',data:{currentSessionId:sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        } catch (error) {
          console.error('Error closing voice session:', error)
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:363',message:'Error closing voice session',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
      }

      // First, close/abandon the current session to allow creating a new one
      try {
        await fetch(`/api/sessions/${sessionId}/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'abandoned' }),
        })
      } catch (error) {
        console.warn('Error closing old session:', error)
        // Continue anyway - we'll try to create a new session
      }
      
      // Create a new session with the same scenario
      const response = await fetch('/api/training-hub/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenarioIdRef.current }),
      })

      if (!response.ok) {
        throw new Error('Failed to create new session')
      }

      const newSession = await response.json()
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:424',message:'New session created, navigating',data:{oldSessionId:sessionId,newSessionId:newSession.id,newSessionFull:JSON.stringify(newSession)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Verify we got a different session ID
      if (newSession.id === sessionId) {
        console.error('[LiveSessionClient] ERROR: New session has same ID as old session!', { oldId: sessionId, newId: newSession.id })
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/40ecd592-1d57-4d23-8901-eda4b8c4fdad',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveSessionClient.tsx:429',message:'ERROR: Same session ID returned',data:{oldSessionId:sessionId,newSessionId:newSession.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new Error('Failed to create new session - same ID returned')
      }
      
      // Mark that we're restarting so the new component instance knows to skip loading spinner
      sessionStorage.setItem('restartingSession', 'true')
      
      // Navigate to the new session URL - this will trigger a remount with fresh state
      // Using replace to avoid adding to browser history
      router.replace(`/training-hub/session/${newSession.id}/live`)
      
      // Note: The component will remount with the new sessionId, which will:
      // - Check sessionStorage and skip loading spinner
      // - Fetch fresh session data (no turns = empty messages)
      // - Initialize VoiceSession with new sessionId
      // - VoiceSession will send welcome message automatically
      
    } catch (error) {
      console.error('Error restarting turn:', error)
      isUnmountingRef.current = false
      setIsRestarting(false)
      alert('Failed to restart session. Please try again.')
    }
  }, [router, sessionId])

  const handlePause = () => {
    console.log('Pause session')
    // TODO: Implement pause
  }

  const handleEndSession = useCallback(async () => {
    // Prevent updates if component is unmounting
    if (isUnmountingRef.current) {
      return
    }

    // First, clean up the voice session if it exists
    if (voiceSessionEndRef.current) {
      try {
        await voiceSessionEndRef.current()
      } catch (error) {
        console.error('Error ending voice session:', error)
      }
    }

    // Update session status to completed (only if not unmounting)
    if (!isUnmountingRef.current) {
      try {
        // Create abort controller for this request
        const controller = new AbortController()
        abortControllerRef.current = controller

        await fetch(`/api/sessions/${sessionId}/update`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            completedAt: new Date().toISOString(),
          }),
          signal: controller.signal,
        })
        
        abortControllerRef.current = null
      } catch (error: any) {
        // Ignore aborted errors (component unmounting)
        if (error?.name !== 'AbortError' && !isUnmountingRef.current) {
          console.error('Error ending session:', error)
        }
      }
    }

    router.push(`/training-hub/session/${sessionId}`)
  }, [router, sessionId])

  // Cleanup effect to cancel requests and mark component as unmounting
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  const handleViewFullAnalytics = () => {
    router.push(`/training-hub/session/${sessionId}/agents`)
  }

  // Don't show loading spinner when restarting - just show empty chat
  // But still need sessionData to render
  if (!sessionData) {
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
                    onMessageStream={handleMessageStream}
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
                    hasExistingTurns={(sessionData?.currentTurn || 0) > 0}
                  />

                  <SessionControls
                    onRestartTurn={handleRestartTurn}
                    onPause={handlePause}
                    onEndSession={handleEndSession}
                    isRestartDisabled={!!currentAssessment || isRestarting}
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
