import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { question_id, question_text, answers } = await req.json()

    if (!question_id || !question_text || !answers) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await adminDb.collection('questions').doc(question_id).update({ question_text })

    for (const answer of answers) {
      if (answer.id) {
        await adminDb
          .collection('questions')
          .doc(question_id)
          .collection('answers')
          .doc(answer.id)
          .update({
            answer_text: answer.answer_text,
            points: answer.points,
          })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
