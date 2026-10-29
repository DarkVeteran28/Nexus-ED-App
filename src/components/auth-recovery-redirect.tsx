'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export function AuthRecoveryRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && window.location.pathname !== '/reset-password') {
        router.replace('/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
