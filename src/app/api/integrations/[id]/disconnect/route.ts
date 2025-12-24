import { createClient } from '@/lib/supabase/server'
import { disconnectIntegration } from '@/lib/services/integrations/integrationsService'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const success = await disconnectIntegration(user.id, id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


