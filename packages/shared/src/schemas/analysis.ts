import { z } from 'zod';
import { pageTypeSchema } from './common';

const nonEmptyList = z.array(z.string().trim().min(1)).max(30);

export const jobResultSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  responsibilities: nonEmptyList,
  requiredSkills: nonEmptyList,
  preferredSkills: nonEmptyList,
  compensation: z.string(),
  workingHours: z.string(),
  workStyle: z.string(),
  remotePolicy: z.string(),
  meetingConditions: z.string(),
  contractType: z.string(),
  skillFitScore: z.number().int().min(0).max(100),
  conditionFitScore: z.number().int().min(0).max(100),
  careerValue: z.string(),
  concerns: nonEmptyList,
  applicationRecommendation: z.string(),
  appealPoints: nonEmptyList,
  nextQuestions: nonEmptyList,
});

export const articleResultSchema = z.object({
  topic: z.string(),
  overview: z.string(),
  technicalPoints: nonEmptyList,
  prerequisites: nonEmptyList,
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  practicalApplications: nonEmptyList,
  skillRelevance: z.string(),
  learningPriority: z.number().int().min(0).max(100),
  nextLearningTopics: nonEmptyList,
  saveRecommendation: z.string(),
});

export const githubResultSchema = z.object({
  overview: z.string(),
  techStack: nonEmptyList,
  directoryStructure: nonEmptyList,
  architectureGuess: z.string(),
  mainFeatures: nonEmptyList,
  codeQualityNotes: nonEmptyList,
  readmeQuality: z.string(),
  hasTests: z.boolean().nullable(),
  learningValue: z.string(),
  improvementIdeas: nonEmptyList,
  skillRelevance: z.string(),
});

export const companyResultSchema = z.object({
  name: z.string(),
  valueProposition: z.string(),
  mainFeatures: nonEmptyList,
  targetUsers: nonEmptyList,
  businessModelGuess: z.string(),
  technicalHighlights: nonEmptyList,
  differentiators: nonEmptyList,
  userRelevance: z.string(),
  reasonsToExplore: nonEmptyList,
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
