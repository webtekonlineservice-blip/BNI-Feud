import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { question_id, question_text, member_id, answers } = await req.json()

    if (!question_text || !answers) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Create new question
    if (!question_id) {
      const existingQuestions = await adminDb.collection('questions').get()
      const newOrder = existingQuestions.size + 1

      const questionRef = await adminDb.collection('questions').add({
        question_text,
        member_id: member_id || null,
        is_active: false,
        is_complete: false,
        display_order: newOrder,
        created_at: new Date().toISOString(),
      })

      for (let i = 0; i < answers.length; i++) {
        if (answers[i].answer_text) {
          await adminDb.collection('questions').doc(questionRef.id).collection('answers').add({
            answer_text: answers[i].answer_text,
            points: answers[i].points || 0,
            display_order: i + 1,
            is_revealed: false,
          })
        }
      }

      return NextResponse.json({ ok: true, id: questionRef.id })
    }

    // Update existing question
    const updateData: any = { question_text }
    if (member_id) updateData.member_id = member_id
    await adminDb.collection('questions').doc(question_id).update(updateData)

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
      } else if (answer.answer_text) {
        // New answer added
        await adminDb.collection('questions').doc(question_id).collection('answers').add({
          answer_text: answer.answer_text,
          points: answer.points || 0,
          display_order: answers.indexOf(answer) + 1,
          is_revealed: false,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { question_id } = await req.json()
    if (!question_id) return NextResponse.json({ error: 'Missing question_id' }, { status: 400 })

    // Delete answers subcollection
    const answers = await adminDb.collection('questions').doc(question_id).collection('answers').get()
    for (const a of answers.docs) await a.ref.delete()

    // Delete question
    await adminDb.collection('questions').doc(question_id).delete()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
