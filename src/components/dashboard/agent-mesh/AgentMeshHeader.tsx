'use client'

import Link from 'next/link'

type RightPanelMode = 'agent-properties' | 'scenario-details' | 'none'

interface AgentMeshHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  onCreateWorkflow?: () => void
  onRunSimulation?: () => void
  rightPanelMode?: RightPanelMode
  onPanelToggle?: (mode: RightPanelMode) => void
}

export function AgentMeshHeader({
  userName,
  userRole = 'System Admin',
  userAvatar,
  onCreateWorkflow,
  onRunSimulation,
  rightPanelMode = 'none',
  onPanelToggle,
}: AgentMeshHeaderProps) {
  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-6 z-20">
      <div className="flex-shrink-0 min-w-0 max-w-[40%]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="material-symbols-outlined text-slate-400 text-xs flex-shrink-0">arrow_back</span>
          <Link
            href="/training-hub"
            className="text-[10px] font-semibold text-slate-500 hover:text-bm-maroon uppercase tracking-wide transition-colors whitespace-nowrap"
          >
            Back to Training
          </Link>
        </div>
        <h2 className="text-base lg:text-lg font-bold text-bm-maroon tracking-tight truncate leading-tight">Agentic Mesh Orchestrator</h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={onCreateWorkflow}
            className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 lg:py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-50 hover:border-bm-maroon/30 hover:text-bm-maroon transition-all text-[11px] lg:text-xs shadow-sm group whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base lg:text-lg text-slate-400 group-hover:text-bm-maroon transition-colors">
              add_circle
            </span>
            <span className="hidden sm:inline">Create Workflow</span>
            <span className="sm:hidden">Create</span>
          </button>
          <button
            onClick={onRunSimulation}
            className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 lg:py-2 bg-bm-gold text-bm-maroon font-semibold rounded-md hover:bg-bm-gold-dark transition-all text-[11px] lg:text-xs shadow-md whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base lg:text-lg">play_arrow</span>
            <span className="hidden sm:inline">Run Simulation</span>
            <span className="sm:hidden">Run</span>
          </button>
          {onPanelToggle && (
            <>
              <div className="h-5 lg:h-6 w-px bg-slate-200 hidden sm:block mx-0.5"></div>
              <div className="flex gap-1">
                <button
                  onClick={() => onPanelToggle(rightPanelMode === 'agent-properties' ? 'none' : 'agent-properties')}
                  className={`flex items-center gap-1 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-md font-semibold text-[11px] lg:text-xs transition-all whitespace-nowrap ${
                    rightPanelMode === 'agent-properties'
                      ? 'bg-bm-maroon text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-bm-maroon/30 hover:text-bm-maroon'
                  }`}
                  title="Toggle Properties Panel"
                >
                  <span className="material-symbols-outlined text-sm lg:text-base">tune</span>
                  <span className="hidden xl:inline">Properties</span>
                </button>
                <button
                  onClick={() => onPanelToggle(rightPanelMode === 'scenario-details' ? 'none' : 'scenario-details')}
                  className={`flex items-center gap-1 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-md font-semibold text-[11px] lg:text-xs transition-all whitespace-nowrap ${
                    rightPanelMode === 'scenario-details'
                      ? 'bg-bm-maroon text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-bm-maroon/30 hover:text-bm-maroon'
                  }`}
                  title="Toggle Scenario Details Panel"
                >
                  <span className="material-symbols-outlined text-sm lg:text-base">account_tree</span>
                  <span className="hidden xl:inline">Scenario</span>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="h-5 lg:h-6 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <button className="relative p-1.5 text-slate-400 hover:text-bm-maroon transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] text-slate-500 truncate">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt="Profile"
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-bm-maroon object-cover shadow-sm flex-shrink-0"
                src={userAvatar}
              />
            ) : (
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-bm-maroon shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-slate-500 text-xs lg:text-sm">person</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

