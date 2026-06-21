import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

// GET /api/questions — all questions with member + answers
export async function GET() {
  const questionsSnap = await adminDb
    .collection('questions')
    .orderBy('created_at')
    .get()

  const questions = await Promise.all(
    questionsSnap.docs.map(async (doc) => {
      const q = { id: doc.id, ...doc.data() }

      // Get associated member
      let members = null
      if ((q as any).member_id) {
        const memberDoc = await adminDb.collection('members').doc((q as any).member_id).get()
        if (memberDoc.exists) {
          members = { id: memberDoc.id, ...memberDoc.data() }
        }
      }

      // Get associated answers
      const answersSnap = await adminDb
        .collection('question_answers')
        .where('question_id', '==', doc.id)
        .orderBy('display_order')
        .get()
      const question_answers = answersSnap.docs.map(a => ({ id: a.id, ...a.data() }))

      return { ...q, members, question_answers }
    })
  )

  return NextResponse.json(questions)
}

// PATCH /api/questions — set active question + open the round
export async function PATCH(req: NextRequest) {
  const { question_id, action } = await req.json()

  if (action === 'activate') {
    // Deactivate all others first
    const allQuestions = await adminDb.collection('questions').where('is_active', '==', true).get()
    const batch = adminDb.batch()
    allQuestions.docs.forEach(doc => {
      batch.update(doc.ref, { is_active: false })
    })

    // Activate this one
    batch.update(adminDb.collection('questions').doc(question_id), { is_active: true })

    // Update game state
    batch.set(adminDb.collection('game_state').doc('singleton'), {
      active_question_id: question_id,
      game_phase: 'playing',
      strikes: 0,
      updated_at: new Date().toISOString(),
    }, { merge: true })

    await batch.commit()
    return NextResponse.json({ ok: true })
  }

  if (action === 'complete') {
    const batch = adminDb.batch()

    batch.update(adminDb.collection('questions').doc(question_id), {
      is_active: false,
      is_complete: true,
    })

    batch.set(adminDb.collection('game_state').doc('singleton'), {
      active_question_id: null,
      game_phase: 'registration',
      updated_at: new Date().toISOString(),
    }, { merge: true })

    await batch.commit()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
