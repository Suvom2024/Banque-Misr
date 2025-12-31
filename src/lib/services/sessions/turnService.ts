import { createClient } from '@/lib/supabase/server'

export interface TurnData {
  sessionId: string
  turnNumber: number
  speaker: 'user' | 'ai-coach' | 'client' | 'system'
  message: string
  metrics?: {
    sentiment?: 'positive' | 'negative' | 'neutral'
    pacing?: number // words per minute
    clarity?: number // 0-100
    empathy?: number // 0-100
    directness?: number // 0-100
  }
  audioChunkId?: string
}

/**
 * Save a conversation turn to the database
 * Optionally triggers AI analysis for user turns
 */
export async function saveTurn(
  turn: TurnData,
  options?: { triggerAIAnalysis?: boolean; conversationContext?: Array<{ speaker: string; message: string }> }
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_turns')
    .insert({
      session_id: turn.sessionId,
      turn_number: turn.turnNumber,
      speaker: turn.speaker,
      message: turn.message,
      metrics: turn.metrics || null,
      audio_chunk_id: turn.audioChunkId || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error saving turn:', error)
    return null
  }

  // Trigger AI analysis for user turns (asynchronously, don't wait)
  if (options?.triggerAIAnalysis && turn.speaker === 'user') {
    // Don't await - let it run in background
    analyzeTurnAsync(data.id, turn.sessionId, turn.speaker, turn.message, options.conversationContext).catch(
      (err) => {
        console.error('[TurnService] Failed to trigger AI analysis:', err)
      }
    )
  }

  return data.id
}

/**
 * Trigger AI analysis asynchronously (non-blocking)
 */
async function analyzeTurnAsync(
  turnId: string,
  sessionId: string,
  speaker: 'user' | 'ai-coach' | 'client' | 'system',
  message: string,
  conversationContext?: Array<{ speaker: string; message: string }>
): Promise<void> {
  try {
    const { analyzeTurn } = await import('./turnAnalysisService')
    await analyzeTurn(turnId, sessionId, speaker, message, conversationContext)
  } catch (error) {
    console.error('[TurnService] Error in async AI analysis:', error)
  }
}

/**
 * Get all turns for a session
 */
export async function getSessionTurns(sessionId: string): Promise<TurnData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('session_turns')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true })

  if (error || !data) {
    console.error('Error fetching turns:', error)
    return []
  }

  return data.map((turn) => ({
    sessionId: turn.session_id,
    turnNumber: turn.turn_number,
    speaker: turn.speaker as TurnData['speaker'],
    message: turn.message,
    metrics: turn.metrics as TurnData['metrics'],
    audioChunkId: turn.audio_chunk_id || undefined,
  }))
}

/**
 * Get the next turn number for a session
 */
export async function getNextTurnNumber(sessionId: string): Promise<number> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('session_turns')
    .select('turn_number')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: false })
    .limit(1)
    .single()

  return (data?.turn_number || 0) + 1
}

