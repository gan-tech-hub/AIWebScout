'use client';

import type { AnalysisStatus, PageType } from '@ai-web-scout/shared';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { AnalysisCard } from './analysis-card';
import { filterAnalyses } from './filter-analyses';
import { mockAnalyses } from './mock-data';
import type { AnalysisFilters } from './types';

const initialFilters: AnalysisFilters = {
  query: '',
  pageType: 'all',
  status: 'all',
  sort: 'newest',
};
const selectClass =
  'h-11 rounded-xl border border-line bg-panel-strong px-3 text-xs text-ink outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-accent/15';

export function HistoryView() {
  const [filters, setFilters] = useState(initialFilters);
  const results = useMemo(
    () => filterAnalyses(mockAnalyses, filters),
    [filters],
  );
  const hasFilters =
    filters.query ||
    filters.pageType !== 'all' ||
    filters.status !== 'all' ||
    filters.sort !== 'newest';
  return (
    <div>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-accent flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]">
            <SlidersHorizontal className="size-4" /> Analysis archive
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            分析履歴
          </h1>
          <p className="text-muted mt-2 text-sm">
            過去のスカウト結果を検索し、判断の根拠までいつでも振り返れます。
          </p>
        </div>
        <div className="text-muted text-xs">
          <span className="text-ink text-2xl font-semibold">
            {results.length}
          </span>{' '}
          / {mockAnalyses.length} results
        </div>
      </header>
      <Surface className="mt-7 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_170px_170px_150px_auto]">
          <label className="relative">
            <span className="sr-only">キーワード検索</span>
            <Search className="text-muted absolute left-3.5 top-1/2 size-4 -translate-y-1/2" />
            <input
              value={filters.query}
              onChange={(event) =>
                setFilters({ ...filters, query: event.target.value })
              }
              placeholder="タイトル、URL、タグを検索"
              className="border-line bg-panel-strong placeholder:text-muted/65 focus:border-accent/50 focus:ring-accent/15 h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none focus:ring-2"
            />
          </label>
          <select
            aria-label="ページ種別"
            value={filters.pageType}
            onChange={(e) =>
              setFilters({
                ...filters,
                pageType: e.target.value as PageType | 'all',
              })
            }
            className={selectClass}
          >
            <option value="all">すべてのページ種別</option>
            <option value="job">求人・副業</option>
            <option value="article">技術記事</option>
            <option value="github">GitHub</option>
            <option value="company">企業・サービス</option>
            <option value="general">一般ページ</option>
          </select>
          <select
            aria-label="ステータス"
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as AnalysisStatus | 'all',
              })
            }
            className={selectClass}
          >
            <option value="all">すべてのステータス</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            aria-label="並び順"
            value={filters.sort}
            onChange={(e) =>
              setFilters({
                ...filters,
                sort: e.target.value as AnalysisFilters['sort'],
              })
            }
            className={selectClass}
          >
            <option value="newest">新しい順</option>
            <option value="oldest">古い順</option>
            <option value="score">スコア順</option>
          </select>
          {hasFilters && (
            <Button variant="ghost" onClick={() => setFilters(initialFilters)}>
              <X className="size-4" /> Reset
            </Button>
          )}
        </div>
      </Surface>
      {results.length ? (
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {results.map((item, index) => (
            <AnalysisCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : (
        <Surface className="mt-5 grid min-h-64 place-items-center border-dashed p-8 text-center">
          <div>
            <span className="bg-panel-hover text-muted mx-auto grid size-12 place-items-center rounded-2xl">
              <Filter className="size-5" />
            </span>
            <p className="mt-4 text-sm font-medium">
              条件に一致する分析がありません
            </p>
            <p className="text-muted mt-2 text-xs">
              検索語またはフィルターを変更してください。
            </p>
            <Button
              className="mt-5"
              variant="secondary"
              size="sm"
              onClick={() => setFilters(initialFilters)}
            >
              フィルターをクリア
            </Button>
          </div>
        </Surface>
      )}
    </div>
  );
}
