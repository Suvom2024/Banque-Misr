import { createClient } from '@/lib/supabase/server'
import { connectIntegration } from '@/lib/services/integrations/integrationsService'
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
    const body = await request.json()
    const { settings } = body

    const success = await connectIntegration(user.id, id, settings)

    if (!success) {
      return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error connecting integration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


