'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { Node, Edge, Connection } from 'reactflow'
import { AgentMeshHeader } from '@/components/dashboard/agent-mesh/AgentMeshHeader'
import { AgentLibrarySidebar } from '@/components/dashboard/agent-mesh/AgentLibrarySidebar'
import { ReactFlowCanvas } from '@/components/dashboard/agent-mesh/ReactFlowCanvas'
import { DynamicRightPanel } from '@/components/dashboard/agent-mesh/DynamicRightPanel'

type RightPanelMode = 'agent-properties' | 'scenario-details' | 'none'

interface AgentMeshOrchestratorClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

// Convert to React Flow format
const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'agentNode',
    position: { x: 50, y: 210 },
    data: {
      agentType: 'trigger' as const,
      title: 'Voice Input',
      subtitle: 'Employee Stream',
      isSelected: false,
      isActive: true,
      nodeType: 'trigger' as const,
    },
  },
  {
    id: 'persona-1',
    type: 'agentNode',
    position: { x: 330, y: 180 },
    data: {
      agentType: 'persona' as const,
      title: 'Persona Agent',
      model: 'GPT-4o-Audio',
      goal: 'Simulate an angry customer demanding a refund.',
      isSelected: true,
      isActive: true,
      nodeType: 'primary' as const,
    },
  },
  {
    id: 'policy-1',
    type: 'agentNode',
    position: { x: 650, y: 50 },
    data: {
      agentType: 'policy' as const,
      title: 'Policy Agent',
      subtitle: 'Strict Compliance',
      isSelected: false,
      isActive: false,
      nodeType: 'validator' as const,
    },
  },
  {
    id: 'coaching-1',
    type: 'agentNode',
    position: { x: 650, y: 310 },
    data: {
      agentType: 'coaching' as const,
      title: 'Coaching Agent',
      subtitle: 'Live Assistance',
      isSelected: false,
      isActive: false,
      nodeType: 'feedback' as const,
    },
  },
  {
    id: 'summarizer-1',
    type: 'agentNode',
    position: { x: 970, y: 180 },
    data: {
      agentType: 'summarizer' as const,
      title: 'Summarizer',
      subtitle: 'Format: JSON Report',
      isSelected: false,
      isActive: false,
      nodeType: 'processor' as const,
    },
  },
  {
    id: 'integrator-1',
    type: 'agentNode',
    position: { x: 1250, y: 180 },
    data: {
      agentType: 'integrator' as const,
      title: 'Teams Sync',
      subtitle: 'Channel: #Training',
      isSelected: false,
      isActive: false,
      nodeType: 'integrator' as const,
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'conn-1',
    source: 'trigger-1',
    target: 'persona-1',
    type: 'default',
    animated: false,
  },
  {
    id: 'conn-2',
    source: 'persona-1',
    target: 'policy-1',
    type: 'default',
    animated: false,
  },
  {
    id: 'conn-3',
    source: 'persona-1',
    target: 'coaching-1',
    sourceHandle: 'aux-output',
    type: 'default',
    animated: false,
  },
  {
    id: 'conn-4',
    source: 'policy-1',
    target: 'summarizer-1',
    type: 'default',
    animated: false,
  },
  {
    id: 'conn-5',
    source: 'coaching-1',
    target: 'summarizer-1',
    type: 'default',
    animated: false,
  },
  {
    id: 'conn-6',
    source: 'summarizer-1',
    target: 'integrator-1',
    type: 'default',
    animated: false,
  },
]

export function AgentMeshOrchestratorClient({ userName, userRole, userAvatar }: AgentMeshOrchestratorClientProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('persona-1')
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('agent-properties')
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Scenario data state
  const [scenarioData, setScenarioData] = useState({
    title: 'High-Value Client Negotiation',
    learningObjective: 'Mastering the art of value-based selling and empathy handling during price objections.',
    temperament: 75,
    knowledgeLevel: 90,
    skills: ['Empathy', 'Negotiation'] as string[],
  })

  // Memoize selected node lookup to avoid recalculation on every render
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId])

  const handleNodeClick = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: { ...n.data, isSelected: n.id === nodeId },
      }))
    )
    setSelectedNodeId(nodeId)
    // Auto-open properties panel when node is selected
    if (rightPanelMode === 'none') {
      setRightPanelMode('agent-properties')
    }
  }, [rightPanelMode])

  const handleNodesChange = useCallback((updatedNodes: Node[]) => {
    setNodes(updatedNodes)
  }, [])

  const handleEdgesChange = useCallback((updatedEdges: Edge[]) => {
    setEdges(updatedEdges)
  }, [])

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        setEdges((eds) => [
          ...eds,
          {
            id: `conn-${Date.now()}`,
            source: connection.source!,
            target: connection.target!,
            sourceHandle: connection.sourceHandle,
            type: 'default',
            animated: false,
          },
        ])
      }
    },
    []
  )

  const handleCreateWorkflow = () => {
    // Reset to empty canvas
    setNodes([])
    setEdges([])
    setSelectedNodeId(null)
    setRightPanelMode('none')
  }

  const handlePanelToggle = useCallback((mode: RightPanelMode) => {
    setRightPanelMode(mode)
  }, [])

  const handleClosePanel = useCallback(() => {
    setRightPanelMode('none')
  }, [])

  const handleRunSimulation = () => {
    // Animate edges to show workflow execution
    setEdges((eds) => eds.map((e) => ({ ...e, animated: true })))
  }

  const handleSaveConfiguration = () => {
    // Handle save configuration - implement save logic here
  }

  const handleConfigurationChange = useCallback((config: any) => {
    if (selectedNodeId) {
      setNodes((prev) =>
        prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, configuration: config } } : n))
      )
    }
  }, [selectedNodeId])

  const handleScenarioDataChange = useCallback((updates: Partial<typeof scenarioData>) => {
    setScenarioData((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleAgentDrop = useCallback(
    (event: React.DragEvent, position: { x: number; y: number }) => {
      event.preventDefault()
      event.stopPropagation()

      const agentData = event.dataTransfer.getData('application/json')
      if (!agentData) return

      try {
        const agent = JSON.parse(agentData)
        const newNodeId = `${agent.type}-${Date.now()}`

        // Determine nodeType based on agent type
        let nodeType: 'trigger' | 'primary' | 'validator' | 'feedback' | 'processor' | 'integrator' = 'primary'
        if (agent.type === 'persona') {
          nodeType = 'primary'
        } else if (agent.type === 'policy') {
          nodeType = 'validator'
        } else if (agent.type === 'coaching') {
          nodeType = 'feedback'
        } else if (agent.type === 'summarizer') {
          nodeType = 'processor'
        } else if (agent.type === 'integrator') {
          nodeType = 'integrator'
        }

        const newNode: Node = {
          id: newNodeId,
          type: 'agentNode',
          position,
          data: {
            agentType: agent.type,
            title: agent.title,
            subtitle: agent.description,
            isSelected: true,
            isActive: false,
            nodeType,
          },
        }

        setNodes((prev) => {
          const updated = prev.map((n) => ({
            ...n,
            data: { ...n.data, isSelected: false },
          }))
          updated.push(newNode)
          return updated
        })
        setSelectedNodeId(newNodeId)
        setRightPanelMode('agent-properties')
      } catch (error) {
        // Silently handle errors
      }
    },
    []
  )

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      <AgentMeshHeader
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
        onCreateWorkflow={handleCreateWorkflow}
        onRunSimulation={handleRunSimulation}
        rightPanelMode={rightPanelMode}
        onPanelToggle={handlePanelToggle}
      />

      <main className="flex-1 flex overflow-hidden min-w-0 min-h-0">
        <AgentLibrarySidebar />
        <div ref={reactFlowWrapper} className="flex-1 min-w-0 min-h-0 relative">
          <ReactFlowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            onConnect={handleConnect}
            onDrop={handleAgentDrop}
          />
        </div>
        <DynamicRightPanel
          mode={rightPanelMode}
          onClose={handleClosePanel}
          selectedNodeId={selectedNodeId}
          agentType={selectedNode?.data?.agentType}
          agentTitle={selectedNode?.data?.title}
          agentDescription="Simulates a customer interaction based on a specific psychological profile. Used to test employee empathy."
          agentConfiguration={
            selectedNode?.data?.configuration || {
              temperament: 75,
              patienceLevel: 20,
              voiceModel: 'Arabic (Egypt) - Male 1',
              logInteractionData: false,
              allowInterruptions: true,
            }
          }
          onConfigurationChange={handleConfigurationChange}
          onSaveConfiguration={handleSaveConfiguration}
          scenarioTitle={scenarioData.title}
          learningObjective={scenarioData.learningObjective}
          temperament={scenarioData.temperament}
          knowledgeLevel={scenarioData.knowledgeLevel}
          skills={scenarioData.skills}
          onScenarioTitleChange={(title) => handleScenarioDataChange({ title })}
          onObjectiveChange={(objective) => handleScenarioDataChange({ learningObjective: objective })}
          onTemperamentChange={(value) => handleScenarioDataChange({ temperament: value })}
          onKnowledgeLevelChange={(value) => handleScenarioDataChange({ knowledgeLevel: value })}
          onSkillRemove={(skill) => handleScenarioDataChange({ skills: scenarioData.skills.filter((s) => s !== skill) })}
          onSkillAdd={(skill) => handleScenarioDataChange({ skills: [...scenarioData.skills, skill] })}
          onPublish={() => {}}
          onSaveDraft={() => {}}
          onShare={() => {}}
        />
      </main>
    </div>
  )
}

