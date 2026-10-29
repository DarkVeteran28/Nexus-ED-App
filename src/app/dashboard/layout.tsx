'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [error, setError] = useState('');
  const router = useRouter();

  async function signOut() {
    setError('');
    try {
      const { error: signOutError } = await getSupabaseBrowserClient().auth.signOut();
      if (signOutError) throw signOutError;
      router.replace('/login');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign out. Please try again.');
    }
  }

  return (
    <>
      <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-4 py-3">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button onClick={signOut} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-700">
          Sign out
        </button>
      </header>
      {children}
    </>
  );
}
