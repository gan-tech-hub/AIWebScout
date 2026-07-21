import { CAPTURE_LIMITS, type CapturePageInput } from '@ai-web-scout/shared';

export type RawPageCapture = Omit<CapturePageInput, 'sourceType'>;

export function truncate(value: string, limit: number): string {
  return value.trim().slice(0, limit);
}

export function normalizeCapture(raw: RawPageCapture): CapturePageInput {
  return {
    title: truncate(raw.title, CAPTURE_LIMITS.title) || 'Untitled page',
    url: truncate(raw.url, CAPTURE_LIMITS.url),
    pageText: truncate(raw.pageText, CAPTURE_LIMITS.pageText),
    selectedText: truncate(raw.selectedText, CAPTURE_LIMITS.selectedText),
    metaDescription: truncate(
      raw.metaDescription,
      CAPTURE_LIMITS.metaDescription,
    ),
    sourceType: 'chrome_extension',
    capturedAt: raw.capturedAt,
  };
}
