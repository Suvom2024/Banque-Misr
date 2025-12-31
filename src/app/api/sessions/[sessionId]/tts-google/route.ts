import { NextResponse } from 'next/server'

/**
 * POST /api/sessions/[sessionId]/tts-google
 * Generate speech from text using Google Cloud Text-to-Speech API
 * Uses the same Google Cloud project as Gemini API
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

    // Try to use Gemini API key (might work if same Google Cloud project)
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    
    if (!apiKey) {
      console.error('[TTS Google] ❌ NEXT_PUBLIC_GEMINI_API_KEY not found')
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    console.log('[TTS Google] 🎤 Generating speech using Google Cloud TTS for text:', text.substring(0, 50))

    // Google Cloud Text-to-Speech API endpoint
    // Note: This requires the Text-to-Speech API to be enabled in your Google Cloud project
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-F', // Female neural voice
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0, // 0 is neutral, can adjust -20 to +20
            volumeGainDb: 0,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[TTS Google] ❌ API Error:', errorData)
      
      // If API not enabled, provide helpful error message
      if (response.status === 403) {
        return NextResponse.json(
          { 
            error: 'Text-to-Speech API not enabled',
            details: 'Please enable the Cloud Text-to-Speech API in your Google Cloud Console',
            helpUrl: 'https://console.cloud.google.com/apis/library/texttospeech.googleapis.com'
          },
          { status: 403 }
        )
      }
      
      throw new Error(errorData.error?.message || `TTS API failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.audioContent) {
      throw new Error('No audio content in response')
    }

    // Decode base64 audio content
    const audioBuffer = Buffer.from(data.audioContent, 'base64')

    console.log('[TTS Google] ✅ Speech generated successfully, size:', audioBuffer.length)

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[TTS Google] ❌ Error generating speech:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    )
  }
}

