import { describe, expect, it } from 'vitest';
import { filterAnalyses } from './filter-analyses';
import { mockAnalyses } from './mock-data';

describe('filterAnalyses', () => {
  it('タイトル、概要、URL、タグをキーワード検索できる', () => {
    expect(
      filterAnalyses(mockAnalyses, {
        query: 'evaluation',
        pageType: 'all',
        status: 'all',
        sort: 'newest',
      }).map((item) => item.id),
    ).toEqual(['demo-article-analysis']);
  });

  it('ページ種別とステータスを同時に絞り込める', () => {
    expect(
      filterAnalyses(mockAnalyses, {
        query: '',
        pageType: 'github',
        status: 'running',
        sort: 'newest',
      }),
    ).toHaveLength(1);
    expect(
      filterAnalyses(mockAnalyses, {
        query: '',
        pageType: 'github',
        status: 'failed',
        sort: 'newest',
      }),
    ).toHaveLength(0);
  });

  it('おすすめ度の高い順に並べ、未採点を末尾にする', () => {
    const result = filterAnalyses(mockAnalyses, {
      query: '',
      pageType: 'all',
      status: 'all',
      sort: 'score',
    });
    expect(result[0]?.recommendationScore).toBe(92);
    expect(result.at(-1)?.recommendationScore).toBeNull();
  });

  it('古い順に並べ替えられる', () => {
    const result = filterAnalyses(mockAnalyses, {
      query: '',
      pageType: 'all',
      status: 'all',
      sort: 'oldest',
    });
    expect(result[0]?.id).toBe('demo-general-analysis');
  });
});
