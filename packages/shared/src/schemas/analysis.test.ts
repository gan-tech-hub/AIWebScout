import { describe, expect, it } from 'vitest';
import { pageClassificationSchema } from './agent';
import { analysisResultSchema } from './analysis';

describe('AI structured output schemas', () => {
  it('parses a complete job analysis', () => {
    expect(
      analysisResultSchema.parse({
        pageType: 'job',
        title: 'Backend Engineer',
        summary: 'TypeScriptの業務委託案件です。',
        keyPoints: ['週3日'],
        risks: ['契約条件の確認が必要'],
        recommendedActions: ['面談で条件を確認する'],
        recommendationScore: 82,
        confidence: 0.91,
        missingInformation: ['契約期間'],
        tags: ['typescript', 'remote'],
        typeSpecificResult: {
          pageType: 'job',
          data: {
            jobTitle: 'Backend Engineer',
            company: 'Example Inc.',
            responsibilities: ['API開発'],
            requiredSkills: ['TypeScript'],
            preferredSkills: ['Next.js'],
            compensation: '月80万円',
            workingHours: '週3日',
            workStyle: '業務委託',
            remotePolicy: 'フルリモート',
            meetingConditions: '週1回',
            contractType: '準委任',
            skillFitScore: 85,
            conditionFitScore: 80,
            careerValue: '設計経験を伸ばせる',
            concerns: ['契約期間が不明'],
            applicationRecommendation: '応募推奨',
            appealPoints: ['TypeScript経験'],
            nextQuestions: ['契約期間は何か'],
          },
        },
      }).pageType,
    ).toBe('job');
  });

  it('rejects a mismatched type-specific result', () => {
    expect(() =>
      analysisResultSchema.parse({
        pageType: 'article',
        title: 'Article',
        summary: 'Summary',
        keyPoints: [],
        risks: [],
        recommendedActions: [],
        recommendationScore: 50,
        confidence: 0.5,
        missingInformation: [],
        tags: [],
        typeSpecificResult: {
          pageType: 'general',
          data: {
            purpose: 'Information',
            usefulness: 'Useful',
            reliabilityNotes: [],
          },
        },
      }),
    ).toThrow();
  });

  it('bounds classification confidence', () => {
    expect(() =>
      pageClassificationSchema.parse({
        pageType: 'general',
        confidence: 1.2,
        reasons: ['General'],
        profileRecommended: false,
      }),
    ).toThrow();
  });
});
