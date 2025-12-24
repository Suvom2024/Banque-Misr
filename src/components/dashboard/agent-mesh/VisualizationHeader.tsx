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
    <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 lg:px-6 z-20">
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 min-w-0 max-w-[40%]">
        <button className="text-bm-text-secondary hover:text-bm-maroon transition-colors p-1.5 rounded-full hover:bg-bm-light-grey flex-shrink-0">
          <span className="material-symbols-outlined text-base lg:text-lg">arrow_back</span>
        </button>
        <div className="min-w-0">
          <h1 className="text-base lg:text-lg font-bold text-bm-text-primary tracking-tight truncate">
            {viewMode === 'mesh' ? 'Full Agentic Mesh Visualization' : 'Scenario Creator Studio'}
          </h1>
          {viewMode === 'scenario' && (
            <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-bm-text-secondary font-medium mt-0.5">
              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 flex-shrink-0">Draft</span>
              {lastSaved && <span className="truncate">Last saved {lastSaved}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        {viewMode === 'scenario' && (
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative flex-shrink-0"
              title="Version History"
            >
              <span className="material-symbols-outlined text-base lg:text-lg">history</span>
            </button>
            <button
              className="p-1.5 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors relative flex-shrink-0"
              title="Collaborators"
            >
              <span className="material-symbols-outlined text-base lg:text-lg">group_add</span>
            </button>
          </div>
        )}
        <div className="flex gap-1.5 lg:gap-2">
          {viewMode === 'mesh' && (
            <>
              <button
                onClick={onCreateWorkflow}
                className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 lg:py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-md text-[11px] lg:text-xs shadow-sm group whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base lg:text-lg text-slate-400 group-hover:text-bm-maroon transition-colors">
                  add_circle
                </span>
                <span className="hidden sm:inline">Create Workflow</span>
                <span className="sm:hidden">Create</span>
              </button>
              <button
                onClick={onRunSimulation}
                className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 lg:py-2 bg-bm-gold text-bm-maroon font-bold rounded-md text-[11px] lg:text-xs shadow-md whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base lg:text-lg">play_arrow</span>
                <span className="hidden sm:inline">Run Simulation</span>
                <span className="sm:hidden">Run</span>
              </button>
            </>
          )}
          <button
            onClick={() => onViewModeChange?.(viewMode === 'mesh' ? 'scenario' : 'mesh')}
            className={`flex items-center gap-1 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-md font-semibold text-[11px] lg:text-xs whitespace-nowrap ${
              viewMode === 'mesh'
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'bg-bm-maroon text-white hover:bg-bm-maroon-dark'
            }`}
          >
            <span className="material-symbols-outlined text-base lg:text-lg">
              {viewMode === 'mesh' ? 'account_tree' : 'hub'}
            </span>
            <span className="hidden sm:inline">{viewMode === 'mesh' ? 'Scenario View' : 'Mesh View'}</span>
            <span className="sm:hidden">{viewMode === 'mesh' ? 'Scenario' : 'Mesh'}</span>
          </button>
        </div>
        <div className="h-5 lg:h-6 w-px bg-bm-grey mx-1 hidden sm:block"></div>
        <div className="flex items-center gap-2 lg:gap-3">
          <button className="relative p-1.5 text-bm-text-secondary hover:text-bm-maroon hover:bg-bm-light-grey rounded-full transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-base lg:text-lg">notifications</span>
            <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-bm-maroon border-2 border-bm-white"></span>
          </button>
          <div className="flex items-center gap-2 lg:gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-xs lg:text-sm text-bm-text-primary leading-tight truncate max-w-[100px]">{userName}</p>
              <p className="text-[10px] lg:text-xs text-bm-text-secondary truncate">{userRole}</p>
            </div>
            {userAvatar ? (
              <img
                alt="User profile"
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border-2 border-bm-maroon shadow-sm flex-shrink-0"
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

