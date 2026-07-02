'use client';

import { useState } from 'react';

interface Player {
  id: string;
  display_name: string;
  phone_number: string;
  total_score: number;
}

interface PlayerModalProps {
  player: Player;
  actionLoading: boolean;
  onSave: (data: { player_id: string; display_name: string; total_score: number }) => void;
  onDelete: (playerId: string) => void;
  onClose: () => void;
}

export default function PlayerModal({ player, actionLoading, onSave, onDelete, onClose }: PlayerModalProps) {
  const [editName, setEditName] = useState(player.display_name);
  const [editScore, setEditScore] = useState(player.total_score);

  const handleSave = () => {
    onSave({ player_id: player.id, display_name: editName, total_score: editScore });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    onDelete(player.id);
  };

  return (
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
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Score</label>
            <input
              type="number"
              value={editScore}
              onChange={(e) => setEditScore(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
            <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-600 text-sm">
              {player.phone_number}
            </p>
          </div>
          <div className="flex gap-3 justify-between">
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              Delete
            </button>
            <div className="flex gap-3">
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
