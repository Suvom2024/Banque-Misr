'use client'

import Link from 'next/link'

type ViewMode = 'mesh' | 'scenario'

interface VisualizationHeaderProps {
  userName: string
  userRole?: string
  userAvatar?: string
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  onCreateWorkflow?: () => void
  onRunSimulation?: () => void
  lastSaved?: string
}

export function VisualizationHeader({
  userName,
  userRole = 'System Admin',
  userAvatar,
  viewMode = 'mesh',
  onViewModeChange,
  onCreateWorkflow,
  onRunSimulation,
  lastSaved,
}: VisualizationHeaderProps) {
  return (
    <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 lg:px-8 z-20">
      <div className="flex items-center gap-4">
        <button className="text-bm-text-secondary hover:text-bm-maroon transition-colors p-2 rounded-full hover:bg-bm-light-grey">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-bm-text-primary tracking-tight">
            {viewMode === 'mesh' ? 'Full Agentic Mesh Visualization' : 'Scenario Creator Studio'}
          </h1>
          {viewMode === 'scenario' && (
            <div className="flex items-center gap-2 text-xs text-bm-text-secondary font-medium mt-0.5">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Draft Mode</span>
              {lastSaved && <span>Last saved {lastSaved}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6">
        {viewMode === 'scenario' && (
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative"
              title="Version History"
            >
              <span className="material-symbols-outlined">history</span>
            </button>
            <button
              className="p-2 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative"
              title="Collaborators"
            >
              <span className="material-symbols-outlined">group_add</span>
            </button>
          </div>
        )}
        <div className="flex gap-3">
          {viewMode === 'mesh' && (
            <>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-bm-gold text-bm-maroon font-extrabold rounded-lg hover:bg-bm-gold-dark transition-all text-sm shadow-md hover:shadow-lg transform active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">play_arrow</span>
                Run Simulation
              </button>
            </>
          )}
          <button
            onClick={() => onViewModeChange?.(viewMode === 'mesh' ? 'scenario' : 'mesh')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
              viewMode === 'mesh'
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-bm-maroon text-white hover:bg-bm-maroon-dark'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {viewMode === 'mesh' ? 'account_tree' : 'hub'}
            </span>
            {viewMode === 'mesh' ? 'Scenario View' : 'Mesh View'}
          </button>
        </div>
        <div className="h-8 w-px bg-bm-grey mx-2"></div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-bm-maroon border-2 border-bm-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-bm-text-primary leading-tight">{userName}</p>
              <p className="text-xs text-bm-text-secondary">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-bm-maroon shadow-sm"
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

