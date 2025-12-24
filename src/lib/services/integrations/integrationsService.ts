import { createClient } from '@/lib/supabase/server'

export interface Integration {
  id: string
  name: string
  description: string
  icon: string
  brandColor: string
  status: 'connected' | 'available' | 'disconnected' | 'pending'
  category: 'communication' | 'productivity' | 'servers-apis' | 'crm' | 'lms'
  isPro?: boolean
  settings?: Array<{ id: string; label: string; enabled: boolean }>
}

/**
 * Get all available integrations
 */
export async function getAllIntegrations(): Promise<Integration[]> {
  const supabase = await createClient()

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching integrations:', error)
    return []
  }

  return (integrations || []).map((integration) => ({
    id: integration.id,
    name: integration.name,
    description: integration.description || '',
    icon: integration.icon || 'extension',
    brandColor: integration.brand_color || 'gray-700',
    status: 'available' as const,
    category: (integration.category as Integration['category']) || 'communication',
    isPro: integration.is_pro_feature || false,
  }))
}

/**
 * Get user's connected integrations
 */
export async function getUserIntegrations(userId: string): Promise<Integration[]> {
  const supabase = await createClient()

  const { data: userIntegrations, error } = await supabase
    .from('user_integrations')
    .select('*, integrations(*)')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user integrations:', error)
    return []
  }

  return (userIntegrations || []).map((ui) => {
    const integration = ui.integrations as any
    return {
      id: integration.id,
      name: integration.name,
      description: integration.description || '',
      icon: integration.icon || 'extension',
      brandColor: integration.brand_color || 'gray-700',
      status: (ui.status as Integration['status']) || 'disconnected',
      category: (integration.category as Integration['category']) || 'communication',
      isPro: integration.is_pro_feature || false,
      settings: (ui.settings as Integration['settings']) || [],
    }
  })
}

/**
 * Connect an integration for a user
 */
export async function connectIntegration(
  userId: string,
  integrationId: string,
  settings?: Record<string, any>
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_integrations')
    .upsert({
      user_id: userId,
      integration_id: integrationId,
      status: 'connected',
      settings: settings || {},
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,integration_id',
    })

  if (error) {
    console.error('Error connecting integration:', error)
    return false
  }

  return true
}

/**
 * Disconnect an integration for a user
 */
export async function disconnectIntegration(
  userId: string,
  integrationId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_integrations')
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('integration_id', integrationId)

  if (error) {
    console.error('Error disconnecting integration:', error)
    return false
  }

  return true
}

/**
 * Update integration settings
 */
export async function updateIntegrationSettings(
  userId: string,
  integrationId: string,
  settings: Record<string, any>
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_integrations')
    .update({
      settings,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('integration_id', integrationId)

  if (error) {
    console.error('Error updating integration settings:', error)
    return false
  }

  return true
}


