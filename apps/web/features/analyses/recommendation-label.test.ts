import { describe, expect, it } from 'vitest';
import { getRecommendationLabel } from './recommendation-label';

describe('getRecommendationLabel', () => {
  it.each([
    [85, '応募を強く推奨'],
    [84, '応募を推奨'],
    [70, '応募を推奨'],
    [69, '条件を確認して応募を検討'],
    [50, '条件を確認して応募を検討'],
    [49, '今回は慎重な検討を推奨'],
  ] as const)('maps job score %i to the expected label', (score, expected) => {
    expect(getRecommendationLabel('job', score)).toBe(expected);
  });

  it.each([
    ['article', 90, '保存・学習を強く推奨'],
    ['github', 75, '調査・活用を推奨'],
    ['company', 60, '関心があれば情報収集を推奨'],
    ['general', 30, '確認優先度は低め'],
  ] as const)(
    'uses page-specific wording for %s',
    (pageType, score, expected) => {
      expect(getRecommendationLabel(pageType, score)).toBe(expected);
    },
  );

  it('does not present an unavailable score as a negative recommendation', () => {
    expect(getRecommendationLabel('job', null)).toBe('推奨度を算出できません');
  });
});
