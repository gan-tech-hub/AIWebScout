import { z } from 'zod';

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  bio: z.string().trim().max(2_000).default(''),
  skills: z.array(z.string().trim().min(1).max(100)).max(100),
  desiredConditions: z.record(z.unknown()).default({}),
  desiredHourlyRate: z.number().int().min(0).max(1_000_000).nullable(),
  availableHours: z.number().int().min(0).max(168).nullable(),
  preferredWorkStyle: z.string().trim().max(100).default(''),
  analysisInstruction: z.string().trim().max(2_000).default(''),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
