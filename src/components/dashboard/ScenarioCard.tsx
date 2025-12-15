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
}

interface ScenarioCardProps {
  scenario: Scenario
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const getStatusBadge = () => {
    switch (scenario.status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Completed
          </span>
        )
      case 'in-progress':
        return (
          <span className="px-2.5 py-1 rounded-full bg-bm-gold/10 text-bm-gold-dark text-xs font-bold border border-bm-gold/20 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">play_circle</span>
            In Progress
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
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
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Link
                href={`/training-hub/session/${scenario.id}`}
                className="flex-1 bg-bm-maroon text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-bm-maroon/20 hover:bg-bm-maroon-dark hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined text-lg">description</span>
                View Report
              </Link>
              <Link
                href={`/training-hub/session/${scenario.id}/agents`}
                className="bg-bm-maroon-dark text-white font-bold py-3 px-3 rounded-xl text-sm shadow-md shadow-bm-maroon/20 hover:bg-bm-maroon hover:shadow-lg transition-all flex items-center justify-center group"
                title="View Agent Breakdown"
              >
                <span className="material-symbols-outlined text-lg">psychology</span>
              </Link>
            </div>
            <button className="w-full bg-bm-gold text-bm-maroon-dark font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-bm-gold/20 hover:bg-bm-gold-dark hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">
                replay
              </span>
              Start Again
            </button>
          </div>
        )
      case 'in-progress':
        return (
          <button className="w-full bg-bm-maroon text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-bm-maroon/20 hover:bg-bm-maroon-dark hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
            Continue Training
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        )
      default:
        return (
          <button className="w-full bg-white border-2 border-bm-gold text-bm-maroon font-bold py-3 px-4 rounded-xl text-sm hover:bg-bm-gold hover:text-bm-maroon-dark transition-all flex items-center justify-center gap-2 group">
            Start Training
            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
              play_arrow
            </span>
          </button>
        )
    }
  }

  return (
    <div
      className={`scenario-card bg-white rounded-2xl shadow-card border ${
        scenario.status === 'in-progress' ? 'border-bm-gold/50 ring-1 ring-bm-gold/20 transform scale-[1.01]' : 'border-bm-grey'
      } overflow-hidden flex flex-col h-full relative ${scenario.status === 'not-started' ? 'opacity-90 hover:opacity-100' : ''}`}
    >
      {/* Top Border */}
      <div className={`h-2 ${getTopBorderColor()} w-full`}></div>

      {/* In Progress Badge Overlay */}
      {scenario.status === 'in-progress' && (
        <div className="absolute top-4 right-4 animate-pulse">{getStatusBadge()}</div>
      )}

      {/* Card Content */}
      <div className="p-6 flex-grow flex flex-col">
        <div className={`flex justify-between items-start mb-4 ${scenario.status === 'in-progress' ? 'mt-2' : ''}`}>
          <div
            className={`p-2 rounded-lg ${getIconColor()} ${
              scenario.status === 'completed'
                ? 'bg-bm-maroon/5'
                : scenario.status === 'in-progress'
                  ? 'bg-bm-gold/10'
                  : 'bg-bm-grey/30'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{getIcon()}</span>
          </div>
          {scenario.status !== 'in-progress' && <div>{getStatusBadge()}</div>}
        </div>

        <h3 className="text-lg font-bold text-bm-text-primary mb-2 leading-tight">{scenario.title}</h3>
        <p className="text-bm-text-secondary text-sm mb-5 leading-relaxed line-clamp-2">{scenario.description}</p>

        {/* Progress Bar for In-Progress */}
        {scenario.status === 'in-progress' && scenario.progress !== undefined && (
          <div className="w-full bg-bm-grey rounded-full h-2 mb-6">
            <div className="bg-bm-gold h-2 rounded-full" style={{ width: `${scenario.progress}%` }}></div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {scenario.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-bm-grey/50 text-bm-text-secondary text-[11px] font-semibold px-2.5 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-0 mt-auto">
        <div className="flex items-center justify-between mb-4 text-xs font-medium text-bm-text-subtle border-t border-bm-grey pt-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span> {scenario.duration}
          </span>
          {scenario.status === 'completed' && scenario.score !== undefined ? (
            <Link
              href={`/training-hub/session/${scenario.id}`}
              className="flex items-center gap-1 text-bm-maroon font-bold hover:text-bm-maroon-dark transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">emoji_events</span> Score: {scenario.score}%
            </Link>
          ) : scenario.status === 'in-progress' && scenario.progress !== undefined ? (
            <span className="text-bm-gold-dark font-bold">{scenario.progress}% Complete</span>
          ) : (
            <span className="flex items-center gap-1 opacity-50">
              <span className="material-symbols-outlined text-sm">bar_chart</span> --
            </span>
          )}
        </div>
        {getActionButton()}
      </div>
    </div>
  )
}

