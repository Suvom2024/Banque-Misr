'use client'

interface AICoachSuggestionProps {
  suggestion: string
}

export function AICoachSuggestion({ suggestion }: AICoachSuggestionProps) {
  return (
    <div className="relative w-full max-w-[85%] ml-auto pr-11 animate-float">
      <div className="absolute -right-6 top-0 transform -translate-y-1/2 z-10">
        <button className="h-8 w-8 bg-bm-white border border-bm-gold text-bm-gold rounded-full shadow-lg flex items-center justify-center hover:bg-bm-gold hover:text-bm-maroon transition-all">
          <span className="material-symbols-outlined text-lg">lightbulb</span>
        </button>
      </div>
      <div className="bg-gradient-to-r from-bm-gold/10 to-transparent border-l-4 border-bm-gold rounded-r-lg p-3 backdrop-blur-sm">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-bm-gold-dark text-lg mt-0.5">auto_awesome</span>
          <div>
            <p className="text-xs font-bold text-bm-maroon mb-1">AI Coach Suggestion</p>
            <p className="text-xs text-bm-text-secondary">
              {suggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}



