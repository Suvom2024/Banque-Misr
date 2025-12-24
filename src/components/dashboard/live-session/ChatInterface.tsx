'use client'

import { ChatMessage } from './ChatMessage'
import { AICoachSuggestion } from './AICoachSuggestion'

export interface ChatMessageData {
  id: string
  speaker: 'ai' | 'user'
  message: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  speakerName?: string
  aiSuggestion?: string
}

interface ChatInterfaceProps {
  messages: ChatMessageData[]
}

export function ChatInterface({ messages }: ChatInterfaceProps) {
  return (
    <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gradient-to-b from-bm-light-grey/30 to-white">
      {messages.map((message, index) => (
        <div key={message.id}>
          <ChatMessage
            id={message.id}
            speaker={message.speaker}
            message={message.message}
            timestamp={message.timestamp}
            status={message.status}
            speakerName={message.speakerName}
          />
          {message.aiSuggestion && index === messages.length - 1 && (
            <div className="mt-3">
              <AICoachSuggestion suggestion={message.aiSuggestion} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}



