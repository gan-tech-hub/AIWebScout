import {
  CAPTURE_LIMITS,
  capturePageInputSchema,
  type CapturePageInput,
} from '@ai-web-scout/shared';
import { ExtensionError } from '../api/errors';

export type RawPageCapture = Omit<CapturePageInput, 'sourceType'>;

export function truncate(value: string, limit: number): string {
  return value.trim().slice(0, limit);
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, (candidate) =>
      candidate.replace(/\d/g, '•'),
    )
    .replace(
      /\b(password|passwd|api[_ -]?key|access[_ -]?token|authorization)\s*[:=]\s*\S+/gi,
      '$1: [REDACTED]',
    )
    .replace(/(パスワード|認証トークン)\s*[:：=]\s*\S+/g, '$1: [REDACTED]');
}

const SENSITIVE_URL_PARAMETER =
  /^(?:access_?token|auth(?:orization)?|api_?key|code|credential|jwt|passw(?:or)?d|secret|session(?:_?id)?|token)$/i;

export function sanitizeUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ExtensionError(
      'INVALID_CAPTURE',
      'ページURLを確認できませんでした。',
    );
  }
  if (url.username || url.password) {
    throw new ExtensionError(
      'INVALID_CAPTURE',
      '認証情報を含むURLは取得できません。',
    );
  }
  for (const key of new Set(url.searchParams.keys())) {
    if (SENSITIVE_URL_PARAMETER.test(key)) {
      url.searchParams.set(key, '[REDACTED]');
    }
  }
  return url.toString();
}

export function normalizeCapture(raw: RawPageCapture): CapturePageInput {
  const capture = {
    title:
      truncate(redactSensitiveText(raw.title), CAPTURE_LIMITS.title) ||
      'Untitled page',
    url: truncate(sanitizeUrl(raw.url), CAPTURE_LIMITS.url),
    pageText: truncate(
      redactSensitiveText(raw.pageText),
      CAPTURE_LIMITS.pageText,
    ),
    selectedText: truncate(
      redactSensitiveText(raw.selectedText),
      CAPTURE_LIMITS.selectedText,
    ),
    metaDescription: truncate(
      redactSensitiveText(raw.metaDescription),
      CAPTURE_LIMITS.metaDescription,
    ),
    sourceType: 'chrome_extension',
    capturedAt: raw.capturedAt,
  } as const;

  const parsed = capturePageInputSchema.safeParse(capture);
  if (!parsed.success) {
    throw new ExtensionError(
      'INVALID_CAPTURE',
      'このページの取得内容を検証できませんでした。',
      { issues: parsed.error.flatten() },
    );
  }
  return parsed.data;
}
