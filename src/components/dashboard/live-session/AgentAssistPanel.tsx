'use client'

import { useState } from 'react'

interface AgentAssistPanelProps {
  suggestion: string
  suggestedResponses: string[]
  onSelectResponse?: (response: string) => void
  onDismiss?: () => void
}

export function AgentAssistPanel({
  suggestion,
  suggestedResponses,
  onSelectResponse,
  onDismiss,
}: AgentAssistPanelProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <div className="bg-bm-light-grey/50 border border-bm-gold/30 rounded-xl p-3 flex gap-3 items-start mb-5 animate-fade-in">
      <div className="bg-bm-gold/10 p-1.5 rounded-lg text-bm-gold-dark">
        <span className="material-symbols-outlined text-xl">auto_awesome</span>
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-bm-text-primary mb-1.5 flex items-center gap-1.5">
          Agent Assist
          <span className="text-[9px] font-normal text-bm-text-secondary bg-bm-white px-1.5 py-0.5 rounded border border-bm-grey">
            AI Suggestion
          </span>
        </h4>
        <p className="text-bm-text-secondary text-xs mb-2.5">{suggestion}</p>
        <div className="flex gap-1.5 flex-wrap">
          {suggestedResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => onSelectResponse?.(response)}
              className="bg-bm-white hover:bg-bm-light-grey text-bm-maroon border border-bm-grey/60 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition-colors shadow-sm"
            >
              {response}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleDismiss} className="text-bm-text-subtle hover:text-bm-maroon">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}



