'use client'

import { useState } from 'react'

interface SessionPlaybackProps {
  date: string
  time: string
  duration: string
  onRedoSession?: () => void
  onSetGoal?: () => void
}

export function SessionPlayback({
  date,
  time,
  duration,
  onRedoSession,
  onSetGoal,
}: SessionPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)

  return (
    <section className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col lg:flex-row gap-6 items-center justify-between">
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-bm-maroon">mic</span>
            <span className="text-sm font-semibold text-bm-text-secondary">
              Recorded Session • {date} • {time}
            </span>
          </div>
          <span className="text-sm font-bold text-bm-maroon">{duration} Total</span>
        </div>
        <div className="flex items-center gap-4 bg-bm-light-grey/50 p-3 rounded-xl border border-gray-100">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 flex items-center justify-center bg-bm-maroon text-white rounded-full shadow-lg hover:bg-bm-maroon-dark hover:scale-105 transition-all"
          >
            <span className={`material-symbols-outlined ${isPlaying ? 'fill-1' : ''}`}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <span className="text-xs font-medium text-bm-text-primary w-10">01:24</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7A1A25 0%, #7A1A25 ${progress}%, #E5E7EB ${progress}%, #E5E7EB 100%)`,
            }}
          />
          <div className="flex items-center gap-2">
            <button className="text-bm-text-secondary hover:text-bm-maroon">
              <span className="material-symbols-outlined">volume_up</span>
            </button>
            <button className="text-bm-text-secondary hover:text-bm-maroon">
              <span className="material-symbols-outlined">speed</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 w-full lg:w-auto">
        <button
          onClick={onRedoSession}
          className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl border border-bm-maroon text-bm-maroon font-bold text-sm hover:bg-bm-maroon/5 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">replay</span>
          Redo Session
        </button>
        <button
          onClick={onSetGoal}
          className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-bm-gold text-bm-maroon font-bold text-sm shadow-lg shadow-bm-gold/20 hover:bg-bm-gold-dark hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          Set Goal from Feedback
          <span className="material-symbols-outlined text-lg">flag</span>
        </button>
      </div>
    </section>
  )
}

