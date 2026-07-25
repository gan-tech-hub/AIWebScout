'use client';

import { Binoculars, LoaderCircle, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const client = createBrowserSupabaseClient();
    const result =
      mode === 'login'
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({ email, password });
    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === 'signup' && !result.data.session) {
      setMessage(
        '確認メールを送信しました。メール確認後にログインしてください。',
      );
      return;
    }
    router.replace('/');
    router.refresh();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    void submit(event);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Surface className="w-full max-w-md p-6 sm:p-8">
        <span className="bg-accent/15 text-accent shadow-glow mx-auto grid size-14 place-items-center rounded-2xl">
          <Binoculars className="size-6" />
        </span>
        <p className="text-accent mt-5 text-center text-xs font-semibold uppercase tracking-[0.2em]">
          AI Web Scout
        </p>
        <h1 className="mt-3 text-center text-2xl font-semibold">
          {mode === 'login' ? 'ワークスペースへログイン' : 'アカウントを作成'}
        </h1>
        <p className="text-muted mt-2 text-center text-xs leading-5">
          Chrome拡張から送信したページとAI分析は、あなたのアカウントだけに保存されます。
        </p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-xs font-medium">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-line bg-panel-strong focus:border-accent/50 mt-2 h-11 w-full rounded-xl border px-3.5 outline-none"
            />
          </label>
          <label className="block text-xs font-medium">
            Password
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-line bg-panel-strong focus:border-accent/50 mt-2 h-11 w-full rounded-xl border px-3.5 outline-none"
            />
          </label>
          {message && (
            <p className="rounded-xl bg-amber-400/10 px-3 py-2 text-xs text-amber-500">
              {message}
            </p>
          )}
          <Button className="w-full" disabled={loading}>
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            {mode === 'login' ? 'ログイン' : '登録する'}
          </Button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMessage('');
          }}
          className="text-muted hover:text-accent mt-5 w-full text-center text-xs"
        >
          {mode === 'login'
            ? '初めて利用する方はこちら'
            : 'すでにアカウントをお持ちの方はこちら'}
        </button>
      </Surface>
    </main>
  );
}
