'use client'

import { useState } from 'react'

interface DefineNewGoalCardProps {
  onGenerateGoal?: (goalText: string) => void
}

export function DefineNewGoalCard({ onGenerateGoal }: DefineNewGoalCardProps) {
  const [goalText, setGoalText] = useState('')
  const [showPreview, setShowPreview] = useState(true)

  const handleGenerate = () => {
    if (goalText.trim()) {
      onGenerateGoal?.(goalText)
      setGoalText('')
    }
  }

  return (
    <div className="bg-gradient-to-r from-bm-maroon to-bm-maroon-dark rounded-2xl shadow-lg p-1 animate-fade-in-up">
      <div className="bg-white rounded-[14px] p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-bm-maroon/5 rounded-xl hidden sm:block">
            <span className="material-symbols-outlined text-bm-maroon text-3xl">psychology_alt</span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-bm-text-primary mb-1 flex items-center gap-2">
              Define New Goal
              <span className="px-2 py-0.5 bg-bm-gold/20 text-bm-gold-dark text-[10px] uppercase font-bold rounded-full tracking-wide border border-bm-gold/30">
                AI Powered
              </span>
            </h2>
            <p className="text-sm text-bm-text-secondary mb-4">
              Type a general idea, and our AI will structure it into a S.M.A.R.T. development plan for you.
            </p>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-bm-text-subtle group-focus-within:text-bm-maroon transition-colors">edit</span>
              </div>
              <input
                className="block w-full pl-10 pr-32 py-4 border-2 border-bm-grey rounded-xl leading-5 bg-bm-light-grey placeholder-bm-text-subtle focus:outline-none focus:bg-white focus:border-bm-maroon focus:ring-0 transition-colors sm:text-sm shadow-sm"
                placeholder="e.g. 'I want to get better at handling angry customers' or 'Improve negotiation skills'"
                type="text"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                  onClick={handleGenerate}
                  className="bg-bm-gold hover:bg-bm-gold-dark text-bm-maroon font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 text-xs"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Generate Goal
                </button>
              </div>
            </div>
            {showPreview && (
              <div className="mt-4 p-4 bg-bm-light-grey/50 rounded-xl border border-bm-grey dashed border-dashed hidden md:block">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-bm-gold-dark text-lg mt-0.5">lightbulb</span>
                  <div>
                    <p className="text-xs font-bold text-bm-text-subtle uppercase mb-1">AI Suggestion Preview</p>
                    <p className="text-sm text-bm-text-primary italic">
                      "Achieve an average <strong className="text-bm-maroon">Empathy Score of 90%</strong> in 5 distinct customer
                      interaction scenarios within the next 30 days."
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-bm-grey rounded-md text-bm-text-secondary font-medium">
                        Focus: Empathetic Listening
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-bm-grey rounded-md text-bm-text-secondary font-medium">
                        Focus: De-escalation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

