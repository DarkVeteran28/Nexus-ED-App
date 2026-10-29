'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage('If an account uses that email, a password reset link will arrive shortly.');
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Could not send a reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="mb-6 text-center text-sm text-slate-600">Enter your school account email and we’ll send a recovery link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recovery-email" className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@school.edu"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          {message && <p role={isError ? 'alert' : 'status'} className={`rounded-lg p-3 text-sm ${isError ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 py-3 font-bold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Sending link…' : 'Send recovery link'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600"><Link href="/login" className="font-medium text-blue-700 underline-offset-4 hover:underline">Back to sign in</Link></p>
      </section>
    </main>
  );
}
