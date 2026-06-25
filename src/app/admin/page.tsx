'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  question_text: string;
  members: { name: string; role: string } | null;
  question_answers: { id: string; answer_text: string; points: number; display_order: number }[];
}

interface Player {
  id: string;
  display_name: string;
  phone_number: string;
  total_score: number;
}

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Tab state
  const [tab, setTab] = useState<'manage' | 'analytics'>('manage');

  // Data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Question edit modal
  const [editing, setEditing] = useState<Question | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswers, setEditAnswers] = useState<{ id: string; answer_text: string; points: number }[]>([]);

  // Player edit modal
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerScore, setEditPlayerScore] = useState(0);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        fetch('/api/questions'),
        fetch('/api/players'),
      ]);
      const qData = await qRes.json();
      const pData = await pRes.json();
      setQuestions(qData.questions || qData || []);
      setPlayers(pData.players || pData || []);
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleAction = async (action: 'reset' | 'clearPlayers' | 'generate') => {
    setActionLoading(true);
    setStatus('');
    try {
      let res;
      if (action === 'reset') {
        res = await fetch('/api/admin/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      } else if (action === 'clearPlayers') {
        res = await fetch('/api/admin/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playersOnly: true }) });
      } else {
        res = await fetch('/api/admin/generate', { method: 'POST' });
      }
      const data = await res.json();
      setStatus(data.message || 'Action completed');
      fetchData();
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const openEditQuestion = (q: Question) => {
    setEditing(q);
    setEditQuestion(q.question_text);
    const answers = Array.from({ length: 6 }, (_, i) => {
      const existing = q.question_answers.find((a) => a.display_order === i + 1);
      return existing
        ? { id: existing.id, answer_text: existing.answer_text, points: existing.points }
        : { id: '', answer_text: '', points: 0 };
    });
    setEditAnswers(answers);
  };

  const saveQuestion = async () => {
    if (!editing) return;
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: editing.id,
          question_text: editQuestion,
          answers: editAnswers.map((a) => ({ id: a.id, answer_text: a.answer_text, points: a.points })),
        }),
      });
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditPlayer = (p: Player) => {
    setEditingPlayer(p);
    setEditPlayerName(p.display_name);
    setEditPlayerScore(p.total_score);
  };

  const savePlayer = async () => {
    if (!editingPlayer) return;
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: editingPlayer.id,
          display_name: editPlayerName,
          total_score: editPlayerScore,
        }),
      });
      setEditingPlayer(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deletePlayer = async () => {
    if (!editingPlayer) return;
    if (!confirm('Are you sure you want to delete this player?')) return;
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit-player', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: editingPlayer.id }),
      });
      setEditingPlayer(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (t: 'manage' | 'analytics') => {
    setTab(t);
    if (t === 'analytics') {
      loadAnalytics();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-sm p-6 border border-gray-200 rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-bni-red">Admin Login</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-4 text-black"
          />
          <button
            type="submit"
            className="w-full bg-bni-red text-white py-2 rounded font-semibold hover:opacity-90 transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bni-red">Admin Panel</h1>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-bni-red transition">
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => handleTabChange('manage')}
          className={`pb-2 px-1 font-medium transition ${tab === 'manage' ? 'border-b-2 border-bni-red text-bni-red' : 'text-gray-500'}`}
        >
          Manage
        </button>
        <button
          onClick={() => handleTabChange('analytics')}
          className={`pb-2 px-1 font-medium transition ${tab === 'analytics' ? 'border-b-2 border-bni-red text-bni-red' : 'text-gray-500'}`}
        >
          Analytics
        </button>
      </div>

      {/* MANAGE TAB */}
      {tab === 'manage' && (
        <div>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{players.length}</p>
              <p className="text-sm text-gray-500">Players</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{new Set(questions.map((q) => q.members?.name).filter(Boolean)).size}</p>
              <p className="text-sm text-gray-500">Members</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => handleAction('reset')}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              Full Reset
            </button>
            <button
              onClick={() => handleAction('clearPlayers')}
              disabled={actionLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 transition"
            >
              Clear Players &amp; Responses
            </button>
            <button
              onClick={() => handleAction('generate')}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Regenerate Questions (AI)
            </button>
          </div>

          {/* Status */}
          {status && (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
              {status}
            </div>
          )}

          {/* Players Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openEditPlayer(p)}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-bni-red transition"
                >
                  <p className="font-medium">{p.display_name}</p>
                  <p className="text-xs text-gray-500">{p.phone_number}</p>
                  <p className="text-sm text-bni-red font-semibold mt-1">{p.total_score} pts</p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Questions</h2>
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => openEditQuestion(q)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-bni-red transition"
                >
                  <p className="text-sm text-gray-500 mb-1">{q.members?.name || 'Unknown Member'}</p>
                  <p className="font-medium">{q.question_text}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {q.question_answers
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((a) => (
                        <span key={a.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {a.answer_text} ({a.points})
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div>
          {!analytics ? (
            <p className="text-gray-500">Loading analytics...</p>
          ) : (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{analytics.totalPlayers}</p>
                  <p className="text-sm text-gray-500">Total Players</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{analytics.totalResponses}</p>
                  <p className="text-sm text-gray-500">Total Responses</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{analytics.matchRate}%</p>
                  <p className="text-sm text-gray-500">Match Rate</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{analytics.totalPoints}</p>
                  <p className="text-sm text-gray-500">Total Points</p>
                </div>
              </div>

              {/* Top Players */}
              {analytics.topPlayers && analytics.topPlayers.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Top Players</h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {analytics.topPlayers.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2">
                        <span>{p.name}</span>
                        <span className="font-semibold text-bni-red">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Most Active */}
              {analytics.mostActive && analytics.mostActive.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Most Active</h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {analytics.mostActive.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2">
                        <span>{p.name}</span>
                        <span className="text-gray-500">{p.answerCount} answers</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Guesses */}
              {analytics.bestGuesses && analytics.bestGuesses.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Best Guesses</h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {analytics.bestGuesses.map((g: any, i: number) => (
                      <div key={i} className="flex justify-between items-center px-4 py-2">
                        <div>
                          <span className="font-medium">{g.name}</span>
                          <span className="text-gray-500 text-sm ml-2">&quot;{g.answer}&quot;</span>
                          {g.matched && <span className="text-green-600 text-xs ml-2">✓ matched</span>}
                        </div>
                        <span className="font-semibold text-bni-red">{g.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              {analytics.completedQuestions !== undefined && (
                <p className="text-sm text-gray-500 mt-4">
                  {analytics.completedQuestions}/{analytics.totalQuestions} questions played · avg {analytics.avgAnswersPerQuestion} answers/question
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* QUESTION EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-bni-red text-white p-4 rounded-t-lg">
              <h3 className="font-semibold">{editing.members?.name || 'Unknown Member'}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Question</label>
                <textarea
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Answers</label>
                <div className="space-y-2">
                  {editAnswers.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={a.answer_text}
                        onChange={(e) => {
                          const updated = [...editAnswers];
                          updated[i] = { ...updated[i], answer_text: e.target.value };
                          setEditAnswers(updated);
                        }}
                        placeholder={`Answer ${i + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-black text-sm"
                      />
                      <input
                        type="number"
                        value={a.points}
                        onChange={(e) => {
                          const updated = [...editAnswers];
                          updated[i] = { ...updated[i], points: parseInt(e.target.value) || 0 };
                          setEditAnswers(updated);
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded text-black text-sm"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Total: {editAnswers.reduce((sum, a) => sum + a.points, 0)} points
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuestion}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-bni-red text-white rounded font-medium hover:opacity-90 disabled:opacity-50 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAYER EDIT MODAL */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="bg-bni-red text-white p-4 rounded-t-lg">
              <h3 className="font-semibold">Edit Player</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                <input
                  type="text"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Score</label>
                <input
                  type="number"
                  value={editPlayerScore}
                  onChange={(e) => setEditPlayerScore(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm">
                  {editingPlayer.phone_number}
                </p>
              </div>
              <div className="flex gap-3 justify-between">
                <button
                  onClick={deletePlayer}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  Delete
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingPlayer(null)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePlayer}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-bni-red text-white rounded font-medium hover:opacity-90 disabled:opacity-50 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
