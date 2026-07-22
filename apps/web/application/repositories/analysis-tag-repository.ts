import type { AnalysisTag } from '@/domain/models';

export interface AnalysisTagRepository {
  addMany(analysisId: string, tags: string[]): Promise<AnalysisTag[]>;
  listByAnalysisId(analysisId: string): Promise<AnalysisTag[]>;
}
