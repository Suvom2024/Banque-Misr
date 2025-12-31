import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * POST /api/sessions/[sessionId]/tts
 * Generate speech from text using OpenAI TTS API
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { text } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[TTS API] ❌ OPENAI_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({ apiKey })

    console.log('[TTS API] 🎤 Generating speech for text:', text.substring(0, 50))

    // Use OpenAI TTS API with a female voice
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // Use tts-1 for faster, or ts-1-hd for higher quality
      voice: 'nova', // 'nova' is a female voice, other options: 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
      input: text,
      response_format: 'mp3',
      speed: 1.0, // 0.25 to 4.0
    })

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    console.log('[TTS API] ✅ Speech generated successfully, size:', buffer.length)

    // Return audio as MP3
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[TTS API] ❌ Error generating speech:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    )
  }
}

