import type { CapturePageInput } from '@ai-web-scout/shared';
import { describe, expect, it, vi } from 'vitest';
import { analyzeCapture } from './analyze-capture';
import { ExtensionError } from './errors';

const capture: CapturePageInput = {
  title: 'Example',
  url: 'https://example.com',
  pageText: 'Visible page text',
  selectedText: '',
  metaDescription: 'Description',
  sourceType: 'chrome_extension',
  capturedAt: '2026-07-23T00:00:00.000Z',
};

function asFetcher(
  implementation: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>,
): typeof fetch {
  return implementation;
}

describe('analyzeCapture', () => {
  it('sends the validated capture and returns IDs', async () => {
    const fetcher = vi.fn(
      asFetcher((_input, init) => {
        expect(init?.method).toBe('POST');
        expect(init?.credentials).toBe('include');
        const body = init?.body;
        if (typeof body !== 'string') throw new Error('Expected JSON body');
        expect(JSON.parse(body)).toEqual(capture);
        return Promise.resolve(
          Response.json({
            success: true,
            data: {
              capturedPageId: '11111111-1111-4111-8111-111111111111',
              analysisId: '22222222-2222-4222-8222-222222222222',
              status: 'pending',
            },
            error: null,
          }),
        );
      }),
    );

    const result = await analyzeCapture(capture, {
      fetcher,
      webAppUrl: 'http://localhost:3000',
    });
    expect(result.analysisId).toBe('22222222-2222-4222-8222-222222222222');
  });

  it('uses the API user message for a structured failure', async () => {
    const fetcher = asFetcher(() =>
      Promise.resolve(
        Response.json(
          {
            success: false,
            data: null,
            error: {
              code: 'CAPTURE_REJECTED',
              message: '本文が長すぎます。',
              details: {},
            },
          },
          { status: 422 },
        ),
      ),
    );

    await expect(
      analyzeCapture(capture, {
        fetcher,
        webAppUrl: 'http://localhost:3000',
      }),
    ).rejects.toMatchObject({
      code: 'API_ERROR',
      message: '本文が長すぎます。',
    });
  });

  it('maps authentication failures to a login message', async () => {
    const fetcher = asFetcher(() =>
      Promise.resolve(new Response(null, { status: 401 })),
    );
    await expect(
      analyzeCapture(capture, {
        fetcher,
        webAppUrl: 'http://localhost:3000',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('rejects malformed successful responses', async () => {
    const fetcher = asFetcher(() =>
      Promise.resolve(Response.json({ success: true, data: {}, error: null })),
    );
    await expect(
      analyzeCapture(capture, {
        fetcher,
        webAppUrl: 'http://localhost:3000',
      }),
    ).rejects.toBeInstanceOf(ExtensionError);
  });

  it('maps fetch failures without leaking their details', async () => {
    const fetcher = asFetcher(() =>
      Promise.reject(new Error('private network detail')),
    );
    await expect(
      analyzeCapture(capture, {
        fetcher,
        webAppUrl: 'http://localhost:3000',
      }),
    ).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});
