'use client'

import { useState } from 'react'

export interface TranscriptEntry {
  id: string
  speaker: 'user' | 'client'
  speakerName: string
  message: string
  highlights?: {
    type: 'positive' | 'improvement'
    text: string
    tooltip?: string
  }[]
}

interface ConversationTranscriptReviewProps {
  entries: TranscriptEntry[]
  userInitials?: string
}

export function ConversationTranscriptReview({
  entries,
  userInitials = 'AH',
}: ConversationTranscriptReviewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col h-[600px]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg text-bm-text-primary tracking-tight leading-tight">Conversation Transcript</h3>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Positive
          </span>
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-700 bg-red-50 px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Improvement
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 transcript-scroll">
        {entries.map((entry) => {
          const isUser = entry.speaker === 'user'
          const hasHighlights = entry.highlights && entry.highlights.length > 0

          return (
            <div key={entry.id} className="flex gap-4 group">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full ${
                  isUser ? 'bg-bm-maroon text-white' : 'bg-gray-200 text-bm-text-primary'
                } flex items-center justify-center font-bold text-sm mt-1 shadow-sm`}
              >
                {isUser ? userInitials : entry.speakerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-bm-text-primary">{entry.speakerName}</span>
                  <button
                    className={`opacity-0 group-hover:opacity-100 text-bm-maroon hover:bg-red-50 p-1 rounded transition-all ${
                      hoveredId === entry.id ? 'opacity-100' : ''
                    }`}
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    title="Play Segment"
                  >
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                  </button>
                </div>
                <div
                  className={`text-sm text-bm-text-primary leading-relaxed p-3 rounded-lg rounded-tl-none ${
                    hasHighlights
                      ? entry.highlights![0].type === 'positive'
                        ? 'bg-green-50/50 border border-green-100'
                        : 'bg-red-50/30 border border-red-100'
                      : isUser
                        ? 'bg-gray-50'
                        : 'bg-white border border-gray-100 shadow-sm'
                  }`}
                >
                  {hasHighlights ? (
                    <>
                      {entry.message.split(entry.highlights![0].text).map((part, index, array) => {
                        if (index === array.length - 1) return part
                        const highlight = entry.highlights![0]
                        return (
                          <span key={index}>
                            {part}
                            <span
                              className={`${
                                highlight.type === 'positive'
                                  ? 'bg-green-100 text-green-800 border-b-2 border-green-200'
                                  : 'bg-red-100 text-red-800 border-b-2 border-red-200'
                              } px-1 py-0.5 rounded font-medium cursor-help`}
                              title={highlight.tooltip || ''}
                            >
                              {highlight.text}
                            </span>
                          </span>
                        )
                      })}
                    </>
                  ) : (
                    entry.message
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

