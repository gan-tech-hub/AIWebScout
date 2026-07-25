'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createBrowserSupabaseClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }
  return (
    <button
      onClick={() => void signOut()}
      aria-label="ログアウト"
      className="border-line bg-panel-strong text-muted hover:text-ink grid size-10 place-items-center rounded-xl border"
    >
      <LogOut className="size-4" />
    </button>
  );
}
