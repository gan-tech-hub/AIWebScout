import type { AnalysisResult } from '@ai-web-scout/shared';
import type {
  AgentStepRepository,
  AnalysisRepository,
  AnalysisTagRepository,
  CaptureRepository,
  ProfileRepository,
} from '@/application/repositories';
import type { AgentStep } from '@/domain/models';
import type { Json } from '@/infrastructure/supabase/database.types';
import type { AiAgentGateway } from './ai-agent-gateway';
import { AgentError } from './agent-error';
import { selectAnalysisStrategy } from './strategies';

type Dependencies = {
  analyses: AnalysisRepository;
  captures: CaptureRepository;
  profiles: ProfileRepository;
  steps: AgentStepRepository;
  tags: AnalysisTagRepository;
  ai: AiAgentGateway;
  maxInputChars: number;
  now?: () => Date;
};

type RunPageAnalysisInput = {
  analysisId: string;
  capturedPageId: string;
  userId: string;
};

const stepDefinitions = [
  ['validate_input', '入力データを検証', 'ページ情報と実行条件を確認します。'],
  [
    'normalize_content',
    '本文を整形',
    '分析対象の本文を安全な長さへ整形します。',
  ],
  ['classify_page', 'ページ種別を判定', 'ページの目的と種別を判定します。'],
  [
    'select_strategy',
    '分析方針を選択',
    'ページ種別に適した分析観点を選択します。',
  ],
  [
    'load_profile',
    'プロフィールを参照',
    '必要な場合だけユーザー条件を参照します。',
  ],
  ['analyze_page', '構造化分析を実行', '制限付きAIワークフローで分析します。'],
  ['validate_result', '分析結果を検証', '構造化結果の整合性を確認します。'],
  ['save_result', '分析結果を保存', '結果、タグ、実行状態を保存します。'],
] as const;

function asJson(value: AnalysisResult): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof AgentError) return error.message;
  return '分析処理中に予期しないエラーが発生しました。';
}

export class RunPageAnalysis {
  private readonly now: () => Date;

  constructor(private readonly dependencies: Dependencies) {
    this.now = dependencies.now ?? (() => new Date());
  }

  async execute(input: RunPageAnalysisInput): Promise<AnalysisResult> {
    const analysisDetails = await this.dependencies.analyses.findById(
      input.analysisId,
      input.userId,
    );
    if (!analysisDetails) {
      throw new AgentError(
        'ANALYSIS_NOT_FOUND',
        '実行対象の分析が見つかりません。',
      );
    }
    if (
      analysisDetails.analysis.capturedPageId !== input.capturedPageId ||
      analysisDetails.capturedPage.id !== input.capturedPageId
    ) {
      throw new AgentError(
        'CAPTURE_NOT_FOUND',
        '分析とページ情報の組み合わせが一致しません。',
      );
    }

    const startedAt = this.now().toISOString();
    const createdSteps = await this.dependencies.steps.createMany(
      stepDefinitions.map(([stepKey, stepName, description], index) => ({
        analysisId: input.analysisId,
        stepKey,
        stepName,
        description,
        sortOrder: index + 1,
      })),
    );
    const steps = new Map(createdSteps.map((step) => [step.stepKey, step]));
    let currentStep: AgentStep | null = null;

    await this.dependencies.analyses.update(input.analysisId, input.userId, {
      status: 'running',
      startedAt,
      errorMessage: null,
    });

    const runStep = async <T>(
      key: string,
      action: () => Promise<T> | T,
      summaries?: {
        input?: string;
        output?: (value: T) => string;
        toolName?: string;
      },
    ): Promise<T> => {
      const step = steps.get(key);
      if (!step) throw new Error(`Agent step is missing: ${key}`);
      currentStep = step;
      const stepStarted = this.now();
      await this.dependencies.steps.update(step.id, input.analysisId, {
        status: 'running',
        startedAt: stepStarted.toISOString(),
        inputSummary: summaries?.input ?? '',
        toolName: summaries?.toolName ?? null,
      });
      const value = await action();
      const completed = this.now();
      await this.dependencies.steps.update(step.id, input.analysisId, {
        status: 'completed',
        completedAt: completed.toISOString(),
        durationMs: completed.getTime() - stepStarted.getTime(),
        outputSummary: summaries?.output?.(value) ?? '',
      });
      currentStep = null;
      return value;
    };

    try {
      const capturedPage = await runStep(
        'validate_input',
        async () => {
          const page = await this.dependencies.captures.findById(
            input.capturedPageId,
            input.userId,
          );
          if (!page) {
            throw new AgentError(
              'CAPTURE_NOT_FOUND',
              '分析対象のページ情報が見つかりません。',
            );
          }
          return page;
        },
        {
          input: `capture=${input.capturedPageId}`,
          output: (page) => `「${page.title}」を確認しました。`,
        },
      );

      const page = await runStep(
        'normalize_content',
        () => ({
          title: capturedPage.title.trim(),
          url: capturedPage.url,
          pageText: capturedPage.pageText
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, this.dependencies.maxInputChars),
          selectedText: capturedPage.selectedText.trim(),
          metaDescription: capturedPage.metaDescription.trim(),
        }),
        {
          input: `${capturedPage.pageText.length.toLocaleString()}文字`,
          output: (value) =>
            `${value.pageText.length.toLocaleString()}文字を分析対象にしました。`,
        },
      );

      const classification = await runStep(
        'classify_page',
        () => this.dependencies.ai.classify(page),
        {
          input: `タイトル、URL、本文${page.pageText.length.toLocaleString()}文字`,
          output: (value) =>
            `${value.pageType}（信頼度 ${Math.round(value.confidence * 100)}%）`,
        },
      );

      const strategy = await runStep(
        'select_strategy',
        () => selectAnalysisStrategy(classification.pageType),
        {
          input: `pageType=${classification.pageType}`,
          output: (value) => `${value.name}: ${value.purpose}`,
        },
      );

      const profileStep = steps.get('load_profile');
      if (!profileStep) throw new Error('Profile step is missing.');
      let profileWasLoaded = false;
      const response = await runStep(
        'analyze_page',
        () =>
          this.dependencies.ai.analyze({
            page,
            classification,
            additionalInstruction: '',
            loadUserProfile: async () => {
              profileWasLoaded = true;
              const toolStarted = this.now();
              await this.dependencies.steps.update(
                profileStep.id,
                input.analysisId,
                {
                  status: 'running',
                  startedAt: toolStarted.toISOString(),
                  toolName: 'load_user_profile',
                  inputSummary: 'AIが分析条件との比較を要求しました。',
                },
              );
              try {
                const profile = await this.dependencies.profiles.findByUserId(
                  input.userId,
                );
                const toolCompleted = this.now();
                await this.dependencies.steps.update(
                  profileStep.id,
                  input.analysisId,
                  {
                    status: 'completed',
                    completedAt: toolCompleted.toISOString(),
                    durationMs: toolCompleted.getTime() - toolStarted.getTime(),
                    outputSummary: profile
                      ? `スキル${profile.skills.length}件と希望条件を参照しました。`
                      : 'プロフィールは未登録でした。',
                  },
                );
                return profile;
              } catch (error: unknown) {
                await this.dependencies.steps.update(
                  profileStep.id,
                  input.analysisId,
                  {
                    status: 'failed',
                    completedAt: this.now().toISOString(),
                    errorMessage:
                      'ユーザープロフィールを参照できませんでした。',
                  },
                );
                throw error;
              }
            },
          }),
        {
          input: `${strategy.name}方針`,
          output: (value) =>
            `推奨度${value.result.recommendationScore}、ツール${value.toolEvents.length}回、${value.usage.totalTokens} tokens`,
        },
      );

      if (!profileWasLoaded) {
        await this.dependencies.steps.update(profileStep.id, input.analysisId, {
          status: 'skipped',
          completedAt: this.now().toISOString(),
          outputSummary: 'この分析ではプロフィール参照を使用しませんでした。',
        });
      }

      const result = await runStep(
        'validate_result',
        () => {
          if (response.result.pageType !== classification.pageType) {
            throw new AgentError(
              'INVALID_AI_OUTPUT',
              '分類結果と分析結果のページ種別が一致しません。',
            );
          }
          return response.result;
        },
        {
          input: 'Structured OutputsとZodの検証済み結果',
          output: (value) =>
            `${value.keyPoints.length}件の重要ポイントを確認しました。`,
        },
      );

      await runStep(
        'save_result',
        async () => {
          const completedAt = this.now().toISOString();
          await this.dependencies.analyses.update(
            input.analysisId,
            input.userId,
            {
              pageType: result.pageType,
              status: 'completed',
              summary: result.summary,
              recommendation: result.recommendedActions[0] ?? '',
              recommendationScore: result.recommendationScore,
              result: asJson(result),
              errorMessage: null,
              completedAt,
            },
          );
          await this.dependencies.tags.addMany(input.analysisId, result.tags);
          return result;
        },
        {
          input: `タグ${result.tags.length}件`,
          output: () => '分析結果とタグを保存しました。',
        },
      );

      return result;
    } catch (error: unknown) {
      const failedAt = this.now();
      const failedStep = currentStep as AgentStep | null;
      if (failedStep) {
        await this.dependencies.steps.update(failedStep.id, input.analysisId, {
          status: 'failed',
          completedAt: failedAt.toISOString(),
          errorMessage: safeErrorMessage(error),
        });
      }
      await this.dependencies.analyses.update(input.analysisId, input.userId, {
        status: 'failed',
        errorMessage: safeErrorMessage(error),
        completedAt: failedAt.toISOString(),
      });
      throw error;
    }
  }
}
