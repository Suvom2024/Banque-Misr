'use client'

import { AgentCard } from './AgentCard'

interface AgentFeedback {
  agentType: 'empathy' | 'policy' | 'pacing' | 'tone'
  title: string
  description: string
  badge?: {
    text: string
    type: 'hint' | 'critical' | 'success'
  }
  timestamp?: string
}

interface MultiAgentFeedbackSidebarProps {
  agents: AgentFeedback[]
}

export function MultiAgentFeedbackSidebar({ agents }: MultiAgentFeedbackSidebarProps) {
  return (
    <aside className="w-96 bg-bm-white border-l border-bm-grey flex flex-col z-10 shadow-soft">
      <div className="p-4 border-b border-bm-grey bg-bm-light-grey/30">
        <h2 className="font-bold text-base text-bm-text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-bm-gold-dark text-lg">hub</span>
          Multi-Agent Feedback
        </h2>
        <p className="text-[10px] text-bm-text-secondary mt-1">Real-time alerts from specialized AI agents.</p>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-bm-light-grey/20">
        {agents.map((agent, index) => (
          <AgentCard
            key={index}
            agentType={agent.agentType}
            title={agent.title}
            description={agent.description}
            badge={agent.badge}
            timestamp={agent.timestamp}
          />
        ))}
      </div>
    </aside>
  )
}



