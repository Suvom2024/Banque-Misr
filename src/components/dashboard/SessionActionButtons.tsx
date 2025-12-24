'use client'

import Link from 'next/link'

interface SessionActionButtonsProps {
  sessionId?: string
  onRedoSession?: () => void
  onSetGoal?: () => void
  onExploreScenarios?: () => void
  onShareReport?: () => void
}

export function SessionActionButtons({
  sessionId,
  onRedoSession,
  onSetGoal,
  onExploreScenarios,
  onShareReport,
}: SessionActionButtonsProps) {
  return (
    <section className="flex flex-col gap-2">
      {sessionId && (
        <>
          <Link
            href={`/training-hub/session/${sessionId}/snapshot`}
            className="bg-bm-maroon text-white font-bold px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 w-full group text-xs"
          >
            <span className="material-symbols-outlined text-sm">insights</span>
            View Performance Snapshot
          </Link>
          <Link
            href={`/training-hub/session/${sessionId}/review`}
            className="bg-bm-maroon-dark text-white font-bold px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 w-full group text-xs"
          >
            <span className="material-symbols-outlined text-sm">description</span>
            View Detailed Review
          </Link>
          <Link
            href={`/training-hub/session/${sessionId}/agents`}
            className="bg-bm-maroon-dark/80 text-white font-bold px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 w-full group text-xs"
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            View Agent Breakdown
          </Link>
        </>
      )}
      <button
        onClick={onRedoSession}
        className="bg-bm-gold text-bm-maroon-dark font-bold px-4 py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 w-full group text-xs"
      >
        <span className="material-symbols-outlined text-sm">replay</span>
        Redo Session
      </button>
      <Link
        href="/development-goals"
        className="bg-white text-bm-maroon border-2 border-bm-gold font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 w-full text-xs"
      >
        <span className="material-symbols-outlined text-sm">flag</span>
        Set Goal from this Feedback
      </Link>
      <button
        onClick={onExploreScenarios}
        className="bg-white text-bm-text-secondary font-semibold px-4 py-2 rounded-lg border border-bm-grey flex items-center justify-center gap-1.5 w-full mt-1 text-xs"
      >
        <span className="material-symbols-outlined text-sm">explore</span>
        Explore Related Scenarios
      </button>
      <div className="flex justify-center mt-1">
        <button
          onClick={onShareReport}
          className="text-bm-text-subtle text-[10px] font-medium flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">share</span>
          Share Feedback Report
        </button>
      </div>
    </section>
  )
}

