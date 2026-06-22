import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

// GET /api/questions — all questions with member + answers
export async function GET() {
  const questionsSnap = await adminDb
    .collection('questions')
    .orderBy('display_order')
    .get()

  const questions = await Promise.all(
    questionsSnap.docs.map(async (qDoc) => {
      const qData = qDoc.data()

      // Get associated member
      let members = null
      if (qData.member_id) {
        const memberDoc = await adminDb.collection('members').doc(qData.member_id).get()
        if (memberDoc.exists) {
          members = { id: memberDoc.id, ...memberDoc.data() }
        }
      }

      // Get answers from subcollection
      const answersSnap = await adminDb
        .collection('questions')
        .doc(qDoc.id)
        .collection('answers')
        .orderBy('display_order')
        .get()

      const question_answers = answersSnap.docs.map(a => ({ id: a.id, ...a.data() }))

      return { id: qDoc.id, ...qData, members, question_answers }
    })
  )

  return NextResponse.json(questions)
}

// PATCH /api/questions — activate or complete a question
export async function PATCH(req: NextRequest) {
  const { question_id, action } = await req.json()

  if (action === 'activate') {
    // Deactivate all others first
    const allActive = await adminDb.collection('questions').where('is_active', '==', true).get()
    const batch = adminDb.batch()
    allActive.docs.forEach(doc => {
      batch.update(doc.ref, { is_active: false })
    })

    // Activate this one
    batch.update(adminDb.collection('questions').doc(question_id), { is_active: true })

    // Get question + member info for game state
    const questionDoc = await adminDb.collection('questions').doc(question_id).get()
    const questionData = questionDoc.data()
    let memberName = ''
    let memberRole = ''
    if (questionData?.member_id) {
      const memberDoc = await adminDb.collection('members').doc(questionData.member_id).get()
      memberName = memberDoc.data()?.name || ''
      memberRole = memberDoc.data()?.role || ''
    }

    // Update game state
    batch.set(adminDb.collection('game_state').doc('current'), {
      active_question_id: question_id,
      question_text: questionData?.question_text || '',
      member_name: memberName,
      member_role: memberRole,
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

    batch.set(adminDb.collection('game_state').doc('current'), {
      active_question_id: null,
      question_text: '',
      member_name: '',
      member_role: '',
      game_phase: 'registration',
      strikes: 0,
      updated_at: new Date().toISOString(),
    }, { merge: true })

    await batch.commit()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
