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
  const [playerCount, setPlayerCount] = useState(0)
  const [responseCount, setResponseCount] = useState(0)
  const [status, setStatus] = useState('')
  const [actionLoading, setActionLoading] = useState('')
  const [editing, setEditing] = useState<Question | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswers, setEditAnswers] = useState<{ text: string; points: number }[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        fetch('/api/questions'),
        fetch('/api/players'),
      ])
      const qs = await qRes.json()
      const ps = await pRes.json()
      setQuestions(Array.isArray(qs) ? qs : [])
      setPlayerCount(Array.isArray(ps) ? ps.length : 0)
    } catch {}
  }

  const handleLogin = async () => {
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: any) {
      setError('Invalid email or password')
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    window.location.href = '/'
  }

  const resetGame = async () => {
    if (!confirm('Reset the entire game? Clears players, responses, and resets questions.')) return
    setActionLoading('reset')
    setStatus('')
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' })
      const data = await res.json()
      setStatus(data.message || 'Game reset!')
      loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
    setActionLoading('')
  }

  const resetPlayersOnly = async () => {
    if (!confirm('Clear all players and responses?')) return
    setActionLoading('players')
    setStatus('')
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playersOnly: true }) })
      const data = await res.json()
      setStatus(data.message || 'Players cleared!')
      loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
    setActionLoading('')
  }

  const regenerateQuestions = async () => {
    if (!confirm('Regenerate all questions using AI? This takes ~30 seconds.')) return
    setActionLoading('regenerate')
    setStatus('Generating questions...')
    try {
      const res = await fetch('/api/admin/generate', { method: 'POST' })
      const data = await res.json()
      setStatus(data.message || 'Questions generated!')
      loadData()
    } catch (e: any) { setStatus('Error: ' + e.message) }
    setActionLoading('')
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Loading...</p>
    </div>
  )

  // Login form
  if (!user) return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-black mb-6"><span className="text-bni-red">Admin</span></h1>
      <div className="w-full max-w-xs space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-bni-red"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-bni-red"
        />
        {error && <p className="text-bni-red text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-bni-red hover:bg-bni-red-dark text-white font-bold py-3 rounded-xl transition"
        >
          Login
        </button>
      </div>
    </div>
  )

  // Admin panel
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
          <div className="text-2xl font-black text-bni-red">{playerCount}</div>
          <div className="text-sm text-gray-500">Players</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-bni-red">{responseCount}</div>
          <div className="text-sm text-gray-500">Responses</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
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

      {/* Questions */}
      <h2 className="font-bold text-lg mb-3">Questions ({questions.length})</h2>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
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
    </div>
  )
}
