import { CAPTURE_LIMITS } from '@ai-web-scout/shared';
import { describe, expect, it } from 'vitest';
import { ExtensionError } from '../api/errors';
import { normalizeCapture, redactSensitiveText } from './sanitize';

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

  it('allows an empty page body while preserving metadata', () => {
    const capture = normalizeCapture({
      title: 'Metadata only',
      url: 'https://example.com/empty',
      pageText: '   ',
      selectedText: '',
      metaDescription: 'A page without readable body text',
      capturedAt: '2026-07-23T00:00:00.000Z',
    });
    expect(capture.pageText).toBe('');
    expect(capture.metaDescription).toBe('A page without readable body text');
  });

  it('rejects non-HTTP URLs', () => {
    expect(() =>
      normalizeCapture({
        title: 'Chrome settings',
        url: 'chrome://settings',
        pageText: '',
        selectedText: '',
        metaDescription: '',
        capturedAt: '2026-07-23T00:00:00.000Z',
      }),
    ).toThrow(ExtensionError);
  });

  it('redacts likely payment and authentication secrets', () => {
    const value = redactSensitiveText(
      'Card 4111 1111 1111 1111 password: secret API_KEY=sk-private',
    );
    expect(value).not.toContain('4111');
    expect(value).not.toContain('secret');
    expect(value).not.toContain('sk-private');
    expect(value).toContain('[REDACTED]');
  });
});
