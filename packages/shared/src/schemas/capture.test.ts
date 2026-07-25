import { describe, expect, it } from 'vitest';
import { CAPTURE_LIMITS } from '../constants/limits';
import { capturePageInputSchema } from './capture';

const validCapture = {
  title: 'AI Web Scout',
  url: 'https://example.com/article',
  pageText: 'A useful article.',
  selectedText: '',
  metaDescription: 'Description',
  sourceType: 'chrome_extension' as const,
  capturedAt: '2026-07-22T00:00:00.000Z',
};

describe('capturePageInputSchema', () => {
  it('accepts a safe capture payload', () => {
    expect(capturePageInputSchema.parse(validCapture)).toEqual(validCapture);
  });

  it('rejects unsupported URL protocols', () => {
    expect(() =>
      capturePageInputSchema.parse({
        ...validCapture,
        url: 'chrome://settings',
      }),
    ).toThrow();
  });

  it('rejects URLs containing embedded credentials', () => {
    expect(() =>
      capturePageInputSchema.parse({
        ...validCapture,
        url: 'https://user:password@example.com/private',
      }),
    ).toThrow();
  });

  it('accepts an empty page body', () => {
    expect(
      capturePageInputSchema.parse({ ...validCapture, pageText: '' }).pageText,
    ).toBe('');
  });

  it('rejects content beyond the configured limit', () => {
    expect(() =>
      capturePageInputSchema.parse({
        ...validCapture,
        pageText: 'a'.repeat(CAPTURE_LIMITS.pageText + 1),
      }),
    ).toThrow();
  });
});
