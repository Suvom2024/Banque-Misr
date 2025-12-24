'use client'

import { useRef, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface TranscriptMessage {
  id: string
  speaker: 'ai-coach' | 'user'
  speakerLabel: string
  timestamp: string
  message: string
  feedback?: {
    type: 'strength' | 'coaching'
    text: string
  }
  audioAvailable?: boolean
}

interface ConversationTranscriptProps {
  messages: TranscriptMessage[]
  userAvatar?: string
}

function ConversationTranscriptComponent({ messages, userAvatar }: ConversationTranscriptProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Virtualize messages for better scroll performance
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Approximate message height
    overscan: 3, // Render 3 extra messages above/below viewport
  })
  return (
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-5">
      <div className="flex items-center justify-between mb-3 border-b border-bm-grey/40 pb-3">
        <h3 className="text-sm font-bold text-bm-text-primary tracking-tight leading-tight flex items-center gap-1.5">
          <span className="material-symbols-outlined text-bm-maroon text-base">forum</span>
          Conversation Transcript
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold bg-bm-light-grey px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Audio Available
        </div>
      </div>
      <div ref={parentRef} className="max-h-[400px] overflow-y-auto pr-3 scroll-optimized custom-scrollbar">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index]
            
            if (message.speaker === 'ai-coach') {
              return (
                <div
                  key={message.id}
                  className="flex gap-3 group absolute w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-bm-maroon flex-shrink-0 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-bm-gold text-base">smart_toy</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-bm-text-secondary uppercase">{message.speakerLabel}</span>
                      <span className="text-[9px] text-bm-text-subtle">{message.timestamp}</span>
                    </div>
                    <div className="bg-bm-light-grey p-3 rounded-xl rounded-tl-none text-bm-text-secondary text-xs leading-relaxed border border-bm-grey/50">
                      {message.message}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={message.id}
                className="flex gap-3 flex-row-reverse group absolute w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {userAvatar ? (
                  <img
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover shadow-md border border-white"
                    src={userAvatar}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bm-grey flex items-center justify-center shadow-md border border-white">
                    <span className="material-symbols-outlined text-bm-text-secondary text-sm">person</span>
                  </div>
                )}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="text-[9px] text-bm-text-subtle">{message.timestamp}</span>
                    <span className="text-[10px] font-bold text-bm-text-primary uppercase">You</span>
                    {message.audioAvailable && (
                      <button className="play-btn w-4 h-4 flex items-center justify-center text-bm-text-subtle transition-colors hover:text-bm-maroon">
                        <span className="material-symbols-outlined text-sm">play_circle</span>
                      </button>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-xl rounded-tr-none text-left text-xs leading-relaxed shadow-sm border relative overflow-hidden ${
                      message.feedback?.type === 'strength'
                        ? 'bg-feedback-positive-bg text-bm-text-primary border-feedback-positive/10'
                        : 'bg-feedback-negative-bg text-bm-text-primary border-feedback-negative/10'
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                        message.feedback?.type === 'strength' ? 'bg-feedback-positive' : 'bg-feedback-negative'
                      }`}
                    ></div>
                    {message.message}
                    {message.feedback && (
                      <div
                        className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold border-t pt-1.5 ${
                          message.feedback.type === 'strength'
                            ? 'text-feedback-positive border-feedback-positive/10'
                            : 'text-feedback-negative border-feedback-negative/10'
                        }`}
                      >
                        <span className="material-symbols-filled text-xs">
                          {message.feedback.type === 'strength' ? 'check_circle' : 'lightbulb'}
                        </span>
                        {message.feedback.type === 'strength' ? 'STRENGTH' : 'COACHING'}: {message.feedback.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const ConversationTranscript = memo(ConversationTranscriptComponent)

