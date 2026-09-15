import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

// PATCH /api/answers — reveal an answer or update game state
export async function PATCH(req: NextRequest) {
  const body = await req.json()

  // If this is a reveal action for a specific answer
  if (body.action === 'reveal' && body.question_id && body.answer_id) {
    try {
      await adminDb
        .collection('questions')
        .doc(body.question_id)
        .collection('answers')
        .doc(body.answer_id)
        .update({ is_revealed: true })
      
      return NextResponse.json({ success: true })
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }

  // Otherwise, update game state
  await adminDb.collection('game_state').doc('singleton').set(
    { ...body, updated_at: new Date().toISOString() },
    { merge: true }
  )

  const updated = await adminDb.collection('game_state').doc('singleton').get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}
