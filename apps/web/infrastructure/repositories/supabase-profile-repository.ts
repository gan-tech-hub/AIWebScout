import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ProfileRepository,
  SaveProfileInput,
} from '@/application/repositories';
import type { UserProfile } from '@/domain/models';
import type {
  Database,
  TableInsert,
} from '@/infrastructure/supabase/database.types';
import { mapProfile } from './mappers';
import { RepositoryError } from './repository-error';

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new RepositoryError('プロフィールの取得', error);
    return data ? mapProfile(data) : null;
  }

  async save(input: SaveProfileInput): Promise<UserProfile> {
    const payload: TableInsert<'profiles'> = {
      user_id: input.userId,
      display_name: input.displayName,
      bio: input.bio,
      skills: input.skills,
      desired_conditions: input.desiredConditions,
      desired_hourly_rate: input.desiredHourlyRate,
      available_hours: input.availableHours,
      preferred_work_style: input.preferredWorkStyle,
      analysis_instruction: input.analysisInstruction,
    };
    const { data, error } = await this.client
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new RepositoryError('プロフィールの保存', error);
    return mapProfile(data);
  }
}
