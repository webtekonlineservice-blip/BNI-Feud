'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question_text: string;
  member_id?: string;
  members: { name: string; role: string } | null;
  question_answers: { id: string; answer_text: string; points: number; display_order: number }[];
}

interface Member {
  id: string;
  name: string;
  role: string;
}

interface QuestionModalProps {
  question: Question;
  members: Member[];
  actionLoading: boolean;
  onSave: (data: { question_id: string; question_text: string; member_id: string; answers: { id: string; answer_text: string; points: number }[] }) => void;
  onDelete: (questionId: string) => void;
  onClose: () => void;
}

export default function QuestionModal({ question, members, actionLoading, onSave, onDelete, onClose }: QuestionModalProps) {
  const [editQuestion, setEditQuestion] = useState(question.question_text);
  const [editMemberId, setEditMemberId] = useState((question as any).member_id || '');
  const [editAnswers, setEditAnswers] = useState(() => {
    if (question.question_answers.length > 0) {
      return question.question_answers
        .sort((a, b) => a.display_order - b.display_order)
        .map(a => ({ id: a.id, answer_text: a.answer_text, points: a.points }));
    }
    return [{ id: '', answer_text: '', points: 0 }];
  });

  const handleSave = () => {
    onSave({
      question_id: question.id,
      question_text: editQuestion,
      member_id: editMemberId,
      answers: editAnswers.filter(a => a.answer_text.trim()).map((a) => ({ id: a.id, answer_text: a.answer_text, points: a.points })),
    });
  };

  const handleDelete = () => {
    if (!confirm('Delete this question and all its answers?')) return;
    onDelete(question.id);
  };

  const addAnswer = () => {
    setEditAnswers([...editAnswers, { id: '', answer_text: '', points: 0 }]);
  };

  const removeAnswer = (index: number) => {
    if (editAnswers.length <= 1) return;
    setEditAnswers(editAnswers.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-bni-red text-white p-4 rounded-t-lg flex items-center justify-between">
          <h3 className="font-semibold">{question.id ? (question.members?.name || 'Edit Question') : 'New Question'}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          {/* Member select */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Member</label>
            <select
              value={editMemberId}
              onChange={(e) => setEditMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black text-sm"
            >
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
              ))}
            </select>
          </div>

          {/* Question text */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Question</label>
            <textarea
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black resize-none"
              rows={3}
              placeholder="We surveyed 100 people..."
            />
          </div>

          {/* Answers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Answers</label>
              <button onClick={addAnswer} className="text-xs text-bni-red font-medium hover:underline">+ Add Answer</button>
            </div>
            <div className="space-y-2">
              {editAnswers.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
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
                    className="w-16 px-2 py-2 border border-gray-300 rounded text-black text-sm text-center"
                    placeholder="pts"
                  />
                  <button
                    onClick={() => removeAnswer(i)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                    title="Remove answer"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Total: {editAnswers.reduce((sum, a) => sum + a.points, 0)} points
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between pt-2 border-t border-gray-100">
            {question.id && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition"
              >
                Delete
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
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
  );
}
