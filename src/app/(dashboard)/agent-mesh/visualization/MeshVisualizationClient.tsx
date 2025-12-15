'use client'

import { useState, useCallback, useMemo } from 'react'
import { Node, Edge } from 'reactflow'
import { VisualizationHeader } from '@/components/dashboard/agent-mesh/VisualizationHeader'
import { AgentLibrarySidebar } from '@/components/dashboard/agent-mesh/AgentLibrarySidebar'
import { ReactFlowCanvas } from '@/components/dashboard/agent-mesh/ReactFlowCanvas'
import { DynamicRightPanel } from '@/components/dashboard/agent-mesh/DynamicRightPanel'
import { CanvasToolbar } from '@/components/dashboard/agent-mesh/CanvasToolbar'

type ViewMode = 'mesh' | 'scenario'
type RightPanelMode = 'agent-properties' | 'scenario-details' | 'none'

interface MeshVisualizationClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

// Mesh view nodes
const initialMeshNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'agentNode',
    position: { x: 100, y: 100 },
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
    position: { x: 100, y: 250 },
    data: {
      agentType: 'persona' as const,
      title: 'Persona Agent',
      model: 'GPT-4o',
      goal: 'Simulate an angry customer demanding a refund.',
      isSelected: false,
      isActive: true,
      nodeType: 'primary' as const,
    },
  },
  {
    id: 'policy-1',
    type: 'agentNode',
    position: { x: 100, y: 450 },
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
    position: { x: 400, y: 450 },
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
    position: { x: 250, y: 650 },
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
    position: { x: 250, y: 850 },
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

const initialMeshEdges: Edge[] = [
  {
    id: 'conn-1',
    source: 'trigger-1',
    target: 'persona-1',
    type: 'default',
    animated: true,
  },
  {
    id: 'conn-2',
    source: 'persona-1',
    target: 'policy-1',
    type: 'default',
    animated: true,
  },
  {
    id: 'conn-3',
    source: 'persona-1',
    target: 'coaching-1',
    sourceHandle: 'aux-output',
    type: 'default',
    animated: true,
  },
  {
    id: 'conn-4',
    source: 'policy-1',
    target: 'summarizer-1',
    type: 'default',
    animated: true,
  },
  {
    id: 'conn-5',
    source: 'coaching-1',
    target: 'summarizer-1',
    type: 'default',
    animated: true,
  },
  {
    id: 'conn-6',
    source: 'summarizer-1',
    target: 'integrator-1',
    type: 'default',
    animated: true,
  },
]

// Scenario view nodes
const initialScenarioNodes: Node[] = [
  {
    id: 'scenario-ai-1',
    type: 'scenarioNode',
    position: { x: 400, y: 80 },
    data: {
      type: 'ai-persona',
      title: 'AI Persona: Greeting',
      content: '"Good morning! I\'m calling regarding the service renewal..."',
    },
  },
  {
    id: 'scenario-trainee-1',
    type: 'scenarioNode',
    position: { x: 400, y: 280 },
    data: {
      type: 'trainee-response',
      title: 'Trainee Response',
      content: '',
      expectedIntent: 'Empathy & Solution',
      logicRule: 'If sentiment > 0.7 AND mentions "Value" -> Path A',
    },
  },
  {
    id: 'scenario-ai-positive',
    type: 'scenarioNode',
    position: { x: 200, y: 520 },
    data: {
      type: 'ai-response-positive',
      title: 'AI: Positive React',
      content: '"That\'s exactly what I needed to hear..."',
    },
  },
  {
    id: 'scenario-ai-negative',
    type: 'scenarioNode',
    position: { x: 600, y: 520 },
    data: {
      type: 'ai-response-negative',
      title: 'AI: Objection',
      content: '"I\'m still not convinced about the pricing..."',
    },
  },
]

const initialScenarioEdges: Edge[] = [
  {
    id: 'scenario-edge-1',
    source: 'scenario-ai-1',
    target: 'scenario-trainee-1',
    type: 'default',
    animated: false,
  },
  {
    id: 'scenario-edge-2',
    source: 'scenario-trainee-1',
    target: 'scenario-ai-positive',
    sourceHandle: 'correct',
    type: 'default',
    animated: false,
    label: 'Correct',
    labelStyle: { fill: '#16A34A', fontWeight: 'bold' },
  },
  {
    id: 'scenario-edge-3',
    source: 'scenario-trainee-1',
    target: 'scenario-ai-negative',
    sourceHandle: 'incorrect',
    type: 'default',
    animated: false,
    label: 'Incorrect',
    labelStyle: { fill: '#DC2626', fontWeight: 'bold' },
  },
]

export function MeshVisualizationClient({ userName, userRole, userAvatar }: MeshVisualizationClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('mesh')
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('none')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [meshNodes, setMeshNodes] = useState<Node[]>(initialMeshNodes)
  const [meshEdges, setMeshEdges] = useState<Edge[]>(initialMeshEdges)
  const [scenarioNodes, setScenarioNodes] = useState<Node[]>(initialScenarioNodes)
  const [scenarioEdges, setScenarioEdges] = useState<Edge[]>(initialScenarioEdges)
  const [scenarioData, setScenarioData] = useState({
    title: 'High-Value Client Negotiation',
    learningObjective: 'Mastering the art of value-based selling and empathy handling during price objections.',
    temperament: 75,
    knowledgeLevel: 90,
    skills: ['Empathy', 'Negotiation'],
  })
  const [newAgentConfig, setNewAgentConfig] = useState({
    agentType: 'persona' as const,
    title: '',
    description: '',
    configuration: {
      temperament: 75,
      patienceLevel: 20,
      voiceModel: 'Arabic (Egypt) - Male 1',
      logInteractionData: false,
      allowInterruptions: true,
    },
  })

  // Get current nodes and edges based on view mode
  const currentNodes = useMemo(() => (viewMode === 'mesh' ? meshNodes : scenarioNodes), [viewMode, meshNodes, scenarioNodes])
  const currentEdges = useMemo(() => (viewMode === 'mesh' ? meshEdges : scenarioEdges), [viewMode, meshEdges, scenarioEdges])

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode)
      // Auto-switch panel based on view mode
      if (mode === 'scenario') {
        setRightPanelMode('scenario-details')
      } else {
        setRightPanelMode(selectedNodeId ? 'agent-properties' : 'none')
      }
      setSelectedNodeId(null)
    },
    [selectedNodeId]
  )

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId)
      if (viewMode === 'mesh') {
        setRightPanelMode('agent-properties')
      }
      // In scenario mode, panel stays as scenario-details
    },
    [viewMode]
  )

  const handleClosePanel = useCallback(() => {
    setRightPanelMode('none')
    setSelectedNodeId(null)
    setIsCreatingAgent(false)
  }, [])

  const handleAddAgent = useCallback(() => {
    setIsCreatingAgent(true)
    setRightPanelMode('agent-properties')
    setSelectedNodeId(null)
  }, [])

  const handleNodesChange = useCallback(
    (nodes: Node[]) => {
      if (viewMode === 'mesh') {
        setMeshNodes(nodes)
      } else {
        setScenarioNodes(nodes)
      }
    },
    [viewMode]
  )

  const handleEdgesChange = useCallback(
    (edges: Edge[]) => {
      if (viewMode === 'mesh') {
        setMeshEdges(edges)
      } else {
        setScenarioEdges(edges)
      }
    },
    [viewMode]
  )

  const handleCreateWorkflow = () => {
    // Handle create workflow - implement workflow creation logic here
  }

  const handleRunSimulation = () => {
    // Handle run simulation - implement simulation execution logic here
  }

  const handleAddStep = () => {
    // Handle add step - implement step addition logic here
  }

  const handleAddBranch = () => {
    // Handle add branch - implement branch addition logic here
  }

  const handleAIGenerate = () => {
    // Handle AI generate - implement AI generation logic here
  }

  const handleSaveNewAgent = useCallback(() => {
    if (!newAgentConfig.title) return

    const newNode: Node = {
      id: `agent-${Date.now()}`,
      type: 'agentNode',
      position: { x: 400, y: 300 },
      data: {
        agentType: newAgentConfig.agentType,
        title: newAgentConfig.title,
        subtitle: newAgentConfig.description,
        goal: newAgentConfig.description,
        isSelected: false,
        isActive: false,
        nodeType: 'primary' as const,
        configuration: newAgentConfig.configuration,
      },
    }

    if (viewMode === 'mesh') {
      setMeshNodes((prev) => [...prev, newNode])
    } else {
      setScenarioNodes((prev) => [...prev, newNode])
    }

    // Reset form
    setNewAgentConfig({
      agentType: 'persona',
      title: '',
      description: '',
      configuration: {
        temperament: 75,
        patienceLevel: 20,
        voiceModel: 'Arabic (Egypt) - Male 1',
        logInteractionData: false,
        allowInterruptions: true,
      },
    })
    setIsCreatingAgent(false)
    setRightPanelMode(viewMode === 'scenario' ? 'scenario-details' : 'none')
  }, [newAgentConfig, viewMode])

  // Get selected node data or new agent config
  const selectedNode = currentNodes.find((n) => n.id === selectedNodeId)
  const agentPanelData = isCreatingAgent
    ? {
        agentType: newAgentConfig.agentType,
        title: newAgentConfig.title,
        description: newAgentConfig.description,
        configuration: newAgentConfig.configuration,
      }
    : {
        agentType: selectedNode?.data?.agentType,
        title: selectedNode?.data?.title,
        description: selectedNode?.data?.goal || selectedNode?.data?.subtitle,
        configuration:
          selectedNode?.data?.configuration || {
            temperament: 75,
            patienceLevel: 20,
            voiceModel: 'Arabic (Egypt) - Male 1',
            logInteractionData: false,
            allowInterruptions: true,
          },
      }

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 relative overflow-hidden">
      <VisualizationHeader
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onCreateWorkflow={handleCreateWorkflow}
        onRunSimulation={handleRunSimulation}
        lastSaved="2 mins ago"
      />

      <main className="flex-1 flex overflow-hidden min-w-0 min-h-0">
        <AgentLibrarySidebar />
        <div className="flex-1 min-w-0 min-h-0 relative transition-all duration-300">
          {viewMode === 'scenario' && (
            <CanvasToolbar
              onAddStep={handleAddStep}
              onAddBranch={handleAddBranch}
              onAIGenerate={handleAIGenerate}
              onAddAgent={handleAddAgent}
            />
          )}
          <ReactFlowCanvas
            key={viewMode}
            initialNodes={currentNodes}
            initialEdges={currentEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            viewMode={viewMode}
          />
        </div>
        <DynamicRightPanel
          mode={rightPanelMode}
          onClose={handleClosePanel}
          // Agent Properties Props
          selectedNodeId={selectedNodeId}
          agentType={agentPanelData.agentType}
          agentTitle={agentPanelData.title}
          agentDescription={agentPanelData.description}
          agentConfiguration={agentPanelData.configuration}
          isCreating={isCreatingAgent}
          onAgentTitleChange={(title) => {
            if (isCreatingAgent) {
              setNewAgentConfig((prev) => ({ ...prev, title }))
            }
          }}
          onAgentDescriptionChange={(description) => {
            if (isCreatingAgent) {
              setNewAgentConfig((prev) => ({ ...prev, description }))
            }
          }}
          onConfigurationChange={(config) => {
            if (isCreatingAgent) {
              setNewAgentConfig((prev) => ({ ...prev, configuration: config }))
            } else {
              // Update existing node configuration
              const updatedNodes = currentNodes.map((node) =>
                node.id === selectedNodeId ? { ...node, data: { ...node.data, configuration: config } } : node
              )
              if (viewMode === 'mesh') {
                setMeshNodes(updatedNodes)
              } else {
                setScenarioNodes(updatedNodes)
              }
            }
          }}
          onSaveConfiguration={isCreatingAgent ? handleSaveNewAgent : () => {
            // Handle save configuration - implement save logic here
          }}
          // Scenario Details Props
          scenarioTitle={scenarioData.title}
          learningObjective={scenarioData.learningObjective}
          temperament={scenarioData.temperament}
          knowledgeLevel={scenarioData.knowledgeLevel}
          skills={scenarioData.skills}
          onScenarioTitleChange={(title) => setScenarioData((prev) => ({ ...prev, title }))}
          onObjectiveChange={(objective) => setScenarioData((prev) => ({ ...prev, learningObjective: objective }))}
          onTemperamentChange={(value) => setScenarioData((prev) => ({ ...prev, temperament: value }))}
          onKnowledgeLevelChange={(value) => setScenarioData((prev) => ({ ...prev, knowledgeLevel: value }))}
          onSkillRemove={(skill) =>
            setScenarioData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
          }
          onSkillAdd={(skill) => setScenarioData((prev) => ({ ...prev, skills: [...prev.skills, skill] }))}
          onPublish={() => {
            // Handle publish scenario - implement publish logic here
          }}
          onSaveDraft={() => {
            // Handle save draft - implement save draft logic here
          }}
          onShare={() => {
            // Handle share scenario - implement share logic here
          }}
        />
      </main>
    </div>
  )
}
