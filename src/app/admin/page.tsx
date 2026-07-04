'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ManageTab from './components/ManageTab';
import MembersTab from './components/MembersTab';
import AnalyticsTab from './components/AnalyticsTab';
import SlidesTab from './components/SlidesTab';

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

interface Slide {
  id: string;
  url: string;
  order: number;
  filename: string;
}

type Tab = 'manage' | 'members' | 'analytics' | 'slides';

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Tab state
  const [tab, setTab] = useState<Tab>('manage');

  // Data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  // Slides
  const [slides, setSlides] = useState<Slide[]>([]);
  const [uploading, setUploading] = useState(false);

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
      fetchMembers();
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

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMembers(data.members || data || []);
    } catch (e) {
      console.error('Failed to fetch members', e);
    }
  };

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      setSlides(data || []);
    } catch (e) {
      console.error('Failed to fetch slides', e);
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

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === 'analytics') loadAnalytics();
    if (t === 'slides') fetchSlides();
  };

  // Auth handlers
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

  // Action handlers
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

  const handleSaveQuestion = async (data: { question_id: string; question_text: string; member_id: string; answers: { id: string; answer_text: string; points: number }[] }) => {
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: data.question_id,
          question_text: data.question_text,
          member_id: data.member_id,
          answers: data.answers,
        }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePlayer = async (data: { player_id: string; display_name: string; total_score: number }) => {
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    setActionLoading(true);
    try {
      await fetch('/api/admin/edit-player', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Slides handlers
  const handleUploadSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filename = `${timestamp}_${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(filename, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/slides/${filename}`;
      const newOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 1;
      const { error: insertError } = await supabase.from('slides').insert({
        url,
        order: newOrder,
        filename,
      });
      if (insertError) throw insertError;
      await fetchSlides();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteSlide = async (slide: Slide) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await supabase.storage.from('slides').remove([slide.filename]);
      await supabase.from('slides').delete().eq('id', slide.id);
      await fetchSlides();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleMoveSlide = async (slide: Slide, direction: 'up' | 'down') => {
    const sorted = [...slides].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === slide.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const swapSlide = sorted[swapIndex];
    const tempOrder = slide.order;
    await supabase.from('slides').update({ order: swapSlide.order }).eq('id', slide.id);
    await supabase.from('slides').update({ order: tempOrder }).eq('id', swapSlide.id);
    await fetchSlides();
  };

  const handleReorderSlide = async (dragId: string, dropSlide: Slide) => {
    const dragSlide = slides.find((s) => s.id === dragId);
    if (!dragSlide) return;
    const tempOrder = dragSlide.order;
    await supabase.from('slides').update({ order: dropSlide.order }).eq('id', dragId);
    await supabase.from('slides').update({ order: tempOrder }).eq('id', dropSlide.id);
    await fetchSlides();
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'manage', label: 'Manage' },
    { key: 'members', label: 'Members' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'slides', label: 'Slides' },
  ];

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
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`pb-2 px-1 font-medium transition ${tab === t.key ? 'border-b-2 border-bni-red text-bni-red' : 'text-gray-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'manage' && (
        <ManageTab
          questions={questions}
          players={players}
          members={members}
          status={status}
          actionLoading={actionLoading}
          onAction={handleAction}
          onSaveQuestion={handleSaveQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onSavePlayer={handleSavePlayer}
          onDeletePlayer={handleDeletePlayer}
        />
      )}

      {tab === 'members' && <MembersTab />}

      {tab === 'analytics' && <AnalyticsTab />}

      {tab === 'slides' && (
        <SlidesTab
          slides={slides}
          uploading={uploading}
          onUpload={handleUploadSlide}
          onDelete={handleDeleteSlide}
          onMove={handleMoveSlide}
          onReorder={handleReorderSlide}
        />
      )}

    </div>
  );
}
