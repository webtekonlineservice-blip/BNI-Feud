import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

// GET /api/admin/questions-backup - List backup questions
export async function GET(req: NextRequest) {
  try {
    const backup = await adminDb.collection('questions_backup').orderBy('backed_up_at', 'desc').get()
    
    const questions = await Promise.all(
      backup.docs.map(async (doc) => {
        const data = doc.data()
        const answers = await adminDb.collection('questions_backup').doc(doc.id).collection('answers').orderBy('display_order').get()
        
        return {
          id: doc.id,
          question_text: data.question_text,
          members: data.members || null,
          backed_up_at: data.backed_up_at,
          question_answers: answers.docs.map(a => ({
            answer_text: a.data().answer_text,
            points: a.data().points
          }))
        }
      })
    )

    return NextResponse.json({ questions })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/admin/questions-backup - Backup or restore questions
export async function POST(req: NextRequest) {
  try {
    const { action, count, questionIds } = await req.json()

    if (action === 'backup') {
      // Backup current questions to questions_backup collection
      const questions = await adminDb.collection('questions').get()
      
      // Clear existing backup
      const existingBackup = await adminDb.collection('questions_backup').get()
      for (const doc of existingBackup.docs) {
        await doc.ref.delete()
      }

      // Copy questions to backup
      for (const q of questions.docs) {
        const questionData = q.data()
        const backupRef = await adminDb.collection('questions_backup').add({
          ...questionData,
          original_id: q.id,
          backed_up_at: new Date().toISOString()
        })

        // Copy answers subcollection
        const answers = await adminDb.collection('questions').doc(q.id).collection('answers').get()
        for (const a of answers.docs) {
          await adminDb.collection('questions_backup').doc(backupRef.id).collection('answers').add(a.data())
        }
      }

      return NextResponse.json({ 
        success: true,
        message: `Backed up ${questions.size} questions` 
      })
    }

    if (action === 'restore') {
      // Restore questions from backup (optionally limit count for testing)
      const backup = await adminDb.collection('questions_backup').get()
      
      if (backup.empty) {
        return NextResponse.json({ error: 'No backup found' }, { status: 404 })
      }

      // Clear current questions
      const currentQuestions = await adminDb.collection('questions').get()
      for (const doc of currentQuestions.docs) {
        // Delete answers subcollection first
        const answers = await adminDb.collection('questions').doc(doc.id).collection('answers').get()
        for (const a of answers.docs) {
          await a.ref.delete()
        }
        await doc.ref.delete()
      }

      // Restore from backup (limit if count specified)
      const questionsToRestore = count ? backup.docs.slice(0, count) : backup.docs
      
      for (const q of questionsToRestore) {
        const questionData = q.data()
        const { original_id, backed_up_at, ...cleanData } = questionData
        
        const newRef = await adminDb.collection('questions').add({
          ...cleanData,
          is_active: false,
          is_complete: false
        })

        // Restore answers subcollection
        const answers = await adminDb.collection('questions_backup').doc(q.id).collection('answers').get()
        for (const a of answers.docs) {
          await adminDb.collection('questions').doc(newRef.id).collection('answers').add({
            ...a.data(),
            is_revealed: false
          })
        }
      }

      return NextResponse.json({ 
        success: true,
        message: `Restored ${questionsToRestore.length} questions from backup` 
      })
    }

    if (action === 'restore-selected') {
      // Restore specific questions by ID (don't clear existing)
      if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return NextResponse.json({ error: 'No question IDs provided' }, { status: 400 })
      }

      let restoredCount = 0

      for (const backupId of questionIds) {
        const backupDoc = await adminDb.collection('questions_backup').doc(backupId).get()
        
        if (!backupDoc.exists) continue

        const questionData = backupDoc.data()!
        const { original_id, backed_up_at, ...cleanData } = questionData
        
        const newRef = await adminDb.collection('questions').add({
          ...cleanData,
          is_active: false,
          is_complete: false
        })

        // Restore answers subcollection
        const answers = await adminDb.collection('questions_backup').doc(backupId).collection('answers').get()
        for (const a of answers.docs) {
          await adminDb.collection('questions').doc(newRef.id).collection('answers').add({
            ...a.data(),
            is_revealed: false
          })
        }

        restoredCount++
      }

      return NextResponse.json({ 
        success: true,
        message: `Added ${restoredCount} questions from backup` 
      })
    }

    if (action === 'load-test') {
      // Load just 3 questions for quick testing
      const backup = await adminDb.collection('questions_backup').get()
      
      if (backup.empty) {
        return NextResponse.json({ error: 'No backup found. Backup questions first.' }, { status: 404 })
      }

      // Clear current questions
      const currentQuestions = await adminDb.collection('questions').get()
      for (const doc of currentQuestions.docs) {
        const answers = await adminDb.collection('questions').doc(doc.id).collection('answers').get()
        for (const a of answers.docs) {
          await a.ref.delete()
        }
        await doc.ref.delete()
      }

      // Load first 3 questions
      const testQuestions = backup.docs.slice(0, 3)
      
      for (const q of testQuestions) {
        const questionData = q.data()
        const { original_id, backed_up_at, ...cleanData } = questionData
        
        const newRef = await adminDb.collection('questions').add({
          ...cleanData,
          is_active: false,
          is_complete: false
        })

        const answers = await adminDb.collection('questions_backup').doc(q.id).collection('answers').get()
        for (const a of answers.docs) {
          await adminDb.collection('questions').doc(newRef.id).collection('answers').add({
            ...a.data(),
            is_revealed: false
          })
        }
      }

      return NextResponse.json({ 
        success: true,
        message: `Loaded 3 test questions (${testQuestions.length} total)` 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
