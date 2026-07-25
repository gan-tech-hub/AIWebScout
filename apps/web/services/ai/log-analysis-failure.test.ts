import { describe, expect, it, vi } from 'vitest';
import { AgentError } from '../../application/ai/agent-error';
import { logAnalysisFailure } from './log-analysis-failure';

describe('logAnalysisFailure', () => {
  it('logs safe identifiers and the agent error code without provider details', () => {
    const logger = vi.fn();
    const providerError = new Error('secret provider response');

    logAnalysisFailure(
      new AgentError(
        'INVALID_AI_OUTPUT',
        'AI分析の実行に失敗しました。',
        providerError,
      ),
      {
        analysisId: 'analysis-id',
        capturedPageId: 'capture-id',
      },
      logger,
    );

    expect(logger).toHaveBeenCalledWith(
      'AI Web Scout background analysis failed.',
      {
        analysisId: 'analysis-id',
        capturedPageId: 'capture-id',
        code: 'INVALID_AI_OUTPUT',
      },
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(
      'secret provider response',
    );
  });

  it('uses a generic code for unexpected failures', () => {
    const logger = vi.fn();

    logAnalysisFailure(
      new Error('unexpected details'),
      {
        analysisId: 'analysis-id',
        capturedPageId: 'capture-id',
      },
      logger,
    );

    expect(logger).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ code: 'UNEXPECTED_ERROR' }),
    );
  });
});
