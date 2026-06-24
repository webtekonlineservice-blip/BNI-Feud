import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { player_id, display_name, total_score } = await req.json()
    if (!player_id) return NextResponse.json({ error: 'Missing player_id' }, { status: 400 })

    await adminDb.collection('players').doc(player_id).update({
      display_name,
      total_score,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { player_id } = await req.json()
    if (!player_id) return NextResponse.json({ error: 'Missing player_id' }, { status: 400 })

    await adminDb.collection('players').doc(player_id).delete()

    const responses = await adminDb.collection('responses').where('player_id', '==', player_id).get()
    for (const doc of responses.docs) await doc.ref.delete()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
