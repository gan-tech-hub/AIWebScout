import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AnalysisListQuery,
  AnalysisRepository,
  CreateAnalysisInput,
  UpdateAnalysisInput,
} from '@/application/repositories';
import type { AnalysisDetails, PageAnalysis } from '@/domain/models';
import type {
  Database,
  TableInsert,
  TableUpdate,
} from '@/infrastructure/supabase/database.types';
import {
  mapAgentStep,
  mapAnalysis,
  mapAnalysisTag,
  mapCapturedPage,
} from './mappers';
import { RepositoryDataError, RepositoryError } from './repository-error';

export class SupabaseAnalysisRepository implements AnalysisRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: CreateAnalysisInput): Promise<PageAnalysis> {
    const payload: TableInsert<'analyses'> = {
      user_id: input.userId,
      captured_page_id: input.capturedPageId,
    };
    const { data, error } = await this.client
      .from('analyses')
      .insert(payload)
      .select()
      .single();

    if (error) throw new RepositoryError('分析の作成', error);
    return mapAnalysis(data);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateAnalysisInput,
  ): Promise<PageAnalysis> {
    const payload: TableUpdate<'analyses'> = {};
    if ('pageType' in input) payload.page_type = input.pageType;
    if (input.status !== undefined) payload.status = input.status;
    if (input.summary !== undefined) payload.summary = input.summary;
    if (input.recommendation !== undefined) {
      payload.recommendation = input.recommendation;
    }
    if ('recommendationScore' in input) {
      payload.recommendation_score = input.recommendationScore;
    }
    if (input.result !== undefined) payload.result_json = input.result;
    if ('errorMessage' in input) payload.error_message = input.errorMessage;
    if ('startedAt' in input) payload.started_at = input.startedAt;
    if ('completedAt' in input) payload.completed_at = input.completedAt;

    const { data, error } = await this.client
      .from('analyses')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new RepositoryError('分析の更新', error);
    return mapAnalysis(data);
  }

  async findById(id: string, userId: string): Promise<AnalysisDetails | null> {
    const analysisResult = await this.client
      .from('analyses')
      .select()
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (analysisResult.error) {
      throw new RepositoryError('分析詳細の取得', analysisResult.error);
    }
    if (!analysisResult.data) return null;

    const [captureResult, stepsResult, tagsResult] = await Promise.all([
      this.client
        .from('captured_pages')
        .select()
        .eq('id', analysisResult.data.captured_page_id)
        .eq('user_id', userId)
        .maybeSingle(),
      this.client
        .from('agent_steps')
        .select()
        .eq('analysis_id', id)
        .order('sort_order', { ascending: true }),
      this.client
        .from('analysis_tags')
        .select()
        .eq('analysis_id', id)
        .order('tag', { ascending: true }),
    ]);

    if (captureResult.error || stepsResult.error || tagsResult.error) {
      throw new RepositoryError(
        '分析関連データの取得',
        captureResult.error ?? stepsResult.error ?? tagsResult.error,
      );
    }
    if (!captureResult.data) {
      throw new RepositoryDataError('分析に紐づくページ情報がありません。');
    }

    return {
      analysis: mapAnalysis(analysisResult.data),
      capturedPage: mapCapturedPage(captureResult.data),
      steps: stepsResult.data.map(mapAgentStep),
      tags: tagsResult.data.map(mapAnalysisTag),
    };
  }

  async list(query: AnalysisListQuery): Promise<PageAnalysis[]> {
    let request = this.client
      .from('analyses')
      .select()
      .eq('user_id', query.userId);

    if (query.pageType) request = request.eq('page_type', query.pageType);
    if (query.status) request = request.eq('status', query.status);

    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
    const { data, error } = await request
      .order('created_at', { ascending: query.ascending ?? false })
      .limit(limit);

    if (error) throw new RepositoryError('分析履歴の取得', error);
    return data.map(mapAnalysis);
  }
}
