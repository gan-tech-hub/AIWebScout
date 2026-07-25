import type { NextRequest } from 'next/server';
import { profileUpdateSchema } from '@ai-web-scout/shared';
import type { Json } from '@/infrastructure/supabase/database.types';
import { SupabaseProfileRepository } from '@/infrastructure/repositories';
import {
  apiFailure,
  apiSuccess,
  applyCors,
  authenticateRequest,
  corsPreflight,
  withApiErrorBoundary,
} from '@/lib/api';

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
  const profile = await new SupabaseProfileRepository(client).findByUserId(
    user.id,
  );
  return applyCors(request, apiSuccess(profile));
}

async function handlePut(request: NextRequest) {
  const { client, user } = await authenticateRequest(request);
  if (!user) {
    return applyCors(
      request,
      apiFailure('UNAUTHORIZED', 'ログインが必要です。', 401),
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return applyCors(
      request,
      apiFailure(
        'INVALID_JSON',
        'JSON形式のリクエストを送信してください。',
        400,
      ),
    );
  }
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return applyCors(
      request,
      apiFailure('VALIDATION_ERROR', 'プロフィールを確認してください。', 400, {
        issues: parsed.error.flatten(),
      }),
    );
  }
  const profile = await new SupabaseProfileRepository(client).save({
    ...parsed.data,
    userId: user.id,
    desiredConditions: JSON.parse(
      JSON.stringify(parsed.data.desiredConditions),
    ) as Record<string, Json | undefined>,
  });
  return applyCors(request, apiSuccess(profile));
}

export function GET(request: NextRequest) {
  return withApiErrorBoundary(request, () => handleGet(request));
}

export function PUT(request: NextRequest) {
  return withApiErrorBoundary(request, () => handlePut(request));
}
