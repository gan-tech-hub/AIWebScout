import { NextResponse, type NextRequest } from 'next/server';
import type { ApiFailure, ApiSuccess } from '@ai-web-scout/shared';
import { applyCors } from './cors';

export function apiSuccess<T>(
  data: T,
  status = 200,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

export function apiFailure(
  code: string,
  message: string,
  status: number,
  details: Record<string, unknown> = {},
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, data: null, error: { code, message, details } },
    { status },
  );
}

export async function withApiErrorBoundary(
  request: NextRequest,
  action: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await action();
  } catch (error: unknown) {
    console.error('AI Web Scout API request failed.', error);
    return applyCors(
      request,
      apiFailure(
        'INTERNAL_ERROR',
        '処理中にエラーが発生しました。時間をおいて再度お試しください。',
        500,
      ),
    );
  }
}
