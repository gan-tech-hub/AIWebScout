import type { CreateAgentStepInput, UpdateAgentStepInput } from './types';
import type { AgentStep } from '@/domain/models';

export interface AgentStepRepository {
  createMany(inputs: CreateAgentStepInput[]): Promise<AgentStep[]>;
  update(
    id: string,
    analysisId: string,
    input: UpdateAgentStepInput,
  ): Promise<AgentStep>;
  listByAnalysisId(analysisId: string): Promise<AgentStep[]>;
}
