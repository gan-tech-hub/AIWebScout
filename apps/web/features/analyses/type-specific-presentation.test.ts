import type { AnalysisResult } from '@ai-web-scout/shared';
import { describe, expect, it } from 'vitest';
import { toTypeSpecificEntries } from './type-specific-presentation';

type TypeSpecificResult = AnalysisResult['typeSpecificResult'];

function present(result: TypeSpecificResult) {
  return Object.fromEntries(
    toTypeSpecificEntries(result).map((entry) => [entry.label, entry.value]),
  );
}

describe('toTypeSpecificEntries', () => {
  it('presents every job field with Japanese labels and score units', () => {
    const entries = toTypeSpecificEntries({
      pageType: 'job',
      data: {
        jobTitle: 'Frontend Engineer',
        company: 'Scout Inc.',
        responsibilities: ['UI開発'],
        requiredSkills: ['TypeScript'],
        preferredSkills: ['Next.js'],
        compensation: '月80万円',
        workingHours: '週5日',
        workStyle: '業務委託',
        remotePolicy: 'フルリモート',
        meetingConditions: '週1回',
        contractType: '準委任',
        skillFitScore: 88,
        conditionFitScore: 76,
        careerValue: '設計経験を伸ばせる',
        concerns: ['稼働時間が長い'],
        applicationRecommendation: '応募を推奨',
        appealPoints: ['React経験'],
        nextQuestions: ['開発体制'],
      },
    });

    expect(entries).toHaveLength(18);
    expect(Object.fromEntries(entries.map((entry) => [entry.label, entry.value])))
      .toMatchObject({
        案件タイトル: 'Frontend Engineer',
        必須スキル: 'TypeScript',
        スキル適合度: '88 / 100',
        条件適合度: '76 / 100',
        次に確認すべき事項: '開発体制',
      });
  });

  it('localizes article difficulty and learning priority', () => {
    const values = present({
      pageType: 'article',
      data: {
        topic: 'React Server Components',
        overview: '仕組みを解説する記事',
        technicalPoints: ['Server Components'],
        prerequisites: ['React'],
        difficulty: 'intermediate',
        practicalApplications: ['配信量削減'],
        skillRelevance: '関連性が高い',
        learningPriority: 82,
        nextLearningTopics: ['Server Actions'],
        saveRecommendation: '保存を推奨',
      },
    });

    expect(values['難易度']).toBe('中級');
    expect(values['学習優先度']).toBe('82 / 100');
  });

  it.each([
    [true, 'あり'],
    [false, 'なし'],
    [null, '不明'],
  ] as const)('formats GitHub test status %s as %s', (hasTests, expected) => {
    const values = present({
      pageType: 'github',
      data: {
        overview: '概要',
        techStack: ['TypeScript'],
        directoryStructure: ['apps/'],
        architectureGuess: 'Monorepo',
        mainFeatures: ['分析'],
        codeQualityNotes: ['型安全'],
        readmeQuality: '充実',
        hasTests,
        learningValue: '高い',
        improvementIdeas: ['E2E追加'],
        skillRelevance: '高い',
      },
    });

    expect(values['テストの有無']).toBe(expected);
  });

  it('uses Japanese labels for company fields', () => {
    const values = present({
      pageType: 'company',
      data: {
        name: 'Scout Inc.',
        valueProposition: '意思決定を支援',
        mainFeatures: ['AI分析'],
        targetUsers: ['開発者'],
        businessModelGuess: 'SaaS',
        technicalHighlights: ['LLM'],
        differentiators: ['可視化'],
        userRelevance: '高い',
        reasonsToExplore: ['学習価値'],
        researchNext: ['料金'],
      },
    });

    expect(values).toMatchObject({
      '企業・サービス名': 'Scout Inc.',
      提供価値: '意思決定を支援',
      主な機能: 'AI分析',
      追加調査すべき内容: '料金',
    });
    expect(values).not.toHaveProperty('valueProposition');
  });

  it('uses Japanese labels for general page fields', () => {
    const values = present({
      pageType: 'general',
      data: {
        purpose: '情報提供',
        usefulness: '参考になる',
        reliabilityNotes: ['公開日を確認'],
      },
    });

    expect(values).toEqual({
      ページの目的: '情報提供',
      ユーザーにとっての有用性: '参考になる',
      信頼性に関する注意点: '公開日を確認',
    });
  });
});
