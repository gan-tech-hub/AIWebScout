import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  authenticateRequest: vi.fn(),
  createCapture: vi.fn(),
  createAnalysis: vi.fn(),
  executeAgent: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...(actual as Record<string, unknown>), after: mocks.after };
});

vi.mock('@/lib/api', () => ({
  authenticateRequest: mocks.authenticateRequest,
  apiSuccess: (data: unknown, status = 200) =>
    Response.json({ success: true, data, error: null }, { status }),
  apiFailure: (code: string, message: string, status: number, details = {}) =>
    Response.json(
      { success: false, data: null, error: { code, message, details } },
      { status },
    ),
  applyCors: (_request: unknown, response: Response) => response,
  corsPreflight: () => new Response(null, { status: 204 }),
  withApiErrorBoundary: (_request: unknown, action: () => Promise<Response>) =>
    action(),
}));

vi.mock('@/infrastructure/repositories', () => ({
  SupabaseCaptureRepository: class {
    create = mocks.createCapture;
  },
  SupabaseAnalysisRepository: class {
    create = mocks.createAnalysis;
  },
}));

vi.mock('@/services/ai', () => ({
  createAnalysisAgent: () => ({ execute: mocks.executeAgent }),
  logAnalysisFailure: vi.fn(),
}));

import { POST } from './route';

const validCapture = {
  title: 'AI Web Scout',
  url: 'https://example.com/article',
  pageText: '安全な本文',
  selectedText: '',
  metaDescription: '説明',
  sourceType: 'chrome_extension',
  capturedAt: '2026-07-26T00:00:00.000Z',
};

describe('POST /api/captures/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({
      client: {},
      user: { id: 'user-1' },
    });
    mocks.createCapture.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
    });
    mocks.createAnalysis.mockResolvedValue({
      id: '22222222-2222-4222-8222-222222222222',
    });
  });

  it('creates an owned capture and queues its analysis', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/captures/analyze', {
        method: 'POST',
        body: JSON.stringify(validCapture),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        capturedPageId: '11111111-1111-4111-8111-111111111111',
        analysisId: '22222222-2222-4222-8222-222222222222',
        status: 'pending',
      },
      error: null,
    });
    expect(mocks.createCapture).toHaveBeenCalledWith({
      ...validCapture,
      userId: 'user-1',
    });
    expect(mocks.createAnalysis).toHaveBeenCalledWith({
      userId: 'user-1',
      capturedPageId: '11111111-1111-4111-8111-111111111111',
    });
    expect(mocks.after).toHaveBeenCalledOnce();
  });

  it('rejects malformed JSON before persistence', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/captures/analyze', {
        method: 'POST',
        body: '{invalid',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createCapture).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'INVALID_JSON' },
    });
  });

  it('rejects invalid capture data before persistence', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/captures/analyze', {
        method: 'POST',
        body: JSON.stringify({ ...validCapture, url: 'chrome://settings' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createCapture).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('requires authentication', async () => {
    mocks.authenticateRequest.mockResolvedValue({ client: {}, user: null });

    const response = await POST(
      new NextRequest('http://localhost/api/captures/analyze', {
        method: 'POST',
        body: JSON.stringify(validCapture),
      }),
    );

    expect(response.status).toBe(401);
    expect(mocks.createCapture).not.toHaveBeenCalled();
  });
});
