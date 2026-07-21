import { z } from 'zod';
import { pageTypeSchema } from './common';

const nonEmptyList = z.array(z.string().trim().min(1)).max(30);

export const jobResultSchema = z.object({
  company: z.string(),
  requiredSkills: nonEmptyList,
  preferredSkills: nonEmptyList,
  workStyle: z.string(),
  skillFitScore: z.number().int().min(0).max(100),
  conditionFitScore: z.number().int().min(0).max(100),
  appealPoints: nonEmptyList,
});

export const articleResultSchema = z.object({
  topic: z.string(),
  technicalPoints: nonEmptyList,
  prerequisites: nonEmptyList,
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  learningPriority: z.number().int().min(0).max(100),
});

export const githubResultSchema = z.object({
  overview: z.string(),
  techStack: nonEmptyList,
  architectureGuess: z.string(),
  hasTests: z.boolean().nullable(),
  improvementIdeas: nonEmptyList,
});

export const companyResultSchema = z.object({
  name: z.string(),
  valueProposition: z.string(),
  targetUsers: nonEmptyList,
  differentiators: nonEmptyList,
  researchNext: nonEmptyList,
});

export const generalResultSchema = z.object({
  purpose: z.string(),
  usefulness: z.string(),
  reliabilityNotes: nonEmptyList,
});

export const typeSpecificResultSchema = z.discriminatedUnion('pageType', [
  z.object({ pageType: z.literal('job'), data: jobResultSchema }),
  z.object({ pageType: z.literal('article'), data: articleResultSchema }),
  z.object({ pageType: z.literal('github'), data: githubResultSchema }),
  z.object({ pageType: z.literal('company'), data: companyResultSchema }),
  z.object({ pageType: z.literal('general'), data: generalResultSchema }),
]);

export const analysisResultSchema = z
  .object({
    pageType: pageTypeSchema,
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    keyPoints: nonEmptyList,
    risks: nonEmptyList,
    recommendedActions: nonEmptyList,
    recommendationScore: z.number().int().min(0).max(100),
    confidence: z.number().min(0).max(1),
    missingInformation: nonEmptyList,
    tags: nonEmptyList,
    typeSpecificResult: typeSpecificResultSchema,
  })
  .superRefine((value, context) => {
    if (value.pageType !== value.typeSpecificResult.pageType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['typeSpecificResult', 'pageType'],
        message: 'ページ種別と固有結果の種別が一致しません。',
      });
    }
  });

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
