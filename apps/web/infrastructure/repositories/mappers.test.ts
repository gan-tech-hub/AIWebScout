import { describe, expect, it } from 'vitest';
import type { TableRow } from '@/infrastructure/supabase/database.types';
import { mapCapturedPage, mapProfile } from './mappers';
import { RepositoryDataError } from './repository-error';

const profileRow: TableRow<'profiles'> = {
  id: 'profile-id',
  user_id: 'user-id',
  display_name: 'Scout',
  bio: 'AI application engineer',
  skills: ['TypeScript', 'Next.js'],
  desired_conditions: { remote: true },
  desired_hourly_rate: 6000,
  available_hours: 20,
  preferred_work_style: 'remote',
  analysis_instruction: 'リスクを重視',
  created_at: '2026-07-22T00:00:00.000Z',
  updated_at: '2026-07-22T00:00:00.000Z',
};

describe('Supabase row mappers', () => {
  it('maps snake_case profile rows into domain models', () => {
    const profile = mapProfile(profileRow);
    expect(profile.userId).toBe('user-id');
    expect(profile.skills).toEqual(['TypeScript', 'Next.js']);
    expect(profile.desiredConditions).toEqual({ remote: true });
  });

  it('rejects malformed persisted profile skills', () => {
    expect(() =>
      mapProfile({ ...profileRow, skills: { invalid: true } }),
    ).toThrow(RepositoryDataError);
  });

  it('maps captured page privacy fields without HTML conversion', () => {
    const row: TableRow<'captured_pages'> = {
      id: 'capture-id',
      user_id: 'user-id',
      title: 'Page title',
      url: 'https://example.com',
      page_text: 'Visible plain text',
      selected_text: 'Selected',
      meta_description: 'Description',
      source_type: 'chrome_extension',
      captured_at: '2026-07-22T00:00:00.000Z',
      created_at: '2026-07-22T00:00:01.000Z',
    };
    expect(mapCapturedPage(row)).toMatchObject({
      userId: 'user-id',
      pageText: 'Visible plain text',
      sourceType: 'chrome_extension',
    });
  });
});
