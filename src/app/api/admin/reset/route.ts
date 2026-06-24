import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const playersOnly = body.playersOnly || false

    const responses = await adminDb.collection('responses').get()
    for (const d of responses.docs) await d.ref.delete()

    const players = await adminDb.collection('players').get()
    for (const d of players.docs) await d.ref.delete()

    if (!playersOnly) {
      const questions = await adminDb.collection('questions').get()
      for (const q of questions.docs) {
        await q.ref.update({ is_active: false, is_complete: false })
        const answers = await adminDb.collection('questions').doc(q.id).collection('answers').get()
        for (const a of answers.docs) await a.ref.update({ is_revealed: false })
      }
    }

    await adminDb.collection('game_state').doc('current').set({
      active_question_id: null,
      game_phase: 'registration',
      strikes: 0,
      question_text: '',
      member_name: '',
      member_role: '',
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ message: playersOnly ? `Cleared ${players.size} players and ${responses.size} responses` : 'Full reset complete' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
