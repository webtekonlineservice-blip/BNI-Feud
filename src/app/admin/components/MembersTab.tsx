'use client';

import { useState, useEffect } from 'react';

interface Member {
  id: string;
  name: string;
  role: string;
  company: string;
  fun_facts: string;
  display_order: number;
}

export default function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Member | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formFunFacts, setFormFunFacts] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data.members || data || []);
    } catch (e) {
      console.error('Failed to fetch members', e);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormCompany(member.company || '');
    setFormFunFacts(member.fun_facts || '');
  };

  const openNew = () => {
    setEditing({ id: '', name: '', role: '', company: '', fun_facts: '', display_order: members.length + 1 });
    setFormName('');
    setFormRole('');
    setFormCompany('');
    setFormFunFacts('');
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id || undefined,
          name: formName,
          role: formRole,
          company: formCompany,
          fun_facts: formFunFacts,
          display_order: editing.display_order,
        }),
      });
      setEditing(null);
      await fetchMembers();
    } catch (e) {
      console.error('Failed to save member', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editing || !editing.id) return;
    if (!confirm('Delete this member?')) return;
    setSaving(true);
    try {
      await fetch('/api/admin/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id }),
      });
      setEditing(null);
      await fetchMembers();
    } catch (e) {
      console.error('Failed to delete member', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading members...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chapter Members</h2>
        <button
          onClick={openNew}
          className="px-3 py-1.5 bg-bni-red text-white rounded text-sm font-medium hover:opacity-90 transition"
        >
          + Add Member
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            onClick={() => openEdit(m)}
            className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-bni-red transition flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-gray-500">{m.role}{m.company ? ` · ${m.company}` : ''}</p>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-gray-500 text-sm">No members yet. Click &quot;+ Add Member&quot; to get started.</p>
        )}
      </div>

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="bg-bni-red text-white p-4 rounded-t-lg">
              <h3 className="font-semibold">{editing.id ? 'Edit Member' : 'Add Member'}</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="e.g. President, Treasurer"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Company</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Fun Facts</label>
                <textarea
                  value={formFunFacts}
                  onChange={(e) => setFormFunFacts(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black resize-none"
                  rows={3}
                  placeholder="Interesting facts about this member"
                />
              </div>
              <div className="flex gap-3 justify-between">
                {editing.id && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
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
