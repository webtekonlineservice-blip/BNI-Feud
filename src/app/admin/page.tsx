'use client'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'

interface Question {
  id: string
  question_text: string
  members: { name: string; role: string } | null
  question_answers: { id: string; answer_text: string; points: number; display_order: number }[]
}

interface Player {
  id: string
  display_name: string
  phone_number: string
  total_score: number
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [status, setStatus] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  // Question edit
  const [editing, setEditing] = useState<Question | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswers, setEditAnswers] = useState<{ id: string; text: string; points: number }[]>([])
  // Player edit
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editPlayerName, setEditPlayerName] = useState('')
  const [editPlayerScore, setEditPlayerScore] = useState(0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false) })
    return () => unsub()
  }, [])

  useEffect(() => { if (user) loadData() }, [user])

  const loadData = async () => {
    try {
      const [qRes, pRes] = await Promise.all([fetch('/api/questions'), fetch('/api/players')])
      const qs = await qRes.json()
      const ps = await pRes.json()
      setQuestions(Array.isArray(qs) ? qs : [])
      setPlayers(Array.isArray(ps) ? ps : [])
    } catch {}
  }

  const handleLogin = async () => {
    setError('')
    try { await signInWithEmailAndPassword(auth, email, password) }
    catch { setError('Invalid email or password') }
  }

  const handleSignOut = async () => { await signOut(auth); window.location.href = '/' }

  const resetGame = async () => {
    if (!confirm('Reset the entire game? Clears players, responses, and resets questions.')) return
    setActionLoading('reset'); setStatus('')
    try { const res = await fetch('/api/admin/reset', { method: 'POST' }); const data = await res.json(); setStatus(data.message || 'Game reset!'); loadData() }
    catch (e: any) { setStatus('Error: ' + e.message) }
    setActionLoading('')
  }

  const resetPlayersOnly = async () => {
    if (!confirm('Clear all players and responses?')) return
    setActionLoading('players'); setStatus('')
    try { const res = await fetch('/api/admin/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playersOnly: true }) }); const data = await res.json(); setStatus(data.message || 'Players cleared!'); loadData() }
    catch (e: any) { setStatus('Error: ' + e.message) }
    setActionLoading('')
  }

  const regenerateQuestions = async () => {
    if (!confirm('Regenerate all questions using AI? This takes ~30 seconds.')) return
    setActionLoading('regenerate'); setStatus('Generating questions...')
    try { const res = await fetch('/api/admin/generate', { method: 'POST' }); const data = await res.json(); setStatus(data.message || 'Questions generated!'); loadData() }
    catch (e: any) { setStatus('Error: ' + e.message) }
    setActionLoading('')
  }

  // Question edit
  const openEditQuestion = (q: Question) => {
    setEditing(q)
    setEditQuestion(q.question_text)
    setEditAnswers(q.question_answers?.map(a => ({ id: a.id, text: a.answer_text, points: a.points })) || [])
  }

  const saveQuestion = async () => {
    if (!editing) return
    try {
      await fetch('/api/admin/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question_id: editing.id, question_text: editQuestion, answers: editAnswers.map(a => ({ id: a.id, answer_text: a.text, points: a.points })) }) })
      setStatus('Question saved!'); setEditing(null); loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
  }

  // Player edit
  const openEditPlayer = (p: Player) => {
    setEditingPlayer(p)
    setEditPlayerName(p.display_name)
    setEditPlayerScore(p.total_score)
  }

  const savePlayer = async () => {
    if (!editingPlayer) return
    try {
      await fetch('/api/admin/edit-player', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_id: editingPlayer.id, display_name: editPlayerName, total_score: editPlayerScore }) })
      setStatus('Player updated!'); setEditingPlayer(null); loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
  }

  const deletePlayer = async () => {
    if (!editingPlayer || !confirm(`Delete ${editingPlayer.display_name}?`)) return
    try {
      await fetch('/api/admin/edit-player', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ player_id: editingPlayer.id }) })
      setStatus('Player deleted'); setEditingPlayer(null); loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
  }

  if (loading) return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center"><p className="text-gray-500 animate-pulse">Loading...</p></div>

  if (!user) return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-black mb-6"><span className="text-bni-red">Admin</span></h1>
      <div className="w-full max-w-xs space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-bni-red" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-bni-red" />
        {error && <p className="text-bni-red text-sm">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-bni-red hover:bg-bni-red-dark text-white font-bold py-3 rounded-xl transition">Login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black"><span className="text-bni-red">Admin</span></h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-bni-red">Sign out</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-bni-red">{questions.length}</div>
          <div className="text-sm text-gray-500">Questions</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-bni-red">{players.length}</div>
          <div className="text-sm text-gray-500">Players</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-bni-red">13</div>
          <div className="text-sm text-gray-500">Members</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-6">
        <button onClick={resetGame} disabled={!!actionLoading} className="w-full bg-bni-red hover:bg-bni-red-dark text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
          {actionLoading === 'reset' ? 'Resetting...' : '🔄 Full Reset'}
        </button>
        <button onClick={resetPlayersOnly} disabled={!!actionLoading} className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
          {actionLoading === 'players' ? 'Clearing...' : '👥 Clear Players & Responses'}
        </button>
        <button onClick={regenerateQuestions} disabled={!!actionLoading} className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
          {actionLoading === 'regenerate' ? 'Generating...' : '🤖 Regenerate Questions (AI)'}
        </button>
      </div>

      {status && <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-6 text-sm">{status}</div>}

      {/* Players */}
      <h2 className="font-bold text-lg mb-3">Players ({players.length})</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {players.map(p => (
          <div key={p.id} onClick={() => openEditPlayer(p)} className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-bni-red transition">
            <div className="font-medium text-sm">{p.display_name}</div>
            <div className="text-xs text-gray-400">{p.phone_number}</div>
            <div className="text-xs text-bni-red font-bold mt-1">{p.total_score} pts</div>
          </div>
        ))}
        {players.length === 0 && <p className="text-gray-400 text-sm col-span-3">No players registered</p>}
      </div>

      {/* Questions */}
      <h2 className="font-bold text-lg mb-3">Questions ({questions.length})</h2>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} onClick={() => openEditQuestion(q)} className="bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-bni-red transition">
            <div className="mb-1">
              <span className="text-xs text-gray-400">#{i + 1}</span>
              <span className="text-sm font-bold text-bni-red ml-2">{q.members?.name}</span>
            </div>
            <p className="text-sm mb-2">{q.question_text}</p>
            <div className="flex flex-wrap gap-1">
              {q.question_answers?.map(a => (
                <span key={a.id} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded">{a.answer_text} ({a.points})</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Question Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="bg-bni-red p-4 rounded-t-2xl">
              <h3 className="text-white font-bold">Edit: {editing.members?.name}</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Question</label>
                <textarea value={editQuestion} onChange={e => setEditQuestion(e.target.value)} rows={3} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bni-red" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Answers (total should = 100)</label>
                <div className="space-y-2">
                  {editAnswers.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs text-gray-400 pt-2 w-5">#{i + 1}</span>
                      <input value={a.text} onChange={e => { const c = [...editAnswers]; c[i].text = e.target.value; setEditAnswers(c) }} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bni-red" />
                      <input type="number" value={a.points} onChange={e => { const c = [...editAnswers]; c[i].points = parseInt(e.target.value) || 0; setEditAnswers(c) }} className="w-14 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-bni-red" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Total: {editAnswers.reduce((s, a) => s + a.points, 0)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={saveQuestion} className="flex-1 bg-bni-red hover:bg-bni-red-dark text-white font-bold py-2.5 rounded-xl transition">Save</button>
                <button onClick={() => setEditing(null)} className="px-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 py-2.5 rounded-xl">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Edit Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditingPlayer(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="bg-bni-red p-4 rounded-t-2xl">
              <h3 className="text-white font-bold">Edit Player</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Name</label>
                <input value={editPlayerName} onChange={e => setEditPlayerName(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bni-red" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Score</label>
                <input type="number" value={editPlayerScore} onChange={e => setEditPlayerScore(parseInt(e.target.value) || 0)} className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bni-red" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Phone</label>
                <p className="text-sm text-gray-400">{editingPlayer.phone_number}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={savePlayer} className="flex-1 bg-bni-red hover:bg-bni-red-dark text-white font-bold py-2.5 rounded-xl transition">Save</button>
                <button onClick={deletePlayer} className="px-4 bg-red-100 hover:bg-red-200 text-bni-red border border-red-200 py-2.5 rounded-xl text-sm font-medium">Delete</button>
                <button onClick={() => setEditingPlayer(null)} className="px-4 bg-gray-100 hover:bg-gray-200 border border-gray-300 py-2.5 rounded-xl">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
