import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { adminDb } from '@/lib/firebaseAdmin'
import { matchAnswer } from '@/lib/matchAnswer'

export const dynamic = 'force-dynamic'

const MessagingResponse = twilio.twiml.MessagingResponse

/**
 * POST /api/twilio
 * Twilio sends every inbound SMS here.
 * Handles: player registration, answer submission, help messages.
 */
export async function POST(req: NextRequest) {
  const body = await req.formData()
  const from: string = (body.get('From') as string) || ''
  const rawMessage: string = ((body.get('Body') as string) || '').trim()
  const message = rawMessage.toLowerCase()

  const twiml = new MessagingResponse()

  // ── 1. Look up player by phone number ───────────────────────────────────
  const playerSnap = await adminDb
    .collection('players')
    .where('phone_number', '==', from)
    .limit(1)
    .get()

  const player = playerSnap.empty ? null : { id: playerSnap.docs[0].id, ...playerSnap.docs[0].data() } as any

  // ── 2. HELP command ──────────────────────────────────────────────────────
  if (message === 'help' || message === '?') {
    twiml.message(
      player
        ? `B&I Feud — Hi ${player.display_name}! Your score: ${player.total_score} pts. Just text your answer when a question is open. Text SCORE to see leaderboard.`
        : `B&I Feud — Text your first name to register and join the game!`
    )
    return twimlResponse(twiml)
  }

  // ── 3. SCORE command ─────────────────────────────────────────────────────
  if (message === 'score' || message === 'scores') {
    const topSnap = await adminDb
      .collection('players')
      .orderBy('total_score', 'desc')
      .limit(5)
      .get()

    const board = topSnap.docs
      .map((doc, i) => {
        const p = doc.data()
        return `${i + 1}. ${p.display_name} — ${p.total_score} pts`
      })
      .join('\n') || 'No scores yet'

    twiml.message(`🏆 Top 5:\n${board}`)
    return twimlResponse(twiml)
  }

  // ── 4. REGISTRATION — new player ─────────────────────────────────────────
  if (!player) {
    const displayName = rawMessage.slice(0, 30)

    try {
      const newPlayer = {
        phone_number: from,
        display_name: displayName,
        total_score: 0,
        registered_at: new Date().toISOString(),
        is_host: false,
      }
      await adminDb.collection('players').add(newPlayer)

      twiml.message(
        `Welcome ${displayName}! 🎉 You're in BNI Family Feud!\n\nHOW TO PLAY:\n1. Watch the big screen for each question\n2. Text your answer to this number\n3. If it matches the board, you score points!\n\nYou get ONE guess per round. Top scorer wins lunch! 🏆\n\nText HELP anytime for info.\nText SCORE to see leaderboard.`
      )
    } catch {
      twiml.message('Something went wrong registering you. Try again!')
    }
    return twimlResponse(twiml)
  }

  // ── 5. Update name if they text "NAME: ..." ──────────────────────────────
  if (message.startsWith('name:')) {
    const newName = rawMessage.slice(5).trim().slice(0, 30)
    await adminDb.collection('players').doc(player.id).update({ display_name: newName })
    twiml.message(`Got it — your name is now ${newName}!`)
    return twimlResponse(twiml)
  }

  // ── 6. ANSWER — check if a question is active ────────────────────────────
  const gameStateDoc = await adminDb.collection('game_state').doc('current').get()
  const gameState = gameStateDoc.data()

  if (!gameState?.active_question_id || gameState.game_phase !== 'playing') {
    twiml.message(`Hey ${player.display_name}! No question is open right now. Watch the screen! 👀`)
    return twimlResponse(twiml)
  }

  const questionId = gameState.active_question_id

  // ── 7. Check if player already answered this round ───────────────────────
  const existingSnap = await adminDb
    .collection('responses')
    .where('player_id', '==', player.id)
    .where('question_id', '==', questionId)
    .limit(1)
    .get()

  if (!existingSnap.empty) {
    twiml.message(`${player.display_name}, you already answered this round! Wait for the next question. 😄`)
    return twimlResponse(twiml)
  }

  // ── 8. Load board answers and fuzzy match ────────────────────────────────
  const answersSnap = await adminDb
    .collection('questions')
    .doc(questionId)
    .collection('answers')
    .orderBy('display_order')
    .get()

  const boardAnswers = answersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

  const matched = matchAnswer(rawMessage, boardAnswers)

  // ── 9. Save the response ─────────────────────────────────────────────────
  await adminDb.collection('responses').add({
    player_id: player.id,
    question_id: questionId,
    raw_answer: rawMessage,
    matched_answer: matched?.answer_text || null,
    points_earned: matched?.points || 0,
    display_name: player.display_name,
    received_at: new Date().toISOString(),
  })

  // ── 10. If matched, reveal the answer on the board + update score ─────────
  if (matched) {
    await adminDb
      .collection('questions')
      .doc(questionId)
      .collection('answers')
      .doc(matched.id)
      .update({ is_revealed: true })

    const newScore = player.total_score + matched.points
    await adminDb.collection('players').doc(player.id).update({ total_score: newScore })

    twiml.message(
      `🔥 MATCH! "${matched.answer_text}" — #${matched.display_order} answer!\n+${matched.points} pts\nYour total: ${newScore} pts`
    )
  } else {
    twiml.message(
      `❌ "${rawMessage}" is not on the board, ${player.display_name}!\nKeep going — next question coming up!`
    )
  }

  return twimlResponse(twiml)
}

function twimlResponse(twiml: twilio.twiml.MessagingResponse) {
  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
