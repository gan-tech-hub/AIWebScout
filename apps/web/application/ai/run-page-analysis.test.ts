import { describe, expect, it, vi } from 'vitest';
import type {
  AgentStepRepository,
  AnalysisRepository,
  AnalysisTagRepository,
  CaptureRepository,
  ProfileRepository,
} from '@/application/repositories';
import type { AgentStep, CapturedPage } from '@/domain/models';
import type { AiAgentGateway } from './ai-agent-gateway';
import { RunPageAnalysis } from './run-page-analysis';

const result = {
  pageType: 'general' as const,
  title: 'Example',
  summary: 'Example summary',
  keyPoints: ['Point'],
  risks: [],
  recommendedActions: ['Review'],
  recommendationScore: 70,
  confidence: 0.9,
  missingInformation: [],
  tags: ['example'],
  typeSpecificResult: {
    pageType: 'general' as const,
    data: {
      purpose: 'Information',
      usefulness: 'Useful',
      reliabilityNotes: [],
    },
  },
};

const capturedPage: CapturedPage = {
  id: 'capture-id',
  userId: 'user-id',
  title: ' Example ',
  url: 'https://example.com',
  pageText: 'Example   page text',
  selectedText: '',
  metaDescription: '',
  sourceType: 'chrome_extension',
  capturedAt: '2026-07-24T00:00:00.000Z',
  createdAt: '2026-07-24T00:00:00.000Z',
};

function createStep(index: number, key: string): AgentStep {
  return {
    id: `step-${index}`,
    analysisId: 'analysis-id',
    stepKey: key,
    stepName: key,
    status: 'pending',
    description: '',
    inputSummary: '',
    outputSummary: '',
    toolName: null,
    errorMessage: null,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    sortOrder: index,
    createdAt: '2026-07-24T00:00:00.000Z',
  };
}

function setup(overrides?: { ai?: Partial<AiAgentGateway> }) {
  const analysisUpdate = vi.fn().mockResolvedValue({});
  const analysisFindById = vi.fn().mockResolvedValue({
    analysis: { capturedPageId: 'capture-id' },
    capturedPage,
    steps: [],
    tags: [],
  });
  const stepUpdate = vi.fn().mockResolvedValue({});
  const stepCreateMany = vi
    .fn()
    .mockImplementation((inputs: { stepKey: string }[]) =>
      Promise.resolve(
        inputs.map((input, index) => createStep(index + 1, input.stepKey)),
      ),
    );
  const aiClassify = vi.fn().mockResolvedValue({
    pageType: 'general',
    confidence: 0.9,
    reasons: ['General content'],
    profileRecommended: false,
  });
  const dependencies = {
    analyses: {
      findById: analysisFindById,
      update: analysisUpdate,
    } as unknown as AnalysisRepository,
    captures: {
      findById: vi.fn().mockResolvedValue(capturedPage),
    } as unknown as CaptureRepository,
    profiles: {
      findByUserId: vi.fn().mockResolvedValue(null),
    } as unknown as ProfileRepository,
    steps: {
      createMany: stepCreateMany,
      update: stepUpdate,
    } as unknown as AgentStepRepository,
    tags: {
      addMany: vi.fn().mockResolvedValue([]),
    } as unknown as AnalysisTagRepository,
    ai: {
      classify: aiClassify,
      analyze: vi.fn().mockResolvedValue({
        result,
        toolEvents: [],
        usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      }),
      ...overrides?.ai,
    },
    maxInputChars: 50_000,
  };
  return {
    dependencies,
    analysisUpdate,
    analysisFindById,
    stepUpdate,
    stepCreateMany,
    aiClassify,
  };
}

describe('RunPageAnalysis', () => {
  it('does not create steps or call AI for an analysis outside the user scope', async () => {
    const { dependencies, analysisFindById, stepCreateMany, aiClassify } =
      setup();
    analysisFindById.mockResolvedValue(null);
    const useCase = new RunPageAnalysis(dependencies);

    await expect(
      useCase.execute({
        analysisId: 'other-analysis',
        capturedPageId: 'capture-id',
        userId: 'user-id',
      }),
    ).rejects.toMatchObject({ code: 'ANALYSIS_NOT_FOUND' });
    expect(stepCreateMany).not.toHaveBeenCalled();
    expect(aiClassify).not.toHaveBeenCalled();
  });

  it('runs the bounded workflow and persists a validated result', async () => {
    const { dependencies, analysisUpdate, stepUpdate } = setup();
    const useCase = new RunPageAnalysis(dependencies);

    await expect(
      useCase.execute({
        analysisId: 'analysis-id',
        capturedPageId: 'capture-id',
        userId: 'user-id',
      }),
    ).resolves.toEqual(result);

    expect(analysisUpdate).toHaveBeenLastCalledWith(
      'analysis-id',
      'user-id',
      expect.objectContaining({
        status: 'completed',
        pageType: 'general',
        recommendationScore: 70,
      }),
    );
    expect(stepUpdate).toHaveBeenCalledWith(
      'step-5',
      'analysis-id',
      expect.objectContaining({ status: 'skipped' }),
    );
  });

  it('fails closed when classification and analysis types differ', async () => {
    const { dependencies, analysisUpdate } = setup({
      ai: {
        analyze: vi.fn().mockResolvedValue({
          result: { ...result, pageType: 'article' },
          toolEvents: [],
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        }),
      },
    });
    const useCase = new RunPageAnalysis(dependencies);

    await expect(
      useCase.execute({
        analysisId: 'analysis-id',
        capturedPageId: 'capture-id',
        userId: 'user-id',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AI_OUTPUT' });
    expect(analysisUpdate).toHaveBeenLastCalledWith(
      'analysis-id',
      'user-id',
      expect.objectContaining({ status: 'failed' }),
    );
  });
});
