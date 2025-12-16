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
    <section className="flex flex-col gap-3">
      {sessionId && (
        <>
          <Link
            href={`/training-hub/session/${sessionId}/snapshot`}
            className="bg-bm-maroon text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 w-full group"
          >
            <span className="material-symbols-outlined">insights</span>
            View Performance Snapshot
          </Link>
          <Link
            href={`/training-hub/session/${sessionId}/review`}
            className="bg-bm-maroon-dark text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 w-full group"
          >
            <span className="material-symbols-outlined">description</span>
            View Detailed Review
          </Link>
          <Link
            href={`/training-hub/session/${sessionId}/agents`}
            className="bg-bm-maroon-dark/80 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 w-full group"
          >
            <span className="material-symbols-outlined">psychology</span>
            View Agent Breakdown
          </Link>
        </>
      )}
      <button
        onClick={onRedoSession}
        className="bg-bm-gold text-bm-maroon-dark font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 w-full group"
      >
        <span className="material-symbols-outlined">replay</span>
        Redo Session
      </button>
      <Link
        href="/development-goals"
        className="bg-white text-bm-maroon border-2 border-bm-gold font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full"
      >
        <span className="material-symbols-outlined">flag</span>
        Set Goal from this Feedback
      </Link>
      <button
        onClick={onExploreScenarios}
        className="bg-white text-bm-text-secondary font-semibold px-6 py-3 rounded-xl border border-bm-grey flex items-center justify-center gap-2 w-full mt-2"
      >
        <span className="material-symbols-outlined">explore</span>
        Explore Related Scenarios
      </button>
      <div className="flex justify-center mt-2">
        <button
          onClick={onShareReport}
          className="text-bm-text-subtle text-sm font-medium flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          Share Feedback Report
        </button>
      </div>
    </section>
  )
}

