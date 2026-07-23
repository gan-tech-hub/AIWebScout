import { z } from 'zod';
import { pageTypeSchema } from './common';

export const pageClassificationSchema = z.object({
  pageType: pageTypeSchema,
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string().trim().min(1)).max(8),
  profileRecommended: z.boolean(),
});

export const profileToolArgumentsSchema = z.object({
  reason: z.string().trim().min(1).max(300),
});

export type PageClassification = z.infer<typeof pageClassificationSchema>;
export type ProfileToolArguments = z.infer<typeof profileToolArgumentsSchema>;
