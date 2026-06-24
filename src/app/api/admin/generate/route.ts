import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST() {
  try {
    const deepseek = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' })

    const existingQuestions = await adminDb.collection('questions').get()
    for (const qDoc of existingQuestions.docs) {
      const answers = await adminDb.collection('questions').doc(qDoc.id).collection('answers').get()
      for (const a of answers.docs) await a.ref.delete()
      await qDoc.ref.delete()
    }

    const membersSnap = await adminDb.collection('members').orderBy('display_order').get()
    if (membersSnap.empty) return NextResponse.json({ error: 'No members found' }, { status: 400 })

    let generated = 0
    let order = 1

    for (const memberDoc of membersSnap.docs) {
      const member = memberDoc.data()
      const prompt = `You are the host of a Family Feud game for a BNI chapter "Think Big St. Louis" — 13 professionals.
Generate ONE funny roast-friendly survey question about:
- Name: ${member.name} | Role: ${member.role} | Company: ${member.company} | Facts: ${member.fun_facts}
Start with "We surveyed 100 people..." — funny but warm. 6 answers totaling 100 points.
Return ONLY JSON: {"question_text":"...","answers":[{"text":"...","points":35},{"text":"...","points":25},{"text":"...","points":18},{"text":"...","points":12},{"text":"...","points":7},{"text":"...","points":3}]}`

      try {
        const response = await deepseek.chat.completions.create({ model: 'deepseek-chat', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
        const text = (response.choices[0]?.message?.content ?? '').replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(text)
        const questionRef = await adminDb.collection('questions').add({ member_id: memberDoc.id, question_text: parsed.question_text, is_active: false, is_complete: false, display_order: order, created_at: new Date().toISOString() })
        for (let i = 0; i < parsed.answers.length; i++) {
          await adminDb.collection('questions').doc(questionRef.id).collection('answers').add({ answer_text: parsed.answers[i].text, points: parsed.answers[i].points, display_order: i + 1, is_revealed: false })
        }
        generated++
      } catch {}
      order++
      await new Promise(r => setTimeout(r, 1500))
    }

    return NextResponse.json({ message: `Generated ${generated}/${membersSnap.size} questions` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
