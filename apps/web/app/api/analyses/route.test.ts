import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  list: vi.fn(),
}));

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
  SupabaseAnalysisRepository: class {
    list = mocks.list;
  },
}));

import { GET } from './route';

describe('GET /api/analyses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authenticateRequest.mockResolvedValue({
      client: {},
      user: { id: 'user-1' },
    });
    mocks.list.mockResolvedValue([]);
  });

  it('returns the authenticated user analyses with validated filters', async () => {
    const response = await GET(
      new NextRequest(
        'http://localhost/api/analyses?pageType=github&status=completed&limit=20&ascending=true',
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: [],
      error: null,
    });
    expect(mocks.list).toHaveBeenCalledWith({
      userId: 'user-1',
      pageType: 'github',
      status: 'completed',
      limit: 20,
      ascending: true,
    });
  });

  it('rejects invalid query parameters before repository access', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/analyses?limit=101'),
    );

    expect(response.status).toBe(400);
    expect(mocks.list).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('requires authentication', async () => {
    mocks.authenticateRequest.mockResolvedValue({ client: {}, user: null });

    const response = await GET(
      new NextRequest('http://localhost/api/analyses'),
    );

    expect(response.status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });
});
