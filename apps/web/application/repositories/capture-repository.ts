import type { CreateCapturedPageInput } from './types';
import type { CapturedPage } from '@/domain/models';

export interface CaptureRepository {
  create(input: CreateCapturedPageInput): Promise<CapturedPage>;
  findById(id: string, userId: string): Promise<CapturedPage | null>;
}
