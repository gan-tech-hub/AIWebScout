import { z } from 'zod';
import { getServerEnv } from './env';

const boundedInteger = (minimum: number, maximum: number, fallback: number) =>
  z.coerce.number().int().min(minimum).max(maximum).default(fallback);

const agentConfigSchema = z.object({
  apiKey: z.string().min(1, 'OPENAI_API_KEYが設定されていません。'),
  model: z.string().min(1, 'OPENAI_MODELが設定されていません。'),
  maxInputChars: boundedInteger(1_000, 50_000, 50_000),
  maxOutputTokens: boundedInteger(500, 10_000, 3_000),
  maxToolCalls: boundedInteger(0, 5, 1),
  timeoutMs: boundedInteger(5_000, 120_000, 45_000),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;

export function getAgentConfig(
  source: Record<string, string | undefined> = process.env,
): AgentConfig {
  const env = getServerEnv(source);
  return agentConfigSchema.parse({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    maxInputChars: env.AI_MAX_INPUT_CHARS,
    maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
    maxToolCalls: env.AI_MAX_TOOL_CALLS,
    timeoutMs: env.AI_TIMEOUT_MS,
  });
}
