import {
  apiResponseSchema,
  captureAnalyzeDataSchema,
  capturePageInputSchema,
  type CaptureAnalyzeData,
  type CapturePageInput,
} from '@ai-web-scout/shared';
import { extensionConfig } from '../config';
import { ExtensionError } from './errors';

const responseSchema = apiResponseSchema(captureAnalyzeDataSchema);

type AnalyzeCaptureOptions = {
  fetcher?: typeof fetch;
  signal?: AbortSignal;
  webAppUrl?: string;
};

export async function analyzeCapture(
  capture: CapturePageInput,
  options: AnalyzeCaptureOptions = {},
): Promise<CaptureAnalyzeData> {
  const validated = capturePageInputSchema.safeParse(capture);
  if (!validated.success) {
    throw new ExtensionError(
      'INVALID_CAPTURE',
      '取得内容を確認できませんでした。ページを再読み込みしてください。',
      { issues: validated.error.flatten() },
    );
  }

  const fetcher = options.fetcher ?? fetch;
  const webAppUrl = options.webAppUrl ?? extensionConfig.webAppUrl;
  let response: Response;

  try {
    response = await fetcher(`${webAppUrl}/api/captures/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(validated.data),
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ExtensionError(
        'REQUEST_TIMEOUT',
        '通信がタイムアウトしました。Webアプリの起動状態を確認してください。',
      );
    }
    throw new ExtensionError(
      'NETWORK_ERROR',
      'Webアプリへ接続できませんでした。起動状態と接続先を確認してください。',
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new ExtensionError(
      'UNAUTHORIZED',
      'Webアプリへのログインが必要です。ログイン後にもう一度お試しください。',
      { status: response.status },
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ExtensionError(
      'INVALID_RESPONSE',
      'Webアプリから正しい応答を受け取れませんでした。',
      { status: response.status },
    );
  }

  const parsed = responseSchema.safeParse(json);
  if (!parsed.success) {
    throw new ExtensionError(
      'INVALID_RESPONSE',
      'Webアプリから正しい応答を受け取れませんでした。',
      { status: response.status },
    );
  }
  if (!parsed.data.success) {
    throw new ExtensionError(
      'API_ERROR',
      parsed.data.error.message,
      parsed.data.error.details,
    );
  }
  return parsed.data.data;
}

export async function analyzeCaptureWithTimeout(
  capture: CapturePageInput,
): Promise<CaptureAnalyzeData> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    extensionConfig.apiTimeoutMs,
  );
  try {
    return await analyzeCapture(capture, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}
