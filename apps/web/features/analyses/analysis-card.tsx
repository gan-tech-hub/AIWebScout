'use client';

import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { PageTypeBadge, StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { AnalysisListItem } from './types';

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function AnalysisCard({
  item,
  index = 0,
}: {
  item: AnalysisListItem;
  index?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.055, 0.25) }}
      className="border-line bg-panel-strong hover:border-accent/30 hover:shadow-panel group rounded-2xl border p-4 transition hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <PageTypeBadge pageType={item.pageType} />
        <StatusBadge status={item.status} />
        <span className="text-muted ml-auto flex items-center gap-1.5 text-[11px]">
          <CalendarDays className="size-3" />
          {dateFormatter.format(new Date(item.createdAt))}
        </span>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{item.title}</h3>
          <p className="text-muted mt-2 line-clamp-2 text-xs leading-5">
            {item.summary}
          </p>
        </div>
        <div
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-2xl border text-sm font-semibold',
            item.recommendationScore === null
              ? 'border-line text-muted'
              : item.recommendationScore >= 85
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-500'
                : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-500',
          )}
        >
          {item.recommendationScore ?? '—'}
        </div>
      </div>
      <div className="border-line mt-4 flex items-center gap-2 border-t pt-3">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="bg-panel-hover text-muted rounded-md px-2 py-1 text-[10px]"
          >
            #{tag}
          </span>
        ))}
        <Link
          href={`/analyses/${item.id}`}
          className="text-muted group-hover:text-accent ml-auto flex items-center gap-1 text-xs font-medium transition"
        >
          詳細を見る <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
