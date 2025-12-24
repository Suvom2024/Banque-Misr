'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'
import { toast } from 'sonner'

// Global singleton to prevent duplicate connections (React Strict Mode causes double mounting)
let globalSessionInstance: any = null
let globalSessionLock = false

interface VoiceSessionProps {
  sessionId: string
  scenarioTitle: string
  onTurnComplete?: (turn: { speaker: string; message: string; metrics?: any }) => void
  onAssessmentTrigger?: (assessment: any) => void
  onSessionEnd?: () => void
  onEndSessionRef?: (endFn: () => Promise<void>) => void
  onVoiceStateChange?: (state: { isListening: boolean; isSpeaking: boolean; isConnected: boolean; isMicMuted: boolean }) => void
  onAssessmentStateChange?: (assessment: any | null) => void
  onAssessmentSubmitRef?: (submitFn: (selectedOptionId: string) => Promise<void>) => void
  onMicToggleRef?: (toggleFn: () => void) => void
}

export function VoiceSession({
  sessionId,
  scenarioTitle,
  onTurnComplete,
  onAssessmentTrigger,
  onSessionEnd,
  onEndSessionRef,
  onVoiceStateChange,
  onAssessmentStateChange,
  onAssessmentSubmitRef,
  onMicToggleRef,
}: VoiceSessionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [currentAssessment, setCurrentAssessment] = useState<any>(null)
  
  // Refs for session management
  const sessionRef = useRef<any>(null)
  const isSessionOpenRef = useRef(false)
  const hasInitializedRef = useRef(false) // Prevent duplicate initialization
  
  // Audio input refs
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const isMicMutedRef = useRef(false)
  
  // Audio output refs - proper queueing system
  const outputAudioContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<ArrayBuffer[]>([])
  const isPlayingRef = useRef(false)
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const lastAudioEndTimeRef = useRef<number | null>(null)
  const currentGainRef = useRef<GainNode | null>(null)
  const playbackTokenRef = useRef(0)
  const schedulerActiveRef = useRef(false)
  const nextStartTimeRef = useRef<number | null>(null)
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([])
  
  // Transcription accumulation refs
  const transcriptionBufferRef = useRef<string>('')
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const aiTranscriptionBufferRef = useRef<string>('')
  const aiTranscriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const TRANSCRIPTION_COMPLETE_DELAY = 1500 // Wait 1.5s after last fragment to consider complete
  
  // Assessment and turn tracking
  const turnCountRef = useRef(0)
  const handleAssessmentTriggerRef = useRef<((assessmentData: any) => void) | null>(null)
  const handleAssessmentSubmitRef = useRef<((selectedOptionId: string) => Promise<void>) | null>(null)

  // ============================================================================
  // AUDIO PLAYBACK SYSTEM - Based on official docs example
  // ============================================================================
  
  const playAudioQueue = useCallback(async () => {
    if (schedulerActiveRef.current || audioQueueRef.current.length === 0 || !outputAudioContextRef.current) {
      return
    }

    schedulerActiveRef.current = true
    const myToken = playbackTokenRef.current

    try {
      const audioContext = outputAudioContextRef.current
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Initialize timeline start if needed
      if (nextStartTimeRef.current == null) {
        nextStartTimeRef.current = Math.max(audioContext.currentTime, (lastAudioEndTimeRef.current ?? 0))
      }

      const MAX_SCHEDULE_AHEAD_SEC = 0.6

      const scheduleMore = () => {
        if (!outputAudioContextRef.current) return
        if (playbackTokenRef.current !== myToken) return

        const ctx = outputAudioContextRef.current
        const now = ctx.currentTime
        if (nextStartTimeRef.current == null) {
          nextStartTimeRef.current = Math.max(now, (lastAudioEndTimeRef.current ?? 0))
        }
        let nextStartTime: number = nextStartTimeRef.current ?? now

        // Schedule chunks on the WebAudio timeline to eliminate event-loop gaps.
        while (
          audioQueueRef.current.length > 0 &&
          nextStartTime - now < MAX_SCHEDULE_AHEAD_SEC &&
          playbackTokenRef.current === myToken
        ) {
          const audioData = audioQueueRef.current.shift()
          if (!audioData) break

          // Convert ArrayBuffer (PCM16) -> Float32
          const pcm16 = new Int16Array(audioData)
          const float32 = new Float32Array(pcm16.length)
          for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768.0
          }

          const audioBuffer = ctx.createBuffer(1, float32.length, 24000)
          audioBuffer.getChannelData(0).set(float32)

          const source = ctx.createBufferSource()
          source.buffer = audioBuffer
          const gain = ctx.createGain()
          gain.gain.setValueAtTime(1, ctx.currentTime)
          source.connect(gain)
          gain.connect(ctx.destination)

          const scheduledStart: number = nextStartTime
          const scheduledEnd: number = scheduledStart + audioBuffer.duration

          isPlayingRef.current = true
          setIsSpeaking(true)
          currentSourceRef.current = source
          currentGainRef.current = gain
          scheduledSourcesRef.current.push(source)

          source.onended = () => {
            // remove from scheduled list
            scheduledSourcesRef.current = scheduledSourcesRef.current.filter((s) => s !== source)
            // track end time on the timeline (end time is known)
            lastAudioEndTimeRef.current = scheduledEnd
            if (currentSourceRef.current === source) {
              currentSourceRef.current = null
              currentGainRef.current = null
            }
            // if we have more data, schedule more
            if (audioQueueRef.current.length > 0 && playbackTokenRef.current === myToken) {
              scheduleMore()
            } else if (scheduledSourcesRef.current.length === 0) {
              // done
              isPlayingRef.current = false
              setIsSpeaking(false)
              nextStartTimeRef.current = null
              schedulerActiveRef.current = false
              onVoiceStateChange?.({
                isListening: !isMicMuted,
                isSpeaking: false,
                isConnected: true,
                isMicMuted: isMicMuted,
              })
            }
          }

          // Schedule precisely; no event-loop jitter.
          try {
            source.start(scheduledStart)
          } catch (e) {
            // If scheduling fails, bail out gracefully
            break
          }

          nextStartTime = scheduledEnd
          nextStartTimeRef.current = scheduledEnd
        }

        // If nothing is scheduled and queue is empty, close out.
        if (audioQueueRef.current.length === 0 && scheduledSourcesRef.current.length === 0) {
          isPlayingRef.current = false
          setIsSpeaking(false)
          nextStartTimeRef.current = null
          schedulerActiveRef.current = false
        }
      }

      scheduleMore()
    } catch (e) {
      schedulerActiveRef.current = false
      isPlayingRef.current = false
      setIsSpeaking(false)
    }
  }, [isMicMuted, onVoiceStateChange])

  const stopAllAudio = useCallback(() => {
    console.log('[VoiceSession] Stopping all audio')
    
    // Abort any in-flight playback loop and stop audio smoothly (avoid overlap/races)
    playbackTokenRef.current += 1
    schedulerActiveRef.current = false
    nextStartTimeRef.current = null
    
    // Clear queued audio immediately
    audioQueueRef.current = []
    
    // Gracefully fade and stop the current chunk (no harsh cut, no overlap)
    const ctx = outputAudioContextRef.current
    const src = currentSourceRef.current
    const gain = currentGainRef.current
    const scheduled = scheduledSourcesRef.current.slice()
    scheduledSourcesRef.current = []
    if (ctx && src) {
      try {
        if (gain) {
          const t = ctx.currentTime
          gain.gain.cancelScheduledValues(t)
          gain.gain.setValueAtTime(gain.gain.value, t)
          gain.gain.linearRampToValueAtTime(0, t + 0.02)
          src.stop(t + 0.03)
        } else {
          // Fallback: stop immediately if no gain node
          src.stop()
        }
      } catch (error) {
        // Already stopped
      }
    }

    // Stop any already-scheduled sources too (they may still be queued on the timeline)
    if (ctx) {
      const t = ctx.currentTime
      for (const s of scheduled) {
        try {
          s.stop(t)
        } catch (e) {
          // ignore
        }
      }
    }
    
    currentSourceRef.current = null
    currentGainRef.current = null
    isPlayingRef.current = false
    setIsSpeaking(false)
  }, [])

  // ============================================================================
  // SESSION INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    // Prevent duplicate initialization with a more robust check
    if (hasInitializedRef.current || globalSessionLock) {
      console.log('[VoiceSession] Already initialized, skipping')
      return
    }
    
    // Set global lock to prevent any other instance from initializing
    globalSessionLock = true
    let isComponentMounted = true
    hasInitializedRef.current = true

    const initializeSession = async () => {
      // Double check we should continue
      if (!isComponentMounted) {
        console.log('[VoiceSession] Component unmounted before init')
        globalSessionLock = false
        return
      }
      
      // If there's already a global session, reuse it
      if (globalSessionInstance) {
        console.log('[VoiceSession] Reusing existing global session')
        sessionRef.current = globalSessionInstance
        setIsConnected(true)
        setIsListening(true)
        globalSessionLock = false
        return
      }
      try {
        console.log('[VoiceSession] Initializing Gemini Live API session...')
        
        // Get session context from API
        const response = await fetch(`/api/sessions/${sessionId}/realtime`)
        if (!response.ok) {
          throw new Error('Failed to get session context')
        }
        const sessionData = await response.json()

        // Get API key
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
        if (!apiKey) {
          throw new Error('Gemini API key not configured')
        }

        // Initialize Google Gen AI client
        const genAI = new GoogleGenAI({ apiKey })

        // Define assessment trigger function
        const triggerAssessmentFunction = {
          name: 'trigger_assessment',
          description: 'Trigger a knowledge check assessment for the user. Use this when you want to test the user\'s understanding after 3-5 good interactions.',
          parameters: {
            type: 'object' as const,
            properties: {
              reason: {
                type: 'string' as const,
                description: 'Brief reason why you are triggering the assessment',
              },
            },
            required: ['reason'],
          },
        }

        const handleTriggerAssessmentFunction = async ({ reason }: { reason: string }) => {
          console.log('[VoiceSession] Assessment triggered:', reason)
          
          try {
            const response = await fetch(`/api/sessions/${sessionId}/assessments/trigger`)
            if (!response.ok) throw new Error('Failed to fetch assessment')

            const data = await response.json()
            
            if (data.shouldTrigger && data.assessments?.length > 0) {
              if (handleAssessmentTriggerRef.current) {
                handleAssessmentTriggerRef.current(data)
              }
              
              return {
                success: true,
                message: `Assessment triggered: "${data.assessments[0].question_text}"`,
                assessmentId: data.assessments[0].id,
              }
            }
            
              return {
                success: false,
              message: 'No assessment available. Continue the conversation.',
            }
          } catch (error) {
            console.error('[VoiceSession] Error triggering assessment:', error)
            return {
              success: false,
              message: 'Failed to trigger assessment.',
            }
          }
        }

        // System instructions
        const systemInstructions = `You are an AI training coach for: "${scenarioTitle}".

${sessionData.scenarioDescription ? `Scenario: ${sessionData.scenarioDescription}` : ''}

Your role:
1. Guide the user through realistic training conversations
2. Provide constructive feedback in real-time
3. After 3-5 good interactions, use trigger_assessment to show a knowledge check
4. When user completes assessment, acknowledge their result and continue naturally
5. ALWAYS listen carefully and respond appropriately
6. If user says something inappropriate, politely redirect to training
7. Acknowledge interruptions gracefully

IMPORTANT: 
- Use trigger_assessment function when testing knowledge - don't just talk about it
- ALWAYS speak in English only
- Be responsive and engaging
- When interrupted, stop and listen, then respond
- Be supportive but challenging`

        // Create output audio context for playback (24kHz for output)
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        })
        outputAudioContextRef.current = outputAudioContext

        // Message queue for handling responses
        const responseQueue: any[] = []

        const waitMessage = async () => {
          while (responseQueue.length === 0) {
            await new Promise((resolve) => setTimeout(resolve, 10))
          }
          return responseQueue.shift()
        }

        // Process Live API messages
        const processMessage = async (message: any) => {
          try {
            // Handle setupComplete
            if (message.setupComplete) {
              console.log('[VoiceSession] Setup complete')
              return
            }

            // Handle serverContent
            if (message.serverContent) {
              const content = message.serverContent

              // Handle interruption
              if (content.interrupted) {
                console.log('[VoiceSession] Interrupted, gracefully stopping audio')
                stopAllAudio()
                return
              }

              // Handle output transcription (AI speech to text)
              if (content.outputTranscription?.text) {
                const fragment = content.outputTranscription.text
                
                // Accumulate AI transcription fragments
                aiTranscriptionBufferRef.current += fragment
                
                // Clear any existing timeout
                if (aiTranscriptionTimeoutRef.current) {
                  clearTimeout(aiTranscriptionTimeoutRef.current)
                }
                
                // Set a new timeout to process accumulated transcription
                aiTranscriptionTimeoutRef.current = setTimeout(async () => {
                  const completeMessage = aiTranscriptionBufferRef.current.trim()
                  
                  if (completeMessage.length > 0) {
                    console.log('[VoiceSession] AI said (complete):', completeMessage)
                    
                    await saveTurn('ai-coach', completeMessage)
                    onTurnComplete?.({
                      speaker: 'ai-coach',
                      message: completeMessage,
                    })
                  }
                  
                  // Clear the buffer
                  aiTranscriptionBufferRef.current = ''
                }, TRANSCRIPTION_COMPLETE_DELAY)
              }

              // Handle model turn (AI response)
              if (content.modelTurn?.parts) {
                for (const part of content.modelTurn.parts) {
                  
                  // Handle audio data
                  if (part.inlineData?.data) {
                    const audioBase64 = part.inlineData.data
                    
                    // Decode base64 to ArrayBuffer
                    const audioData = atob(audioBase64)
                    const buffer = new ArrayBuffer(audioData.length)
                    const view = new Uint8Array(buffer)
                    for (let i = 0; i < audioData.length; i++) {
                      view[i] = audioData.charCodeAt(i)
                    }

                    // Add to queue
                    audioQueueRef.current.push(buffer)
                    
                    setIsSpeaking(true)
                    onVoiceStateChange?.({
                      isListening: false,
                      isSpeaking: true,
                      isConnected: true,
                      isMicMuted: isMicMuted,
                    })

                    // Start playback if not already playing
                    if (!isPlayingRef.current) {
                      playAudioQueue()
                    }
                  }

                  // Handle text (AI thought/transcript)
                  if (part.text && !part.thought) {
                    const aiMessage = part.text
                    console.log('[VoiceSession] AI said:', aiMessage)
                    
                    await saveTurn('ai-coach', aiMessage)
                    onTurnComplete?.({
                      speaker: 'ai-coach',
                      message: aiMessage,
                    })
                  }
                  
                  // Handle function call
                  if (part.functionCall) {
                    const functionCall = part.functionCall
                    if (functionCall.name === 'trigger_assessment') {
                      const reason = functionCall.args?.reason || 'Assessment requested'
                      const result = await handleTriggerAssessmentFunction({ reason })
                      
                      sessionRef.current?.sendToolResponse({
                        name: functionCall.name,
                        response: result,
                      })
                    }
                  }
                }
              }

              // Handle input transcription (user speech to text)
              if (content.inputTranscription?.text) {
                const fragment = content.inputTranscription.text
                
                // Accumulate transcription fragments
                transcriptionBufferRef.current += fragment
                
                // Clear any existing timeout
                if (transcriptionTimeoutRef.current) {
                  clearTimeout(transcriptionTimeoutRef.current)
                }
                
                // Set a new timeout to process accumulated transcription
                transcriptionTimeoutRef.current = setTimeout(async () => {
                  const completeMessage = transcriptionBufferRef.current.trim()
                  
                  if (completeMessage.length > 0) {
                    console.log('[VoiceSession] User said (complete):', completeMessage)
                    
                    await saveTurn('user', completeMessage)
                    onTurnComplete?.({
                      speaker: 'user',
                      message: completeMessage,
                    })
                    
                    turnCountRef.current++
                  }
                  
                  // Clear the buffer
                  transcriptionBufferRef.current = ''
                }, TRANSCRIPTION_COMPLETE_DELAY)
              }
            }
          } catch (error) {
            console.error('[VoiceSession] Error processing message:', error)
          }
        }

        // Connect to Live API
        const modelName = 'gemini-2.5-flash-native-audio-preview-12-2025'
        
        const session = await genAI.live.connect({
          model: modelName,
          callbacks: {
            onopen: () => {
              console.log('[VoiceSession] Connected to Gemini Live API')
              setIsConnected(true)
              isSessionOpenRef.current = true
            },
            onmessage: async (message: any) => {
              responseQueue.push(message)
              await processMessage(message)
            },
            onerror: (error: any) => {
              console.error('[VoiceSession] Live API error:', error)
              toast.error('Connection error', {
                description: error.message || 'Please try reconnecting.',
              })
            },
            onclose: (event: any) => {
              console.log('[VoiceSession] Connection closed:', event?.reason || 'Unknown')
              setIsConnected(false)
              isSessionOpenRef.current = false
              
              if (processorRef.current) {
                processorRef.current.disconnect()
                processorRef.current = null
              }
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstructions,
            tools: [{
              functionDeclarations: [triggerAssessmentFunction as any]
            }],
            // Enable input transcription so we can show user messages
            inputAudioTranscription: {},
            // Enable output transcription so we can show AI text responses in chat
            outputAudioTranscription: {},
            // Configure Voice Activity Detection for better detection
            realtimeInputConfig: {
              automaticActivityDetection: {
                disabled: false,
                // Lower thresholds for better detection
                silenceDurationMs: 800, // Wait 800ms of silence before considering speech ended
                prefixPaddingMs: 100, // Include 100ms before speech starts
              }
            }
          }
        })

        sessionRef.current = session
        globalSessionInstance = session // Store in global singleton
        console.log('[VoiceSession] Session connected successfully')

        // Set up microphone input (16kHz as per docs)
        console.log('[VoiceSession] Setting up microphone...')
        
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
          }
        })

        console.log('[VoiceSession] Microphone access granted')
          mediaStreamRef.current = stream

        // Create audio context for input processing (16kHz for input as per docs)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
          })
          audioContextRef.current = audioContext

          const source = audioContext.createMediaStreamSource(stream)
          const bufferSize = 4096
          const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
          processorRef.current = processor

          processor.onaudioprocess = (event) => {
          if (!sessionRef.current || !isSessionOpenRef.current || isMicMutedRef.current) {
              return
            }

            const inputBuffer = event.inputBuffer.getChannelData(0)
            const pcm16 = new Int16Array(inputBuffer.length)
            
          // Convert float32 to int16 PCM
            for (let i = 0; i < inputBuffer.length; i++) {
              const s = Math.max(-1, Math.min(1, inputBuffer[i]))
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
            }

          try {
            // Convert to base64
              const uint8Array = new Uint8Array(pcm16.buffer)
            const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
              
            // Send to Live API with correct MIME type
            sessionRef.current.sendRealtimeInput({
                audio: {
                  data: base64Audio,
                  mimeType: "audio/pcm;rate=16000"
                }
              })
            } catch (error: any) {
            if (!error?.message?.includes('CLOS')) {
              console.error('[VoiceSession] Error sending audio:', error)
            }
            }
          }

          source.connect(processor)
          processor.connect(audioContext.destination)

        console.log('[VoiceSession] Audio pipeline ready')
        
        setIsListening(true)
        
        onVoiceStateChange?.({
          isListening: true,
          isSpeaking: false,
          isConnected: true,
          isMicMuted: false,
        })

        toast.success('Voice session connected!', {
          description: 'You can now start speaking.',
        })
        
        // Release lock after successful initialization
        globalSessionLock = false

      } catch (error: any) {
        console.error('[VoiceSession] Initialization error:', error)
        hasInitializedRef.current = false // Allow retry
        globalSessionLock = false // Release lock on error
        globalSessionInstance = null
        toast.error('Failed to connect', {
          description: error.message || 'Please check your settings.',
        })
      }
    }

    initializeSession()

    // Cleanup
    return () => {
      console.log('[VoiceSession] Cleaning up...')
      isComponentMounted = false
      
      // Force stop all audio on cleanup (unlike graceful interruption)
      audioQueueRef.current = []
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop()
          currentSourceRef.current = null
        } catch (error) {
          // Already stopped
        }
      }
      isPlayingRef.current = false
      
      // Clear transcription timeouts
      if (transcriptionTimeoutRef.current) {
        clearTimeout(transcriptionTimeoutRef.current)
        transcriptionTimeoutRef.current = null
      }
      if (aiTranscriptionTimeoutRef.current) {
        clearTimeout(aiTranscriptionTimeoutRef.current)
        aiTranscriptionTimeoutRef.current = null
      }
      
      if (processorRef.current) {
        processorRef.current.disconnect()
        processorRef.current = null
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error)
        audioContextRef.current = null
      }

      if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close().catch(console.error)
        outputAudioContextRef.current = null
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      
      if (sessionRef.current) {
        try {
          // Only close if this is the last instance
          const shouldClose = sessionRef.current === globalSessionInstance
          if (shouldClose) {
            sessionRef.current.close()
            globalSessionInstance = null
            console.log('[VoiceSession] Closed global session')
          }
          isSessionOpenRef.current = false
        } catch (error) {
          console.error('[VoiceSession] Error closing session:', error)
        }
        sessionRef.current = null
      }
      
      // Only reset if this is the actual cleanup (not React Strict Mode)
      setTimeout(() => {
        if (!isComponentMounted) {
          hasInitializedRef.current = false
          globalSessionLock = false
        }
      }, 100)
    }
  }, [stopAllAudio]) // Include stopAllAudio in deps

  // ============================================================================
  // TURN MANAGEMENT
  // ============================================================================

  const saveTurn = async (speaker: 'user' | 'ai-coach', message: string, metrics?: any) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/turns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speaker, message, metrics }),
      })

      if (!response.ok) {
        throw new Error('Failed to save turn')
      }

      const data = await response.json()

      onTurnComplete?.({ speaker, message, metrics })

      if (data.assessmentTrigger?.shouldTrigger) {
        handleAssessmentTrigger(data.assessmentTrigger)
      }
    } catch (error) {
      console.error('[VoiceSession] Error saving turn:', error)
    }
  }

  const handleAssessmentTrigger = useCallback((assessmentData: any) => {
    console.log('[VoiceSession] Assessment trigger:', assessmentData)
    
    if (!assessmentData.assessments || assessmentData.assessments.length === 0) {
      return
    }
    
    const assessment = assessmentData.assessments[0]
    setCurrentAssessment(assessment)
    
    onAssessmentStateChange?.(assessment)
    onAssessmentTrigger?.(assessmentData)
    
    // Pause voice input during assessment
      setIsListening(false)
      
      onVoiceStateChange?.({
        isListening: false,
        isSpeaking: false,
        isConnected: true,
        isMicMuted: isMicMuted,
      })
  }, [onAssessmentTrigger, onAssessmentStateChange, onVoiceStateChange, isMicMuted])
    
  useEffect(() => {
    handleAssessmentTriggerRef.current = handleAssessmentTrigger
  }, [handleAssessmentTrigger])

  // ============================================================================
  // ASSESSMENT SUBMISSION
  // ============================================================================

  const handleAssessmentSubmit = async (selectedOptionId: string) => {
    if (!currentAssessment || !sessionRef.current) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}/assessments/${currentAssessment.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: selectedOptionId }),
      })

      if (!response.ok) throw new Error('Failed to save answer')

      const data = await response.json()
      
      // Get selected option text
        const selectedOption = currentAssessment.options?.find((opt: any, idx: number) => {
          const optId = typeof opt === 'string' ? `opt-${idx}` : opt.id || `opt-${idx}`
          return optId === selectedOptionId
        })
        const selectedText = typeof selectedOption === 'string' 
          ? selectedOption 
          : selectedOption?.text || selectedOptionId

      // Create message for AI
      const assessmentMessage = data.isCorrect
        ? `I completed the assessment "${currentAssessment.question_text}" and selected "${selectedText}". I got it correct! ${data.feedback || ''} Please acknowledge and continue.`
        : `I completed the assessment "${currentAssessment.question_text}" and selected "${selectedText}". I got it wrong. ${data.feedback || ''} Please explain and continue.`

      // Save turn
      await saveTurn('user', assessmentMessage)
      
        onTurnComplete?.({
          speaker: 'user',
        message: `Assessment: "${selectedText}"`,
      })

      // Send to Live API
      sessionRef.current.sendClientContent({
              turns: [{
                role: 'user',
          parts: [{ text: assessmentMessage }]
        }]
      })

      // Show toast
      if (data.isCorrect) {
        toast.success('Correct!', { description: 'AI is acknowledging...' })
      } else {
        toast.info('Answer submitted', { description: 'AI is providing feedback...' })
      }

      // Clear assessment and resume
      setCurrentAssessment(null)
      onAssessmentStateChange?.(null)
      setIsListening(true)
      
      onVoiceStateChange?.({
        isListening: true,
        isSpeaking: false,
        isConnected: true,
        isMicMuted: isMicMuted,
      })
      
    } catch (error) {
      console.error('[VoiceSession] Error submitting assessment:', error)
      toast.error('Failed to submit answer')
      
      setCurrentAssessment(null)
      onAssessmentStateChange?.(null)
      setIsListening(true)
      
      onVoiceStateChange?.({
        isListening: true,
        isSpeaking: false,
        isConnected: true,
        isMicMuted: isMicMuted,
      })
    }
  }

  useEffect(() => {
    if (onAssessmentSubmitRef) {
      onAssessmentSubmitRef(handleAssessmentSubmit)
    }
    handleAssessmentSubmitRef.current = handleAssessmentSubmit
  }, [handleAssessmentSubmit, onAssessmentSubmitRef])

  // ============================================================================
  // MIC TOGGLE
  // ============================================================================

  const toggleMic = useCallback(() => {
      setIsMicMuted((prev) => {
        const newState = !prev
      isMicMutedRef.current = newState
      console.log('[VoiceSession] Mic toggled:', newState ? 'MUTED' : 'UNMUTED')
        return newState
      })
  }, [])
  
  useEffect(() => {
    onVoiceStateChange?.({
      isListening: isListening && !isMicMuted,
      isSpeaking: isSpeaking,
      isConnected: isConnected,
      isMicMuted: isMicMuted,
    })
  }, [isMicMuted, isListening, isSpeaking, isConnected, onVoiceStateChange])

  useEffect(() => {
    if (onMicToggleRef) {
      onMicToggleRef(toggleMic)
    }
  }, [toggleMic, onMicToggleRef])

  // ============================================================================
  // END SESSION
  // ============================================================================

  const handleEndSession = useCallback(async () => {
    try {
      console.log('[VoiceSession] Ending session...')
      
      stopAllAudio()
      
      if (processorRef.current) {
        processorRef.current.disconnect()
        processorRef.current = null
      }
      
      if (audioContextRef.current) {
        await audioContextRef.current.close()
        audioContextRef.current = null
      }
      
      if (outputAudioContextRef.current) {
        await outputAudioContextRef.current.close()
        outputAudioContextRef.current = null
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      
      if (sessionRef.current) {
            await sessionRef.current.close()
        sessionRef.current = null
      }
      
      setIsConnected(false)
      setIsListening(false)
      setIsSpeaking(false)
      
      console.log('[VoiceSession] Session ended')
      onSessionEnd?.()
    } catch (error) {
      console.error('[VoiceSession] Error ending session:', error)
      setIsConnected(false)
      onSessionEnd?.()
    }
  }, [onSessionEnd, stopAllAudio])

  useEffect(() => {
    if (onEndSessionRef) {
      onEndSessionRef(handleEndSession)
    }
  }, [handleEndSession, onEndSessionRef])

  return null
}
