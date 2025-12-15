'use client'

import { ToneSlider } from './ToneSlider'

export interface SessionDetails {
  scenarioId: string
  title: string
  id: string
  description: string
  skills: Array<{ icon: string; label: string }>
  tone: 'Supportive' | 'Neutral' | 'Direct'
  difficulty: string
  estimatedXP: number
}

interface SessionDetailsPanelProps {
  details?: SessionDetails
  onToneChange?: (tone: 'Supportive' | 'Neutral' | 'Direct') => void
  onBeginSession?: () => void
}

const defaultDetails: SessionDetails = {
  scenarioId: '1',
  title: 'Underperformance Discussion',
  id: '#4205',
  description:
    "This scenario simulates a delicate conversation with a tenured employee. You'll practice separating personal feelings from professional standards.",
  skills: [
    { icon: 'star', label: 'Empathy' },
    { icon: 'balance', label: 'Fairness' },
    { icon: 'record_voice_over', label: 'Clarity' },
  ],
  tone: 'Neutral',
  difficulty: 'Medium',
  estimatedXP: 150,
}

export function SessionDetailsPanel({ details = defaultDetails, onToneChange, onBeginSession }: SessionDetailsPanelProps) {
  return (
    <div className="xl:col-span-4 h-full">
      <div className="bg-bm-white rounded-2xl shadow-card border border-bm-grey sticky top-0 p-8 h-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-bm-gold-light rounded-lg">
            <span className="material-symbols-outlined text-bm-maroon text-2xl">tune</span>
          </div>
          <h2 className="text-2xl font-bold text-bm-text-primary tracking-tighter leading-tight">Session Details</h2>
        </div>

        {/* Scenario Info */}
        <div className="mb-8 p-5 bg-bm-light-grey rounded-xl border border-bm-grey-dark/30">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-bm-text-primary">{details.title}</h3>
            <span className="text-xs font-bold text-bm-maroon bg-white px-2 py-1 rounded border border-bm-maroon/10">
              ID: {details.id}
            </span>
          </div>
          <p className="text-sm text-bm-text-secondary mb-4 leading-relaxed">
            <span className="font-semibold text-bm-maroon block mb-1">What you'll learn:</span>
            {details.description}
          </p>
          {/* Skill Tags */}
          <div className="flex flex-wrap gap-2">
            {details.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-bm-white border border-bm-grey text-bm-text-secondary"
              >
                <span className="material-symbols-outlined text-sm text-bm-gold-hover">{skill.icon}</span>
                {skill.label}
              </span>
            ))}
          </div>
        </div>

        {/* Tone Slider */}
        <ToneSlider value={details.tone} onChange={onToneChange} />

        {/* Difficulty and XP */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-bm-white p-3 rounded-lg border border-bm-grey text-center">
            <div className="text-xs text-bm-text-subtle uppercase font-semibold mb-1">Difficulty</div>
            <div className="text-bm-maroon font-extrabold text-lg">{details.difficulty}</div>
          </div>
          <div className="bg-bm-white p-3 rounded-lg border border-bm-grey text-center">
            <div className="text-xs text-bm-text-subtle uppercase font-semibold mb-1">Est. XP</div>
            <div className="text-bm-gold-hover font-extrabold text-lg">+{details.estimatedXP} XP</div>
          </div>
        </div>

        {/* Begin Session Button */}
        <button
          className="group w-full bg-bm-gold hover:bg-bm-gold-hover text-bm-maroon-dark font-extrabold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
          onClick={onBeginSession}
        >
          Begin Session
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform font-bold">
            arrow_forward
          </span>
        </button>
        <p className="text-center text-xs text-bm-text-subtle mt-4">Last session completed 2 days ago</p>
      </div>
    </div>
  )
}
