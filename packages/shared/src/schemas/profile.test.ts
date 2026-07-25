import { describe, expect, it } from 'vitest';
import { profileUpdateSchema } from './profile';

describe('profileUpdateSchema', () => {
  const validProfile = {
    displayName: 'Scout User',
    bio: '',
    skills: ['TypeScript', 'Next.js'],
    desiredConditions: { text: 'リモート中心' },
    desiredHourlyRate: 6_000,
    availableHours: 20,
    preferredWorkStyle: 'remote',
    analysisInstruction: '懸念点を率直に示してください。',
  };

  it('accepts a valid profile', () => {
    expect(profileUpdateSchema.safeParse(validProfile).success).toBe(true);
  });

  it('rejects an empty display name and out-of-range hours', () => {
    const result = profileUpdateSchema.safeParse({
      ...validProfile,
      displayName: ' ',
      availableHours: 169,
    });

    expect(result.success).toBe(false);
  });
});
