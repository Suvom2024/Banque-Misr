'use client'

import { useState } from 'react'

interface CompletedGoal {
  id: string
  title: string
  completedDate: string
}

interface CompletedGoalsSectionProps {
  goals: CompletedGoal[]
}

export function CompletedGoalsSection({ goals }: CompletedGoalsSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="animate-fade-in-up animate-delay-300 pb-8">
      <details
        className="group bg-white rounded-2xl shadow-card border border-bm-grey/60 overflow-hidden"
        open={isOpen}
        onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-bm-light-grey/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bm-grey rounded-lg text-bm-text-secondary group-open:bg-feedback-positive-bg group-open:text-feedback-positive transition-colors">
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-bm-text-primary">Completed Goals & Achievements</h3>
              <p className="text-sm text-bm-text-secondary">{goals.length} goal{goals.length !== 1 ? 's' : ''} achieved in 2023</p>
            </div>
          </div>
          <span className="material-symbols-outlined transform group-open:rotate-180 transition-transform text-bm-text-secondary">
            expand_more
          </span>
        </summary>
        <div className="p-6 pt-0 border-t border-bm-grey/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-bm-grey/60 rounded-xl p-4 flex items-center gap-4 bg-bm-light-grey/20">
                <div className="bg-feedback-positive/10 text-feedback-positive rounded-full p-2 h-10 w-10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">check</span>
                </div>
                <div>
                  <h4 className="font-bold text-bm-text-primary text-sm">{goal.title}</h4>
                  <p className="text-xs text-bm-text-secondary">Completed {goal.completedDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}

