import { createClient } from '@/lib/supabase/server'
import { getAllIntegrations, getUserIntegrations } from '@/lib/services/integrations/integrationsService'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeUserConnections = searchParams.get('includeUserConnections') === 'true'

    const [allIntegrations, userIntegrations] = await Promise.all([
      getAllIntegrations(),
      includeUserConnections ? getUserIntegrations(user.id) : Promise.resolve([]),
    ])

    // Merge user connection status into all integrations
    const userIntegrationMap = new Map(
      userIntegrations.map((ui) => [ui.id, ui])
    )

    const mergedIntegrations = allIntegrations.map((integration) => {
      const userIntegration = userIntegrationMap.get(integration.id)
      if (userIntegration) {
        return {
          ...integration,
          status: userIntegration.status,
          settings: userIntegration.settings,
        }
      }
      return integration
    })

    return NextResponse.json(mergedIntegrations)
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


