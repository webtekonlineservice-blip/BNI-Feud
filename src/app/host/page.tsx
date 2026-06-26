'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

interface Answer { id: string; answer_text: string; points: number; display_order: number; is_revealed: boolean }
interface Question { id: string; member_id: string; question_text: string; is_active: boolean; is_complete: boolean; members: any; question_answers: Answer[] }
interface Player { id: string; display_name: string; total_score: number }
interface Response { id: string; raw_answer: string; matched_answer: string | null; points_earned: number; display_name?: string }

type GamePhase = 'lobby' | 'playing' | 'leaderboard'

export default function HostPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('lobby')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<{ id: string; type: 'match' | 'miss'; name: string; answer: string; matched?: string; points?: number; x: number; y: number }[]>([])

  const loadQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : [])
    } catch {}
  }, [])

  const loadPlayers = useCallback(async () => {
    try {
      const res = await fetch('/api/players')
      const data = await res.json()
      setPlayers(Array.isArray(data) ? data : [])
    } catch {}
  }, [])

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadQuestions(), loadPlayers()])
      setLoading(false)
    }
    init()
  }, [loadQuestions, loadPlayers])

  const currentQuestion = questions[currentIndex]

  // Real-time listeners when playing
  useEffect(() => {
    if (!currentQuestion?.id || phase !== 'playing') return

    const unsubAnswers = onSnapshot(
      query(collection(db, 'questions', currentQuestion.id, 'answers'), orderBy('display_order')),
      (snap) => setAnswers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Answer)))
    )

    const unsubResponses = onSnapshot(
      collection(db, 'responses'),
      (snap) => {
        const filtered = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter((r: any) => r.question_id === currentQuestion.id)
        filtered.sort((a: any, b: any) => (b.received_at || '').localeCompare(a.received_at || ''))
        
        if (filtered.length > responses.length && filtered.length > 0) {
          const newest = filtered[0]
          const id = Date.now().toString() + Math.random()
          const x = 15 + Math.random() * 55
          const y = 15 + Math.random() * 45
          if (newest.matched_answer) {
            setNotifications(prev => [...prev, { id, type: 'match', name: newest.display_name, answer: newest.raw_answer, matched: newest.matched_answer, points: newest.points_earned, x, y }])
            try { new Audio('/sounds/Correct.wav').play() } catch {}
          } else {
            setNotifications(prev => [...prev, { id, type: 'miss', name: newest.display_name, answer: newest.raw_answer, x, y }])
            try { new Audio('/sounds/Wrong.wav').play() } catch {}
          }
          setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 2000)
        }
        
        setResponses(filtered)
      }
    )

    const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Player))
      all.sort((a, b) => b.total_score - a.total_score)
      setPlayers(all)
    })

    return () => { unsubAnswers(); unsubResponses(); unsubPlayers() }
  }, [currentQuestion?.id, phase])

  const startGame = async () => {
    if (!questions.length) return
    setCurrentIndex(0)
    setResponses([])
    isFirstLoad.current = true
    responseCountRef.current = 0
    setPhase('playing')
    await fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questions[0].id, action: 'activate' }),
    })
  }

  const nextQuestion = async () => {
    await fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: currentQuestion.id, action: 'complete' }),
    })

    const nextIdx = currentIndex + 1
    if (nextIdx >= questions.length) {
      setPhase('leaderboard')
      loadPlayers()
      // Send congrats text to the winner
      fetch('/api/admin/congrats', { method: 'POST' }).catch(() => {})
      return
    }

    setCurrentIndex(nextIdx)
    setResponses([])
    await fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questions[nextIdx].id, action: 'activate' }),
    })
  }

  const prevQuestion = async () => {
    if (currentIndex === 0) return
    const prevIdx = currentIndex - 1
    setCurrentIndex(prevIdx)
    setResponses([])
    await fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questions[prevIdx].id, action: 'activate' }),
    })
  }

  const revealAnswer = async (answerId: string) => {
    await fetch('/api/answers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: currentQuestion.id, answer_id: answerId, action: 'reveal' }),
    })
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-bni-red text-xl animate-pulse">Loading game...</p>
    </div>
  )

  // ── LOBBY ─────────────────────────────────────────────────────────────────
  if (phase === 'lobby') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black mb-2"><span className="text-bni-red">BNI</span> Family Feud</h1>
      <p className="text-gray-500 mb-8">{questions.length} questions ready · {players.length} players registered</p>
      <button
        onClick={startGame}
        disabled={!questions.length}
        className="bg-bni-red hover:bg-bni-red-dark text-white font-bold text-xl px-10 py-4 rounded-xl transition disabled:opacity-50"
      >
        Start Game
      </button>
      {players.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Players:</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {players.map(p => (
              <span key={p.id} className="bg-gray-100 border border-gray-200 text-sm px-3 py-1 rounded-full">{p.display_name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // ── LEADERBOARD ───────────────────────────────────────────────────────────
  if (phase === 'leaderboard') return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Winner announcement */}
      {players.length > 0 && (
        <div className="text-center mb-6 animate-pulse">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="text-3xl font-black text-bni-red mb-1">CONGRATULATIONS!</h1>
          <p className="text-2xl font-bold text-black">{players[0]?.display_name}</p>
          <p className="text-lg text-gray-500">wins with <span className="text-bni-red font-black">{players[0]?.total_score}</span> points!</p>
          <p className="text-bni-red font-medium mt-2">🍽 Lunch is on Patrick!</p>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="w-full max-w-lg space-y-2">
        {players.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-4 rounded-xl p-4 border-2 transition-all ${
            i === 0 ? 'border-bni-red bg-red-50 scale-105 shadow-lg' 
            : i === 1 ? 'border-gray-300 bg-gray-50' 
            : i === 2 ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-100'
          }`}>
            <div className="text-2xl w-8 text-center">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-400 font-bold">{i + 1}</span>}
            </div>
            <div className="flex-1">
              <div className={`font-bold ${i === 0 ? 'text-lg' : ''}`}>{p.display_name}</div>
              {i === 0 && <div className="text-bni-red text-xs font-medium">WINNER</div>}
            </div>
            <div className={`font-black ${i === 0 ? 'text-3xl text-bni-red' : 'text-xl text-black'}`}>{p.total_score}</div>
          </div>
        ))}
      </div>

      {/* Play again */}
      <button onClick={() => setPhase('lobby')} className="mt-8 bg-bni-red hover:bg-bni-red-dark text-white font-bold px-8 py-3 rounded-xl transition">
        Play Again
      </button>
    </div>
  )

  // ── PLAYING ───────────────────────────────────────────────────────────────
  const revealed = answers.filter(a => a.is_revealed).length
  const totalAnswers = answers.length

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
          <p className="text-black font-bold">{currentQuestion?.members?.name} <span className="text-gray-500 font-normal">— {currentQuestion?.members?.role}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Revealed</p>
          <p className="text-xl font-black text-bni-red">{revealed}/{totalAnswers}</p>
        </div>
      </div>

      {/* Scrolling leaderboard ticker */}
      {players.length > 0 && (
        <div className="overflow-hidden mb-3 bg-gray-50 border border-gray-200 rounded-lg py-2">
          <div className="animate-scroll flex whitespace-nowrap gap-8 px-4">
            {players.slice(0, 3).map((p, i) => (
              <span key={p.id} className="inline-flex items-center gap-2 text-sm font-medium">
                <span className={`font-black ${i === 0 ? 'text-bni-red' : 'text-gray-500'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </span>
                <span className="text-black">{p.display_name}</span>
                <span className="text-bni-red font-bold">{p.total_score} pts</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {players.slice(0, 3).map((p, i) => (
              <span key={`dup-${p.id}`} className="inline-flex items-center gap-2 text-sm font-medium">
                <span className={`font-black ${i === 0 ? 'text-bni-red' : 'text-gray-500'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </span>
                <span className="text-black">{p.display_name}</span>
                <span className="text-bni-red font-bold">{p.total_score} pts</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Question */}
      <div className="bg-bni-red rounded-xl p-5 mb-4 text-center">
        <p className="text-white text-xl font-medium">{currentQuestion?.question_text}</p>
      </div>

      {/* Answer Board */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {answers.map(ans => (
          <button
            key={ans.id}
            onClick={() => revealAnswer(ans.id)}
            className={`rounded-lg p-3 text-left transition-all border-2 ${
              ans.is_revealed
                ? 'bg-green-50 border-green-400'
                : 'bg-gray-50 border-gray-200 hover:border-bni-red cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">#{ans.display_order}</span>
              <span className="text-xs font-bold text-bni-red">{ans.points} pts</span>
            </div>
            <div className={`font-medium mt-1 ${ans.is_revealed ? 'text-black' : 'text-transparent bg-gray-200 rounded select-none'}`}>
              {ans.is_revealed ? ans.answer_text : '████████'}
            </div>
          </button>
        ))}
      </div>

      {/* Response count */}
      <div className="text-center text-sm text-gray-400 mb-16">
        {responses.length} answers submitted
      </div>

      {/* Fixed bottom corners: Prev / Next */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between bg-white border-t border-gray-200">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black font-bold rounded-xl transition disabled:opacity-30"
        >
          ← Previous
        </button>
        <button
          onClick={nextQuestion}
          className="px-6 py-3 bg-bni-red hover:bg-bni-red-dark text-white font-bold rounded-xl transition"
        >
          {currentIndex + 1 >= questions.length ? 'Leaderboard →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
