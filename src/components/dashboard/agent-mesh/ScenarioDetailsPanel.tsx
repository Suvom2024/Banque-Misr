'use client'

import { useState } from 'react'

interface ScenarioDetailsPanelProps {
  scenarioTitle?: string
  learningObjective?: string
  temperament?: number
  knowledgeLevel?: number
  skills?: string[]
  onTitleChange?: (title: string) => void
  onObjectiveChange?: (objective: string) => void
  onTemperamentChange?: (value: number) => void
  onKnowledgeLevelChange?: (value: number) => void
  onSkillRemove?: (skill: string) => void
  onSkillAdd?: (skill: string) => void
  onPublish?: () => void
  onSaveDraft?: () => void
  onShare?: () => void
  onClose?: () => void
}

export function ScenarioDetailsPanel({
  scenarioTitle = 'High-Value Client Negotiation',
  learningObjective = 'Mastering the art of value-based selling and empathy handling during price objections.',
  temperament = 75,
  knowledgeLevel = 90,
  skills = ['Empathy', 'Negotiation'],
  onTitleChange,
  onObjectiveChange,
  onTemperamentChange,
  onKnowledgeLevelChange,
  onSkillRemove,
  onSkillAdd,
  onPublish,
  onSaveDraft,
  onShare,
  onClose,
}: ScenarioDetailsPanelProps) {
  const [title, setTitle] = useState(scenarioTitle)
  const [objective, setObjective] = useState(learningObjective)
  const [tempValue, setTempValue] = useState(temperament)
  const [knowledgeValue, setKnowledgeValue] = useState(knowledgeLevel)
  const [skillList, setSkillList] = useState(skills)

  const getTemperamentLabel = (value: number) => {
    if (value >= 75) return 'Impatient'
    if (value >= 50) return 'Moderate'
    return 'Calm'
  }

  const handleSkillRemove = (skill: string) => {
    setSkillList((prev) => prev.filter((s) => s !== skill))
    onSkillRemove?.(skill)
  }

  return (
    <aside className="w-96 bg-bm-white border-l border-bm-grey shadow-xl z-20 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-bm-grey flex justify-between items-center bg-bm-white sticky top-0">
        <h2 className="font-bold text-sm text-bm-text-primary">Scenario Details</h2>
        <button onClick={onClose} className="text-bm-text-secondary">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-6">
        <div className="space-y-3">
          <label className="block">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-bm-text-primary">Scenario Title</span>
              <button className="text-[10px] text-bm-gold-dark hover:text-bm-gold font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                Suggest
              </button>
            </div>
            <input
              className="w-full rounded-lg border border-bm-grey text-xs focus:border-bm-maroon focus:ring-bm-maroon p-2"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                onTitleChange?.(e.target.value)
              }}
            />
          </label>
          <label className="block">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-bm-text-primary">Learning Objective</span>
            </div>
            <div className="relative">
              <textarea
                className="w-full rounded-lg border border-bm-grey text-xs focus:border-bm-maroon focus:ring-bm-maroon h-20 resize-none p-2"
                placeholder="Define what the trainee should learn..."
                value={objective}
                onChange={(e) => {
                  setObjective(e.target.value)
                  onObjectiveChange?.(e.target.value)
                }}
              />
              <button
                className="absolute bottom-1.5 right-1.5 p-1 text-bm-gold rounded"
                title="AI Polish"
              >
                <span className="material-symbols-outlined text-sm">magic_button</span>
              </button>
            </div>
          </label>
        </div>
        <hr className="border-bm-grey" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-bm-text-primary text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-bm-maroon text-sm">psychology</span>
              AI Persona Config
            </h3>
            <span className="text-[10px] text-bm-maroon font-semibold bg-bm-maroon/10 px-1.5 py-0.5 rounded">Advanced</span>
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-bm-text-secondary">Temperament</span>
                <span className="font-bold text-bm-maroon">{getTemperamentLabel(tempValue)}</span>
              </div>
              <input
                className="w-full h-1.5 bg-bm-grey rounded-lg appearance-none cursor-pointer accent-bm-maroon"
                type="range"
                min="1"
                max="100"
                value={tempValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setTempValue(val)
                  onTemperamentChange?.(val)
                }}
              />
              <div className="flex justify-between text-[9px] text-bm-text-subtle mt-0.5">
                <span>Calm</span>
                <span>Aggressive</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-bm-text-secondary">Knowledge Level</span>
                <span className="font-bold text-bm-maroon">Expert</span>
              </div>
              <input
                className="w-full h-1.5 bg-bm-grey rounded-lg appearance-none cursor-pointer accent-bm-maroon"
                type="range"
                min="1"
                max="100"
                value={knowledgeValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setKnowledgeValue(val)
                  onKnowledgeLevelChange?.(val)
                }}
              />
            </div>
          </div>
        </div>
        <hr className="border-bm-grey" />
        <div className="space-y-2.5">
          <h3 className="font-bold text-bm-text-primary text-xs">Targeted Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {skillList.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-bm-light-grey text-bm-text-primary border border-bm-grey"
              >
                {skill}
                <button
                  className="flex-shrink-0 ml-1 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center text-bm-text-subtle hover:bg-bm-grey hover:text-bm-text-primary focus:outline-none"
                  onClick={() => handleSkillRemove(skill)}
                >
                  <span className="sr-only">Remove</span>
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </span>
            ))}
            <button className="inline-flex items-center px-2 py-0.5 border border-dashed border-bm-text-subtle rounded-md text-[10px] font-medium text-bm-text-secondary">
              <span className="material-symbols-outlined text-xs mr-0.5">add</span>
              Add Skill
            </button>
          </div>
        </div>
        <hr className="border-bm-grey" />
        <div className="space-y-2.5">
          <h3 className="font-bold text-bm-text-primary text-xs">Supporting Resources</h3>
          <div className="border-2 border-dashed border-bm-grey rounded-xl p-3 text-center cursor-pointer">
            <span className="material-symbols-outlined text-2xl text-bm-text-subtle mb-1.5">cloud_upload</span>
            <p className="text-[10px] text-bm-text-secondary">Drag PDF, Video or Links here</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 p-1.5 rounded-lg border border-bm-grey bg-bm-light-grey/30">
              <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-[10px] font-bold text-bm-text-primary truncate">Pricing_Policy_2024.pdf</p>
                <p className="text-[9px] text-bm-text-subtle">2.4 MB</p>
              </div>
              <button className="text-bm-text-subtle hover:text-red-600">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-bm-light-grey border-t border-bm-grey space-y-2 mt-auto">
        <button
          onClick={onPublish}
          className="w-full bg-bm-gold text-bm-maroon-dark font-bold py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 text-xs"
        >
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          Publish Scenario
        </button>
        <div className="flex gap-2">
          <button
            onClick={onSaveDraft}
            className="flex-1 bg-white border border-bm-grey text-bm-text-secondary font-bold py-2 px-3 rounded-lg text-xs"
          >
            Save Draft
          </button>
          <button
            onClick={onShare}
            className="flex-1 bg-white border border-bm-grey text-bm-text-secondary font-bold py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-xs"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Share
          </button>
        </div>
      </div>
    </aside>
  )
}

