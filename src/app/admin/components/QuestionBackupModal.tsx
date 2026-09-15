'use client';

import { useState, useEffect } from 'react';

interface BackupQuestion {
  id: string;
  question_text: string;
  members: { name: string; role: string } | null;
  backed_up_at: string;
  question_answers: { answer_text: string; points: number }[];
}

interface QuestionBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (questionIds: string[]) => void;
}

export default function QuestionBackupModal({ isOpen, onClose, onRestore }: QuestionBackupModalProps) {
  const [backupQuestions, setBackupQuestions] = useState<BackupQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBackupQuestions();
    }
  }, [isOpen]);

  const loadBackupQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/questions-backup?action=list');
      const data = await res.json();
      if (data.questions) {
        setBackupQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to load backup:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(backupQuestions.map(q => q.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleRestore = () => {
    if (selectedIds.size > 0) {
      onRestore(Array.from(selectedIds));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Questions to Restore</h2>
            <p className="text-sm text-gray-500 mt-1">
              {backupQuestions.length} questions in backup • {selectedIds.size} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200 flex gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Deselect All
          </button>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading backup questions...</div>
          ) : backupQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No backup found. Click "📦 Backup Questions" first.
            </div>
          ) : (
            <div className="space-y-3">
              {backupQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedIds.has(q.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedIds.has(q.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedIds.has(q.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Question content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-gray-900">{q.question_text}</p>
                      </div>
                      
                      {q.members && (
                        <p className="text-sm text-gray-600 mb-2">
                          {q.members.name} — {q.members.role}
                        </p>
                      )}

                      {/* Answers preview */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.question_answers.slice(0, 3).map((ans, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {ans.answer_text} ({ans.points}pts)
                          </span>
                        ))}
                        {q.question_answers.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{q.question_answers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            disabled={selectedIds.size === 0}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Restore {selectedIds.size} Question{selectedIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
