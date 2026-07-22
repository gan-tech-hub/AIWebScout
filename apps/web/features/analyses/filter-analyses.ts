import type { AnalysisFilters, AnalysisListItem } from './types';

export function filterAnalyses(
  items: AnalysisListItem[],
  filters: AnalysisFilters,
) {
  const query = filters.query.trim().toLocaleLowerCase('ja');
  return items
    .filter((item) => {
      const matchesQuery =
        !query ||
        [item.title, item.summary, item.url, ...item.tags].some((value) =>
          value.toLocaleLowerCase('ja').includes(query),
        );
      const matchesType =
        filters.pageType === 'all' || item.pageType === filters.pageType;
      const matchesStatus =
        filters.status === 'all' || item.status === filters.status;
      return matchesQuery && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (filters.sort === 'score')
        return (b.recommendationScore ?? -1) - (a.recommendationScore ?? -1);
      const direction = filters.sort === 'newest' ? -1 : 1;
      return (
        direction *
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      );
    });
}
