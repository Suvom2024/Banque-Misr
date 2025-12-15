'use client'

import { useState, useMemo } from 'react'

interface Agent {
  id: string
  type: 'persona' | 'policy' | 'coaching' | 'summarizer' | 'integrator'
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
  category: 'core' | 'utility'
}

const defaultAgents: Agent[] = [
  {
    id: 'persona',
    type: 'persona',
    title: 'Persona Agent',
    description: 'Simulates customer behavior',
    icon: 'face',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'core',
  },
  {
    id: 'policy',
    type: 'policy',
    title: 'Policy Validator',
    description: 'Checks compliance rules',
    icon: 'gavel',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'core',
  },
  {
    id: 'coaching',
    type: 'coaching',
    title: 'Coaching Agent',
    description: 'Provides real-time tips',
    icon: 'school',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'core',
  },
  {
    id: 'summarizer',
    type: 'summarizer',
    title: 'Summarizer',
    description: 'Condenses conversation',
    icon: 'summarize',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    category: 'utility',
  },
  {
    id: 'integrator',
    type: 'integrator',
    title: 'Integrator',
    description: 'Connects external APIs',
    icon: 'hub',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'utility',
  },
]

interface AgentLibrarySidebarProps {
  onAgentDrag?: (agent: Agent) => void
}

export function AgentLibrarySidebar({ onAgentDrag }: AgentLibrarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Memoize category filtering - only runs once
  const { coreAgents, utilityAgents } = useMemo(() => {
    const core = defaultAgents.filter((a) => a.category === 'core')
    const utility = defaultAgents.filter((a) => a.category === 'utility')
    return { coreAgents: core, utilityAgents: utility }
  }, [])

  // Memoize search filtering - only recalculates when searchQuery changes
  const filteredCoreAgents = useMemo(() => {
    if (!searchQuery) return coreAgents
    const query = searchQuery.toLowerCase()
    return coreAgents.filter(
      (a) => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
    )
  }, [coreAgents, searchQuery])

  const filteredUtilityAgents = useMemo(() => {
    if (!searchQuery) return utilityAgents
    const query = searchQuery.toLowerCase()
    return utilityAgents.filter(
      (a) => a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query)
    )
  }, [utilityAgents, searchQuery])

  const handleDragStart = (e: React.DragEvent, agent: Agent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(agent))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <section className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Agent Library</h3>
          <button className="text-slate-400 hover:text-bm-maroon transition-colors">
            <span className="material-symbols-outlined text-xl">tune</span>
          </button>
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg group-hover:text-bm-maroon transition-colors">
            search
          </span>
          <input
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-bm-maroon/20 focus:border-bm-maroon transition-all placeholder-slate-400"
            placeholder="Search agents..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 min-h-0">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Core Agents</h4>
          <div className="space-y-3">
            {filteredCoreAgents.map((agent) => (
              <div
                key={agent.id}
                draggable
                onDragStart={(e) => handleDragStart(e, agent)}
                className="group bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-bm-maroon/30 hover:shadow-md transition-all flex items-start gap-3 select-none"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${agent.bgColor} ${agent.color} flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-100 transition-colors shadow-sm`}
                >
                  <span className="material-symbols-outlined">{agent.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-bm-maroon transition-colors">{agent.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Utilities</h4>
          <div className="space-y-3">
            {filteredUtilityAgents.map((agent) => (
              <div
                key={agent.id}
                draggable
                onDragStart={(e) => handleDragStart(e, agent)}
                className="group bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-bm-maroon/30 hover:shadow-md transition-all flex items-start gap-3 select-none"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${agent.bgColor} ${agent.color} flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-100 transition-colors shadow-sm`}
                >
                  <span className="material-symbols-outlined">{agent.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-bm-maroon transition-colors">{agent.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

