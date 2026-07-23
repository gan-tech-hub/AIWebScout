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

export function normalizeCapture(raw: RawPageCapture): CapturePageInput {
  const capture = {
    title: truncate(raw.title, CAPTURE_LIMITS.title) || 'Untitled page',
    url: truncate(raw.url, CAPTURE_LIMITS.url),
    pageText: truncate(
      redactSensitiveText(raw.pageText),
      CAPTURE_LIMITS.pageText,
    ),
    selectedText: truncate(
      redactSensitiveText(raw.selectedText),
      CAPTURE_LIMITS.selectedText,
    ),
    metaDescription: truncate(
      raw.metaDescription,
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
