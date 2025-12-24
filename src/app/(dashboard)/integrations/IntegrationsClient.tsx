'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { IntegrationsHeader } from '@/components/dashboard/IntegrationsHeader'
import { IntegrationsFilters } from '@/components/dashboard/IntegrationsFilters'
import { IntegrationCard, Integration } from '@/components/dashboard/IntegrationCard'

interface IntegrationsClientProps {
  userName: string
  userRole?: string
  userAvatar?: string
}

// Hard-coded integrations data
const defaultIntegrations: Integration[] = [
  // Connected Integrations
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Automatically share feedback summaries and schedule training sessions directly in your team calendar.',
    icon: 'groups',
    brandColor: 'brand-teams',
    status: 'connected',
    category: 'communication',
    settings: [
      { id: 'sync-calendar', label: 'Sync Calendar', enabled: true },
      { id: 'channel-notifications', label: 'Channel Notifications', enabled: true },
    ],
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Sync training invitations and receive weekly performance digests via email.',
    icon: 'mark_email_unread',
    brandColor: 'brand-outlook',
    status: 'connected',
    category: 'communication',
    settings: [{ id: 'weekly-digest', label: 'Weekly Digest', enabled: true }],
  },
  // Available Integrations
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Google Workspace account for seamless email notifications and calendar events.',
    icon: 'mail',
    brandColor: 'brand-gmail',
    status: 'available',
    category: 'communication',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Export your training data, scores, and analytics directly to a spreadsheet for custom reporting.',
    icon: 'table_chart',
    brandColor: 'brand-sheets',
    status: 'available',
    category: 'productivity',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: "Securely store and backup your voice recording archives to your organization's cloud storage.",
    icon: 'cloud_circle',
    brandColor: 'brand-onedrive',
    status: 'available',
    category: 'productivity',
  },
  {
    id: 'mcp-server',
    name: 'MCP Server',
    description: 'Connect to a custom Model Context Protocol server for advanced AI model integration and private data handling.',
    icon: 'dns',
    brandColor: 'gray-700',
    status: 'available',
    category: 'servers-apis',
    isPro: true,
  },
  // Additional integrations
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get real-time notifications about training sessions, achievements, and team performance updates in your Slack channels.',
    icon: 'chat',
    brandColor: 'brand-slack',
    status: 'available',
    category: 'communication',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Automatically schedule and join training sessions directly from Zoom meetings with AI-powered session recording.',
    icon: 'videocam',
    brandColor: 'brand-zoom',
    status: 'available',
    category: 'communication',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync your training notes, insights, and progress reports to Notion pages for comprehensive knowledge management.',
    icon: 'description',
    brandColor: 'brand-notion',
    status: 'available',
    category: 'productivity',
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Create training task cards and track your learning progress with automated board updates and milestone tracking.',
    icon: 'view_kanban',
    brandColor: 'brand-trello',
    status: 'available',
    category: 'productivity',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Integrate training performance data with Salesforce CRM to track employee development and skill progression.',
    icon: 'account_circle',
    brandColor: 'brand-salesforce',
    status: 'available',
    category: 'productivity',
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Store training recordings, transcripts, and analytics data securely in your AWS S3 buckets with automated backups.',
    icon: 'storage',
    brandColor: 'brand-aws',
    status: 'available',
    category: 'servers-apis',
    isPro: true,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Create custom automation workflows connecting your training platform with 5000+ apps for seamless data flow.',
    icon: 'sync_alt',
    brandColor: 'brand-zapier',
    status: 'available',
    category: 'servers-apis',
  },
]

function IntegrationsClientComponent({ userName, userRole, userAvatar }: IntegrationsClientProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [activeCategory, setActiveCategory] = useState<'all' | 'communication' | 'productivity' | 'servers-apis'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/integrations?includeUserConnections=true')
      
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      } else {
        // Fallback to default if API fails
        setIntegrations(defaultIntegrations)
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
      setIntegrations(defaultIntegrations)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    let filtered = integrations

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((integration) => integration.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (integration) =>
          integration.name.toLowerCase().includes(query) || integration.description.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [integrations, activeCategory, searchQuery])

  const connectedIntegrations = useMemo(() => filteredIntegrations.filter((i) => i.status === 'connected'), [filteredIntegrations])
  const availableIntegrations = useMemo(() => filteredIntegrations.filter((i) => i.status === 'available'), [filteredIntegrations])

  const handleToggle = useCallback(async (integrationId: string, settingId: string, enabled: boolean) => {
    // Update local state immediately for better UX
    setIntegrations((prev) =>
      prev.map((integration) => {
        if (integration.id === integrationId && integration.settings) {
          return {
            ...integration,
            settings: integration.settings.map((setting) =>
              setting.id === settingId ? { ...setting, enabled } : setting
            ),
          }
        }
        return integration
      })
    )

    // Update in backend
    try {
      const integration = integrations.find((i) => i.id === integrationId)
      if (integration && integration.settings) {
        const updatedSettings = integration.settings.map((s) =>
          s.id === settingId ? { ...s, enabled } : s
        )
        const settingsObj = updatedSettings.reduce((acc, s) => {
          acc[s.id] = s.enabled
          return acc
        }, {} as Record<string, boolean>)

        await handleManage(integrationId, settingsObj)
      }
    } catch (error) {
      console.error('Error updating toggle:', error)
      // Revert on error
      await fetchIntegrations()
    }
  }, [integrations])

  const handleConnect = useCallback(async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: {} }),
      })

      if (response.ok) {
        // Refresh integrations list
        await fetchIntegrations()
      } else {
        throw new Error('Failed to connect integration')
      }
    } catch (error) {
      console.error('Error connecting integration:', error)
      alert('Failed to connect integration. Please try again.')
    }
  }, [])

  const handleDisconnect = useCallback(async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return
    }

    try {
      const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchIntegrations()
      } else {
        throw new Error('Failed to disconnect integration')
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error)
      alert('Failed to disconnect integration. Please try again.')
    }
  }, [])

  const handleManage = useCallback(async (integrationId: string, settings?: Record<string, any>) => {
    // If settings provided, update them
    if (settings) {
      try {
        const response = await fetch(`/api/integrations/${integrationId}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        })

        if (response.ok) {
          await fetchIntegrations()
        } else {
          throw new Error('Failed to update settings')
        }
      } catch (error) {
        console.error('Error updating settings:', error)
        alert('Failed to update settings. Please try again.')
      }
    } else {
      // Just refresh for manage action
      await fetchIntegrations()
    }
  }, [])

  const handleSettings = useCallback((integrationId: string) => {
    // Handle settings logic
    console.log('Opening settings for:', integrationId)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bm-light-grey">
      <IntegrationsHeader userName={userName} userRole={userRole} userAvatar={userAvatar} />

      <main className="flex-grow overflow-y-auto w-full">
        <div className="px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-screen-2xl mx-auto">
          {/* Filters */}
          <IntegrationsFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

        {/* Currently Connected Section */}
        {connectedIntegrations.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-feedback-positive"></span>
              <h2 className="text-lg font-bold tracking-tight text-bm-text-primary">Currently Connected</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {connectedIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={handleToggle}
                  onManage={handleManage}
                  onSettings={handleSettings}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Integrations Section */}
        {availableIntegrations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight text-bm-text-primary">Available Integrations</h2>
              <a className="text-xs font-bold text-bm-maroon hover:underline" href="#">
                Request an Integration
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {availableIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                />
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-bm-text-subtle mb-3">search_off</span>
            <p className="text-sm font-medium text-bm-text-secondary mb-1">No integrations found</p>
            <p className="text-xs text-bm-text-subtle">Try adjusting your filters or search query</p>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  )
}

export const IntegrationsClient = memo(IntegrationsClientComponent)

