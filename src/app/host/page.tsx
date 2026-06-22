'use client'
import { useEffect, useState, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import Image from 'next/image'

interface Member { id: string; name: string; role: string; company: string; display_order: number }
interface Answer { id: string; answer_text: string; points: number; display_order: number; is_revealed: boolean }
interface Question { id: string; member_id: string; question_text: string; is_active: boolean; is_complete: boolean; members: Member; question_answers: Answer[] }
interface Player { id: string; display_name: string; phone_number: string; total_score: number }
interface Response { id: string; raw_answer: string; matched_answer: string | null; points_earned: number; display_name?: string }

export default function HostPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [selected, setSelected] = useState<Question | null>(null)
  const [strikes, setStrikes] = useState(0)
  const [gamePhase, setGamePhase] = useState('registration')
  const [loading, setLoading] = useState(true)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  const twilioPhone = process.env.NEXT_PUBLIC_TWILIO_PHONE || '+16366892103'

  const loadQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/questions')
      setQuestions(await res.json())
    } catch (e) { console.error('Failed to load questions:', e) }
  }, [])

  const loadPlayers = useCallback(async () => {
    try {
      const res = await fetch('/api/players')
      setPlayers(await res.json())
    } catch (e) { console.error('Failed to load players:', e) }
  }, [])

  const loadResponses = useCallback(async (questionId: string) => {
    try {
      const res = await fetch(`/api/answers?question_id=${questionId}`)
      setResponses(await res.json())
    } catch (e) { console.error('Failed to load responses:', e) }
  }, [])

  useEffect(() => {
    const init = async () => { await Promise.all([loadQuestions(), loadPlayers()]); setLoading(false) }
    init()
    const unsub = onSnapshot(doc(db, 'game_state', 'current'), (snap) => {
      const data = snap.data()
      if (!data) return
      setStrikes(data.strikes || 0)
      setGamePhase(data.game_phase || 'registration')
      setActiveQuestionId(data.active_question_id || null)
    })
    return () => unsub()
  }, [loadQuestions, loadPlayers])

  useEffect(() => {
    if (activeQuestionId) { loadResponses(activeQuestionId) } else { setResponses([]) }
  }, [activeQuestionId, loadResponses])

  useEffect(() => {
    if (!activeQuestionId || gamePhase !== 'playing') return
    const interval = setInterval(() => { loadResponses(activeQuestionId); loadPlayers() }, 3000)
    return () => clearInterval(interval)
  }, [activeQuestionId, gamePhase, loadResponses, loadPlayers])

  const activateQuestion = async (q: Question) => {
    await fetch('/api/questions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id: q.id, action: 'activate' }) })
    setActiveQuestionId(q.id); setGamePhase('playing'); setStrikes(0); setResponses([]); loadQuestions()
  }

  const completeQuestion = async (q: Question) => {
    await fetch('/api/questions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id: q.id, action: 'complete' }) })
    setSelected(null); setActiveQuestionId(null); setGamePhase('registration'); loadQuestions()
  }

  const addStrike = async () => {
    const newStrikes = Math.min(strikes + 1, 3)
    setStrikes(newStrikes)
    await updateDoc(doc(db, 'game_state', 'current'), { strikes: newStrikes })
  }

  const revealAnswer = async (questionId: string, answerId: string) => {
    await fetch('/api/answers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id: questionId, answer_id: answerId, action: 'reveal' }) })
    loadQuestions()
  }

  const completed = questions.filter(q => q.is_complete).length
  const total = questions.length

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-bni-red text-xl animate-pulse">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black"><span className="text-bni-red">HOST</span> PANEL</h1>
          <p className="text-gray-500 text-xs">{players.length} players · {completed}/{total} rounds</p>
        </div>
        <div className="bg-bni-red text-white rounded-lg px-3 py-1 text-center">
          <div className="text-xs">Progress</div>
          <div className="text-lg font-bold">{completed}/{total}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div className="bg-bni-red h-2 rounded-full transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
      </div>

      {/* Status */}
      <div className={`rounded-lg p-3 mb-4 text-center text-sm font-medium border ${gamePhase === 'playing' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        {gamePhase === 'playing' ? '🟢 ROUND OPEN — answers via SMS' : '⏸ Click a member to start a round'}
      </div>

      {/* QR Button */}
      <button onClick={() => setShowQrModal(true)} className="w-full mb-4 bg-bni-red hover:bg-bni-red-dark text-white font-bold py-3 rounded-lg transition">
        📱 Show QR Code
      </button>

      {/* Member grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {questions.map(q => (
          <button key={q.id} onClick={() => setSelected(q)}
            className={`rounded-lg p-2 text-center transition-all border-2 ${
              q.is_complete ? 'bg-green-50 border-green-400'
              : q.is_active ? 'bg-red-50 border-bni-red ring-2 ring-bni-red'
              : 'bg-white border-gray-200 hover:border-bni-red'
            }`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 text-white ${q.is_complete ? 'bg-green-500' : 'bg-bni-red'}`}>
              {q.is_complete ? '✓' : q.members?.name?.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="text-[10px] font-medium truncate text-black">{q.members?.name}</div>
            {q.is_active && <div className="text-[10px] text-bni-red font-bold">LIVE</div>}
          </button>
        ))}
      </div>

      {/* Live answers */}
      {responses.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">Live Answers ({responses.length})</div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {responses.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span><span className="font-medium">{r.display_name}</span>: &quot;{r.raw_answer}&quot;</span>
                {r.matched_answer ? <span className="text-green-600 font-medium">+{r.points_earned}</span> : <span className="text-bni-red">✗</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">Players ({players.length})</div>
        <div className="flex flex-wrap gap-1.5">
          {players.map(p => (
            <span key={p.id} className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full border border-gray-300">
              {p.display_name} · {p.total_score}
            </span>
          ))}
        </div>
        {players.length === 0 && <p className="text-gray-400 text-xs">Waiting for SMS registrations...</p>}
      </div>

      {/* Question Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="bg-bni-red p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-bni-red font-bold text-sm">
                {selected.members?.name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">{selected.members?.name}</div>
                <div className="text-white/80 text-xs">{selected.members?.role}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/80 hover:text-white text-xl">×</button>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-black font-medium text-sm">{selected.question_text}</p>
              </div>

              {/* Strikes */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {[1,2,3].map(i => (
                    <span key={i} className={`text-2xl font-bold ${i <= strikes ? 'text-bni-red' : 'text-gray-200'}`}>✗</span>
                  ))}
                </div>
                <button onClick={addStrike} className="bg-bni-red hover:bg-bni-red-dark text-white px-3 py-1.5 rounded text-xs font-medium transition">+ Strike</button>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-2 gap-2">
                {[...(selected.question_answers || [])].sort((a, b) => a.display_order - b.display_order).map(ans => (
                  <button key={ans.id} onClick={() => revealAnswer(selected.id, ans.id)}
                    className={`rounded-lg p-2 text-left transition-all border-2 ${ans.is_revealed ? 'bg-green-50 border-green-400' : 'bg-gray-100 border-gray-300 hover:border-bni-red'}`}>
                    <div className="text-[10px] text-gray-400">#{ans.display_order}</div>
                    <div className={`text-xs font-medium ${ans.is_revealed ? 'text-black' : 'text-transparent bg-gray-200 rounded select-none'}`}>
                      {ans.is_revealed ? ans.answer_text : '██████'}
                    </div>
                    <div className="text-[10px] text-bni-red font-medium">{ans.points} pts</div>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!selected.is_active && !selected.is_complete && (
                  <button onClick={() => activateQuestion(selected)} className="flex-1 bg-bni-red hover:bg-bni-red-dark text-white font-bold py-2.5 rounded-lg text-sm transition">
                    🟢 Open Round
                  </button>
                )}
                {selected.is_active && (
                  <button onClick={() => completeQuestion(selected)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm transition">
                    ✓ Complete
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="px-4 bg-gray-100 hover:bg-gray-200 text-black py-2.5 rounded-lg text-sm border border-gray-300">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]" onClick={() => setShowQrModal(false)}>
          <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-1"><span className="text-bni-red">SCAN</span> TO JOIN</h2>
            <p className="text-gray-500 text-sm mb-6">Opens registration — just hit send</p>
            <Image src="/img/TB-QR.png" alt="Scan to register" width={250} height={250} className="mx-auto mb-6 rounded-lg" />
            <p className="text-gray-400 text-sm">Or text your name to</p>
            <p className="text-bni-red text-2xl font-bold mt-1 mb-6">{twilioPhone}</p>
            <button onClick={() => setShowQrModal(false)} className="bg-bni-red hover:bg-bni-red-dark text-white px-6 py-2 rounded-lg font-medium transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
