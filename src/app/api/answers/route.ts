import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

// GET /api/answers — get game state
export async function GET() {
  const doc = await adminDb.collection('game_state').doc('singleton').get()

  if (!doc.exists) {
    return NextResponse.json({ game_phase: 'registration', strikes: 0, active_question_id: null })
  }

  return NextResponse.json({ id: doc.id, ...doc.data() })
}

// PATCH /api/answers — update game state (strikes, etc.)
export async function PATCH(req: NextRequest) {
  const body = await req.json()

  await adminDb.collection('game_state').doc('singleton').set(
    { ...body, updated_at: new Date().toISOString() },
    { merge: true }
  )

  const updated = await adminDb.collection('game_state').doc('singleton').get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}
