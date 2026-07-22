import { describe, expect, it } from 'vitest';
import { getPublicEnv, getServerEnv } from './env';

const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
};

describe('environment validation', () => {
  it('accepts public Supabase configuration', () => {
    expect(getPublicEnv(publicEnv)).toEqual(publicEnv);
  });

  it('rejects malformed Supabase URLs', () => {
    expect(() =>
      getPublicEnv({ ...publicEnv, NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' }),
    ).toThrow();
  });

  it('keeps the service role key server-only and optional', () => {
    expect(
      getServerEnv({ ...publicEnv, SUPABASE_SERVICE_ROLE_KEY: 'server-secret' })
        .SUPABASE_SERVICE_ROLE_KEY,
    ).toBe('server-secret');
    expect(getServerEnv(publicEnv).SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });
});
