import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AgentStepRepository,
  CreateAgentStepInput,
  UpdateAgentStepInput,
} from '@/application/repositories';
import type { AgentStep } from '@/domain/models';
import type {
  Database,
  TableInsert,
  TableUpdate,
} from '@/infrastructure/supabase/database.types';
import { mapAgentStep } from './mappers';
import { RepositoryError } from './repository-error';

export class SupabaseAgentStepRepository implements AgentStepRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createMany(inputs: CreateAgentStepInput[]): Promise<AgentStep[]> {
    if (inputs.length === 0) return [];
    const payload: TableInsert<'agent_steps'>[] = inputs.map((input) => ({
      analysis_id: input.analysisId,
      step_key: input.stepKey,
      step_name: input.stepName,
      sort_order: input.sortOrder,
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(input.description === undefined
        ? {}
        : { description: input.description }),
      ...(input.inputSummary === undefined
        ? {}
        : { input_summary: input.inputSummary }),
      ...(input.outputSummary === undefined
        ? {}
        : { output_summary: input.outputSummary }),
      ...(input.toolName === undefined ? {} : { tool_name: input.toolName }),
      ...(input.errorMessage === undefined
        ? {}
        : { error_message: input.errorMessage }),
      ...(input.startedAt === undefined ? {} : { started_at: input.startedAt }),
      ...(input.completedAt === undefined
        ? {}
        : { completed_at: input.completedAt }),
      ...(input.durationMs === undefined
        ? {}
        : { duration_ms: input.durationMs }),
    }));

    const { data, error } = await this.client
      .from('agent_steps')
      .insert(payload)
      .select();
    if (error) throw new RepositoryError('エージェントステップの作成', error);
    return data.map(mapAgentStep);
  }

  async update(
    id: string,
    analysisId: string,
    input: UpdateAgentStepInput,
  ): Promise<AgentStep> {
    const payload: TableUpdate<'agent_steps'> = {};
    if (input.stepName !== undefined) payload.step_name = input.stepName;
    if (input.status !== undefined) payload.status = input.status;
    if (input.description !== undefined)
      payload.description = input.description;
    if (input.inputSummary !== undefined) {
      payload.input_summary = input.inputSummary;
    }
    if (input.outputSummary !== undefined) {
      payload.output_summary = input.outputSummary;
    }
    if ('toolName' in input) payload.tool_name = input.toolName;
    if ('errorMessage' in input) payload.error_message = input.errorMessage;
    if ('startedAt' in input) payload.started_at = input.startedAt;
    if ('completedAt' in input) payload.completed_at = input.completedAt;
    if ('durationMs' in input) payload.duration_ms = input.durationMs;

    const { data, error } = await this.client
      .from('agent_steps')
      .update(payload)
      .eq('id', id)
      .eq('analysis_id', analysisId)
      .select()
      .single();
    if (error) throw new RepositoryError('エージェントステップの更新', error);
    return mapAgentStep(data);
  }

  async listByAnalysisId(analysisId: string): Promise<AgentStep[]> {
    const { data, error } = await this.client
      .from('agent_steps')
      .select()
      .eq('analysis_id', analysisId)
      .order('sort_order', { ascending: true });
    if (error) throw new RepositoryError('エージェントステップの取得', error);
    return data.map(mapAgentStep);
  }
}
