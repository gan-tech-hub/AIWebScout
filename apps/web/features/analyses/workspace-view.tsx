'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageTypeBadge, StatusBadge } from '@/components/ui/status-badge';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';
import { demoWorkspace } from './mock-data';
import type { WorkspaceStep } from './types';

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function CaptureInspector() {
  const page = demoWorkspace.capturedPage;
  const [expanded, setExpanded] = useState(false);
  return (
    <Surface className="h-fit overflow-hidden">
      <div className="border-line border-b p-4">
        <p className="text-muted flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <FileText className="size-4 text-cyan-500" /> Browser capture
        </p>
        <h2 className="mt-3 text-sm font-semibold leading-5">{page.title}</h2>
        <a
          href={page.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-1 truncate text-[11px] text-cyan-500 hover:underline"
        >
          {page.url}
          <ExternalLink className="size-3 shrink-0" />
        </a>
      </div>
      <div className="space-y-5 p-4">
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">
            Captured
          </p>
          <p className="mt-1 text-xs">
            {dateFormatter.format(new Date(page.capturedAt))}
          </p>
        </div>
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">
            Meta description
          </p>
          <p className="text-muted mt-2 text-xs leading-5">
            {page.metaDescription}
          </p>
        </div>
        <div>
          <p className="text-muted text-[10px] font-semibold uppercase tracking-widest">
            Selected text
          </p>
          <blockquote className="border-accent/50 text-ink/80 mt-2 border-l-2 pl-3 text-xs leading-5">
            {page.selectedText}
          </blockquote>
        </div>
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-widest"
          >
            Page text{' '}
            <ChevronDown
              className={cn('size-3.5 transition', expanded && 'rotate-180')}
            />
          </button>
          <p
            className={cn(
              'text-muted mt-2 text-xs leading-5',
              !expanded && 'line-clamp-4',
            )}
          >
            {page.excerpt}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-3 text-[11px] leading-5 text-emerald-600 dark:text-emerald-400">
          <span className="font-medium">Privacy guard:</span>{' '}
          フォーム入力値とHTMLは取得していません。
        </div>
      </div>
    </Surface>
  );
}

function StepNode({
  step,
  index,
  selected,
  onSelect,
}: {
  step: WorkspaceStep;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="relative pb-7 last:pb-0">
      <div
        className={cn(
          'bg-line absolute left-[21px] top-11 h-[calc(100%-28px)] w-px',
          index === demoWorkspace.steps.length - 1 && 'hidden',
        )}
      >
        <span
          className={cn(
            'to-accent/30 block h-full w-px origin-top bg-gradient-to-b from-emerald-400/80',
            step.status !== 'completed' && 'opacity-20',
          )}
        />
      </div>
      <motion.button
        whileHover={{ x: 2 }}
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'focus-visible:ring-accent/50 relative flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left outline-none transition focus-visible:ring-2',
          selected
            ? 'border-accent/35 bg-accent/[0.09] shadow-glow'
            : 'border-line bg-panel-strong hover:border-accent/20',
          step.status === 'running' && 'agent-running',
        )}
      >
        <span
          className={cn(
            'relative z-10 grid size-11 shrink-0 place-items-center rounded-xl border text-xs font-semibold',
            step.status === 'completed' &&
              'border-emerald-400/20 bg-emerald-400/10 text-emerald-500',
            step.status === 'running' &&
              'border-cyan-400/25 bg-cyan-400/10 text-cyan-500',
            step.status === 'failed' &&
              'border-rose-400/20 bg-rose-400/10 text-rose-500',
          )}
        >
          {step.status === 'completed' ? (
            <Check className="size-4" />
          ) : (
            String(index + 1).padStart(2, '0')
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{step.name}</span>
            <StatusBadge status={step.status} />
          </span>
          <span className="text-muted mt-1.5 block text-[11px] leading-4">
            {step.purpose}
          </span>
        </span>
        <ArrowRight className="text-muted mt-3 size-3.5 shrink-0" />
      </motion.button>
    </div>
  );
}

function StepDetails({ step }: { step: WorkspaceStep }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="border-line bg-panel-strong mt-4 rounded-2xl border p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold">{step.name} details</p>
            <p className="text-muted mt-1 text-[11px] leading-5">
              {step.description}
            </p>
          </div>
          <Bot className="text-accent size-4 shrink-0" />
        </div>
        <dl className="mt-4 grid gap-3 text-[11px] sm:grid-cols-2">
          <div className="bg-panel-hover rounded-xl p-3">
            <dt className="text-muted text-[9px] font-semibold uppercase tracking-widest">
              Input
            </dt>
            <dd className="mt-1.5 leading-4">{step.input}</dd>
          </div>
          <div className="bg-panel-hover rounded-xl p-3">
            <dt className="text-muted text-[9px] font-semibold uppercase tracking-widest">
              Output
            </dt>
            <dd className="mt-1.5 leading-4">{step.output}</dd>
          </div>
          <div className="text-muted flex items-center gap-2">
            <Wrench className="size-3.5" />
            <dt className="sr-only">使用ツール</dt>
            <dd>{step.tool}</dd>
          </div>
          <div className="text-muted flex items-center gap-2">
            <Clock3 className="size-3.5" />
            <dt className="sr-only">処理時間</dt>
            <dd>
              {step.durationMs === null
                ? '—'
                : `${step.durationMs.toLocaleString()} ms`}
            </dd>
          </div>
        </dl>
        {step.warning && (
          <p className="mt-3 flex gap-2 rounded-xl bg-amber-400/10 p-3 text-[11px] text-amber-500">
            <AlertTriangle className="size-3.5 shrink-0" />
            {step.warning}
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function AgentCanvas() {
  const [selectedId, setSelectedId] = useState('analysis');
  const selected = useMemo(
    () =>
      demoWorkspace.steps.find((step) => step.id === selectedId) ??
      demoWorkspace.steps[0]!,
    [selectedId],
  );
  return (
    <Surface className="relative overflow-hidden p-4 sm:p-5">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(hsl(var(--ink)/.12)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <Bot className="size-4" /> Agent workspace
            </p>
            <p className="text-muted mt-2 text-xs leading-5">
              ノードを選択すると、安全な処理ログの詳細を確認できます。
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-medium text-emerald-500">
            9 / 9 completed
          </span>
        </div>
        <div className="mt-6">
          {demoWorkspace.steps.map((step, index) => (
            <StepNode
              key={step.id}
              step={step}
              index={index}
              selected={selectedId === step.id}
              onSelect={() => setSelectedId(step.id)}
            />
          ))}
        </div>
        <StepDetails step={selected} />
      </div>
    </Surface>
  );
}

function InsightSection({
  title,
  icon,
  items,
  tone = 'default',
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone?: 'default' | 'risk' | 'action';
}) {
  return (
    <div>
      <p
        className={cn(
          'flex items-center gap-2 text-xs font-semibold',
          tone === 'risk'
            ? 'text-rose-500'
            : tone === 'action'
              ? 'text-cyan-500'
              : 'text-ink',
        )}
      >
        {icon}
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <motion.li
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + index * 0.06 }}
            key={item}
            className="text-muted flex gap-2 text-[11px] leading-5"
          >
            <span
              className={cn(
                'mt-2 size-1 shrink-0 rounded-full',
                tone === 'risk'
                  ? 'bg-rose-400'
                  : tone === 'action'
                    ? 'bg-cyan-400'
                    : 'bg-accent',
              )}
            />
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function FinalInsight() {
  const { item, insight } = demoWorkspace;
  return (
    <Surface className="h-fit overflow-hidden">
      <div className="border-line relative overflow-hidden border-b p-5">
        <div className="absolute -right-8 -top-10 size-36 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-500">
              <Sparkles className="size-4" /> Final insight
            </p>
            <PageTypeBadge pageType={item.pageType} />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 flex items-end gap-3"
          >
            <span className="text-6xl font-semibold tracking-tighter">
              {item.recommendationScore}
            </span>
            <span className="text-muted mb-2 text-xs">
              / 100
              <br />
              RECOMMENDED
            </span>
          </motion.div>
          <div className="bg-panel-hover mt-4 h-1.5 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.recommendationScore}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400"
            />
          </div>
          <p className="mt-5 text-sm font-semibold">応募を強く推奨</p>
          <p className="text-muted mt-2 text-xs leading-5">{item.summary}</p>
        </div>
      </div>
      <div className="space-y-6 p-5">
        <div className="grid grid-cols-2 gap-2">
          {insight.typeSpecific.map((entry, index) => (
            <motion.div
              key={entry.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-panel-hover rounded-xl p-3"
            >
              <p className="text-muted text-[9px] font-semibold uppercase tracking-wider">
                {entry.label}
              </p>
              <p className="mt-1.5 text-xs font-medium">{entry.value}</p>
            </motion.div>
          ))}
        </div>
        <InsightSection
          title="重要ポイント"
          icon={<Check className="size-3.5 text-emerald-500" />}
          items={insight.keyPoints}
        />
        <InsightSection
          title="リスク・懸念点"
          icon={<ShieldAlert className="size-3.5" />}
          items={insight.risks}
          tone="risk"
        />
        <InsightSection
          title="推奨アクション"
          icon={<ArrowRight className="size-3.5" />}
          items={insight.actions}
          tone="action"
        />
        <details className="border-line bg-panel-hover group rounded-xl border p-3">
          <summary className="cursor-pointer list-none text-xs font-semibold">
            分析根拠{' '}
            <span className="text-muted float-right">
              {insight.evidence.length} sources
            </span>
          </summary>
          <ul className="border-line mt-3 space-y-2 border-t pt-3">
            {insight.evidence.map((item) => (
              <li key={item} className="text-muted text-[11px] leading-5">
                “{item}”
              </li>
            ))}
          </ul>
        </details>
        <div className="border-line flex items-center justify-between rounded-xl border p-3">
          <span className="flex items-center gap-2 text-xs">
            <Gauge className="text-accent size-4" /> Confidence
          </span>
          <span className="text-sm font-semibold">
            {Math.round(insight.confidence * 100)}%
          </span>
        </div>
      </div>
    </Surface>
  );
}

export function WorkspaceView() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/analyses"
            className="text-muted hover:text-accent mb-4 inline-flex items-center gap-1.5 text-xs transition"
          >
            <ArrowLeft className="size-3.5" /> 分析履歴へ戻る
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <PageTypeBadge pageType={demoWorkspace.item.pageType} />
            <StatusBadge status={demoWorkspace.item.status} />
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {demoWorkspace.item.title}
          </h1>
          <p className="text-muted mt-2 text-xs">
            AIがページ情報を読み取り、判断を組み立てた流れを確認できます。
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setMessage('再分析リクエストを受け付けました（MVPモック）');
            window.setTimeout(() => setMessage(null), 2800);
          }}
        >
          <RefreshCw className="size-4" /> 再分析
        </Button>
      </header>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-600 dark:text-cyan-300"
        >
          {message}
        </motion.div>
      )}
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(230px,.65fr)_minmax(380px,1.05fr)_minmax(300px,.8fr)]">
        <CaptureInspector />
        <AgentCanvas />
        <FinalInsight />
      </div>
    </div>
  );
}
