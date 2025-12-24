'use client'

import Link from 'next/link'

export interface Scenario {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'not-started'
  tags: string[]
  duration: string
  score?: number
  progress?: number
  lastSessionId?: string
}

interface ScenarioCardProps {
  scenario: Scenario
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const getStatusBadge = () => {
    switch (scenario.status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-100 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-green-500"></span>
            Completed
          </span>
        )
      case 'in-progress':
        return (
          <span className="px-2 py-0.5 rounded-full bg-bm-gold/10 text-bm-gold-dark text-[10px] font-bold border border-bm-gold/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">play_circle</span>
            In Progress
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold border border-gray-200">
            Not Started
          </span>
        )
    }
  }

  const getIcon = () => {
    switch (scenario.status) {
      case 'completed':
        return 'verified_user'
      case 'in-progress':
        return 'warning'
      default:
        return 'groups'
    }
  }

  const getIconColor = () => {
    switch (scenario.status) {
      case 'completed':
        return 'text-bm-maroon'
      case 'in-progress':
        return 'text-bm-gold-dark'
      default:
        return 'text-bm-text-secondary'
    }
  }

  const getTopBorderColor = () => {
    switch (scenario.status) {
      case 'completed':
        return 'bg-gradient-to-r from-bm-maroon to-bm-maroon-light'
      case 'in-progress':
        return 'bg-gradient-to-r from-bm-gold to-bm-gold-dark'
      default:
        return 'bg-gradient-to-r from-gray-300 to-gray-400'
    }
  }

  const getActionButton = () => {
    switch (scenario.status) {
      case 'completed':
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              {scenario.lastSessionId ? (
                <>
                  <Link
                    href={`/training-hub/session/${scenario.lastSessionId}`}
                    className="flex-1 bg-bm-maroon text-white font-bold py-2 px-3 rounded-lg text-xs shadow-md shadow-bm-maroon/20 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    View Report
                  </Link>
                  <Link
                    href={`/training-hub/session/${scenario.lastSessionId}/agents`}
                    className="bg-bm-maroon-dark text-white font-bold py-2 px-2.5 rounded-lg text-xs shadow-md shadow-bm-maroon/20 flex items-center justify-center"
                    title="View Agent Breakdown"
                  >
                    <span className="material-symbols-outlined text-sm">psychology</span>
                  </Link>
                </>
              ) : (
                <div className="flex-1 bg-gray-200 text-gray-500 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <span className="material-symbols-outlined text-sm">description</span>
                  No Report Available
                </div>
              )}
            </div>
            <button className="w-full bg-bm-gold text-bm-maroon-dark font-bold py-2 px-3 rounded-lg text-xs shadow-md shadow-bm-gold/20 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                replay
              </span>
              Start Again
            </button>
          </div>
        )
      case 'in-progress':
        return (
          <button className="w-full bg-bm-maroon text-white font-bold py-2 px-3 rounded-lg text-xs shadow-md shadow-bm-maroon/20 flex items-center justify-center gap-1.5">
            Continue Training
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        )
      default:
        return (
          <button className="w-full bg-white border-2 border-bm-gold text-bm-maroon font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5">
            Start Training
            <span className="material-symbols-outlined text-sm">
              play_arrow
            </span>
          </button>
        )
    }
  }

  return (
    <div
      className={`scenario-card bg-white rounded-2xl shadow-card border ${
        scenario.status === 'in-progress' ? 'border-bm-gold/50 ring-1 ring-bm-gold/20 scale-[1.01]' : 'border-bm-grey'
      } overflow-hidden flex flex-col h-full relative`}
    >
      {/* Top Border */}
      <div className={`h-2 ${getTopBorderColor()} w-full`}></div>

      {/* In Progress Badge Overlay */}
        {scenario.status === 'in-progress' && (
        <div className="absolute top-4 right-4">{getStatusBadge()}</div>
      )}

      {/* Card Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className={`flex justify-between items-start mb-3 ${scenario.status === 'in-progress' ? 'mt-2' : ''}`}>
          <div
            className={`p-1.5 rounded-lg ${getIconColor()} ${
              scenario.status === 'completed'
                ? 'bg-bm-maroon/5'
                : scenario.status === 'in-progress'
                  ? 'bg-bm-gold/10'
                  : 'bg-bm-grey/30'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{getIcon()}</span>
          </div>
          {scenario.status !== 'in-progress' && <div>{getStatusBadge()}</div>}
        </div>

        <h3 className="text-sm font-bold text-bm-text-primary mb-1.5 leading-tight">{scenario.title}</h3>
        <p className="text-bm-text-secondary text-xs mb-4 leading-relaxed line-clamp-2">{scenario.description}</p>

        {/* Progress Bar for In-Progress */}
        {scenario.status === 'in-progress' && scenario.progress !== undefined && (
          <div className="w-full bg-bm-grey rounded-full h-1.5 mb-4">
            <div className="bg-bm-gold h-1.5 rounded-full" style={{ width: `${scenario.progress}%` }}></div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          {scenario.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-bm-grey/50 text-bm-text-secondary text-[10px] font-semibold px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-0 mt-auto">
        <div className="flex items-center justify-between mb-3 text-[10px] font-medium text-bm-text-subtle border-t border-bm-grey pt-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span> {scenario.duration}
          </span>
          {scenario.status === 'completed' && scenario.score !== undefined ? (
            scenario.lastSessionId ? (
              <Link
                href={`/training-hub/session/${scenario.lastSessionId}`}
                className="flex items-center gap-1 text-bm-maroon font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">emoji_events</span> Score: {scenario.score}%
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-bm-maroon font-bold">
                <span className="material-symbols-outlined text-xs">emoji_events</span> Score: {scenario.score}%
              </span>
            )
          ) : scenario.status === 'in-progress' && scenario.progress !== undefined ? (
            <span className="text-bm-gold-dark font-bold text-[10px]">{scenario.progress}% Complete</span>
          ) : (
            <span className="flex items-center gap-1 opacity-50">
              <span className="material-symbols-outlined text-xs">bar_chart</span> --
            </span>
          )}
        </div>
        {getActionButton()}
      </div>
    </div>
  )
}

