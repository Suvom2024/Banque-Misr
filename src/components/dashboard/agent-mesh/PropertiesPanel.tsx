'use client'

import { useState } from 'react'

interface AgentConfiguration {
  temperament?: number
  patienceLevel?: number
  voiceModel?: string
  goal?: string
  logInteractionData?: boolean
  allowInterruptions?: boolean
}

interface PropertiesPanelProps {
  agentType?: 'persona' | 'policy' | 'coaching' | 'summarizer' | 'integrator' | 'trigger'
  title?: string
  description?: string
  configuration?: AgentConfiguration
  onConfigurationChange?: (config: AgentConfiguration) => void
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onSave?: () => void
  onClose?: () => void
  isCreating?: boolean
}

export function PropertiesPanel({
  agentType = 'persona',
  title = 'Persona Agent',
  description = 'Simulates a customer interaction based on a specific psychological profile. Used to test employee empathy.',
  configuration = {
    temperament: 75,
    patienceLevel: 20,
    voiceModel: 'Arabic (Egypt) - Male 1',
    logInteractionData: false,
    allowInterruptions: true,
  },
  onConfigurationChange,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onClose,
  isCreating = false,
}: PropertiesPanelProps) {
  const [config, setConfig] = useState<AgentConfiguration>(configuration)

  const getAgentIcon = () => {
    switch (agentType) {
      case 'persona':
        return 'face'
      case 'policy':
        return 'gavel'
      case 'coaching':
        return 'school'
      case 'summarizer':
        return 'summarize'
      case 'integrator':
        return 'hub'
      default:
        return 'smart_toy'
    }
  }

  const getAgentColor = () => {
    switch (agentType) {
      case 'persona':
        return { bg: 'bg-blue-100', text: 'text-blue-700' }
      case 'policy':
        return { bg: 'bg-purple-100', text: 'text-purple-700' }
      case 'coaching':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
      case 'summarizer':
        return { bg: 'bg-amber-100', text: 'text-amber-700' }
      case 'integrator':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700' }
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700' }
    }
  }

  const colors = getAgentColor()

  const getTemperamentLabel = (value: number) => {
    if (value >= 75) return 'Aggressive'
    if (value >= 50) return 'Moderate'
    return 'Calm'
  }

  const getPatienceLabel = (value: number) => {
    if (value >= 75) return 'High'
    if (value >= 50) return 'Moderate'
    return 'Low'
  }

  const handleConfigChange = (key: keyof AgentConfiguration, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onConfigurationChange?.(newConfig)
  }

  const isEmpty = !isCreating && (!title || !agentType)

  return (
    <section className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] h-full overflow-hidden">
      <div className="h-14 flex items-center justify-between px-4 bg-bm-maroon text-white flex-shrink-0">
        <h3 className="font-bold text-xs uppercase tracking-wide">{isCreating ? 'Create New Agent' : 'Properties Panel'}</h3>
        {onClose && (
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {isEmpty ? (
          <div className="p-5 flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl text-slate-400">select_all</span>
            </div>
            <h3 className="text-xs font-bold text-slate-600 mb-0.5">No Node Selected</h3>
            <p className="text-[10px] text-slate-400">Click on a node to view and edit its properties</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shadow-sm`}>
                <span className="material-symbols-outlined text-xl">{getAgentIcon()}</span>
              </div>
              <div className="flex-1">
                {isCreating ? (
                  <>
                    <input
                      type="text"
                      value={title || ''}
                      onChange={(e) => onTitleChange?.(e.target.value)}
                      placeholder="Agent Name"
                      className="text-base font-bold text-slate-900 w-full bg-transparent border-b-2 border-slate-200 focus:border-bm-maroon focus:outline-none pb-1 text-sm"
                    />
                    <span className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                      <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                      New Agent
                    </span>
                  </>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-slate-900">{title}</h2>
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-100 text-green-700 border border-green-200">
                      <span className="w-1 h-1 rounded-full bg-green-600 animate-pulse"></span>
                      Active Node
                    </span>
                  </>
                )}
              </div>
            </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
              {isCreating ? (
                <textarea
                  value={description || ''}
                  onChange={(e) => onDescriptionChange?.(e.target.value)}
                  placeholder="Enter agent description..."
                  className="w-full text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 focus:border-bm-maroon focus:ring-1 focus:ring-bm-maroon/20 focus:outline-none resize-none min-h-[60px]"
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {description}
                </p>
              )}
            </div>
            <hr className="border-slate-100" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configuration</label>
                <span className="text-[9px] text-bm-maroon font-semibold cursor-pointer hover:underline">Reset to Default</span>
              </div>
              <div className="space-y-4">
                {agentType === 'persona' && (
                  <>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-700">Temperament</span>
                        <span className="text-[10px] font-bold text-white bg-bm-maroon px-1.5 py-0.5 rounded">
                          {getTemperamentLabel(config.temperament || 75)}
                        </span>
                      </div>
                      <input
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-bm-maroon"
                        type="range"
                        min="0"
                        max="100"
                        value={config.temperament || 75}
                        onChange={(e) => handleConfigChange('temperament', parseInt(e.target.value))}
                      />
                      <div className="flex justify-between mt-0.5 text-[9px] text-slate-400">
                        <span>Calm</span>
                        <span>Hostile</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-700">Patience Level</span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          {getPatienceLabel(config.patienceLevel || 20)}
                        </span>
                      </div>
                      <input
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-bm-maroon"
                        type="range"
                        min="0"
                        max="100"
                        value={config.patienceLevel || 20}
                        onChange={(e) => handleConfigChange('patienceLevel', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Voice Model</label>
                      <div className="relative">
                        <select
                          className="block w-full pl-2.5 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bm-maroon focus:border-bm-maroon shadow-sm appearance-none"
                          value={config.voiceModel || 'Arabic (Egypt) - Male 1'}
                          onChange={(e) => handleConfigChange('voiceModel', e.target.value)}
                        >
                          <option>Arabic (Egypt) - Male 1</option>
                          <option>Arabic (Egypt) - Female 2</option>
                          <option>English (UK) - Male</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <hr className="border-slate-100" />
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Advanced Settings</label>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-700">Log Interaction Data</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config.logInteractionData || false}
                    onChange={(e) => handleConfigChange('logInteractionData', e.target.checked)}
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bm-maroon/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-bm-maroon"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700">Allow Interruptions</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config.allowInterruptions !== false}
                    onChange={(e) => handleConfigChange('allowInterruptions', e.target.checked)}
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-bm-maroon/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-bm-maroon"></div>
                </label>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
      {!isEmpty && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onSave}
            className="w-full bg-bm-maroon text-white font-bold py-2 rounded-lg shadow-lg shadow-bm-maroon/20 flex items-center justify-center gap-1.5 text-xs"
          >
            <span className="material-symbols-outlined text-sm">{isCreating ? 'add_circle' : 'save'}</span>
            {isCreating ? 'Create Agent' : 'Save Configuration'}
          </button>
        </div>
      )}
    </section>
  )
}

