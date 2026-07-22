import type {
  AgentStepStatus,
  AnalysisStatus,
  PageType,
} from '@ai-web-scout/shared';
import { cn } from '@/lib/utils';

const statusClass = {
  pending: 'bg-slate-400/10 text-slate-400 ring-slate-400/20',
  running: 'bg-cyan-400/10 text-cyan-500 ring-cyan-400/25',
  completed: 'bg-emerald-400/10 text-emerald-500 ring-emerald-400/25',
  failed: 'bg-rose-400/10 text-rose-500 ring-rose-400/25',
  skipped: 'bg-amber-400/10 text-amber-500 ring-amber-400/25',
  needs_confirmation: 'bg-violet-400/10 text-violet-500 ring-violet-400/25',
} satisfies Record<AgentStepStatus, string>;

export function StatusBadge({
  status,
}: {
  status: AgentStepStatus | AnalysisStatus;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset',
        statusClass[status],
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full bg-current',
          status === 'running' && 'animate-pulse',
        )}
      />
      {status.replace('_', ' ')}
    </span>
  );
}

const pageTypeLabels: Record<PageType, string> = {
  job: 'JOB',
  article: 'ARTICLE',
  github: 'GITHUB',
  company: 'COMPANY',
  general: 'GENERAL',
};

export function PageTypeBadge({ pageType }: { pageType: PageType }) {
  return (
    <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-violet-500">
      {pageTypeLabels[pageType]}
    </span>
  );
}
