'use client'

import { PropertiesPanel } from './PropertiesPanel'
import { ScenarioDetailsPanel } from './ScenarioDetailsPanel'

type RightPanelMode = 'agent-properties' | 'scenario-details' | 'none'

interface DynamicRightPanelProps {
  mode: RightPanelMode
  onClose?: () => void
  // Agent Properties Props
  selectedNodeId?: string | null
  agentType?: 'persona' | 'policy' | 'coaching' | 'summarizer' | 'integrator' | 'trigger'
  agentTitle?: string
  agentDescription?: string
  agentConfiguration?: {
    temperament?: number
    patienceLevel?: number
    voiceModel?: string
    logInteractionData?: boolean
    allowInterruptions?: boolean
  }
  onConfigurationChange?: (config: any) => void
  onAgentTitleChange?: (title: string) => void
  onAgentDescriptionChange?: (description: string) => void
  onSaveConfiguration?: () => void
  isCreating?: boolean
  // Scenario Details Props
  scenarioTitle?: string
  learningObjective?: string
  temperament?: number
  knowledgeLevel?: number
  skills?: string[]
  onScenarioTitleChange?: (title: string) => void
  onObjectiveChange?: (objective: string) => void
  onTemperamentChange?: (value: number) => void
  onKnowledgeLevelChange?: (value: number) => void
  onSkillRemove?: (skill: string) => void
  onSkillAdd?: (skill: string) => void
  onPublish?: () => void
  onSaveDraft?: () => void
  onShare?: () => void
}

export function DynamicRightPanel({
  mode,
  onClose,
  // Agent props
  selectedNodeId,
  agentType,
  agentTitle,
  agentDescription,
  agentConfiguration,
  onConfigurationChange,
  onAgentTitleChange,
  onAgentDescriptionChange,
  onSaveConfiguration,
  isCreating,
  // Scenario props
  scenarioTitle,
  learningObjective,
  temperament,
  knowledgeLevel,
  skills,
  onScenarioTitleChange,
  onObjectiveChange,
  onTemperamentChange,
  onKnowledgeLevelChange,
  onSkillRemove,
  onSkillAdd,
  onPublish,
  onSaveDraft,
  onShare,
}: DynamicRightPanelProps) {
  if (mode === 'none') {
    return <aside className="flex-shrink-0 w-0 overflow-hidden transition-all duration-300 ease-in-out" />
  }

  return (
    <aside
      className={`flex-shrink-0 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out ${
        mode === 'agent-properties' ? 'w-80' : 'w-96'
      }`}
    >
      {mode === 'agent-properties' && (
        <PropertiesPanel
          agentType={agentType}
          title={agentTitle}
          description={agentDescription}
          configuration={agentConfiguration}
          onConfigurationChange={onConfigurationChange}
          onTitleChange={onAgentTitleChange}
          onDescriptionChange={onAgentDescriptionChange}
          onSave={onSaveConfiguration}
          onClose={onClose}
          isCreating={isCreating}
        />
      )}
      {mode === 'scenario-details' && (
        <ScenarioDetailsPanel
          scenarioTitle={scenarioTitle}
          learningObjective={learningObjective}
          temperament={temperament}
          knowledgeLevel={knowledgeLevel}
          skills={skills}
          onTitleChange={onScenarioTitleChange}
          onObjectiveChange={onObjectiveChange}
          onTemperamentChange={onTemperamentChange}
          onKnowledgeLevelChange={onKnowledgeLevelChange}
          onSkillRemove={onSkillRemove}
          onSkillAdd={onSkillAdd}
          onPublish={onPublish}
          onSaveDraft={onSaveDraft}
          onShare={onShare}
        />
      )}
    </aside>
  )
}

