'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type PageState = 'checking' | 'ready' | 'invalid' | 'saved';

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let recoveryEventSeen = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryEventSeen = true;
        setPageState('ready');
      } else if (session && recoveryEventSeen) {
        setPageState('ready');
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setPageState('invalid');
        return;
      }
      if (data.session) setPageState('ready');
      else window.setTimeout(() => setPageState((current) => current === 'checking' ? 'invalid' : current), 2500);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (password.length < 12) {
      setMessage('Use a password with at least 12 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setPageState('saved');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update the password. Request a fresh recovery link and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Choose a new password</h1>
        {pageState === 'checking' && <p role="status" className="mt-6 text-center text-sm text-slate-600">Checking your recovery link…</p>}
        {pageState === 'invalid' && (
          <div className="mt-6 space-y-4 text-center">
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">This recovery link is invalid or expired. Request a new one to continue.</p>
            <Link href="/forgot-password" className="inline-flex rounded-lg bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800">Request another link</Link>
          </div>
        )}
        {pageState === 'saved' && (
          <div className="mt-6 space-y-4 text-center">
            <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Your password has been updated. Sign in with your new password.</p>
            <Link href="/login" className="inline-flex rounded-lg bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800">Back to sign in</Link>
          </div>
        )}
        {pageState === 'ready' && (
          <>
            <p className="mb-6 mt-2 text-center text-sm text-slate-600">Choose a new password with at least 12 characters.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              {message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{message}</p>}
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-700 py-3 font-bold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60">
                {loading ? 'Updating password…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
