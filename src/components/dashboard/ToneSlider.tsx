'use client'

import { useState } from 'react'

type Tone = 'Supportive' | 'Neutral' | 'Direct'

interface ToneSliderProps {
  value?: Tone
  onChange?: (tone: Tone) => void
}

export function ToneSlider({ value = 'Neutral', onChange }: ToneSliderProps) {
  const [tone, setTone] = useState<Tone>(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = parseInt(e.target.value)
    let newTone: Tone = 'Neutral'
    
    if (sliderValue < 33) {
      newTone = 'Supportive'
    } else if (sliderValue > 66) {
      newTone = 'Direct'
    } else {
      newTone = 'Neutral'
    }
    
    setTone(newTone)
    onChange?.(newTone)
  }

  const getSliderValue = () => {
    switch (tone) {
      case 'Supportive':
        return 0
      case 'Direct':
        return 100
      default:
        return 50
    }
  }

  const getToneDescription = () => {
    switch (tone) {
      case 'Supportive':
        return 'The AI will respond with empathetic and understanding emotions. Best for practicing compassionate communication.'
      case 'Direct':
        return 'The AI will respond with straightforward and assertive emotions. Best for practicing confident leadership.'
      default:
        return 'The AI will respond with balanced emotions. Best for practicing standard protocol adherence.'
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-bm-text-primary text-lg">Conversation Tone</h3>
        <span className="text-sm font-semibold text-bm-maroon bg-bm-maroon/5 px-2 py-0.5 rounded">{tone}</span>
      </div>
      <div className="relative py-4 px-2">
        <input
          className="w-full relative z-10"
          id="tone-slider"
          max="100"
          min="0"
          type="range"
          value={getSliderValue()}
          onChange={handleChange}
        />
        {/* Position Markers */}
        <div className="absolute top-[22px] left-0 w-full flex justify-between px-1 pointer-events-none">
          <div className="w-1 h-2 bg-bm-grey-dark rounded-full"></div>
          <div className="w-1 h-2 bg-bm-grey-dark rounded-full"></div>
          <div className="w-1 h-2 bg-bm-grey-dark rounded-full"></div>
        </div>
      </div>
      {/* Labels */}
      <div className="flex justify-between text-xs font-bold text-bm-text-subtle uppercase tracking-wide mt-1">
        <span>Supportive</span>
        <span className={tone === 'Neutral' ? 'text-bm-text-primary' : ''}>Neutral</span>
        <span>Direct</span>
      </div>
      {/* Info Box */}
      <div className="mt-4 p-3 bg-bm-gold-light/50 border border-bm-gold/20 rounded-lg flex gap-3 items-start">
        <span className="material-symbols-outlined text-bm-gold-hover text-xl mt-0.5">info</span>
        <p className="text-xs text-bm-text-secondary leading-snug">
          <span className="font-bold text-bm-maroon-dark">{tone} Tone:</span> {getToneDescription()}
        </p>
      </div>
    </div>
  )
}


