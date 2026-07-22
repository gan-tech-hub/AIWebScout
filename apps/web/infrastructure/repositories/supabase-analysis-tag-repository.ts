import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalysisTagRepository } from '@/application/repositories';
import type { AnalysisTag } from '@/domain/models';
import type {
  Database,
  TableInsert,
} from '@/infrastructure/supabase/database.types';
import { mapAnalysisTag } from './mappers';
import { RepositoryError } from './repository-error';

function normalizeTags(tags: string[]): string[] {
  return [
    ...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  ];
}

export class SupabaseAnalysisTagRepository implements AnalysisTagRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async addMany(analysisId: string, tags: string[]): Promise<AnalysisTag[]> {
    const normalized = normalizeTags(tags);
    if (normalized.length === 0) return [];
    const payload: TableInsert<'analysis_tags'>[] = normalized.map((tag) => ({
      analysis_id: analysisId,
      tag,
    }));
    const { data, error } = await this.client
      .from('analysis_tags')
      .upsert(payload, {
        onConflict: 'analysis_id,tag',
        ignoreDuplicates: true,
      })
      .select();
    if (error) throw new RepositoryError('分析タグの保存', error);
    return data.map(mapAnalysisTag);
  }

  async listByAnalysisId(analysisId: string): Promise<AnalysisTag[]> {
    const { data, error } = await this.client
      .from('analysis_tags')
      .select()
      .eq('analysis_id', analysisId)
      .order('tag', { ascending: true });
    if (error) throw new RepositoryError('分析タグの取得', error);
    return data.map(mapAnalysisTag);
  }
}
