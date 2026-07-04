'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { PageAgent: any }
}

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const agentRef = useRef<any>(null);
  const scriptLoaded = useRef(false);

  // Cmd+K to open
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Load page-agent via CDN
  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/page-agent@1.10.0/dist/iife/page-agent.demo.js?autoInit=false';
    script.crossOrigin = 'true';
    script.onload = () => { scriptLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  const getAgent = () => {
    if (agentRef.current) return agentRef.current;
    if (!window.PageAgent) return null;
    agentRef.current = new window.PageAgent({
      model: 'deepseek-chat',
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
      language: 'en-US',
    });
    return agentRef.current;
  };

  const executeCommand = async () => {
    if (!command.trim()) return;
    setLoading(true);
    setStatus('Thinking...');
    try {
      const agent = getAgent();
      if (!agent) { setStatus('Agent not ready — try again'); setLoading(false); return; }
      await agent.execute(command);
      setStatus('Done!');
      setCommand('');
      setTimeout(() => { setStatus(''); setOpen(false); }, 1500);
    } catch (e: any) {
      setStatus('Error: ' + (e.message || 'Failed'));
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-bni-red text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:scale-105 transition flex items-center gap-2"
      >
        <span>⌘K</span>
        <span>AI</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-[100]" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-gray-200 px-4">
          <span className="text-gray-400 mr-3">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && executeCommand()}
            placeholder="Type a command... e.g. 'Click Full Reset'"
            className="flex-1 py-4 text-black outline-none text-sm"
            disabled={loading}
          />
          {loading && <div className="animate-spin w-4 h-4 border-2 border-bni-red border-t-transparent rounded-full" />}
        </div>
        {status && (
          <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
            {status}
          </div>
        )}
        <div className="px-4 py-2 text-xs text-gray-400 flex justify-between">
          <span>DeepSeek + Page Agent</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
