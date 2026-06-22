'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import Image from 'next/image'

interface Answer { id: string; answer_text: string; points: number; display_order: number; is_revealed: boolean }
interface ActiveQuestion { id: string; question_text: string; member_name: string; member_role: string }
interface Player { display_name: string; total_score: number }

type BoardView = 'game' | 'leaderboard' | 'registration'

export default function BoardPage() {
  const [view, setView] = useState<BoardView>('registration')
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [strikes, setStrikes] = useState(0)
  const [players, setPlayers] = useState<Player[]>([])
  const [playerCount, setPlayerCount] = useState(0)
  const [roundPoints, setRoundPoints] = useState(0)
  const twilioPhone = process.env.NEXT_PUBLIC_TWILIO_PHONE || '+16366892103'

  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
      const allPlayers = snap.docs.map(d => d.data() as Player)
      allPlayers.sort((a, b) => b.total_score - a.total_score)
      setPlayers(allPlayers.slice(0, 10))
      setPlayerCount(snap.size)
    })

    const unsubGameState = onSnapshot(doc(db, 'game_state', 'current'), (snap) => {
      const data = snap.data()
      if (!data) return

      setStrikes(data.strikes || 0)

      if (data.game_phase === 'playing' && data.active_question_id) {
        setActiveQuestion({
          id: data.active_question_id,
          question_text: data.question_text || '',
          member_name: data.member_name || '',
          member_role: data.member_role || '',
        })
        setView('game')
      } else if (data.game_phase === 'leaderboard') {
        setView('leaderboard')
        setActiveQuestion(null)
        setAnswers([])
      } else {
        setView('registration')
        setActiveQuestion(null)
        setAnswers([])
      }
    })

    return () => { unsubPlayers(); unsubGameState() }
  }, [])

  useEffect(() => {
    if (!activeQuestion?.id) { setAnswers([]); setRoundPoints(0); return }

    const unsubAnswers = onSnapshot(
      query(collection(db, 'questions', activeQuestion.id, 'answers'), orderBy('display_order')),
      (snap) => {
        const ans = snap.docs.map(d => ({ id: d.id, ...d.data() } as Answer))
        setAnswers(ans)
        setRoundPoints(ans.filter(a => a.is_revealed).reduce((sum, a) => sum + a.points, 0))
      }
    )
    return () => unsubAnswers()
  }, [activeQuestion?.id])

  // ── Registration screen ──────────────────────────────────────────────────
  if (view === 'registration') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black mb-2">
          <span className="text-bni-red">BNI</span> Family Feud
        </h1>
        <p className="text-gray-500 text-xl">Scan to join the game!</p>
      </div>

      <div className="mb-6">
        <Image
          src="/img/TB-QR.png"
          alt="Scan to register"
          width={280}
          height={280}
          className="rounded-xl shadow-lg"
          priority
        />
      </div>

      <div className="text-center mb-8">
        <p className="text-gray-500 text-sm">Scan the QR code to register</p>
      </div>

      <div className="text-center">
        <div className="text-5xl font-black text-bni-red">{playerCount}</div>
        <div className="text-gray-500 text-lg mt-1">players ready</div>
        {players.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-xl">
            {players.map((p, i) => (
              <span key={i} className="bg-gray-100 text-black text-sm px-3 py-1 rounded-full border border-gray-200">{p.display_name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── Game board ────────────────────────────────────────────────────────────
  if (view === 'game') return (
    <div className="min-h-[calc(100vh-4rem)] p-6 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-gray-500 text-sm uppercase tracking-wide">Question about</div>
          <div className="text-bni-red text-2xl font-bold">{activeQuestion?.member_name}</div>
          <div className="text-gray-500 text-sm">{activeQuestion?.member_role}</div>
        </div>
        <div className="text-right">
          <div className="text-gray-500 text-sm">Round points</div>
          <div className="text-4xl font-black text-bni-red">{roundPoints}</div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-bni-red rounded-2xl p-6 mb-6 text-center">
        <p className="text-white text-2xl font-medium leading-relaxed">{activeQuestion?.question_text}</p>
      </div>

      {/* Answer board */}
      <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
        {answers.map(ans => (
          <div
            key={ans.id}
            className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 border-2 ${
              ans.is_revealed
                ? 'bg-white border-green-500'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            <div className="text-gray-400 text-sm">#{ans.display_order}</div>
            <div className={`text-xl font-bold ${ans.is_revealed ? 'text-black' : 'text-transparent select-none bg-gray-200 rounded'}`}>
              {ans.is_revealed ? ans.answer_text : '████████████'}
            </div>
            {ans.is_revealed && <div className="text-bni-red text-lg font-bold">{ans.points} pts</div>}
          </div>
        ))}
      </div>

      {/* Strikes */}
      <div className="flex items-center justify-center gap-8">
        {[1,2,3].map(i => (
          <span key={i} className={`text-6xl font-bold transition-all ${i <= strikes ? 'text-bni-red scale-110' : 'text-gray-200'}`}>✗</span>
        ))}
      </div>
    </div>
  )

  // ── Leaderboard ───────────────────────────────────────────────────────────
  if (view === 'leaderboard') return (
    <div className="min-h-[calc(100vh-4rem)] p-8 flex flex-col">
      <h1 className="text-4xl font-black text-center mb-10">
        <span className="text-bni-red">LEADERBOARD</span>
      </h1>
      <div className="max-w-2xl mx-auto w-full space-y-3">
        {players.map((p, i) => (
          <div key={i} className={`flex items-center gap-4 rounded-xl p-4 border-2 ${i === 0 ? 'border-bni-red bg-red-50' : 'border-gray-200'}`}>
            <div className="text-3xl font-bold text-gray-400 w-10">{i + 1}</div>
            <div className="flex-1">
              <div className="text-lg font-bold">{p.display_name}</div>
              {i === 0 && <div className="text-bni-red text-sm font-medium">Wins lunch!</div>}
            </div>
            <div className={`text-2xl font-black ${i === 0 ? 'text-bni-red' : 'text-black'}`}>{p.total_score}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return null
}
