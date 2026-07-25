import type { NextRequest } from 'next/server';
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

const idSchema = z.string().uuid();

export function OPTIONS(request: NextRequest) {
  return corsPreflight(request);
}

async function handleGet(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { client, user } = await authenticateRequest(request);
  if (!user) {
    return applyCors(
      request,
      apiFailure('UNAUTHORIZED', 'ログインが必要です。', 401),
    );
  }
  const parsedId = idSchema.safeParse((await context.params).id);
  if (!parsedId.success) {
    return applyCors(
      request,
      apiFailure('VALIDATION_ERROR', '分析IDが正しくありません。', 400),
    );
  }
  const details = await new SupabaseAnalysisRepository(client).findById(
    parsedId.data,
    user.id,
  );
  if (!details) {
    return applyCors(
      request,
      apiFailure('NOT_FOUND', '分析が見つかりません。', 404),
    );
  }
  return applyCors(request, apiSuccess(details));
}

export function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withApiErrorBoundary(request, () => handleGet(request, context));
}
