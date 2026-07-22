import type {
  AnalysisListQuery,
  CreateAnalysisInput,
  UpdateAnalysisInput,
} from './types';
import type { AnalysisDetails, PageAnalysis } from '@/domain/models';

export interface AnalysisRepository {
  create(input: CreateAnalysisInput): Promise<PageAnalysis>;
  update(
    id: string,
    userId: string,
    input: UpdateAnalysisInput,
  ): Promise<PageAnalysis>;
  findById(id: string, userId: string): Promise<AnalysisDetails | null>;
  list(query: AnalysisListQuery): Promise<PageAnalysis[]>;
}
