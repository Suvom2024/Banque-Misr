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
    <div className="bg-bm-white border border-bm-grey rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 flex flex-col relative overflow-hidden">
      {/* PRO Badge */}
      {integration.isPro && (
        <div className="absolute -right-8 top-4 bg-bm-maroon text-bm-white text-[10px] font-bold py-1 px-8 rotate-45 shadow-sm">
          PRO
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${getBrandColor(integration.brandColor)}15` }}>
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'FILL' 1", color: getBrandColor(integration.brandColor) }}
          >
            {integration.icon}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-feedback-positive-bg text-feedback-positive'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isConnected ? 'Connected' : 'Available'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-bm-text-primary mb-2">{integration.name}</h3>

      {/* Description */}
      <p className="text-sm text-bm-text-secondary mb-6 flex-grow line-clamp-2">{integration.description}</p>

      {/* Settings Toggles (for connected integrations) */}
      {isConnected && integration.settings && integration.settings.length > 0 && (
        <div className="bg-bm-light-grey rounded-lg p-4 mb-6 space-y-3">
          {integration.settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <label className="text-sm font-medium text-bm-text-primary" htmlFor={`${integration.id}-${setting.id}`}>
                {setting.label}
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  checked={setting.enabled}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:border-bm-maroon"
                  id={`${integration.id}-${setting.id}`}
                  name={`${integration.id}-${setting.id}`}
                  type="checkbox"
                  onChange={(e) => onToggle?.(integration.id, setting.id, e.target.checked)}
                />
                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer" htmlFor={`${integration.id}-${setting.id}`}></label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <button
              className="flex-1 bg-bm-light-grey text-bm-text-primary hover:bg-gray-200 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors border border-bm-grey"
              onClick={() => onManage?.(integration.id)}
            >
              Manage
            </button>
            <button
              className="text-bm-text-subtle hover:text-bm-maroon transition-colors p-2"
              onClick={() => onSettings?.(integration.id)}
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </>
        ) : (
          <button
            className="w-full bg-bm-gold text-bm-maroon-dark font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-bm-gold-dark transition-colors shadow-sm"
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
