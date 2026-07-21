import {
  Binoculars,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Analyses', href: '/analyses', icon: History },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-white/10 bg-black/10 px-5 py-7 backdrop-blur-xl lg:block">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-wide"
        >
          <span className="shadow-glow grid size-10 place-items-center rounded-2xl bg-violet-500/20 text-violet-300">
            <Binoculars className="size-5" />
          </span>
          <span>AI WEB SCOUT</span>
        </Link>
        <nav className="mt-10 space-y-2" aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-12 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
          <Sparkles className="size-4 text-violet-300" />
          <p className="mt-3 text-sm font-medium">Agent-ready foundation</p>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            ページの情報を安全に読み取り、分類・分析して、次のアクションへつなげます。
          </p>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
        {children}
      </main>
    </div>
  );
}
