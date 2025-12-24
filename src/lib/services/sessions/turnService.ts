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
 */
export async function saveTurn(turn: TurnData): Promise<string | null> {
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

  return data.id
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

