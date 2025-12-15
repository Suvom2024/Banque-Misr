'use client'

interface CanvasToolbarProps {
  onAddStep?: () => void
  onAddBranch?: () => void
  onAIGenerate?: () => void
  onAddAgent?: () => void
}

export function CanvasToolbar({ onAddStep, onAddBranch, onAIGenerate, onAddAgent }: CanvasToolbarProps) {
  return (
    <div className="absolute top-6 left-6 z-10 flex gap-2">
      <div className="bg-bm-white shadow-card rounded-lg p-1.5 flex gap-1 border border-bm-grey">
        <button
          onClick={onAddStep}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-text-secondary font-semibold text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          Add Step
        </button>
        <div className="w-px bg-bm-grey my-1"></div>
        <button
          onClick={onAddBranch}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-text-secondary font-semibold text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">call_split</span>
          Add Branch
        </button>
        <div className="w-px bg-bm-grey my-1"></div>
        <button
          onClick={onAIGenerate}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-text-secondary font-semibold text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          AI Generate
        </button>
        {onAddAgent && (
          <>
            <div className="w-px bg-bm-grey my-1"></div>
            <button
              onClick={onAddAgent}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-bm-light-grey text-bm-maroon font-semibold text-sm transition-colors border border-bm-maroon/20"
            >
              <span className="material-symbols-outlined text-[20px]">face</span>
              Add Agent
            </button>
          </>
        )}
      </div>
    </div>
  )
}

