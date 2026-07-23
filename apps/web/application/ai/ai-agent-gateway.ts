import type { PageClassification } from '@ai-web-scout/shared';
import type {
  AgentPageInput,
  AnalyzePageRequest,
  AnalyzePageResponse,
} from './types';

export interface AiAgentGateway {
  classify(page: AgentPageInput): Promise<PageClassification>;
  analyze(request: AnalyzePageRequest): Promise<AnalyzePageResponse>;
}
