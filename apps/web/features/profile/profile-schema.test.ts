import { describe, expect, it } from 'vitest';
import { profileFormSchema } from './profile-schema';

const validProfile = {
  displayName: 'Scout',
  bio: '',
  skills: 'TypeScript',
  desiredConditions: 'リモート',
  desiredHourlyRate: 6000,
  availableHours: 20,
  preferredWorkStyle: 'remote',
  analysisInstruction: '',
};

describe('profileFormSchema', () => {
  it('有効なプロフィールを受理する', () => {
    expect(profileFormSchema.safeParse(validProfile).success).toBe(true);
  });

  it('ユーザー名の空文字を拒否する', () => {
    expect(
      profileFormSchema.safeParse({ ...validProfile, displayName: '   ' })
        .success,
    ).toBe(false);
  });

  it('現実的でない稼働時間を拒否する', () => {
    expect(
      profileFormSchema.safeParse({ ...validProfile, availableHours: 169 })
        .success,
    ).toBe(false);
  });
});
