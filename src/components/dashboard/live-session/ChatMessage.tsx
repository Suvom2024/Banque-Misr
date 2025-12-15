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
      <div className="flex items-end gap-3 max-w-[85%] group">
        <div className="w-8 h-8 rounded-full bg-bm-maroon flex items-center justify-center shadow-md flex-shrink-0 z-10 mb-2">
          <span className="material-symbols-outlined text-base text-bm-gold">smart_toy</span>
        </div>
        <div className="flex flex-col">
          <div className="bg-white border border-bm-grey/60 p-4 rounded-2xl rounded-bl-none shadow-card text-bm-text-secondary text-sm leading-relaxed">
            {message}
          </div>
          <span className="text-[10px] text-bm-text-subtle mt-1 ml-1">{speakerName || 'AI Coach'} • {timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-3 max-w-[85%] ml-auto flex-row-reverse group">
      <div className="w-8 h-8 rounded-full bg-bm-gold flex items-center justify-center shadow-md flex-shrink-0 z-10 mb-2 border border-white">
        <span className="material-symbols-outlined text-base text-bm-maroon">person</span>
      </div>
      <div className="flex flex-col items-end">
        <div className="bg-gradient-to-br from-bm-maroon to-bm-maroon-dark text-white p-4 rounded-2xl rounded-br-none shadow-md text-sm leading-relaxed relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          {message}
        </div>
        <div className="flex items-center gap-1 mt-1 mr-1">
          <span className="text-[10px] text-bm-text-subtle">{timestamp}</span>
          {status === 'read' && (
            <span className="material-symbols-outlined text-[14px] text-bm-gold">done_all</span>
          )}
          {status === 'delivered' && (
            <span className="material-symbols-outlined text-[14px] text-bm-gold">done</span>
          )}
        </div>
      </div>
    </div>
  )
}



