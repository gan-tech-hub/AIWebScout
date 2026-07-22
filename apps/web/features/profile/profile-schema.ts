import { z } from 'zod';

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'ユーザー名を入力してください')
    .max(60, '60文字以内で入力してください'),
  bio: z.string().trim().max(500, '500文字以内で入力してください'),
  skills: z.string().trim().max(500),
  desiredConditions: z.string().trim().max(1000),
  desiredHourlyRate: z.coerce
    .number()
    .int()
    .min(0, '0以上で入力してください')
    .max(100000, '入力値を確認してください'),
  availableHours: z.coerce
    .number()
    .int()
    .min(1, '1時間以上で入力してください')
    .max(168, '168時間以内で入力してください'),
  preferredWorkStyle: z.enum(['remote', 'hybrid', 'office', 'flexible']),
  analysisInstruction: z
    .string()
    .trim()
    .max(1000, '1000文字以内で入力してください'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
