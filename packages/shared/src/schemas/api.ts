import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).default({}),
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion('success', [
    z.object({ success: z.literal(true), data: dataSchema, error: z.null() }),
    z.object({
      success: z.literal(false),
      data: z.null(),
      error: apiErrorSchema,
    }),
  ]);

export type ApiSuccess<T> = { success: true; data: T; error: null };
export type ApiFailure = {
  success: false;
  data: null;
  error: { code: string; message: string; details: Record<string, unknown> };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
