import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type {
  Database,
  TableRow,
} from '@/infrastructure/supabase/database.types';
import { RepositoryError } from './repository-error';
import { SupabaseAnalysisRepository } from './supabase-analysis-repository';

const analysisRow: TableRow<'analyses'> = {
  id: 'analysis-id',
  user_id: 'user-id',
  captured_page_id: 'capture-id',
  page_type: 'github',
  status: 'completed',
  summary: '概要',
  recommendation: '確認する',
  recommendation_score: 80,
  result_json: {},
  error_message: null,
  started_at: '2026-07-26T00:00:00.000Z',
  completed_at: '2026-07-26T00:00:10.000Z',
  created_at: '2026-07-26T00:00:00.000Z',
  updated_at: '2026-07-26T00:00:10.000Z',
};

describe('SupabaseAnalysisRepository', () => {
  it('scopes history filters to the user and bounds the requested limit', async () => {
    const query = {
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({ data: [analysisRow], error: null }),
    };
    query.eq.mockReturnValue(query);
    query.order.mockReturnValue(query);
    const repository = new SupabaseAnalysisRepository({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(query),
      }),
    } as unknown as SupabaseClient<Database>);

    const result = await repository.list({
      userId: 'user-id',
      pageType: 'github',
      status: 'completed',
      limit: 1_000,
      ascending: true,
    });

    expect(query.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-id');
    expect(query.eq).toHaveBeenNthCalledWith(2, 'page_type', 'github');
    expect(query.eq).toHaveBeenNthCalledWith(3, 'status', 'completed');
    expect(query.order).toHaveBeenCalledWith('created_at', {
      ascending: true,
    });
    expect(query.limit).toHaveBeenCalledWith(100);
    expect(result[0]).toMatchObject({
      id: 'analysis-id',
      userId: 'user-id',
      recommendationScore: 80,
    });
  });

  it('keeps update operations inside the user scope', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...analysisRow, status: 'failed', error_message: '失敗' },
      error: null,
    });
    const query = { eq: vi.fn(), select: vi.fn(), single };
    query.eq.mockReturnValue(query);
    query.select.mockReturnValue(query);
    const update = vi.fn().mockReturnValue(query);
    const repository = new SupabaseAnalysisRepository({
      from: vi.fn().mockReturnValue({ update }),
    } as unknown as SupabaseClient<Database>);

    await repository.update('analysis-id', 'user-id', {
      status: 'failed',
      errorMessage: '失敗',
    });

    expect(update).toHaveBeenCalledWith({
      status: 'failed',
      error_message: '失敗',
    });
    expect(query.eq).toHaveBeenNthCalledWith(1, 'id', 'analysis-id');
    expect(query.eq).toHaveBeenNthCalledWith(2, 'user_id', 'user-id');
  });

  it('converts history query failures into repository errors', async () => {
    const query = {
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'database unavailable' },
      }),
    };
    query.eq.mockReturnValue(query);
    query.order.mockReturnValue(query);
    const repository = new SupabaseAnalysisRepository({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(query),
      }),
    } as unknown as SupabaseClient<Database>);

    await expect(repository.list({ userId: 'user-id' })).rejects.toBeInstanceOf(
      RepositoryError,
    );
  });
});
