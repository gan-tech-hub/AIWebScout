'use client';

import {
  Activity,
  ArrowRight,
  BarChart3,
  Clock3,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import type { PageType } from '@ai-web-scout/shared';
import { AnalysisCard } from '@/features/analyses/analysis-card';
import type { AnalysisListItem } from '@/features/analyses/types';
import { Surface } from '@/components/ui/surface';

const stages = [
  {
    label: 'Browser Capture',
    detail: '閲覧ページをユーザー確認のうえ取得',
    state: 'READY',
  },
  {
    label: 'Content Parsing',
    detail: 'プライバシーに配慮して本文を整形',
    state: 'GUARDED',
  },
  {
    label: 'Agent Analysis',
    detail: '上限付きの構造化ワークフロー',
    state: 'BOUNDED',
  },
  {
    label: 'Final Insight',
    detail: '根拠と次の行動が分かる分析結果',
    state: 'STRUCTURED',
  },
];

const typeDefinitions: Array<{
  type: PageType;
  label: string;
  color: string;
}> = [
  { type: 'job', label: 'Job', color: 'bg-violet-400' },
  { type: 'article', label: 'Article', color: 'bg-cyan-400' },
  { type: 'github', label: 'GitHub', color: 'bg-fuchsia-400' },
  { type: 'company', label: 'Company', color: 'bg-amber-400' },
  { type: 'general', label: 'General', color: 'bg-slate-400' },
];

export function DashboardView({ analyses }: { analyses: AnalysisListItem[] }) {
  const typeStats = typeDefinitions.map((definition) => ({
    ...definition,
    value: analyses.filter((item) => item.pageType === definition.type).length,
  }));
  const scores = analyses
    .map((item) => item.recommendationScore)
    .filter((score): score is number => score !== null);
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]">
            <Radar className="size-4" /> Mission control
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Turn browsing into
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              decisions that move.
            </span>
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-sm leading-6">
            閲覧ページの情報がAIエージェントを通り、判断に使えるインサイトへ変わるまでをひとつのワークスペースで追跡できます。
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-500">
          <span className="size-2 rounded-full bg-current shadow-[0_0_12px_currentColor]" />{' '}
          Systems ready
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.5fr)]">
        <Surface className="relative overflow-hidden p-5 sm:p-7">
          <div className="absolute -right-20 -top-20 size-56 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Agent pipeline</p>
              <p className="text-muted mt-1 text-xs">
                取得から最終判断まで、安全で再現可能な処理フロー
              </p>
            </div>
            <Activity className="text-accent size-5" />
          </div>
          <div className="relative mt-7 grid gap-3 md:grid-cols-4">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                className="border-line bg-panel-strong hover:border-accent/30 group relative rounded-2xl border p-4 transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted font-mono text-[10px]">
                    0{index + 1}
                  </span>
                  <span className="bg-accent size-2 rounded-full shadow-[0_0_10px_currentColor]" />
                </div>
                <p className="mt-6 text-sm font-medium">{stage.label}</p>
                <p className="text-muted mt-2 text-xs leading-5">
                  {stage.detail}
                </p>
                <span className="bg-panel-hover text-muted mt-4 inline-flex rounded-full px-2 py-1 text-[9px] tracking-wider">
                  {stage.state}
                </span>
                {index < stages.length - 1 && (
                  <ArrowRight className="text-accent absolute -right-2.5 top-1/2 z-10 hidden size-4 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </Surface>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Surface className="p-5">
            <div className="flex items-center justify-between">
              <Sparkles className="text-accent size-5" />
              <span className="text-muted text-[10px] tracking-widest">
                THIS MONTH
              </span>
            </div>
            <p className="mt-7 text-4xl font-semibold">{analyses.length}</p>
            <p className="text-muted mt-1 text-sm">分析したページ</p>
            <div className="bg-panel-hover mt-5 flex h-1.5 overflow-hidden rounded-full">
              {typeStats.map((stat) => (
                <span
                  key={stat.label}
                  className={stat.color}
                  style={{
                    width: `${analyses.length ? (stat.value / analyses.length) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {typeStats.slice(0, 4).map((stat) => (
                <div
                  key={stat.label}
                  className="text-muted flex items-center gap-2 text-[10px]"
                >
                  <span className={`size-1.5 rounded-full ${stat.color}`} />
                  {stat.label}{' '}
                  <span className="text-ink ml-auto">{stat.value}</span>
                </div>
              ))}
            </div>
          </Surface>
          <Surface className="p-5">
            <div className="flex items-center justify-between">
              <Target className="size-5 text-cyan-500" />
              <span className="text-muted text-[10px] tracking-widest">
                AVG SCORE
              </span>
            </div>
            <p className="mt-7 text-4xl font-semibold">
              {averageScore}
              <span className="text-muted text-base">/100</span>
            </p>
            <p className="text-muted mt-1 text-sm">平均おすすめ度</p>
            <div className="bg-panel-hover mt-4 h-1.5 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${averageScore}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
              />
            </div>
          </Surface>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold">Recent analyses</p>
            <p className="text-muted mt-1 text-xs">
              最近スカウトしたページと分析状況
            </p>
          </div>
          <Link
            href="/analyses"
            className="text-muted hover:text-accent flex items-center gap-1 text-xs font-medium transition"
          >
            すべて見る <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {analyses.slice(0, 4).map((item, index) => (
            <AnalysisCard key={item.id} item={item} index={index} />
          ))}
          {analyses.length === 0 && (
            <Surface className="text-muted border-dashed p-6 text-sm xl:col-span-2">
              Chrome拡張から最初のページを分析すると、ここに結果が表示されます。
            </Surface>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Surface className="flex items-center gap-4 p-5">
          <div className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-500">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <p className="text-xs font-medium">Privacy by default</p>
            <p className="text-muted mt-1 text-[11px]">
              送信前確認とプレーンテキスト処理
            </p>
          </div>
        </Surface>
        <Surface className="flex items-center gap-4 p-5">
          <div className="grid size-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-500">
            <Clock3 className="size-4" />
          </div>
          <div>
            <p className="text-xs font-medium">Bounded workflow</p>
            <p className="text-muted mt-1 text-[11px]">
              処理回数とツール実行を制御
            </p>
          </div>
        </Surface>
        <Surface className="flex items-center gap-4 p-5">
          <div className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-500">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <p className="text-xs font-medium">Structured insight</p>
            <p className="text-muted mt-1 text-[11px]">
              検証可能なJSON形式で保存
            </p>
          </div>
        </Surface>
      </section>
    </div>
  );
}
