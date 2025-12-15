'use client'

export function CircularListeningVisualization() {
  return (
    <div className="flex-shrink-0 bg-bm-light-grey pt-6 pb-2 flex justify-center items-center z-10">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border-2 border-dashed animate-[spin_10s_linear_infinite] opacity-30 border-bm-maroon"></div>
        <div className="absolute w-[120%] h-[120%] rounded-full border border-bm-gold opacity-40 animate-[spin_15s_linear_infinite_reverse]"></div>
        <div className="relative w-16 h-16 rounded-full visualizer-orb flex items-center justify-center animate-pulse-slow">
          <span className="material-symbols-outlined text-bm-white text-3xl">graphic_eq</span>
        </div>
        <div className="absolute -bottom-4 bg-bm-white shadow-soft px-3 py-0.5 rounded-full border border-bm-grey">
          <span className="text-xs font-bold text-bm-maroon uppercase tracking-wide">Listening</span>
        </div>
      </div>
    </div>
  )
}



