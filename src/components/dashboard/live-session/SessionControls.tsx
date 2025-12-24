'use client'

interface SessionControlsProps {
  onRestartTurn?: () => void
  onPause?: () => void
  onEndSession?: () => void
  isRestartDisabled?: boolean
}

export function SessionControls({
  onRestartTurn,
  onPause,
  onEndSession,
  isRestartDisabled = false,
}: SessionControlsProps) {
  return (
    <div className="p-3 bg-white border-t border-bm-grey/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <button
            onClick={onRestartTurn}
            disabled={isRestartDisabled}
            className={`group flex items-center gap-1.5 px-3 py-2 rounded-lg border border-bm-grey text-bm-text-secondary hover:border-bm-maroon hover:text-bm-maroon transition-all bg-white shadow-sm hover:shadow-md text-xs ${
              isRestartDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-base group-hover:rotate-180 transition-transform duration-500">
              restart_alt
            </span>
            <span className="font-semibold">Restart Turn</span>
          </button>
          <button
            onClick={onPause}
            className="group flex items-center gap-1.5 px-3 py-2 rounded-lg border border-bm-grey text-bm-text-secondary hover:bg-bm-grey/50 transition-all bg-white shadow-sm text-xs"
          >
            <span className="material-symbols-outlined text-base">pause</span>
            <span className="font-semibold">Pause</span>
          </button>
        </div>
        <button
          onClick={onEndSession}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bm-maroon text-bm-white hover:bg-bm-maroon-dark transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-bold text-xs"
        >
          <span className="material-symbols-outlined text-sm">stop_circle</span>
          End Session
        </button>
      </div>
    </div>
  )
}



