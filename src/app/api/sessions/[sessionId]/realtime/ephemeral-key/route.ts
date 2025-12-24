import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * POST /api/sessions/[sessionId]/realtime/ephemeral-key
 * Generate an ephemeral client key for OpenAI Realtime API
 * This is the secure way to use Realtime API in browser
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // For now, we'll use the regular API key with insecure option
    // In the future, OpenAI may provide an ephemeral key endpoint
    // For development, we return a flag to use insecure mode
    const serverApiKey = process.env.OPENAI_API_KEY
    
    if (!serverApiKey) {
      return NextResponse.json({ error: 'Server API key not configured' }, { status: 500 })
    }

    // Return server API key (in production, this should be an ephemeral key)
    // Client will use this with useInsecureApiKey option
    return NextResponse.json({
      useServerKey: true,
      // Note: In production, generate ephemeral key here
    })
  } catch (error: any) {
    console.error('Error generating ephemeral key:', error)
    
    // If ephemeral key generation fails, fall back to using regular API key with insecure option
    // This is a workaround for development
    return NextResponse.json({
      error: 'Failed to generate ephemeral key',
      fallback: true,
      message: 'Use regular API key with useInsecureApiKey option',
    }, { status: 500 })
  }
}

