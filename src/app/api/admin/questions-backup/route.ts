import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export const dynamic = 'force-dynamic'

// POST /api/admin/questions-backup - Backup or restore questions
export async function POST(req: NextRequest) {
  try {
    const { action, count } = await req.json()

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
