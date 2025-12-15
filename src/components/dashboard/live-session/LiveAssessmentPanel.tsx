'use client'

import { useState } from 'react'

interface AssessmentOption {
  id: string
  text: string
  isCorrect: boolean
}

interface LiveAssessmentPanelProps {
  question: string
  options: AssessmentOption[]
  timeLimit: number
  hint?: string
  onSubmit?: (selectedOptionId: string) => void
}

export function LiveAssessmentPanel({
  question,
  options,
  timeLimit,
  hint,
  onSubmit,
}: LiveAssessmentPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit?.(selectedOption)
    }
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-bm-gold/50 flex-grow min-h-[300px] animate-slide-up">
      <div className="bg-bm-maroon p-4 flex items-center justify-between border-b-4 border-bm-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-2 z-10">
          <span className="material-symbols-outlined text-bm-gold animate-pulse">quiz</span>
          <h2 className="text-white font-bold text-sm uppercase tracking-wide">Live Assessment</h2>
        </div>
        <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono text-bm-gold font-bold flex items-center gap-1 z-10">
          <span className="material-symbols-outlined text-sm">timer</span>
          {formatTime(timeRemaining)}
        </div>
      </div>
      <div className="p-6 flex flex-col h-full bg-bm-light-grey/30">
        <div className="mb-6">
          <span className="text-[10px] font-bold text-bm-text-subtle uppercase mb-1 block">Scenario Challenge</span>
          <p className="text-bm-text-primary font-bold text-base leading-snug">{question}</p>
        </div>
        <div className="space-y-3 mb-6">
          {options.map((option) => (
            <label
              key={option.id}
              className="quiz-option cursor-pointer block group"
              onClick={() => setSelectedOption(option.id)}
            >
              <input className="hidden" name="quiz" type="radio" checked={selectedOption === option.id} readOnly />
              <div
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all shadow-sm ${
                  selectedOption === option.id
                    ? 'border-bm-gold bg-feedback-neutral-bg'
                    : 'border-bm-grey bg-white hover:border-bm-maroon/30'
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 bg-white transition-all ${
                    selectedOption === option.id
                      ? 'border-bm-gold border-[5px]'
                      : 'border-bm-text-subtle'
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    selectedOption === option.id
                      ? 'text-bm-text-primary'
                      : 'text-bm-text-secondary group-hover:text-bm-text-primary'
                  }`}
                >
                  {option.text}
                </span>
              </div>
            </label>
          ))}
        </div>
        {hint && (
          <div className="mb-6">
            <details className="group" open={showHint} onToggle={(e) => setShowHint((e.target as HTMLDetailsElement).open)}>
              <summary className="list-none flex items-center gap-2 cursor-pointer text-xs font-bold text-bm-maroon hover:text-bm-maroon-dark transition-colors">
                <span className="bg-bm-gold/20 p-1 rounded-full">
                  <span className="material-symbols-outlined text-sm text-bm-maroon">lightbulb</span>
                </span>
                Need a hint? (AI Coach)
              </summary>
              <div className="mt-2 p-3 bg-bm-gold/10 border border-bm-gold/30 rounded-lg text-xs text-bm-text-secondary animate-in fade-in slide-in-from-top-2">
                <span className="font-bold text-bm-maroon">Hint:</span> {hint}
              </div>
            </details>
          </div>
        )}
        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className={`w-full bg-gradient-to-r from-bm-gold to-bm-gold-dark hover:from-bm-gold-dark hover:to-bm-gold text-bm-maroon-dark font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-glow transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${
              !selectedOption ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span>Submit Answer</span>
            <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}



