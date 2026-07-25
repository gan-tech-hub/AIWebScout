import { after, type NextRequest } from 'next/server';
import {
  captureAnalyzeDataSchema,
  capturePageInputSchema,
} from '@ai-web-scout/shared';
import {
  SupabaseAnalysisRepository,
  SupabaseCaptureRepository,
} from '@/infrastructure/repositories';
import { createAnalysisAgent, logAnalysisFailure } from '@/services/ai';
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

async function handlePost(request: NextRequest) {
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
  const parsed = capturePageInputSchema.safeParse(body);
  if (!parsed.success) {
    return applyCors(
      request,
      apiFailure(
        'VALIDATION_ERROR',
        'ページ情報を確認できませんでした。',
        400,
        {
          issues: parsed.error.flatten(),
        },
      ),
    );
  }

  const captures = new SupabaseCaptureRepository(client);
  const analyses = new SupabaseAnalysisRepository(client);
  const capture = await captures.create({ ...parsed.data, userId: user.id });
  const analysis = await analyses.create({
    userId: user.id,
    capturedPageId: capture.id,
  });
  const agent = createAnalysisAgent(client);
  after(async () => {
    try {
      await agent.execute({
        analysisId: analysis.id,
        capturedPageId: capture.id,
        userId: user.id,
      });
    } catch (error: unknown) {
      // RunPageAnalysis persists the user-facing failed state. Log only safe
      // identifiers and the bounded error code; never page or provider data.
      logAnalysisFailure(error, {
        analysisId: analysis.id,
        capturedPageId: capture.id,
      });
    }
  });

  const data = captureAnalyzeDataSchema.parse({
    capturedPageId: capture.id,
    analysisId: analysis.id,
    status: 'pending',
  });
  return applyCors(request, apiSuccess(data, 202));
}

export function POST(request: NextRequest) {
  return withApiErrorBoundary(request, () => handlePost(request));
}
