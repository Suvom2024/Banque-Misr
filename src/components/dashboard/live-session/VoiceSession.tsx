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
  const lastAssessmentTriggerRef = useRef<number>(0) // Track last trigger time to prevent spam
  const currentAssessmentRef = useRef<any>(null) // Track assessment state via ref
  const ASSESSMENT_TRIGGER_COOLDOWN = 10000 // 10 seconds cooldown between triggers

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
          // Auto-mute mic when AI starts speaking to prevent noise transcription
          setIsMicMuted(true)
          isMicMutedRef.current = true
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
              // done - AI finished speaking
              isPlayingRef.current = false
              setIsSpeaking(false)
              nextStartTimeRef.current = null
              schedulerActiveRef.current = false

              // Auto-unmute mic when AI finishes speaking (unless assessment is active)
              // Clear assessment ref when AI finishes speaking after assessment submission
              if (currentAssessmentRef.current) {
                // Assessment was just submitted and AI finished feedback - clear it now
                currentAssessmentRef.current = null
              }

              if (!currentAssessmentRef.current) {
                setIsMicMuted(false)
                isMicMutedRef.current = false
                onVoiceStateChange?.({
                  isListening: true,
                  isSpeaking: false,
                  isConnected: true,
                  isMicMuted: false,
                })
              } else {
                // Keep mic muted if assessment is still active
                onVoiceStateChange?.({
                  isListening: false,
                  isSpeaking: false,
                  isConnected: true,
                  isMicMuted: true,
                })
              }
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

          // Auto-unmute mic when AI finishes speaking (unless assessment is active)
          // Clear assessment ref when AI finishes speaking after assessment submission
          if (currentAssessmentRef.current) {
            // Assessment was just submitted and AI finished feedback - clear it now
            currentAssessmentRef.current = null
          }

          if (!currentAssessmentRef.current) {
            setIsMicMuted(false)
            isMicMutedRef.current = false
          }
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
          description: 'CRITICAL: Trigger a knowledge check assessment. You MUST call this function IMMEDIATELY when: (1) User asks for assessment/quiz/question/test - examples: "send me an assessment", "give me a quiz", "I want to test my knowledge", "show me a question". (2) After 3-5 good interactions when testing understanding would be valuable. (3) When you want to check the user\'s understanding of key concepts. DO NOT just talk about giving an assessment - YOU MUST CALL THIS FUNCTION to actually show it.',
          parameters: {
            type: 'object' as const,
            properties: {
              reason: {
                type: 'string' as const,
                description: 'Why you are triggering (e.g., "User explicitly requested assessment" or "Testing understanding after discussing negotiation tactics")',
              },
            },
            required: ['reason'],
          },
        }

        console.log('[VoiceSession] 📋 Registering trigger_assessment function with Gemini Live API')
        console.log('[VoiceSession] Function details:', {
          name: triggerAssessmentFunction.name,
          description: triggerAssessmentFunction.description.substring(0, 100) + '...',
          hasParameters: !!triggerAssessmentFunction.parameters
        })

        const handleTriggerAssessmentFunction = async ({ reason }: { reason: string }) => {
          console.log('[VoiceSession] 🤖 AI explicitly triggered assessment via function call:', reason)

          try {
            // Use direct endpoint - AI has already decided to trigger, so just get assessments
            const response = await fetch(`/api/sessions/${sessionId}/assessments/direct`)
            if (!response.ok) {
              console.error('[VoiceSession] ❌ Assessment direct API error:', response.status)
              throw new Error('Failed to fetch assessment')
            }

            const data = await response.json()
            console.log('[VoiceSession] 📥 AI function call assessment response:', {
              assessmentsCount: data.assessments?.length || 0,
              count: data.count || 0
            })

            if (data.assessments && data.assessments.length > 0) {
              // Format the response to match what handleAssessmentTrigger expects
              const assessmentData = {
                shouldTrigger: true,
                reason: reason || 'AI requested assessment',
                assessments: data.assessments
              }

              if (handleAssessmentTriggerRef.current) {
                console.log('[VoiceSession] ✅ Calling assessment trigger handler with', data.assessments.length, 'assessment(s)')
                handleAssessmentTriggerRef.current(assessmentData)
              } else {
                console.warn('[VoiceSession] ⚠️ Assessment trigger handler not available')
              }

              return {
                success: true,
                message: `Assessment triggered: "${data.assessments[0].question_text}"`,
                assessmentId: data.assessments[0].id,
              }
            }

            console.warn('[VoiceSession] ⚠️ No assessment available for this scenario')
            return {
              success: false,
              message: 'No assessment available. Continue the conversation.',
            }
          } catch (error) {
            console.error('[VoiceSession] ❌ Error triggering assessment:', error)
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
1. CRITICAL - CONVERSATION INITIATION: You MUST initiate the conversation by greeting the user when the session starts. Do not wait for the user to speak first. Greet them warmly, introduce yourself as their AI training coach, and explain that you're ready to begin the training session. This is your first priority when the session begins.
2. Guide the user through realistic training conversations
3. Provide constructive feedback in real-time
4. When user asks for an assessment, quiz, or knowledge check, IMMEDIATELY call trigger_assessment function - do NOT just talk about it
5. Use trigger_assessment function when you decide it's the right moment to test the user's knowledge (typically after 3-5 good interactions, when a key concept has been discussed)
6. CRITICAL - ASSESSMENT RESPONSES: When you receive a message starting with "I just submitted my assessment answer", you MUST respond IMMEDIATELY with voice feedback. Do NOT wait for additional user input. Do NOT remain silent. Treat this as a direct question requiring an immediate answer. If the answer is correct, respond with "That's correct! Great job! [brief encouragement]. Let's continue..." If incorrect, respond with "That's not quite right. The correct answer is [X] because [brief reason]. Let's continue practicing..." You MUST speak your response immediately after receiving this message - do not wait for the user to speak again.
7. ALWAYS listen carefully and respond appropriately
8. If user says something inappropriate, politely redirect to training
9. Acknowledge interruptions gracefully

CRITICAL - ASSESSMENT FUNCTION CALLING:
You have access to a function called trigger_assessment. When triggered, it will display an assessment panel to the user.

YOU MUST CALL trigger_assessment FUNCTION in these situations:
1. User explicitly requests assessment/quiz/question - examples:
   - "send me an assessment"
   - "give me a quiz" 
   - "I want an assessment"
   - "show me a question"
   - "test my knowledge"
   - "let me do an assessment"
   When you hear ANY of these, IMMEDIATELY call trigger_assessment function. Do NOT respond with words first - CALL THE FUNCTION.

2. After discussing key concepts (typically 3-5 interactions) when a knowledge check would be valuable.

3. When you want to test understanding of a specific topic that was just discussed.

IMPORTANT:
- DO NOT say "I'll send you an assessment" - just CALL THE FUNCTION
- DO NOT say "Let me show you a quiz" - just CALL THE FUNCTION  
- Assessments only appear when you call trigger_assessment - they won't appear automatically
- When user asks for assessment, CALL THE FUNCTION IMMEDIATELY without extra dialogue

GENERAL RULES:
- ALWAYS speak in English only
- Be responsive and engaging
- When interrupted, stop and listen, then respond
- Be supportive but challenging
- REMEMBER: You MUST greet the user first when the session starts - do not wait for them to speak`

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
            // Log message structure for debugging (especially function calls)
            if (message.serverContent?.modelTurn?.parts) {
              const hasFunctionCall = message.serverContent.modelTurn.parts.some((p: any) => p.functionCall)
              if (hasFunctionCall) {
                console.log('[VoiceSession] 🔍 Message contains function call:', JSON.stringify(message.serverContent.modelTurn.parts, null, 2))
              }
            }

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

                    // Check if AI mentions testing/assessment and trigger if needed
                    await triggerAssessmentByKeywords(completeMessage, 'ai')

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
                    // Auto-mute mic when AI starts speaking to prevent noise transcription
                    setIsMicMuted(true)
                    isMicMutedRef.current = true
                    onVoiceStateChange?.({
                      isListening: false,
                      isSpeaking: true,
                      isConnected: true,
                      isMicMuted: true,
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
                    console.log('[VoiceSession] 🔧 Function call received:', functionCall.name, functionCall.args)

                    if (functionCall.name === 'trigger_assessment') {
                      const reason = functionCall.args?.reason || 'Assessment requested'
                      console.log('[VoiceSession] 🎯 Processing trigger_assessment function call with reason:', reason)

                      try {
                        const result = await handleTriggerAssessmentFunction({ reason })
                        console.log('[VoiceSession] ✅ Assessment function result:', result)

                        if (sessionRef.current) {
                          sessionRef.current.sendToolResponse({
                            name: functionCall.name,
                            response: result,
                          })
                          console.log('[VoiceSession] 📤 Sent tool response to AI')
                        } else {
                          console.error('[VoiceSession] ❌ Cannot send tool response - session not available')
                        }
                      } catch (error) {
                        console.error('[VoiceSession] ❌ Error processing trigger_assessment:', error)
                        if (sessionRef.current) {
                          sessionRef.current.sendToolResponse({
                            name: functionCall.name,
                            response: {
                              success: false,
                              message: 'Failed to trigger assessment. Please try again.',
                            },
                          })
                        }
                      }
                    } else {
                      console.warn('[VoiceSession] ⚠️ Unknown function call:', functionCall.name)
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

                    // Check if user requests assessment and trigger if needed
                    await triggerAssessmentByKeywords(completeMessage, 'user')

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
            onopen: async () => {
              console.log('[VoiceSession] Connected to Gemini Live API')
              setIsConnected(true)
              isSessionOpenRef.current = true

              // Send initial greeting to trigger AI to speak first
              // Wait a brief moment to ensure session is fully ready
              setTimeout(() => {
                if (sessionRef.current && isSessionOpenRef.current) {
                  console.log('[VoiceSession] 🎤 Sending initial greeting prompt to trigger AI response')
                  try {
                    sessionRef.current.sendClientContent({
                      turns: [{
                        role: 'user',
                        parts: [{ text: 'Please greet me and introduce yourself as my AI training coach. Let\'s begin the training session.' }]
                      }]
                    })
                    console.log('[VoiceSession] ✅ Initial greeting prompt sent - AI should respond now')
                  } catch (error) {
                    console.error('[VoiceSession] ❌ Error sending initial greeting:', error)
                  }
                }
              }, 500) // Small delay to ensure session is fully ready
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

      // Note: Assessments are now ONLY triggered by AI via function call (trigger_assessment)
      // The AI decides when to show assessments based on conversation flow and knowledge checks
    } catch (error) {
      console.error('[VoiceSession] Error saving turn:', error)
    }
  }

  const handleAssessmentTrigger = useCallback((assessmentData: any) => {
    console.log('[VoiceSession] 🟢 Assessment trigger received:', assessmentData)

    if (!assessmentData) {
      console.warn('[VoiceSession] ⚠️ Assessment trigger called with no data')
      return
    }

    // Handle both formats: { assessments: [...] } or direct assessment object
    const assessments = assessmentData.assessments || (assessmentData.id ? [assessmentData] : [])

    if (assessments.length === 0) {
      console.warn('[VoiceSession] ⚠️ No assessments in trigger data:', assessmentData)
      return
    }

    const assessment = assessments[0]
    console.log('[VoiceSession] ✅ Setting assessment:', {
      id: assessment.id,
      question: assessment.question_text?.substring(0, 50) + '...',
      optionsCount: assessment.options?.length || 0
    })

    setCurrentAssessment(assessment)
    onAssessmentStateChange?.(assessment)
    onAssessmentTrigger?.(assessmentData)

    // Auto-mute mic when assessment is triggered to prevent noise transcription
    setIsListening(false)
    setIsMicMuted(true)
    isMicMutedRef.current = true

    onVoiceStateChange?.({
      isListening: false,
      isSpeaking: false,
      isConnected: true,
      isMicMuted: true,
    })

    // Update last trigger time and ref
    lastAssessmentTriggerRef.current = Date.now()
    currentAssessmentRef.current = assessment
  }, [onAssessmentTrigger, onAssessmentStateChange, onVoiceStateChange, isMicMuted])

  // Helper function to trigger assessment by keyword/phrase detection
  const triggerAssessmentByKeywords = useCallback(async (message: string, source: 'user' | 'ai') => {
    // Check cooldown
    const timeSinceLastTrigger = Date.now() - lastAssessmentTriggerRef.current
    if (timeSinceLastTrigger < ASSESSMENT_TRIGGER_COOLDOWN) {
      console.log('[VoiceSession] ⏳ Assessment trigger on cooldown, skipping')
      return
    }

    // Check if already showing an assessment
    if (currentAssessmentRef.current) {
      console.log('[VoiceSession] ⏸️ Assessment already active, skipping trigger')
      return
    }

    const messageLower = message.toLowerCase()

    // Keywords/phrases that indicate assessment request
    const userAssessmentKeywords = [
      'send me an assessment',
      'give me an assessment',
      'i want an assessment',
      'show me an assessment',
      'give me a quiz',
      'send me a quiz',
      'i want a quiz',
      'show me a quiz',
      'give me a question',
      'test my knowledge',
      'let me do an assessment',
      'trigger assessment',
      'start assessment',
    ]

    // AI phrases that indicate it wants to test/assess
    const aiAssessmentKeywords = [
      'test your understanding',
      'test your knowledge',
      'check your understanding',
      'knowledge check',
      'assessment',
      'quiz',
      'test your comprehension',
      'evaluate your understanding',
    ]

    const shouldTrigger = source === 'user'
      ? userAssessmentKeywords.some(keyword => messageLower.includes(keyword))
      : aiAssessmentKeywords.some(keyword => messageLower.includes(keyword))

    if (shouldTrigger) {
      console.log(`[VoiceSession] 🔍 Assessment keyword detected in ${source} message:`, message.substring(0, 100))
      console.log('[VoiceSession] 🚀 Triggering assessment via keyword detection')

      try {
        const response = await fetch(`/api/sessions/${sessionId}/assessments/direct`)
        if (!response.ok) {
          console.error('[VoiceSession] ❌ Assessment direct API error:', response.status)
          return
        }

        const data = await response.json()
        console.log('[VoiceSession] 📥 Keyword-triggered assessment response:', {
          assessmentsCount: data.assessments?.length || 0
        })

        if (data.assessments && data.assessments.length > 0) {
          const assessmentData = {
            shouldTrigger: true,
            reason: `${source} requested assessment via keyword detection`,
            assessments: data.assessments
          }

          handleAssessmentTrigger(assessmentData)
        } else {
          console.warn('[VoiceSession] ⚠️ No assessments available for keyword trigger')
        }
      } catch (error) {
        console.error('[VoiceSession] ❌ Error triggering assessment via keywords:', error)
      }
    }
  }, [sessionId, handleAssessmentTrigger])

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

      // Get correct answer text
      let correctAnswerText = currentAssessment.correct_answer || ''
      if (currentAssessment.options && Array.isArray(currentAssessment.options)) {
        const correctOption = currentAssessment.options.find((opt: any) => {
          if (typeof opt === 'string') return opt === correctAnswerText
          return opt.is_correct || opt.isCorrect || opt.text === correctAnswerText
        })
        if (correctOption) {
          correctAnswerText = typeof correctOption === 'string' ? correctOption : (correctOption.text || correctAnswerText)
        }
      }

      // Create explicit message that requires immediate AI response
      // Make it very clear that immediate voice feedback is required
      const assessmentMessage = data.isCorrect
        ? `I just submitted my assessment answer. Question: "${currentAssessment.question_text}". My answer: "${selectedText}". Result: CORRECT. ${data.feedback ? `Feedback: ${data.feedback}. ` : ''}Please provide immediate voice feedback on my answer right now.`
        : `I just submitted my assessment answer. Question: "${currentAssessment.question_text}". My answer: "${selectedText}". Result: INCORRECT. The correct answer is "${correctAnswerText}". ${data.feedback ? `Feedback: ${data.feedback}. ` : ''}Please provide immediate voice feedback explaining why "${correctAnswerText}" is correct right now.`

      console.log('[VoiceSession] 📤 Sending assessment result to AI (expecting immediate response):', {
        isCorrect: data.isCorrect,
        messagePreview: assessmentMessage.substring(0, 100) + '...'
      })

      // Save turn
      await saveTurn('user', assessmentMessage)

      onTurnComplete?.({
        speaker: 'user',
        message: `Assessment: "${selectedText}"`,
      })

      // Verify session is ready
      if (!sessionRef.current || !isSessionOpenRef.current) {
        console.error('[VoiceSession] ❌ Session not ready to send message')
        toast.error('Session not ready', { description: 'Please wait a moment' })
        return
      }

      // Send to Live API - use sendClientContent to send text message
      // The key is to send the text message, then immediately send audio input
      // to trigger the API to process and respond
      console.log('[VoiceSession] 📡 Sending assessment message to Gemini Live API...')
      console.log('[VoiceSession] Message content:', assessmentMessage.substring(0, 200) + '...')

      try {
        // Step 1: Send the text message via sendClientContent
        // This adds the message to the conversation context
        sessionRef.current.sendClientContent({
          turns: [{
            role: 'user',
            parts: [{ text: assessmentMessage }]
          }]
        })
        console.log('[VoiceSession] ✅ Text message sent via sendClientContent')

        // Step 2: Send silence chunks over time to signal end of turn
        // The API needs to detect silence to know the user has finished speaking
        // Send multiple smaller chunks to simulate natural speech ending
        const sampleRate = 16000
        const chunkDuration = 0.5 // 0.5 seconds per chunk
        const totalChunks = 6 // 3 seconds total (6 chunks × 0.5s)
        const samplesPerChunk = Math.floor(chunkDuration * sampleRate)

        // Send silence chunks with small delays between them
        // This simulates natural speech patterns where silence builds up
        for (let i = 0; i < totalChunks; i++) {
          await new Promise(resolve => setTimeout(resolve, i === 0 ? 150 : 100))

          const silenceBuffer = new Int16Array(samplesPerChunk).fill(0)
          const uint8Array = new Uint8Array(silenceBuffer.buffer)
          const base64Silence = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))

          sessionRef.current.sendRealtimeInput({
            audio: {
              data: base64Silence,
              mimeType: "audio/pcm;rate=16000"
            }
          })

          if (i === 0) {
            console.log('[VoiceSession] ✅ Started sending silence chunks to signal end of turn...')
          }
        }
        console.log('[VoiceSession] ✅ Sent 3s of silence in chunks - AI should respond now')
        console.log('[VoiceSession] ⏳ Waiting for AI to process and respond...')
      } catch (error: any) {
        console.error('[VoiceSession] ❌ Error sending message to AI:', error)
        toast.error('Failed to send message to AI', {
          description: error.message || 'Please try again'
        })
        return
      }

      // Show toast
      if (data.isCorrect) {
        toast.success('Correct!', { description: 'AI is responding...' })
      } else {
        toast.info('Answer submitted', { description: 'AI is providing feedback...' })
      }

      // Clear assessment UI (but keep ref until AI responds)
      setCurrentAssessment(null)
      // Note: Keep currentAssessmentRef.current set until AI finishes responding
      // This ensures mic stays muted during AI feedback
      onAssessmentStateChange?.(null)

      // Set state to wait for AI response (not listening yet, AI will speak)
      // Mic is already muted from assessment trigger, keep it muted during AI response
      setIsListening(false) // AI will respond, so we're not listening to user yet
      setIsSpeaking(false)  // Will become true when AI starts speaking

      onVoiceStateChange?.({
        isListening: false, // Will become true after AI finishes speaking
        isSpeaking: false,  // Will become true when AI response arrives
        isConnected: true,
        isMicMuted: true, // Keep mic muted until AI finishes feedback
      })

      console.log('[VoiceSession] ⏳ Waiting for AI to respond to assessment submission...')

    } catch (error) {
      console.error('[VoiceSession] Error submitting assessment:', error)
      toast.error('Failed to submit answer')

      setCurrentAssessment(null)
      currentAssessmentRef.current = null
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
