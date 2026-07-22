'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem('ai-web-scout-theme');
    const nextDark = saved ? saved === 'dark' : true;
    document.documentElement.classList.toggle('dark', nextDark);
    setDark(nextDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    window.localStorage.setItem(
      'ai-web-scout-theme',
      nextDark ? 'dark' : 'light',
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? 'ライトモードへ切り替え' : 'ダークモードへ切り替え'}
      className="border-line bg-panel-strong text-muted hover:border-accent/35 hover:text-ink grid size-10 place-items-center rounded-xl border transition active:scale-95"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
