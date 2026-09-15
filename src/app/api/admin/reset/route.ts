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

    // Don't touch questions or answers - keep them as-is
    // Just reset game state to registration phase
    await adminDb.collection('game_state').doc('current').set({
      active_question_id: null,
      game_phase: 'registration',
      strikes: 0,
      question_text: '',
      member_name: '',
      member_role: '',
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ message: `Reset complete: cleared ${players.size} players and ${responses.size} responses` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

