import type { SupabaseClient } from '@supabase/supabase-js';
import { RunPageAnalysis } from '@/application/ai';
import {
  SupabaseAgentStepRepository,
  SupabaseAnalysisRepository,
  SupabaseAnalysisTagRepository,
  SupabaseCaptureRepository,
  SupabaseProfileRepository,
} from '@/infrastructure/repositories';
import { OpenAiAgentGateway } from '@/infrastructure/openai';
import type { Database } from '@/infrastructure/supabase/database.types';
import { getAgentConfig } from '@/lib/agent-config';

export function createAnalysisAgent(
  client: SupabaseClient<Database>,
  source: Record<string, string | undefined> = process.env,
): RunPageAnalysis {
  const config = getAgentConfig(source);
  return new RunPageAnalysis({
    analyses: new SupabaseAnalysisRepository(client),
    captures: new SupabaseCaptureRepository(client),
    profiles: new SupabaseProfileRepository(client),
    steps: new SupabaseAgentStepRepository(client),
    tags: new SupabaseAnalysisTagRepository(client),
    ai: new OpenAiAgentGateway(config),
    maxInputChars: config.maxInputChars,
  });
}
