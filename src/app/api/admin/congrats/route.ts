import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import twilio from 'twilio'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const playersSnap = await adminDb.collection('players').orderBy('total_score', 'desc').limit(1).get()
    if (playersSnap.empty) return NextResponse.json({ error: 'No players' }, { status: 400 })

    const winner = playersSnap.docs[0].data()
    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

    await client.messages.create({
      body: 'Congratulations ' + winner.display_name + '! You won BNI Family Feud with ' + winner.total_score + ' points! Lunch is on Patrick!',
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: winner.phone_number,
    })

    return NextResponse.json({ ok: true, winner: winner.display_name })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
