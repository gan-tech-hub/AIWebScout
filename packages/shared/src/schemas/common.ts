import { z } from 'zod';

export const pageTypeSchema = z.enum([
  'job',
  'article',
  'github',
  'company',
  'general',
]);

export const analysisStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
]);

export const agentStepStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
  'needs_confirmation',
]);

export const sourceTypeSchema = z.enum(['chrome_extension', 'web']);

export const isoDateTimeSchema = z.string().datetime({ offset: true });

export type PageType = z.infer<typeof pageTypeSchema>;
export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
export type AgentStepStatus = z.infer<typeof agentStepStatusSchema>;
export type CaptureSourceType = z.infer<typeof sourceTypeSchema>;
