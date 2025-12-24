'use client'

import { useEffect, useRef, useState } from 'react'

interface VoiceVisualizationProps {
  isListening: boolean
  isSpeaking: boolean
  isMicMuted: boolean
  audioLevel?: number // 0-100, optional real-time audio level
  onMicToggle?: () => void
}

export function VoiceVisualization({ isListening, isSpeaking, isMicMuted, audioLevel, onMicToggle }: VoiceVisualizationProps) {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([])
  const animationRef = useRef<number>()

  // Initialize waveform bars
  useEffect(() => {
    const bars = Array.from({ length: 13 }, () => Math.random() * 20 + 8)
    setWaveformHeights(bars)
  }, [])

  // Animate waveform based on listening/speaking state
  useEffect(() => {
    const animate = () => {
      setWaveformHeights((prev) => {
        if (isListening || isSpeaking) {
          // Active animation - use real audio level if provided, otherwise random
          const baseLevel = audioLevel !== undefined ? audioLevel / 5 : Math.random() * 30 + 10
          return prev.map(() => baseLevel + Math.random() * 15)
        } else {
          // Idle animation - smaller, slower
          return prev.map((h) => Math.max(4, h * 0.9 + Math.random() * 4))
        }
      })
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening, isSpeaking, audioLevel])

  return (
    <div className="relative bg-gradient-to-b from-[#2a0a0f] to-[#1a0507] rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-center overflow-hidden border border-bm-gold/20 flex-grow min-h-[300px]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bm-maroon rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
      
      {/* Status Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
            isListening ? 'bg-feedback-positive' : isSpeaking ? 'bg-bm-gold' : 'bg-bm-grey'
          } opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isListening ? 'bg-feedback-positive' : isSpeaking ? 'bg-bm-gold' : 'bg-bm-grey'
          }`}></span>
        </span>
        <span className="text-white/80 text-[10px] font-semibold tracking-wider uppercase">
          {isMicMuted ? 'Mic Muted' : isListening ? 'Listening' : isSpeaking ? 'AI Speaking' : 'Ready'}
        </span>
      </div>

      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-24 w-full z-10 px-3">
        {waveformHeights.map((height, index) => (
          <div
            key={index}
            className="visualizer-bar rounded-full bg-gradient-to-t from-bm-gold to-bm-gold-dark opacity-80 transition-all duration-150"
            style={{
              height: `${Math.max(4, height * 3)}px`,
              width: '8px',
              animationDelay: `${index * 0.1}s`,
              animation: isListening || isSpeaking ? 'wave 1.2s ease-in-out infinite' : 'none',
            }}
          ></div>
        ))}
      </div>

      {/* Center Icon - Mic Toggle Button */}
      <div className="mt-6 z-10 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-bm-gold to-bm-maroon rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <button
          onClick={onMicToggle}
          className={`relative w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-glow hover:scale-110 active:scale-95 ${
            isMicMuted ? 'bg-red-500/20 border-red-400/40' : isListening || isSpeaking ? 'scale-110' : ''
          }`}
          title={isMicMuted ? 'Click to unmute microphone' : 'Click to mute microphone'}
        >
          <span className="material-symbols-outlined text-3xl">
            {isMicMuted ? 'mic_off' : isListening ? 'mic' : isSpeaking ? 'volume_up' : 'mic'}
          </span>
        </button>
      </div>

      {/* Status Text */}
      <p className="mt-4 text-bm-white/60 text-xs font-medium z-10">
        {isMicMuted 
          ? 'Microphone is muted - click mic to unmute' 
          : isListening 
            ? 'Speak clearly to continue...' 
            : isSpeaking 
              ? 'AI is responding...' 
              : 'Waiting for input...'}
      </p>
    </div>
  )
}

