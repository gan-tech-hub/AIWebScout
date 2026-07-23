import { z } from 'zod';
import { CAPTURE_LIMITS } from '../constants/limits';
import { isoDateTimeSchema, sourceTypeSchema } from './common';

const httpUrlSchema = z
  .string()
  .url()
  .max(CAPTURE_LIMITS.url)
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'HTTPまたはHTTPSのURLを指定してください。',
  });

export const capturePageInputSchema = z.object({
  title: z.string().trim().min(1).max(CAPTURE_LIMITS.title),
  url: httpUrlSchema,
  pageText: z.string().trim().max(CAPTURE_LIMITS.pageText),
  selectedText: z.string().trim().max(CAPTURE_LIMITS.selectedText).default(''),
  metaDescription: z
    .string()
    .trim()
    .max(CAPTURE_LIMITS.metaDescription)
    .default(''),
  sourceType: sourceTypeSchema.default('chrome_extension'),
  capturedAt: isoDateTimeSchema,
});

export const captureAnalyzeDataSchema = z.object({
  capturedPageId: z.string().uuid(),
  analysisId: z.string().uuid(),
  status: z.enum(['pending', 'running', 'completed']),
});

export type CapturePageInput = z.infer<typeof capturePageInputSchema>;
export type CaptureAnalyzeData = z.infer<typeof captureAnalyzeDataSchema>;
