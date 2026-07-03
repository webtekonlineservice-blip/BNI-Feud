'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface Player { id: string; display_name: string; total_score: number }
interface Response { id: string; display_name: string; raw_answer: string; matched_answer: string | null; points_earned: number; question_id: string; received_at: string }

export default function AnalyticsTab() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [questionsCount, setQuestionsCount] = useState(0);

  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Player));
      all.sort((a, b) => b.total_score - a.total_score);
      setPlayers(all);
    });

    const unsubResponses = onSnapshot(collection(db, 'responses'), (snap) => {
      setResponses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Response)));
    });

    const unsubQuestions = onSnapshot(collection(db, 'questions'), (snap) => {
      setQuestionsCount(snap.size);
    });

    return () => { unsubPlayers(); unsubResponses(); unsubQuestions(); };
  }, []);

  const totalResponses = responses.length;
  const matches = responses.filter(r => r.matched_answer);
  const misses = responses.filter(r => !r.matched_answer);
  const matchRate = totalResponses > 0 ? Math.round((matches.length / totalResponses) * 100) : 0;
  const totalPoints = responses.reduce((sum, r) => sum + (r.points_earned || 0), 0);
  const avgScore = players.length > 0 ? Math.round(totalPoints / players.length) : 0;

  // Most active (by response count)
  const responseCounts: Record<string, { name: string; count: number }> = {};
  responses.forEach(r => {
    const name = r.display_name || 'Unknown';
    if (!responseCounts[name]) responseCounts[name] = { name, count: 0 };
    responseCounts[name].count++;
  });
  const mostActive = Object.values(responseCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Recent activity (last 10 responses)
  const recent = [...responses].sort((a, b) => (b.received_at || '').localeCompare(a.received_at || '')).slice(0, 10);

  return (
    <div>
      {/* Live stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-bni-red">{players.length}</p>
          <p className="text-xs text-gray-500">Players</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-bni-red">{totalResponses}</p>
          <p className="text-xs text-gray-500">Total Answers</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{matchRate}%</p>
          <p className="text-xs text-gray-500">Match Rate</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-bni-red">{totalPoints}</p>
          <p className="text-xs text-gray-500">Points Awarded</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{matches.length}</p>
          <p className="text-xs text-gray-500">Correct</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{misses.length}</p>
          <p className="text-xs text-gray-500">Wrong</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{questionsCount}</p>
          <p className="text-xs text-gray-500">Questions</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{avgScore}</p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div>
          <h3 className="font-semibold mb-2">Leaderboard</h3>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {players.slice(0, 10).map((p, i) => (
              <div key={p.id} className="flex justify-between items-center px-4 py-2">
                <span className="text-sm">
                  <span className="mr-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
                  {p.display_name}
                </span>
                <span className="font-semibold text-bni-red">{p.total_score}</span>
              </div>
            ))}
            {players.length === 0 && <p className="px-4 py-3 text-gray-400 text-sm">No players yet</p>}
          </div>
        </div>

        {/* Most Active */}
        <div>
          <h3 className="font-semibold mb-2">Most Active</h3>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {mostActive.map((p, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2">
                <span className="text-sm">{p.name}</span>
                <span className="text-gray-500 text-sm">{p.count} answers</span>
              </div>
            ))}
            {mostActive.length === 0 && <p className="px-4 py-3 text-gray-400 text-sm">No activity yet</p>}
          </div>
        </div>
      </div>

      {/* Live activity feed */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Live Activity</h3>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {recent.map((r) => (
            <div key={r.id} className="flex justify-between items-center px-4 py-2">
              <div className="text-sm">
                <span className="font-medium">{r.display_name}</span>
                <span className="text-gray-500 ml-2">&quot;{r.raw_answer}&quot;</span>
              </div>
              {r.matched_answer
                ? <span className="text-green-600 text-sm font-medium">+{r.points_earned}</span>
                : <span className="text-red-400 text-sm">✗</span>
              }
            </div>
          ))}
          {recent.length === 0 && <p className="px-4 py-3 text-gray-400 text-sm">No answers yet</p>}
        </div>
      </div>
    </div>
  );
}
