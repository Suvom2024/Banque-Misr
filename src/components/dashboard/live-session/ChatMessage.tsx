'use client'

interface ChatMessageProps {
  id: string
  speaker: 'ai' | 'user'
  message: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  speakerName?: string
}

export function ChatMessage({ speaker, message, timestamp, status, speakerName }: ChatMessageProps) {
  if (speaker === 'ai') {
    return (
      <div className="flex items-end gap-2 max-w-[85%] group">
        <div className="w-6 h-6 rounded-full bg-bm-maroon flex items-center justify-center shadow-md flex-shrink-0 z-10 mb-1.5">
          <span className="material-symbols-outlined text-xs text-bm-gold">smart_toy</span>
        </div>
        <div className="flex flex-col">
          <div className="bg-white border border-bm-grey/60 p-3 rounded-xl rounded-bl-none shadow-card text-bm-text-secondary text-xs leading-relaxed">
            {message}
          </div>
          <span className="text-[9px] text-bm-text-subtle mt-0.5 ml-1">{speakerName || 'AI Coach'} • {timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 max-w-[85%] ml-auto flex-row-reverse group">
      <div className="w-6 h-6 rounded-full bg-bm-gold flex items-center justify-center shadow-md flex-shrink-0 z-10 mb-1.5 border border-white">
        <span className="material-symbols-outlined text-xs text-bm-maroon">person</span>
      </div>
      <div className="flex flex-col items-end">
        <div className="bg-gradient-to-br from-bm-maroon to-bm-maroon-dark text-white p-3 rounded-xl rounded-br-none shadow-md text-xs leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white opacity-5 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          {message}
        </div>
        <div className="flex items-center gap-0.5 mt-0.5 mr-1">
          <span className="text-[9px] text-bm-text-subtle">{timestamp}</span>
          {status === 'read' && (
            <span className="material-symbols-outlined text-[12px] text-bm-gold">done_all</span>
          )}
          {status === 'delivered' && (
            <span className="material-symbols-outlined text-[12px] text-bm-gold">done</span>
          )}
        </div>
      </div>
    </div>
  )
}



