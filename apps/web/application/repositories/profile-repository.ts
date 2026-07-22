import type { SaveProfileInput } from './types';
import type { UserProfile } from '@/domain/models';

export interface ProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(input: SaveProfileInput): Promise<UserProfile>;
}
