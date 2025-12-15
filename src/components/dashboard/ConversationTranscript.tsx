'use client'

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

export function ConversationTranscript({ messages, userAvatar }: ConversationTranscriptProps) {
  return (
    <section className="bg-white rounded-2xl shadow-card border border-bm-grey/60 p-6">
      <div className="flex items-center justify-between mb-4 border-b border-bm-grey/40 pb-4">
        <h3 className="text-lg font-bold text-bm-text-primary tracking-tight leading-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-bm-maroon">forum</span>
          Conversation Transcript
        </h3>
        <div className="flex items-center gap-2 text-xs font-semibold bg-bm-light-grey px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Audio Available
        </div>
      </div>
      <div className="max-h-[400px] overflow-y-auto pr-4 space-y-5 custom-scrollbar">
        {messages.map((message) => {
          if (message.speaker === 'ai-coach') {
            return (
              <div key={message.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-bm-maroon flex-shrink-0 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-bm-gold text-xl">smart_toy</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-bm-text-secondary uppercase">{message.speakerLabel}</span>
                    <span className="text-[10px] text-bm-text-subtle">{message.timestamp}</span>
                  </div>
                  <div className="bg-bm-light-grey p-4 rounded-2xl rounded-tl-none text-bm-text-secondary text-sm leading-relaxed border border-bm-grey/50">
                    {message.message}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={message.id} className="flex gap-4 flex-row-reverse group">
              {userAvatar ? (
                <img
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover shadow-md border border-white"
                  src={userAvatar}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-bm-grey flex items-center justify-center shadow-md border border-white">
                  <span className="material-symbols-outlined text-bm-text-secondary">person</span>
                </div>
              )}
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-[10px] text-bm-text-subtle">{message.timestamp}</span>
                  <span className="text-xs font-bold text-bm-text-primary uppercase">You</span>
                  {message.audioAvailable && (
                    <button className="play-btn w-5 h-5 flex items-center justify-center text-bm-text-subtle transition-colors hover:text-bm-maroon">
                      <span className="material-symbols-outlined text-lg">play_circle</span>
                    </button>
                  )}
                </div>
                <div
                  className={`p-4 rounded-2xl rounded-tr-none text-left text-sm leading-relaxed shadow-sm border relative overflow-hidden ${
                    message.feedback?.type === 'strength'
                      ? 'bg-feedback-positive-bg text-bm-text-primary border-feedback-positive/10'
                      : 'bg-feedback-negative-bg text-bm-text-primary border-feedback-negative/10'
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      message.feedback?.type === 'strength' ? 'bg-feedback-positive' : 'bg-feedback-negative'
                    }`}
                  ></div>
                  {message.message}
                  {message.feedback && (
                    <div
                      className={`mt-3 flex items-center gap-2 text-xs font-semibold border-t pt-2 ${
                        message.feedback.type === 'strength'
                          ? 'text-feedback-positive border-feedback-positive/10'
                          : 'text-feedback-negative border-feedback-negative/10'
                      }`}
                    >
                      <span className="material-symbols-filled text-sm">
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
    </section>
  )
}

