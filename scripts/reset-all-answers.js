const admin = require('firebase-admin')
const serviceAccount = require('../firebase-service-account.json')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()

async function resetAllAnswers() {
  console.log('🔄 Resetting all answers to unrevealed...')
  
  const questions = await db.collection('questions').get()
  
  let totalAnswers = 0
  for (const q of questions.docs) {
    const answers = await db.collection('questions').doc(q.id).collection('answers').get()
    
    for (const a of answers.docs) {
      await a.ref.update({ is_revealed: false })
      totalAnswers++
    }
  }
  
  console.log(`✅ Reset ${totalAnswers} answers across ${questions.size} questions`)
  process.exit(0)
}

resetAllAnswers().catch(console.error)
