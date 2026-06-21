import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

// GET /api/leaderboard — players + their responses for results view
export async function GET() {
  const playersSnap = await adminDb
    .collection('players')
    .orderBy('total_score', 'desc')
    .get()

  const players = await Promise.all(
    playersSnap.docs.map(async (doc) => {
      const player = { id: doc.id, ...doc.data() }

      // Get player's responses with question/member info
      const responsesSnap = await adminDb
        .collection('player_responses')
        .where('player_id', '==', doc.id)
        .orderBy('received_at', 'desc')
        .get()

      const player_responses = await Promise.all(
        responsesSnap.docs.map(async (rDoc) => {
          const response = { id: rDoc.id, ...rDoc.data() }
          const questionId = (response as any).question_id

          // Get question + member
          let questions = null
          if (questionId) {
            const qDoc = await adminDb.collection('questions').doc(questionId).get()
            if (qDoc.exists) {
              const qData = qDoc.data()
              let members = null
              if (qData?.member_id) {
                const mDoc = await adminDb.collection('members').doc(qData.member_id).get()
                if (mDoc.exists) members = { name: mDoc.data()?.name }
              }
              questions = { question_text: qData?.question_text, members }
            }
          }

          return { ...response, questions }
        })
      )

      return { ...player, player_responses }
    })
  )

  return NextResponse.json(players)
}
