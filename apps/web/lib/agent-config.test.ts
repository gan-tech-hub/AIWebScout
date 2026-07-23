import { describe, expect, it } from 'vitest';
import { getAgentConfig } from './agent-config';

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
  OPENAI_API_KEY: 'test-key',
  OPENAI_MODEL: 'test-model',
};

describe('getAgentConfig', () => {
  it('applies bounded defaults', () => {
    expect(getAgentConfig(baseEnv)).toEqual({
      apiKey: 'test-key',
      model: 'test-model',
      maxInputChars: 50_000,
      maxOutputTokens: 3_000,
      maxToolCalls: 1,
      timeoutMs: 45_000,
    });
  });

  it('rejects unsafe limits', () => {
    expect(() =>
      getAgentConfig({ ...baseEnv, AI_MAX_TOOL_CALLS: '99' }),
    ).toThrow();
  });
});
