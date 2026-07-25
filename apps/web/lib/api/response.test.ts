import { NextRequest, NextResponse } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyCors, corsPreflight } from './cors';
import { apiSuccess, withApiErrorBoundary } from './response';

const extensionOrigin = 'chrome-extension://phase-six-test';

describe('API response boundary', () => {
  const originalOrigins = process.env.CHROME_EXTENSION_ORIGINS;

  afterEach(() => {
    process.env.CHROME_EXTENSION_ORIGINS = originalOrigins;
    vi.restoreAllMocks();
  });

  it('returns the unified success envelope and allowed CORS origin', async () => {
    process.env.CHROME_EXTENSION_ORIGINS = extensionOrigin;
    const request = new NextRequest('http://localhost:3000/api/analyses', {
      headers: { origin: extensionOrigin },
    });
    const response = applyCors(request, apiSuccess({ id: 'analysis-id' }, 202));

    expect(response.status).toBe(202);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      extensionOrigin,
    );
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { id: 'analysis-id' },
      error: null,
    });
  });

  it('does not reflect an origin outside the allowlist', () => {
    process.env.CHROME_EXTENSION_ORIGINS = extensionOrigin;
    const request = new NextRequest('http://localhost:3000/api/analyses', {
      headers: { origin: 'chrome-extension://not-allowed' },
    });

    expect(
      applyCors(request, NextResponse.json({})).headers.get(
        'Access-Control-Allow-Origin',
      ),
    ).toBeNull();
  });

  it('returns the unified error envelope when an API action throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const request = new NextRequest('http://localhost:3000/api/analyses');
    const response = await withApiErrorBoundary(request, () =>
      Promise.reject(new Error('provider secret')),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      data: null,
      error: { code: 'INTERNAL_ERROR' },
    });
  });

  it('answers extension preflight requests', () => {
    process.env.CHROME_EXTENSION_ORIGINS = extensionOrigin;
    const request = new NextRequest('http://localhost:3000/api/profile', {
      method: 'OPTIONS',
      headers: { origin: extensionOrigin },
    });
    const response = corsPreflight(request);

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe(
      'true',
    );
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
      'POST',
    );
  });
});
