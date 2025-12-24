'use client'

interface AICoachSuggestionProps {
  suggestion: string
}

export function AICoachSuggestion({ suggestion }: AICoachSuggestionProps) {
  return (
    <div className="relative w-full max-w-[85%] ml-auto pr-9 animate-float">
      <div className="absolute -right-5 top-0 transform -translate-y-1/2 z-10">
        <button className="h-7 w-7 bg-bm-white border border-bm-gold text-bm-gold rounded-full shadow-lg flex items-center justify-center hover:bg-bm-gold hover:text-bm-maroon transition-all">
          <span className="material-symbols-outlined text-base">lightbulb</span>
        </button>
      </div>
      <div className="bg-gradient-to-r from-bm-gold/10 to-transparent border-l-4 border-bm-gold rounded-r-lg p-2.5 backdrop-blur-sm">
        <div className="flex items-start gap-1.5">
          <span className="material-symbols-outlined text-bm-gold-dark text-base mt-0.5">auto_awesome</span>
          <div>
            <p className="text-[10px] font-bold text-bm-maroon mb-0.5">AI Coach Suggestion</p>
            <p className="text-[10px] text-bm-text-secondary">
              {suggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



