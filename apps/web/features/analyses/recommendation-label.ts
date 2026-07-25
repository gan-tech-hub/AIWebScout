import type { PageType } from '@ai-web-scout/shared';

type RecommendationBand = 'strong' | 'recommended' | 'consider' | 'low';

const LABELS_BY_PAGE_TYPE: Record<
  PageType,
  Record<RecommendationBand, string>
> = {
  job: {
    strong: '応募を強く推奨',
    recommended: '応募を推奨',
    consider: '条件を確認して応募を検討',
    low: '今回は慎重な検討を推奨',
  },
  article: {
    strong: '保存・学習を強く推奨',
    recommended: '保存・学習を推奨',
    consider: '必要に応じて参照を推奨',
    low: '学習優先度は低め',
  },
  github: {
    strong: '調査・活用を強く推奨',
    recommended: '調査・活用を推奨',
    consider: '目的に合えば検証を推奨',
    low: '活用優先度は低め',
  },
  company: {
    strong: '追加調査を強く推奨',
    recommended: '追加調査を推奨',
    consider: '関心があれば情報収集を推奨',
    low: '調査優先度は低め',
  },
  general: {
    strong: '確認・活用を強く推奨',
    recommended: '確認・活用を推奨',
    consider: '必要に応じて参照を推奨',
    low: '確認優先度は低め',
  },
};

function getRecommendationBand(score: number): RecommendationBand {
  if (score >= 85) return 'strong';
  if (score >= 70) return 'recommended';
  if (score >= 50) return 'consider';
  return 'low';
}

export function getRecommendationLabel(
  pageType: PageType,
  score: number | null,
): string {
  if (score === null) return '推奨度を算出できません';
  return LABELS_BY_PAGE_TYPE[pageType][getRecommendationBand(score)];
}
