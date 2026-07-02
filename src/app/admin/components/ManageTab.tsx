'use client';

import { useState } from 'react';
import QuestionModal from './QuestionModal';
import PlayerModal from './PlayerModal';

interface Question {
  id: string;
  question_text: string;
  member_id?: string;
  members: { name: string; role: string } | null;
  question_answers: { id: string; answer_text: string; points: number; display_order: number }[];
}

interface Player {
  id: string;
  display_name: string;
  phone_number: string;
  total_score: number;
}

interface Member {
  id: string;
  name: string;
  role: string;
}

interface ManageTabProps {
  questions: Question[];
  players: Player[];
  members: Member[];
  status: string;
  actionLoading: boolean;
  onAction: (action: 'reset' | 'clearPlayers' | 'generate') => void;
  onSaveQuestion: (data: { question_id: string; question_text: string; member_id: string; answers: { id: string; answer_text: string; points: number }[] }) => void;
  onDeleteQuestion: (questionId: string) => void;
  onSavePlayer: (data: { player_id: string; display_name: string; total_score: number }) => void;
  onDeletePlayer: (playerId: string) => void;
}

export default function ManageTab({
  questions,
  players,
  members,
  status,
  actionLoading,
  onAction,
  onSaveQuestion,
  onDeleteQuestion,
  onSavePlayer,
  onDeletePlayer,
}: ManageTabProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const openNewQuestion = () => {
    setEditingQuestion({ id: '', question_text: '', members: null, question_answers: [] } as Question);
  };

  return (
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
          onClick={() => onAction('reset')}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition"
        >
          Full Reset
        </button>
        <button
          onClick={() => onAction('clearPlayers')}
          disabled={actionLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:opacity-50 transition"
        >
          Clear Players &amp; Responses
        </button>
        <button
          onClick={() => onAction('generate')}
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
              onClick={() => setEditingPlayer(p)}
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Questions</h2>
          <button onClick={openNewQuestion} className="px-3 py-1.5 bg-bni-red text-white rounded text-sm font-medium hover:opacity-90 transition">
            + Add Question
          </button>
        </div>
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => setEditingQuestion(q)}
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

      {/* Modals */}
      {editingQuestion && (
        <QuestionModal
          question={editingQuestion}
          members={members}
          actionLoading={actionLoading}
          onSave={(data) => {
            onSaveQuestion(data);
            setEditingQuestion(null);
          }}
          onDelete={(id) => {
            onDeleteQuestion(id);
            setEditingQuestion(null);
          }}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {editingPlayer && (
        <PlayerModal
          player={editingPlayer}
          actionLoading={actionLoading}
          onSave={(data) => {
            onSavePlayer(data);
            setEditingPlayer(null);
          }}
          onDelete={(id) => {
            onDeletePlayer(id);
            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
}
