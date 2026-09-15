import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const playersOnly = body.playersOnly || false

    // Delete responses
    const responses = await adminDb.collection('responses').get()
    for (const d of responses.docs) await d.ref.delete()

    // Delete players
    const players = await adminDb.collection('players').get()
    for (const d of players.docs) await d.ref.delete()

    // Reset all answers to unrevealed (turn green back to black)
    const questions = await adminDb.collection('questions').get()
    let answerCount = 0
    
    for (const q of questions.docs) {
      const answers = await adminDb.collection('questions').doc(q.id).collection('answers').get()
      
      // Use batch for better reliability
      const batch = adminDb.batch()
      for (const a of answers.docs) {
        batch.update(a.ref, { is_revealed: false })
        answerCount++
      }
      await batch.commit()
    }

    // Reset game state
    await adminDb.collection('game_state').doc('current').set({
      active_question_id: null,
      game_phase: 'registration',
      strikes: 0,
      question_text: '',
      member_name: '',
      member_role: '',
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ 
      message: `Reset complete: cleared ${players.size} players, ${responses.size} responses, and reset ${answerCount} answers`,
      players: players.size,
      responses: responses.size,
      answers: answerCount
    })
  } catch (e: any) {
    console.error('Reset error:', e)
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
  }
}

