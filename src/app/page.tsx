'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { db } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

interface Answer { id: string; answer_text: string; points: number; display_order: number; is_revealed: boolean }
interface Question { id: string; question_text: string; members: any; question_answers: Answer[] }
interface Player { id: string; display_name: string; total_score: number }
interface Response { id: string; raw_answer: string; matched_answer: string | null; points_earned: number; display_name?: string }
interface Slide { id: string; url: string; order: number }

export default function PresentationPage() {
  // Slide state
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  // Game state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string; type: 'match' | 'miss'; name: string; answer: string; matched?: string; points?: number; x: number; y: number }[]>([])
  const playedIds = useRef(new Set<string>())
  const firstSnapshot = useRef(true)

  const currentQuestion = questions[currentIndex]

  // Load questions
  const loadQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(Array.isArray(data) ? data : [])
    } catch {}
  }, [])

  useEffect(() => { loadQuestions() }, [loadQuestions])

  // Load slides from Supabase
  useEffect(() => {
    supabase.from('slides').select('*').order('order', { ascending: true }).then(({ data }) => {
      if (data) setSlides(data)
    })
  }, [])

  // Real-time listeners when game is active
  useEffect(() => {
    if (!currentQuestion?.id || !gameActive) return

    firstSnapshot.current = true

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

        if (firstSnapshot.current) {
          filtered.forEach((r: any) => playedIds.current.add(r.id))
          firstSnapshot.current = false
        } else {
          for (const r of filtered) {
            if (!playedIds.current.has(r.id)) {
              playedIds.current.add(r.id)
              const nid = Date.now().toString() + Math.random()
              const x = 10 + Math.random() * 70
              const y = 10 + Math.random() * 50
              if (r.matched_answer) {
                setNotifications(prev => [...prev, { id: nid, type: 'match', name: r.display_name, answer: r.raw_answer, matched: r.matched_answer, points: r.points_earned, x, y }])
                try { new Audio('/sounds/Correct.wav').play() } catch {}
              } else {
                setNotifications(prev => [...prev, { id: nid, type: 'miss', name: r.display_name, answer: r.raw_answer, x, y }])
                try { new Audio('/sounds/Wrong.wav').play() } catch {}
              }
              setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== nid)), 2500)
            }
          }
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
  }, [currentQuestion?.id, gameActive])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentSlide(s => Math.min(s + 1, slides.length - 1))
      if (e.key === 'ArrowLeft') setCurrentSlide(s => Math.max(s - 1, 0))
      if (e.key === 'g' || e.key === 'G') setDrawerOpen(prev => !prev)
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Game controls
  const startGame = async () => {
    if (!questions.length) return
    setCurrentIndex(0)
    setGameActive(true)
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
      setGameActive(false)
      return
    }
    setCurrentIndex(nextIdx)
    setResponses([])
    firstSnapshot.current = true
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
    firstSnapshot.current = true
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

  const revealed = answers.filter(a => a.is_revealed).length

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden select-none fixed inset-0 z-0">
      {/* Slide viewer — full viewport */}
      <div className="w-full h-full flex items-center justify-center bg-black">
        <img
          src={slides[currentSlide]?.url || ''}
          alt={`Slide ${currentSlide + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Slide counter */}
      <div className="fixed top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Slide navigation arrows */}
      <button
        onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))}
        className="fixed left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 transition"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrentSlide(s => Math.min(s + 1, slides.length - 1))}
        className="fixed right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 transition"
      >
        ›
      </button>

      {/* Scattered notifications — always visible over slides */}
      {notifications.map(n => (
        <div key={n.id} className="fixed z-50 pointer-events-none animate-bounce" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}>
          {n.type === 'miss' ? (
            <div className="text-center">
              <div className="text-7xl font-black text-bni-red leading-none drop-shadow-lg">✗</div>
              <div className="bg-white/95 rounded-lg px-3 py-1.5 shadow-xl border-2 border-bni-red mt-1">
                <p className="font-bold text-sm text-bni-red">{n.name}</p>
                <p className="text-gray-500 text-xs">&quot;{n.answer}&quot;</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-7xl font-black text-green-500 leading-none drop-shadow-lg">✓</div>
              <div className="bg-white/95 rounded-lg px-3 py-1.5 shadow-xl border-2 border-green-500 mt-1">
                <p className="font-bold text-sm text-green-600">{n.name}</p>
                <p className="text-black font-medium text-xs">&quot;{n.matched}&quot;</p>
                <p className="text-green-600 font-black text-lg">+{n.points}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Leaderboard ticker — always visible when game active */}
      {gameActive && players.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-30 bg-black/70 py-2 overflow-hidden">
          <div className="animate-scroll flex whitespace-nowrap gap-8 px-4">
            {players.slice(0, 3).map((p, i) => (
              <span key={p.id} className="inline-flex items-center gap-2 text-sm font-medium text-white">
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <span>{p.display_name}</span>
                <span className="text-bni-red font-bold">{p.total_score} pts</span>
              </span>
            ))}
            {players.slice(0, 3).map((p, i) => (
              <span key={`dup-${p.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-white">
                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <span>{p.display_name}</span>
                <span className="text-bni-red font-bold">{p.total_score} pts</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Game drawer toggle button */}
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-6 py-2 rounded-full font-bold text-sm shadow-lg transition-all ${
          drawerOpen ? 'bg-gray-800 text-white' : 'bg-bni-red text-white hover:scale-105'
        }`}
      >
        {drawerOpen ? '▼ Close' : '▲ Open'}
      </button>

      {/* Game drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-30 bg-white border-t-4 border-bni-red rounded-t-3xl shadow-2xl transition-transform duration-300 ${
        drawerOpen ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ maxHeight: '70vh' }}>
        {/* Scrolling leaderboard at top of drawer */}
        {gameActive && players.length > 0 && (
          <div className="overflow-hidden border-b border-gray-200 py-2 bg-gray-50">
            <div className="animate-scroll flex whitespace-nowrap gap-8 px-4">
              {players.map((p, i) => (
                <span key={p.id} className="inline-flex items-center gap-2 text-sm font-medium">
                  <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
                  <span className="text-black">{p.display_name}</span>
                  <span className="text-bni-red font-bold">{p.total_score}</span>
                </span>
              ))}
              {players.map((p, i) => (
                <span key={`dup-${p.id}`} className="inline-flex items-center gap-2 text-sm font-medium">
                  <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
                  <span className="text-black">{p.display_name}</span>
                  <span className="text-bni-red font-bold">{p.total_score}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>

          {/* Not started */}
          {!gameActive && (
            <div className="text-center py-8">
              <h2 className="text-2xl font-black mb-2"><span className="text-bni-red">BNI</span> Family Feud</h2>
              <p className="text-gray-500 mb-6">{questions.length} questions · {players.length} players</p>
              <button onClick={startGame} disabled={!questions.length} className="bg-bni-red hover:bg-bni-red-dark text-white font-bold text-lg px-8 py-3 rounded-xl transition disabled:opacity-50">
                Start Game
              </button>
            </div>
          )}

          {/* Game active */}
          {gameActive && currentQuestion && (
            <div>
              {/* Question header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Q{currentIndex + 1}/{questions.length}</p>
                  <p className="font-bold text-sm">{currentQuestion.members?.name} <span className="text-gray-400 font-normal">— {currentQuestion.members?.role}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-bni-red font-black">{revealed}/{answers.length}</span>
                  <span className="text-xs text-gray-400 ml-1">revealed</span>
                </div>
              </div>

              {/* Question */}
              <div className="bg-bni-red rounded-xl p-4 mb-3 text-center">
                <p className="text-white font-medium">{currentQuestion.question_text}</p>
              </div>

              {/* Answer board */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {answers.map(ans => (
                  <button
                    key={ans.id}
                    onClick={() => revealAnswer(ans.id)}
                    className={`rounded-lg p-2 text-left transition-all border ${
                      ans.is_revealed ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200 hover:border-bni-red'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400">#{ans.display_order}</span>
                      <span className="text-[10px] font-bold text-bni-red">{ans.points}</span>
                    </div>
                    <div className={`text-xs font-medium mt-0.5 ${ans.is_revealed ? 'text-black' : 'text-transparent bg-gray-200 rounded select-none'}`}>
                      {ans.is_revealed ? ans.answer_text : '████'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Responses */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-3 max-h-24 overflow-y-auto">
                <p className="text-xs text-gray-400 mb-1">{responses.length} answers</p>
                {responses.map(r => (
                  <div key={r.id} className="flex justify-between text-xs">
                    <span><span className="font-medium">{r.display_name}</span>: &quot;{r.raw_answer}&quot;</span>
                    {r.matched_answer ? <span className="text-green-600">+{r.points_earned}</span> : <span className="text-gray-300">✗</span>}
                  </div>
                ))}
              </div>

              {/* Nav */}
              {/* Prev / Next arrows on either side */}
              <div className="flex justify-between items-center">
                <button onClick={prevQuestion} disabled={currentIndex === 0} className="w-12 h-12 bg-gray-100 border border-gray-300 rounded-full text-xl font-bold disabled:opacity-30 hover:bg-gray-200 transition">←</button>
                <span className="text-sm text-gray-500">Q{currentIndex + 1} of {questions.length}</span>
                <button onClick={nextQuestion} className="w-12 h-12 bg-bni-red text-white rounded-full text-xl font-bold hover:bg-bni-red-dark transition">→</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
