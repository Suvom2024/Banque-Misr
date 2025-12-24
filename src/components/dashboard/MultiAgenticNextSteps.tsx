'use client'

interface Resource {
  id: string
  title: string
  type: 'document' | 'video'
  duration: string
  icon: string
}

interface MultiAgenticNextStepsProps {
  onRedoSession?: () => void
  onTakeQuiz?: () => void
  resources: Resource[]
}

export function MultiAgenticNextSteps({ onRedoSession, onTakeQuiz, resources }: MultiAgenticNextStepsProps) {
  return (
    <div className="bg-bm-white rounded-2xl shadow-card border border-bm-grey p-5 flex flex-col gap-3">
      <h3 className="font-bold text-base text-bm-text-primary flex items-center gap-2">
        <span className="material-symbols-outlined text-bm-gold-dark text-lg">school</span>
        Next Steps
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onRedoSession}
          className="bg-bm-gold hover:bg-bm-gold-dark text-bm-maroon-dark font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm flex flex-col items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">replay</span>
          Redo Session
        </button>
        <button
          onClick={onTakeQuiz}
          className="bg-bm-white hover:bg-bm-light-grey text-bm-maroon border border-bm-grey font-bold py-2.5 px-3 rounded-xl text-xs transition-colors shadow-sm flex flex-col items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">quiz</span>
          Take Quiz
        </button>
      </div>
      <div className="border-t border-bm-grey pt-3 mt-1">
        <h4 className="text-[10px] font-bold text-bm-text-secondary uppercase mb-2.5">Recommended Resources</h4>
        <ul className="space-y-2.5">
          {resources.map((resource) => (
            <li key={resource.id}>
              <a
                className="flex items-center gap-2.5 group p-1.5 rounded-lg hover:bg-bm-light-grey transition-colors"
                href="#"
              >
                <div
                  className={`p-1.5 rounded-lg group-hover:bg-bm-maroon group-hover:text-bm-white transition-colors ${
                    resource.type === 'document' ? 'bg-bm-maroon/10 text-bm-maroon' : 'bg-bm-gold/10 text-bm-gold-dark'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{resource.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-bm-text-primary group-hover:text-bm-maroon">{resource.title}</p>
                  <p className="text-[10px] text-bm-text-secondary">
                    {resource.type === 'document' ? 'PDF Document' : 'Video Module'} • {resource.duration}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

