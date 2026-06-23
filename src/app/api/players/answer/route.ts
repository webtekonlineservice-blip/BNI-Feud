import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { matchAnswer } from '@/lib/matchAnswer'

export const dynamic = 'force-dynamic'

// POST /api/players/answer — web form answer submission
export async function POST(req: NextRequest) {
  const { player_id, question_id, raw_answer } = await req.json()

  if (!player_id || !question_id || !raw_answer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check if player already answered this round
  const existingSnap = await adminDb
    .collection('player_responses')
    .where('player_id', '==', player_id)
    .where('question_id', '==', question_id)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    return NextResponse.json({ error: 'Already answered this round', matched: false, points: 0 })
  }

  // Load board answers for this question
  const answersSnap = await adminDb
    .collection('question_answers')
    .where('question_id', '==', question_id)
    .orderBy('display_order')
    .get()

  const boardAnswers = answersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

  const matched = matchAnswer(raw_answer, boardAnswers)

  // Save player response
  await adminDb.collection('player_responses').add({
    player_id,
    question_id,
    raw_answer,
    matched_answer: matched?.answer_text || null,
    points_earned: matched?.points || 0,
    received_at: new Date().toISOString(),
  })

  if (matched) {
    // Reveal answer on board
    await adminDb.collection('question_answers').doc(matched.id).update({ is_revealed: true })

    // Update player score
    const playerDoc = await adminDb.collection('players').doc(player_id).get()
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
}
