'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

type Screen = 'register' | 'waiting' | 'answer' | 'submitted' | 'results'

interface ActiveQuestion {
  id: string
  question_text: string
  member_name: string
}

export default function PlayPage() {
  const [screen, setScreen] = useState<Screen>('register')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [answer, setAnswer] = useState('')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [playerScore, setPlayerScore] = useState(0)
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null)
  const [lastResult, setLastResult] = useState<{ matched: boolean; points: number; answer: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'game_state', 'current'), (snap) => {
      const data = snap.data()
      if (!data) return

      if (data.game_phase === 'playing' && data.active_question_id) {
        setActiveQuestion({
          id: data.active_question_id,
          question_text: data.question_text || '',
          member_name: data.member_name || '',
        })
        if (playerId) setScreen('answer')
      } else {
        setActiveQuestion(null)
        if (playerId) setScreen('waiting')
      }
    })

    return () => unsubscribe()
  }, [playerId])

  const register = async () => {
    setError('')
    if (!name.trim()) { setError('Enter your name'); return }
    if (!phone.trim()) { setError('Enter your phone number'); return }

    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name.trim(), phone_number: phone.trim() }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); return }

    setPlayerId(data.id)
    setPlayerName(data.display_name)
    setPlayerScore(data.total_score || 0)
    setScreen(activeQuestion ? 'answer' : 'waiting')
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !playerId || !activeQuestion) return
    setSubmitting(true)

    const res = await fetch('/api/players/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_id: playerId,
        question_id: activeQuestion.id,
        raw_answer: answer.trim(),
      }),
    })
    const data = await res.json()
    setLastResult(data)
    if (data.points > 0) setPlayerScore(s => s + data.points)
    setAnswer('')
    setScreen('submitted')
    setSubmitting(false)
  }

  // ── Register ──────────────────────────────────────────────────────────────
  if (screen === 'register') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black"><span className="text-bni-red">BNI</span> Family Feud</h1>
          <p className="text-gray-500 mt-2">Register to play — lunch is on the line!</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-600 text-sm block mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="First name or full name"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-bni-red"
            />
          </div>
          <div>
            <label className="text-gray-600 text-sm block mb-1">Your phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(314) 555-1234"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-bni-red"
            />
          </div>

          {error && <p className="text-bni-red text-sm">{error}</p>}

          <button
            onClick={register}
            className="w-full bg-bni-red hover:bg-bni-red-dark text-white font-bold py-4 rounded-xl text-lg transition"
          >
            Join the Game
          </button>
        </div>
      </div>
    </div>
  )

  // ── Waiting ───────────────────────────────────────────────────────────────
  if (screen === 'waiting') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h2 className="text-2xl font-bold mb-2">You&apos;re in, {playerName}!</h2>
      <p className="text-gray-500 mb-6">Watch the big screen for questions.</p>

      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 w-full max-w-sm mb-6">
        <p className="text-sm text-gray-500 uppercase font-medium mb-2">To answer, text to:</p>
        <a href={`sms:${process.env.NEXT_PUBLIC_TWILIO_PHONE || '+16366892103'}`} className="text-bni-red text-3xl font-black block mb-2">
          {process.env.NEXT_PUBLIC_TWILIO_PHONE || '+16366892103'}
        </a>
        <p className="text-gray-400 text-xs">Just text your answer when a question is open</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-3">
        <span className="text-gray-500 text-sm">Your score: </span>
        <span className="text-bni-red font-bold text-xl">{playerScore} pts</span>
      </div>
    </div>
  )

  // ── Answer ────────────────────────────────────────────────────────────────
  if (screen === 'answer') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-6">
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Question about</div>
        <div className="text-bni-red font-bold text-lg">{activeQuestion?.member_name}</div>
      </div>

      <div className="bg-bni-red rounded-2xl p-5 mb-6 flex-1 flex items-center justify-center">
        <p className="text-white text-xl font-medium text-center leading-relaxed">
          {activeQuestion?.question_text}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitAnswer()}
          placeholder="Type your answer..."
          autoFocus
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-black text-lg placeholder-gray-400 focus:outline-none focus:border-bni-red"
        />
        <button
          onClick={submitAnswer}
          disabled={submitting || !answer.trim()}
          className="w-full bg-bni-red disabled:opacity-50 hover:bg-bni-red-dark text-white font-bold py-4 rounded-xl text-lg transition"
        >
          {submitting ? 'Sending...' : 'Submit Answer'}
        </button>
        <p className="text-gray-400 text-xs text-center">Score: {playerScore} pts</p>
      </div>
    </div>
  )

  // ── Submitted ─────────────────────────────────────────────────────────────
  if (screen === 'submitted') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
      {lastResult?.matched ? (
        <>
          <div className="text-6xl mb-4">🔥</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">Match!</h2>
          <p className="text-gray-600 mb-2">&quot;{lastResult.answer}&quot;</p>
          <p className="text-bni-red text-4xl font-black mb-1">+{lastResult.points}</p>
          <p className="text-gray-500 text-sm mb-6">Total: {playerScore} pts</p>
        </>
      ) : (
        <>
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold text-bni-red mb-2">Not on the board!</h2>
          <p className="text-gray-500 mb-6">Nice try — watch for the next question</p>
        </>
      )}
      <button onClick={() => setScreen('waiting')} className="bg-gray-100 border border-gray-200 text-black px-8 py-3 rounded-xl hover:bg-gray-200 transition">
        Back to waiting room
      </button>
    </div>
  )

  return null
}
