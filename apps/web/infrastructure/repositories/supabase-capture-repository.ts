import type { SupabaseClient } from '@supabase/supabase-js';
import type { CaptureRepository } from '@/application/repositories';
import type { CreateCapturedPageInput } from '@/application/repositories';
import type { CapturedPage } from '@/domain/models';
import type {
  Database,
  TableInsert,
} from '@/infrastructure/supabase/database.types';
import { mapCapturedPage } from './mappers';
import { RepositoryError } from './repository-error';

export class SupabaseCaptureRepository implements CaptureRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: CreateCapturedPageInput): Promise<CapturedPage> {
    const payload: TableInsert<'captured_pages'> = {
      user_id: input.userId,
      title: input.title,
      url: input.url,
      page_text: input.pageText,
      selected_text: input.selectedText,
      meta_description: input.metaDescription,
      source_type: input.sourceType,
      captured_at: input.capturedAt,
    };
    const { data, error } = await this.client
      .from('captured_pages')
      .insert(payload)
      .select()
      .single();

    if (error) throw new RepositoryError('ページ情報の保存', error);
    return mapCapturedPage(data);
  }

  async findById(id: string, userId: string): Promise<CapturedPage | null> {
    const { data, error } = await this.client
      .from('captured_pages')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new RepositoryError('ページ情報の取得', error);
    return data ? mapCapturedPage(data) : null;
  }
}
