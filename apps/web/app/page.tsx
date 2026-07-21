import {
  Activity,
  ArrowUpRight,
  Clock3,
  Radar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';

const stages = [
  {
    label: 'Browser capture',
    detail: '確認済みページの入力を待機中',
    state: 'ready',
  },
  {
    label: 'Content parsing',
    detail: 'プライバシーに配慮して本文を整形',
    state: 'guarded',
  },
  {
    label: 'Agent analysis',
    detail: '上限付きの構造化ワークフロー',
    state: 'bounded',
  },
  {
    label: 'Final insight',
    detail: '根拠と結びついた推奨結果',
    state: 'structured',
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-violet-300">
            <Radar className="size-4" /> Mission control
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Turn browsing into
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              decisions that move.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            AI Web
            Scoutは、あなたが確認したページ情報だけを読み取ります。取得した情報が
            価値あるインサイトへ変わるまでの、安全なエージェント処理を可視化します。
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200">
          <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />{' '}
          Systems ready
        </div>
      </header>

      <section className="mt-9 grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="absolute -right-24 -top-24 size-64 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Agent pipeline</p>
              <p className="mt-1 text-xs text-white/40">
                ページ取得から最終判断までの流れを、透明性のある形で表示します
              </p>
            </div>
            <Activity className="size-5 text-violet-300" />
          </div>
          <div className="relative mt-8 grid gap-3 md:grid-cols-4">
            {stages.map((stage, index) => (
              <div
                key={stage.label}
                className="group relative rounded-2xl border border-white/10 bg-black/20 p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-white/30">
                    0{index + 1}
                  </span>
                  <span className="size-2 rounded-full bg-violet-300/80 shadow-[0_0_10px_#c4b5fd]" />
                </div>
                <p className="mt-7 text-sm font-medium">{stage.label}</p>
                <p className="mt-2 text-xs leading-5 text-white/40">
                  {stage.detail}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-white/45">
                  {stage.state}
                </span>
                {index < stages.length - 1 && (
                  <ArrowUpRight className="absolute -right-2 top-1/2 z-10 hidden size-4 text-violet-300/50 md:block" />
                )}
              </div>
            ))}
          </div>
        </article>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-violet-500/15 to-transparent p-6 backdrop-blur-xl">
            <Sparkles className="size-5 text-violet-300" />
            <p className="mt-8 text-3xl font-semibold">5</p>
            <p className="mt-1 text-sm text-white/45">
              ページ種別ごとの分析戦略
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
            <ShieldCheck className="size-5 text-cyan-300" />
            <p className="mt-8 text-sm font-medium">Privacy by default</p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              プレーンテキスト、送信前確認、文字数制限、サーバーだけで扱う機密情報。
            </p>
          </div>
        </aside>
      </section>

      <section className="mt-4 rounded-[28px] border border-dashed border-white/15 bg-black/10 px-6 py-12 text-center backdrop-blur-md">
        <Clock3 className="mx-auto size-6 text-white/25" />
        <p className="mt-4 text-sm font-medium">分析履歴はまだありません</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/40">
          Chrome拡張のSide
          Panelでページ情報を確認し、最初の分析を実行してください。
          分析結果はここに蓄積されます。
        </p>
      </section>
    </AppShell>
  );
}
