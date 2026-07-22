'use client';

import {
  Binoculars,
  History,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const navigation = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Analyses', href: '/analyses', icon: History },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="mt-9 space-y-1.5" aria-label="Main navigation">
      {navigation.map(({ label, href, icon: Icon }) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            {...(active ? { 'aria-current': 'page' as const } : {})}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
              active
                ? 'bg-accent/10 text-ink ring-accent/15 ring-1 ring-inset'
                : 'text-muted hover:bg-panel-hover hover:text-ink',
            )}
          >
            <Icon
              className={cn('size-4 transition', active && 'text-accent')}
            />
            {label}
            {active && (
              <span className="bg-accent shadow-glow ml-auto size-1.5 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 text-sm font-semibold tracking-wide"
    >
      <span className="bg-accent/15 text-accent shadow-glow grid size-10 place-items-center rounded-2xl">
        <Binoculars className="size-5" />
      </span>
      <span>AI WEB SCOUT</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-line bg-sidebar sticky top-0 hidden h-screen border-r px-5 py-7 backdrop-blur-2xl lg:block">
        <Brand />
        <Navigation />
        <div className="border-accent/20 bg-accent/[0.07] absolute inset-x-5 bottom-7 rounded-2xl border p-4">
          <Sparkles className="text-accent size-4" />
          <p className="mt-3 text-sm font-medium">Agent-ready foundation</p>
          <p className="text-muted mt-1 text-xs leading-relaxed">
            ページ情報を安全に読み取り、目的別の分析から次のアクションへつなげます。
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-line bg-canvas/75 sticky top-0 z-40 flex h-16 items-center justify-between border-b px-5 backdrop-blur-xl lg:justify-end lg:px-8">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="メニューを開く"
              className="border-line bg-panel-strong text-muted grid size-10 place-items-center rounded-xl border lg:hidden"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </header>
        <main className="min-w-0 px-4 py-6 sm:px-7 lg:px-9 lg:py-8">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="メニューを閉じる"
          />
          <aside className="border-line bg-canvas absolute inset-y-0 right-0 w-[min(84vw,320px)] border-l p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                aria-label="メニューを閉じる"
                onClick={() => setMobileOpen(false)}
                className="bg-panel-strong grid size-9 place-items-center rounded-xl"
              >
                <X className="size-4" />
              </button>
            </div>
            <Navigation onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
