import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type {
  Database,
  TableRow,
} from '@/infrastructure/supabase/database.types';
import { RepositoryError } from './repository-error';
import { SupabaseCaptureRepository } from './supabase-capture-repository';

const row: TableRow<'captured_pages'> = {
  id: 'capture-id',
  user_id: 'user-id',
  title: 'Page title',
  url: 'https://example.com',
  page_text: 'Plain text',
  selected_text: '',
  meta_description: '',
  source_type: 'chrome_extension',
  captured_at: '2026-07-22T00:00:00.000Z',
  created_at: '2026-07-22T00:00:01.000Z',
};

describe('SupabaseCaptureRepository', () => {
  it('saves a capture and returns a domain model', async () => {
    const single = vi.fn().mockResolvedValue({ data: row, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    const repository = new SupabaseCaptureRepository({
      from,
    } as unknown as SupabaseClient<Database>);

    const result = await repository.create({
      userId: 'user-id',
      title: 'Page title',
      url: 'https://example.com',
      pageText: 'Plain text',
      selectedText: '',
      metaDescription: '',
      sourceType: 'chrome_extension',
      capturedAt: '2026-07-22T00:00:00.000Z',
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-id', page_text: 'Plain text' }),
    );
    expect(result.id).toBe('capture-id');
  });

  it('adds user ownership to find queries', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const query = { eq: vi.fn(), maybeSingle };
    query.eq.mockReturnValue(query);
    const select = vi.fn().mockReturnValue(query);
    const from = vi.fn().mockReturnValue({ select });
    const repository = new SupabaseCaptureRepository({
      from,
    } as unknown as SupabaseClient<Database>);

    await repository.findById('capture-id', 'user-id');

    expect(query.eq).toHaveBeenNthCalledWith(1, 'id', 'capture-id');
    expect(query.eq).toHaveBeenNthCalledWith(2, 'user_id', 'user-id');
  });

  it('converts Supabase failures into repository errors', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'database unavailable' },
    });
    const query = { eq: vi.fn(), maybeSingle };
    query.eq.mockReturnValue(query);
    const repository = new SupabaseCaptureRepository({
      from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(query) }),
    } as unknown as SupabaseClient<Database>);

    await expect(
      repository.findById('capture-id', 'user-id'),
    ).rejects.toBeInstanceOf(RepositoryError);
  });
});
