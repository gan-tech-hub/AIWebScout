export type AgentErrorCode =
  | 'AI_TIMEOUT'
  | 'AI_PROVIDER_ERROR'
  | 'INVALID_AI_OUTPUT'
  | 'TOOL_LIMIT_EXCEEDED'
  | 'UNKNOWN_TOOL'
  | 'ANALYSIS_NOT_FOUND'
  | 'CAPTURE_NOT_FOUND';

export class AgentError extends Error {
  constructor(
    public readonly code: AgentErrorCode,
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'AgentError';
  }
}
