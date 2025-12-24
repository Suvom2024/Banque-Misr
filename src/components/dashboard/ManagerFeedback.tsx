'use client'

import { useState } from 'react'

export interface ManagerComment {
  id: string
  managerName: string
  managerAvatar?: string
  comment: string
  timestamp: string
}

interface ManagerFeedbackProps {
  comments: ManagerComment[]
  userAvatar?: string
}

export function ManagerFeedback({ comments, userAvatar }: ManagerFeedbackProps) {
  const [newComment, setNewComment] = useState('')

  const handleSubmit = () => {
    if (newComment.trim()) {
      // Handle submit
      console.log('New comment:', newComment)
      setNewComment('')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex flex-col h-[280px]">
      <h3 className="font-bold text-base text-bm-text-primary mb-3 tracking-tight leading-tight">Manager Feedback</h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            {comment.managerAvatar ? (
              <img
                alt={comment.managerName}
                className="w-7 h-7 rounded-full object-cover"
                src={comment.managerAvatar}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-bm-grey flex items-center justify-center">
                <span className="material-symbols-outlined text-bm-text-secondary text-xs">
                  person
                </span>
              </div>
            )}
            <div>
              <div className="bg-gray-50 p-2.5 rounded-lg rounded-tl-none border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-bm-text-primary">{comment.managerName}</span>
                  <span className="text-[9px] text-bm-text-secondary">{comment.timestamp}</span>
                </div>
                <p className="text-[10px] text-bm-text-secondary">{comment.comment}</p>
              </div>
              <button className="text-[9px] font-bold text-bm-text-secondary hover:text-bm-maroon mt-1 ml-1">
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Add a comment..."
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-bm-gold focus:border-bm-gold outline-none"
          />
          <button
            onClick={handleSubmit}
            className="bg-bm-maroon text-white p-1.5 rounded-lg hover:bg-bm-maroon-dark transition-colors"
          >
            <span className="material-symbols-outlined text-base">send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

