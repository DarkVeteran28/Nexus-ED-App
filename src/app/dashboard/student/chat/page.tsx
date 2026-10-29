'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type ClassMessage = { id: string | number; text: string; created_at?: string };
const CLASS_ID = '10A';

export default function StudentChatPage() {
  const [messages, setMessages] = useState<ClassMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMessages = useCallback(async () => {
    setErrorMessage('');
    try {
      const { data, error } = await getSupabaseBrowserClient()
        .from('messages')
        .select('id, text, created_at')
        .eq('class_id', CLASS_ID)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages((data ?? []) as ClassMessage[]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Class messages could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadMessages(); }, [loadMessages]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, classId: CLASS_ID }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Message could not be sent.');
      setText('');
      await loadMessages();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-3xl flex-col gap-4 p-4 text-slate-900 sm:p-8">
      <header>
        <h1 className="text-2xl font-bold">Class Chat</h1>
        <p className="text-sm text-slate-600">Messages for class {CLASS_ID}</p>
      </header>
      <section aria-label="Class messages" className="min-h-64 flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        {loading ? <p className="text-sm text-slate-600">Loading messages…</p>
          : messages.length === 0 ? <p className="text-sm text-slate-600">No messages yet. Start the class conversation.</p>
            : messages.map((message) => (
              <article key={message.id} className="rounded-lg bg-slate-50 p-3">
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                {message.created_at && <time className="mt-1 block text-xs text-slate-500">{new Date(message.created_at).toLocaleString()}</time>}
              </article>
            ))}
      </section>
      {errorMessage && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>}
      <form onSubmit={sendMessage} className="flex gap-2">
        <label htmlFor="class-message" className="sr-only">Write a class message</label>
        <input id="class-message" value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} required placeholder="Write a message…" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        <button disabled={sending} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{sending ? 'Sending…' : 'Send'}</button>
      </form>
    </main>
  );
}
