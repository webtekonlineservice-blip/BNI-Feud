import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

// GET /api/players — all registered players sorted by score
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('players')
      .orderBy('total_score', 'desc')
      .get()

    const players = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(players)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/players — manual registration (QR web form fallback)
export async function POST(req: NextRequest) {
  try {
    const { phone_number, display_name } = await req.json()

    if (!phone_number || !display_name) {
      return NextResponse.json({ error: 'phone_number and display_name required' }, { status: 400 })
    }

    // Normalize phone to E.164
    const normalized = phone_number.replace(/\D/g, '')
    const e164 = normalized.startsWith('1') ? `+${normalized}` : `+1${normalized}`

    // Check if player already exists by phone number
    const existing = await adminDb
      .collection('players')
      .where('phone_number', '==', e164)
      .limit(1)
      .get()

    if (!existing.empty) {
      const doc = existing.docs[0]
      await doc.ref.update({ display_name })
      return NextResponse.json({ id: doc.id, ...doc.data(), display_name })
    }

    // Create new player
    const newPlayer = {
      phone_number: e164,
      display_name,
      total_score: 0,
      registered_at: new Date().toISOString(),
      is_host: false,
    }

    const docRef = await adminDb.collection('players').add(newPlayer)
    return NextResponse.json({ id: docRef.id, ...newPlayer })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
