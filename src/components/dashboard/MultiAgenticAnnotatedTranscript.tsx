'use client'

import { useState } from 'react'

export interface AnnotatedTranscriptEntry {
  id: string
  speaker: 'user' | 'client'
  message: string
  timestamp: string
  highlights?: {
    text: string
    type: 'empathy' | 'compliance' | 'positive'
    tooltip?: string
  }[]
  complianceAlert?: string
}

interface MultiAgenticAnnotatedTranscriptProps {
  entries: AnnotatedTranscriptEntry[]
}

export function MultiAgenticAnnotatedTranscript({ entries }: MultiAgenticAnnotatedTranscriptProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const getHighlightClass = (type: string) => {
    switch (type) {
      case 'empathy':
        return 'bg-yellow-500/30 border-b border-yellow-300'
      case 'compliance':
        return 'bg-red-500/30 border-b border-red-300'
      case 'positive':
        return 'bg-green-500/30 border-b border-green-300'
      default:
        return 'bg-gray-500/30 border-b border-gray-300'
    }
  }

  return (
    <div className="bg-bm-white rounded-2xl shadow-card border border-bm-grey flex flex-col h-[600px]">
      <div className="p-3 border-b border-bm-grey bg-bm-light-grey/30 rounded-t-2xl">
        <h3 className="font-bold text-base text-bm-text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-bm-text-secondary text-lg">description</span>
          Annotated Transcript
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-1 items-end group">
            {entry.speaker === 'user' && (
              <>
                <div className="bg-bm-maroon text-bm-white p-2.5 rounded-2xl rounded-tr-none text-xs max-w-[90%] shadow-sm relative">
                  {entry.highlights && entry.highlights.length > 0 ? (
                    <p>
                      {entry.message.split(entry.highlights[0].text).map((part, index, array) => {
                        if (index === array.length - 1) return part
                        const highlight = entry.highlights![0]
                        return (
                          <span key={index}>
                            {part}
                            <span
                              className={`${getHighlightClass(highlight.type)} cursor-pointer`}
                              title={highlight.tooltip || ''}
                              onMouseEnter={() => setHoveredId(entry.id)}
                              onMouseLeave={() => setHoveredId(null)}
                            >
                              {highlight.text}
                            </span>
                          </span>
                        )
                      })}
                    </p>
                  ) : (
                    <p>{entry.message}</p>
                  )}
                  {hoveredId === entry.id && entry.highlights && entry.highlights[0].tooltip && (
                    <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-white p-2.5 rounded-lg shadow-xl border border-bm-gold z-10 text-bm-text-primary animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-bm-gold text-xs">lightbulb</span>
                        <div>
                          <p className="text-[10px] font-bold text-bm-gold-dark uppercase mb-1">Empathy Hint</p>
                          <p className="text-[10px] text-bm-text-secondary">{entry.highlights[0].tooltip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {entry.complianceAlert && (
                    <div className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-md border border-bm-maroon cursor-pointer group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-bm-maroon text-xs block">gavel</span>
                    </div>
                  )}
                </div>
                <div className="text-[9px] text-bm-text-subtle font-medium">You • {entry.timestamp}</div>
              </>
            )}
            {entry.speaker === 'client' && (
              <>
                <div className="bg-bm-light-grey text-bm-text-primary p-2.5 rounded-2xl rounded-tl-none text-xs max-w-[90%] border border-bm-grey shadow-sm">
                  <p>{entry.message}</p>
                </div>
                <div className="text-[9px] text-bm-text-subtle font-medium">Client • {entry.timestamp}</div>
              </>
            )}
            {entry.complianceAlert && (
              <div className="flex justify-center my-2 w-full">
                <div className="bg-red-50 border border-red-100 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-bm-maroon text-[10px]">warning</span>
                  <span className="text-[9px] font-bold text-bm-maroon uppercase tracking-wide">{entry.complianceAlert}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

