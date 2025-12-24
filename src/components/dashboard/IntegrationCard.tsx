'use client'

import { memo } from 'react'

const brandColors: Record<string, string> = {
  'brand-teams': '#6264A7',
  'brand-outlook': '#0078D4',
  'brand-gmail': '#EA4335',
  'brand-sheets': '#34A853',
  'brand-onedrive': '#0078D4',
  'brand-slack': '#4A154B',
  'brand-zoom': '#2D8CFF',
  'brand-notion': '#000000',
  'brand-trello': '#0079BF',
  'brand-salesforce': '#00A1E0',
  'brand-aws': '#FF9900',
  'brand-zapier': '#FF4A00',
  'gray-700': '#374151',
}

function getBrandColor(colorKey: string): string {
  return brandColors[colorKey] || '#6B7280'
}

export interface Integration {
  id: string
  name: string
  description: string
  icon: string
  brandColor: string
  status: 'connected' | 'available'
  category: 'communication' | 'productivity' | 'servers-apis'
  isPro?: boolean
  settings?: Array<{
    id: string
    label: string
    enabled: boolean
  }>
}

interface IntegrationCardProps {
  integration: Integration
  onToggle?: (integrationId: string, settingId: string, enabled: boolean) => void
  onConnect?: (integrationId: string) => void
  onManage?: (integrationId: string) => void
  onSettings?: (integrationId: string) => void
}

function IntegrationCardComponent({
  integration,
  onToggle,
  onConnect,
  onManage,
  onSettings,
}: IntegrationCardProps) {
  const isConnected = integration.status === 'connected'

  return (
    <div className="bg-bm-white border border-bm-grey rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col relative overflow-hidden">
      {/* PRO Badge */}
      {integration.isPro && (
        <div className="absolute -right-8 top-3 bg-bm-maroon text-bm-white text-[9px] font-bold py-0.5 px-8 rotate-45 shadow-sm">
          PRO
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${getBrandColor(integration.brandColor)}15` }}>
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 1", color: getBrandColor(integration.brandColor) }}
          >
            {integration.icon}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
            isConnected
              ? 'bg-feedback-positive-bg text-feedback-positive'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isConnected ? 'Connected' : 'Available'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-bm-text-primary mb-1.5">{integration.name}</h3>

      {/* Description */}
      <p className="text-xs text-bm-text-secondary mb-4 flex-grow line-clamp-2">{integration.description}</p>

      {/* Settings Toggles (for connected integrations) */}
      {isConnected && integration.settings && integration.settings.length > 0 && (
        <div className="bg-bm-light-grey rounded-lg p-3 mb-4 space-y-2">
          {integration.settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <label className="text-xs font-medium text-bm-text-primary" htmlFor={`${integration.id}-${setting.id}`}>
                {setting.label}
              </label>
              <div className="relative inline-block w-9 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  checked={setting.enabled}
                  className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-3 appearance-none cursor-pointer border-gray-300 checked:border-bm-maroon"
                  id={`${integration.id}-${setting.id}`}
                  name={`${integration.id}-${setting.id}`}
                  type="checkbox"
                  onChange={(e) => onToggle?.(integration.id, setting.id, e.target.checked)}
                />
                <label className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-300 cursor-pointer" htmlFor={`${integration.id}-${setting.id}`}></label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <button
              className="flex-1 bg-bm-light-grey text-bm-text-primary hover:bg-gray-200 font-bold py-2 px-3 rounded-lg text-xs transition-colors border border-bm-grey"
              onClick={() => onManage?.(integration.id)}
            >
              Manage
            </button>
            <button
              className="text-bm-text-subtle hover:text-bm-maroon transition-colors p-1.5"
              onClick={() => onSettings?.(integration.id)}
            >
              <span className="material-symbols-outlined text-base">settings</span>
            </button>
          </>
        ) : (
          <button
            className="w-full bg-bm-gold text-bm-maroon-dark font-bold py-2 px-3 rounded-lg text-xs hover:bg-bm-gold-dark transition-colors shadow-sm"
            onClick={() => onConnect?.(integration.id)}
          >
            {integration.isPro ? 'Configure' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  )
}

export const IntegrationCard = memo(IntegrationCardComponent)
