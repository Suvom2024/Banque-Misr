'use client'

export function ListeningPanel() {
  const waveformBars = [
    { height: 12, delay: '0.1s' },
    { height: 16, delay: '0.2s' },
    { height: 8, delay: '0.3s' },
    { height: 20, delay: '0.4s' },
    { height: 24, delay: '0.5s' },
    { height: 14, delay: '0.2s' },
    { height: 28, delay: '0.1s' },
    { height: 32, delay: '0s' },
    { height: 24, delay: '0.3s' },
    { height: 16, delay: '0.5s' },
    { height: 20, delay: '0.4s' },
    { height: 10, delay: '0.2s' },
    { height: 14, delay: '0.1s' },
  ]

  return (
    <div className="relative bg-gradient-to-b from-[#2a0a0f] to-[#1a0507] rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-center overflow-hidden border border-bm-gold/20 flex-grow min-h-[300px]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bm-maroon rounded-full blur-[100px] opacity-40 animate-pulse-slow"></div>
      <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-feedback-positive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-feedback-positive"></span>
        </span>
        <span className="text-white/80 text-[10px] font-semibold tracking-wider uppercase">Listening</span>
      </div>
      <div className="flex items-center justify-center gap-1 h-24 w-full z-10 px-3">
        {waveformBars.map((bar, index) => (
          <div
            key={index}
            className="visualizer-bar rounded-full bg-gradient-to-t from-bm-gold to-bm-gold-dark opacity-80"
            style={{
              height: `${bar.height * 3}px`,
              animationDelay: bar.delay,
              animation: 'wave 1.2s ease-in-out infinite',
            }}
          ></div>
        ))}
      </div>
      <div className="mt-6 z-10 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-bm-gold to-bm-maroon rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <button className="relative w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all duration-300 shadow-glow">
          <span className="material-symbols-outlined text-3xl">mic</span>
        </button>
      </div>
      <p className="mt-4 text-bm-white/60 text-xs font-medium z-10">Speak clearly to continue...</p>
    </div>
  )
}



