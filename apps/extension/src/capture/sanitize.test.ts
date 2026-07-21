import { CAPTURE_LIMITS } from '@ai-web-scout/shared';
import { describe, expect, it } from 'vitest';
import { normalizeCapture } from './sanitize';

describe('normalizeCapture', () => {
  it('trims and bounds captured page content', () => {
    const capture = normalizeCapture({
      title: ' Example ',
      url: 'https://example.com',
      pageText: ` ${'x'.repeat(CAPTURE_LIMITS.pageText + 100)} `,
      selectedText: ' selection ',
      metaDescription: ' description ',
      capturedAt: '2026-07-22T00:00:00.000Z',
    });
    expect(capture.title).toBe('Example');
    expect(capture.pageText).toHaveLength(CAPTURE_LIMITS.pageText);
    expect(capture.selectedText).toBe('selection');
  });

  it('uses a safe fallback for an empty title', () => {
    const capture = normalizeCapture({
      title: ' ',
      url: 'https://example.com',
      pageText: '',
      selectedText: '',
      metaDescription: '',
      capturedAt: '2026-07-22T00:00:00.000Z',
    });
    expect(capture.title).toBe('Untitled page');
  });
});
