import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { matchAnswer } from '@/lib/matchAnswer'

export const dynamic = 'force-dynamic'

// POST /api/players/answer — web form answer submission
export async function POST(req: NextRequest) {
  try {
    const { player_id, question_id, raw_answer } = await req.json()

    if (!player_id || !question_id || !raw_answer) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Check if player already answered this round
    const existingSnap = await adminDb
      .collection('responses')
      .where('player_id', '==', player_id)
      .where('question_id', '==', question_id)
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      return NextResponse.json({ error: 'Already answered this round', matched: false, points: 0 })
    }

    // Load board answers from subcollection
    const answersSnap = await adminDb
      .collection('questions')
      .doc(question_id)
      .collection('answers')
      .orderBy('display_order')
      .get()

    const boardAnswers = answersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

    const matched = matchAnswer(raw_answer, boardAnswers)

    // Get player name for response record
    const playerDoc = await adminDb.collection('players').doc(player_id).get()
    const playerName = playerDoc.data()?.display_name || ''

    // Save response
    await adminDb.collection('responses').add({
      player_id,
      question_id,
      raw_answer,
      matched_answer: matched?.answer_text || null,
      points_earned: matched?.points || 0,
      display_name: playerName,
      received_at: new Date().toISOString(),
    })

    if (matched) {
      // Reveal answer on board
      await adminDb
        .collection('questions')
        .doc(question_id)
        .collection('answers')
        .doc(matched.id)
        .update({ is_revealed: true })

      // Update player score
      const currentScore = playerDoc.data()?.total_score || 0
      await adminDb.collection('players').doc(player_id).update({
        total_score: currentScore + matched.points,
      })
    }

    return NextResponse.json({
      matched: !!matched,
      points: matched?.points || 0,
      answer: matched?.answer_text || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
