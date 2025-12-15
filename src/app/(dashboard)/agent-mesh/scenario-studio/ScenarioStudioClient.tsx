'use client'

import { useState } from 'react'
import { ScenarioStudioHeader } from '@/components/dashboard/agent-mesh/ScenarioStudioHeader'
import { AgentLibrarySidebar } from '@/components/dashboard/agent-mesh/AgentLibrarySidebar'
import { ScenarioCanvas } from '@/components/dashboard/agent-mesh/ScenarioCanvas'
import { ScenarioDetailsPanel } from '@/components/dashboard/agent-mesh/ScenarioDetailsPanel'

interface ScenarioStudioClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

// Hard-coded scenario data
const defaultScenarioNodes = [
  {
    id: 'ai-greeting',
    type: 'ai-persona' as const,
    title: 'AI Persona: Greeting',
    content: '"Good morning! I\'m calling regarding the service renewal..."',
    position: { x: 360, y: 20 },
    isSelected: false,
  },
  {
    id: 'trainee-response',
    type: 'trainee-response' as const,
    title: 'Trainee Response',
    content: '',
    position: { x: 304, y: 280 },
    isSelected: false,
    logicRule: 'If sentiment > 0.7 AND mentions "Value" -> Path A',
  },
  {
    id: 'ai-positive',
    type: 'ai-response' as const,
    title: 'AI: Positive React',
    content: '"That\'s exactly what I needed to hear..."',
    position: { x: 220, y: 520 },
    isSelected: false,
    responseType: 'positive' as const,
  },
  {
    id: 'ai-objection',
    type: 'ai-response' as const,
    title: 'AI: Objection',
    content: '"I\'m still not convinced about the pricing..."',
    position: { x: 620, y: 520 },
    isSelected: false,
    responseType: 'negative' as const,
  },
]

export function ScenarioStudioClient({ userName, userRole, userAvatar }: ScenarioStudioClientProps) {
  const [nodes, setNodes] = useState(defaultScenarioNodes)

  const handleNodeClick = (nodeId: string) => {
    setNodes((prev) => prev.map((n) => ({ ...n, isSelected: n.id === nodeId })))
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-bm-light-grey h-full">
      <ScenarioStudioHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow flex overflow-hidden">
        <AgentLibrarySidebar />
        <ScenarioCanvas nodes={nodes} onNodeClick={handleNodeClick} />
        <ScenarioDetailsPanel
          onPublish={() => console.log('Publish scenario')}
          onSaveDraft={() => console.log('Save draft')}
          onShare={() => console.log('Share scenario')}
        />
      </main>
    </div>
  )
}

