'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { dashboardForRole, isSupportedRole, type AppRole } from '@/lib/route-access.mjs';

const roles: readonly AppRole[] = ['student', 'teacher', 'admin', 'parent'];

export default function LoginPage() {
  const [role, setRole] = useState<AppRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;

      // app_metadata is managed by a trusted Supabase admin process. Do not authorize
      // using user_metadata, which the signed-in user can edit themselves.
      const actualRole: unknown = data.user.app_metadata.role;
      if (!isSupportedRole(actualRole) || actualRole !== role) {
        await supabase.auth.signOut();
        setIsError(true);
        setMessage('This account is not authorized for the selected role. Select the account’s assigned role or contact your school administrator.');
        return;
      }

      const dashboard = dashboardForRole(actualRole);
      if (!dashboard) throw new Error('No dashboard is configured for this account role.');
      router.replace(dashboard);
      router.refresh();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Nexus Ed Portal</h1>
        <p className="mb-6 text-center text-sm text-slate-600">Sign in with your school account.</p>
        <Link href="/demo" className="mb-6 block rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800 hover:bg-blue-100">
          Explore the interactive demo without signing in →
        </Link>

        <div aria-label="Choose account role" className="mb-6 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={role === item}
              onClick={() => setRole(item)}
              className={`rounded-lg px-2 py-2 text-sm font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${role === item ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-700">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@school.edu"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm font-medium text-blue-700 underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          {message && <p role="alert" className={`rounded-lg p-3 text-sm ${isError ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 py-3 font-bold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Signing in…' : `Login as ${role[0].toUpperCase()}${role.slice(1)}`}
          </button>
        </form>
      </section>
    </main>
  );
}
