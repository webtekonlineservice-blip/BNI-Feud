/**
 * scripts/generate-questions.ts
 * Run ONCE before your meeting: npx ts-node --project tsconfig.scripts.json scripts/generate-questions.ts
 *
 * Loops through all 13 Think Big members, calls DeepSeek API for each,
 * generates a funny personalized Family Feud question + 6 answers,
 * saves everything to Firestore.
 */

import OpenAI from 'openai'
import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Init DeepSeek
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// Init Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}
const db = admin.firestore()

interface GeneratedQuestion {
  question_text: string
  answers: { text: string; points: number }[]
}

async function generateForMember(
  name: string,
  role: string,
  company: string,
  funFacts: string
): Promise<GeneratedQuestion> {
  const prompt = `You are the host of a Family Feud game for a BNI (Business Networking) chapter called "Think Big St. Louis" — 13 professionals who meet weekly.

Generate ONE funny, roast-friendly survey question specifically about this person:
- Name: ${name}
- Role: ${role}
- Company: ${company}
- Fun facts: ${funFacts}

The question should:
- Start with "We surveyed 100 people..." or "Name something..."
- Be specifically about their profession or known personality traits
- Be funny and slightly roast-y but warm and friendly
- Make the whole room laugh because they KNOW this person

Then provide exactly 6 answers that were "surveyed", ranked by how many people said them.
Points must add up to exactly 100.

Return ONLY valid JSON, no markdown, no explanation:
{
  "question_text": "We surveyed 100 people: Name something...",
  "answers": [
    {"text": "answer 1", "points": 35},
    {"text": "answer 2", "points": 25},
    {"text": "answer 3", "points": 18},
    {"text": "answer 4", "points": 12},
    {"text": "answer 5", "points": 7},
    {"text": "answer 6", "points": 3}
  ]
}`

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (response.choices[0]?.message?.content ?? '')
    .replace(/```json|```/g, '')
    .trim()

  return JSON.parse(text)
}

async function main() {
  console.log('🎮 BNI Family Feud — Question Generator (DeepSeek)\n')

  // Clear existing questions
  const existingQuestions = await db.collection('questions').get()
  if (!existingQuestions.empty) {
    console.log(`  Clearing ${existingQuestions.size} existing questions...`)
    for (const qDoc of existingQuestions.docs) {
      // Delete answers subcollection first
      const answers = await db.collection('questions').doc(qDoc.id).collection('answers').get()
      for (const aDoc of answers.docs) {
        await aDoc.ref.delete()
      }
      await qDoc.ref.delete()
    }
  }

  // Fetch all members
  const membersSnap = await db.collection('members').orderBy('display_order').get()

  if (membersSnap.empty) {
    console.error('❌ No members found. Run the seed script first.')
    process.exit(1)
  }

  console.log(`  Found ${membersSnap.size} members. Generating questions...\n`)

  let order = 1
  for (const memberDoc of membersSnap.docs) {
    const member = memberDoc.data()
    process.stdout.write(`  ${order}. ${member.name} (${member.role})... `)

    try {
      const generated = await generateForMember(
        member.name,
        member.role,
        member.company,
        member.fun_facts
      )

      // Create question document
      const questionRef = await db.collection('questions').add({
        member_id: memberDoc.id,
        question_text: generated.question_text,
        is_active: false,
        is_complete: false,
        display_order: order,
        created_at: new Date().toISOString(),
      })

      // Add 6 answers as subcollection
      for (let i = 0; i < generated.answers.length; i++) {
        await db.collection('questions').doc(questionRef.id).collection('answers').add({
          answer_text: generated.answers[i].text,
          points: generated.answers[i].points,
          display_order: i + 1,
          is_revealed: false,
        })
      }

      console.log(`✅ "${generated.question_text.slice(0, 55)}..."`)
    } catch (err) {
      console.log(`❌ Failed — ${err}`)
    }

    order++
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1500))
  }

  console.log('\n✨ All questions generated!')
  console.log('   Review them in Firebase Console or test on /host')
  console.log('   You can edit question_text or answers directly in Firestore.\n')
  process.exit(0)
}

main().catch(err => { console.error('❌', err); process.exit(1) })
