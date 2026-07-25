import { AgentError } from '../../application/ai/agent-error';

type AnalysisFailureContext = {
  analysisId: string;
  capturedPageId: string;
};

type ErrorLogger = (
  message: string,
  context: AnalysisFailureContext & { code: string },
) => void;

export function logAnalysisFailure(
  error: unknown,
  context: AnalysisFailureContext,
  logger: ErrorLogger = console.error,
): void {
  logger('AI Web Scout background analysis failed.', {
    ...context,
    code: error instanceof AgentError ? error.code : 'UNEXPECTED_ERROR',
  });
}
