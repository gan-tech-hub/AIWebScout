import type { NextRequest } from 'next/server';
import { analysisStatusSchema, pageTypeSchema } from '@ai-web-scout/shared';
import { z } from 'zod';
import { SupabaseAnalysisRepository } from '@/infrastructure/repositories';
import {
  apiFailure,
  apiSuccess,
  applyCors,
  authenticateRequest,
  corsPreflight,
  withApiErrorBoundary,
} from '@/lib/api';

const querySchema = z.object({
  pageType: pageTypeSchema.optional(),
  status: analysisStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  ascending: z.enum(['true', 'false']).default('false'),
});

export function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

async function handleGet(request: NextRequest) {
  const { client, user } = await authenticateRequest(request);
  if (!user) {
    return applyCors(
      request,
      apiFailure('UNAUTHORIZED', 'ログインが必要です。', 401),
    );
  }
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return applyCors(
      request,
      apiFailure('VALIDATION_ERROR', '検索条件が正しくありません。', 400),
    );
  }
  const repository = new SupabaseAnalysisRepository(client);
  const analyses = await repository.list({
    userId: user.id,
    limit: parsed.data.limit,
    ascending: parsed.data.ascending === 'true',
    ...(parsed.data.pageType ? { pageType: parsed.data.pageType } : {}),
    ...(parsed.data.status ? { status: parsed.data.status } : {}),
  });
  return applyCors(request, apiSuccess(analyses));
}

export function GET(request: NextRequest) {
  return withApiErrorBoundary(request, () => handleGet(request));
}
