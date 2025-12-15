'use client'

import Link from 'next/link'

interface AgentMeshHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  onCreateWorkflow?: () => void
  onRunSimulation?: () => void
}

export function AgentMeshHeader({
  userName,
  userRole = 'System Admin',
  userAvatar,
  onCreateWorkflow,
  onRunSimulation,
}: AgentMeshHeaderProps) {
  return (
    <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 z-20">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-slate-400 text-sm">arrow_back</span>
          <Link
            href="/training-hub"
            className="text-xs font-semibold text-slate-500 hover:text-bm-maroon uppercase tracking-wide transition-colors"
          >
            Back to Training
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-bm-maroon tracking-tight">Agentic Mesh Orchestrator</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-3">
          <button
            onClick={onCreateWorkflow}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:border-bm-maroon/30 hover:text-bm-maroon transition-all text-sm shadow-sm group"
          >
            <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-bm-maroon transition-colors">
              add_circle
            </span>
            Create Workflow
          </button>
          <button
            onClick={onRunSimulation}
            className="flex items-center gap-2 px-5 py-2.5 bg-bm-gold text-bm-maroon font-bold rounded-lg hover:bg-bm-gold-dark transition-all text-sm shadow-md"
          >
            <span className="material-symbols-outlined text-xl">play_arrow</span>
            Run Simulation
          </button>
        </div>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-bm-maroon transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-bm-maroon object-cover shadow-sm"
                src={userAvatar}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-bm-maroon shadow-sm">
                <span className="material-symbols-outlined text-slate-500">person</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

