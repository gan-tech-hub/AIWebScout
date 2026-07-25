import { after, type NextRequest } from 'next/server';
import { z } from 'zod';
import { SupabaseAnalysisRepository } from '@/infrastructure/repositories';
import { createAnalysisAgent } from '@/services/ai';
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

async function handlePost(
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
  const parsedId = z
    .string()
    .uuid()
    .safeParse((await context.params).id);
  if (!parsedId.success) {
    return applyCors(
      request,
      apiFailure('VALIDATION_ERROR', '分析IDが正しくありません。', 400),
    );
  }
  const repository = new SupabaseAnalysisRepository(client);
  const source = await repository.findById(parsedId.data, user.id);
  if (!source) {
    return applyCors(
      request,
      apiFailure('NOT_FOUND', '分析が見つかりません。', 404),
    );
  }
  const analysis = await repository.create({
    userId: user.id,
    capturedPageId: source.capturedPage.id,
  });
  const agent = createAnalysisAgent(client);
  after(async () => {
    try {
      await agent.execute({
        analysisId: analysis.id,
        capturedPageId: source.capturedPage.id,
        userId: user.id,
      });
    } catch {
      // Safe failure state is persisted by the use case.
    }
  });
  return applyCors(
    request,
    apiSuccess(
      {
        capturedPageId: source.capturedPage.id,
        analysisId: analysis.id,
        status: 'pending' as const,
      },
      202,
    ),
  );
}

export function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  return withApiErrorBoundary(request, () => handlePost(request, context));
}
