import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import {
  analysisResultSchema,
  pageClassificationSchema,
  profileToolArgumentsSchema,
  type AnalysisResult,
  type PageClassification,
} from '@ai-web-scout/shared';
import type { AiAgentGateway } from '../../application/ai/ai-agent-gateway';
import { AgentError } from '../../application/ai/agent-error';
import type {
  AgentPageInput,
  AgentTokenUsage,
  AnalyzePageRequest,
  AnalyzePageResponse,
} from '../../application/ai/types';
import type { AgentConfig } from '../../lib/agent-config';
import {
  buildAnalysisInstructions,
  buildClassificationInstructions,
  buildPageContext,
} from './prompts';

type FunctionCall = {
  type: 'function_call';
  call_id: string;
  name: string;
  arguments: string;
};

const profileTool = {
  type: 'function' as const,
  name: 'load_user_profile',
  description:
    '現在のユーザーのスキル、希望条件、働き方、AI分析追加指示を読み込む。',
  parameters: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'この分析でプロフィール比較が必要な理由。',
      },
    },
    required: ['reason'],
    additionalProperties: false,
  },
  strict: true,
};

function isFunctionCall(item: unknown): item is FunctionCall {
  if (!item || typeof item !== 'object') return false;
  const value = item as Record<string, unknown>;
  return (
    value.type === 'function_call' &&
    typeof value.call_id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.arguments === 'string'
  );
}

function usageOf(
  usage:
    | { input_tokens?: number; output_tokens?: number; total_tokens?: number }
    | null
    | undefined,
): AgentTokenUsage {
  return {
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

function mergeUsage(
  first: AgentTokenUsage,
  second: AgentTokenUsage,
): AgentTokenUsage {
  return {
    inputTokens: first.inputTokens + second.inputTokens,
    outputTokens: first.outputTokens + second.outputTokens,
    totalTokens: first.totalTokens + second.totalTokens,
  };
}

function requireParsed<T>(value: T | null, label: string): T {
  if (value === null) {
    throw new AgentError(
      'INVALID_AI_OUTPUT',
      `${label}の構造化出力を取得できませんでした。`,
    );
  }
  return value;
}

export class OpenAiAgentGateway implements AiAgentGateway {
  private readonly client: OpenAI;

  constructor(
    private readonly config: AgentConfig,
    client?: OpenAI,
  ) {
    this.client = client ?? new OpenAI({ apiKey: config.apiKey });
  }

  async classify(page: AgentPageInput): Promise<PageClassification> {
    try {
      const response = await this.client.responses.parse(
        {
          model: this.config.model,
          instructions: buildClassificationInstructions(),
          input: buildPageContext(page),
          max_output_tokens: Math.min(this.config.maxOutputTokens, 1_000),
          text: {
            format: zodTextFormat(
              pageClassificationSchema,
              'page_classification',
            ),
          },
        },
        { signal: AbortSignal.timeout(this.config.timeoutMs) },
      );
      return pageClassificationSchema.parse(
        requireParsed(response.output_parsed, 'ページ分類'),
      );
    } catch (error: unknown) {
      throw this.mapError(error, 'ページ種別の判定に失敗しました。');
    }
  }

  async analyze(request: AnalyzePageRequest): Promise<AnalyzePageResponse> {
    try {
      const first = await this.client.responses.parse(
        {
          model: this.config.model,
          instructions: buildAnalysisInstructions(
            request.classification,
            request.additionalInstruction,
          ),
          input: buildPageContext(request.page),
          max_output_tokens: this.config.maxOutputTokens,
          max_tool_calls: this.config.maxToolCalls,
          parallel_tool_calls: false,
          tools: this.config.maxToolCalls > 0 ? [profileTool] : [],
          text: {
            format: zodTextFormat(analysisResultSchema, 'page_analysis'),
          },
        },
        { signal: AbortSignal.timeout(this.config.timeoutMs) },
      );

      const calls = first.output.filter(isFunctionCall) as FunctionCall[];
      if (calls.length === 0) {
        return {
          result: this.parseAnalysis(first.output_parsed),
          toolEvents: [],
          usage: usageOf(first.usage),
        };
      }
      if (calls.length > this.config.maxToolCalls) {
        throw new AgentError(
          'TOOL_LIMIT_EXCEEDED',
          'AIツールの実行上限を超えました。',
        );
      }
      if (new Set(calls.map((call) => call.name)).size !== calls.length) {
        throw new AgentError(
          'TOOL_LIMIT_EXCEEDED',
          '同じAIツールの繰り返し実行は許可されていません。',
        );
      }

      const toolEvents: AnalyzePageResponse['toolEvents'] = [];
      const outputs = [];
      for (const call of calls) {
        if (call.name !== 'load_user_profile') {
          throw new AgentError(
            'UNKNOWN_TOOL',
            `許可されていないAIツールが要求されました: ${call.name}`,
          );
        }
        const args = profileToolArgumentsSchema.parse(
          JSON.parse(call.arguments) as unknown,
        );
        const profile = await request.loadUserProfile();
        toolEvents.push({
          name: 'load_user_profile',
          reason: args.reason,
          calledAt: new Date().toISOString(),
          found: profile !== null,
        });
        outputs.push({
          type: 'function_call_output' as const,
          call_id: call.call_id,
          output: JSON.stringify(profile),
        });
      }

      const finalResponse = await this.client.responses.parse(
        {
          model: this.config.model,
          previous_response_id: first.id,
          input: outputs,
          max_output_tokens: this.config.maxOutputTokens,
          parallel_tool_calls: false,
          tools: [profileTool],
          tool_choice: 'none',
          text: {
            format: zodTextFormat(analysisResultSchema, 'page_analysis'),
          },
        },
        { signal: AbortSignal.timeout(this.config.timeoutMs) },
      );
      if (finalResponse.output.some(isFunctionCall)) {
        throw new AgentError(
          'TOOL_LIMIT_EXCEEDED',
          'AIツールが停止条件の後に再実行されました。',
        );
      }
      return {
        result: this.parseAnalysis(finalResponse.output_parsed),
        toolEvents,
        usage: mergeUsage(usageOf(first.usage), usageOf(finalResponse.usage)),
      };
    } catch (error: unknown) {
      throw this.mapError(error, 'AI分析の実行に失敗しました。');
    }
  }

  private parseAnalysis(value: AnalysisResult | null): AnalysisResult {
    return analysisResultSchema.parse(requireParsed(value, 'AI分析'));
  }

  private mapError(error: unknown, message: string): AgentError {
    if (error instanceof AgentError) return error;
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return new AgentError('AI_TIMEOUT', 'AI分析がタイムアウトしました。');
    }
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      return new AgentError('AI_TIMEOUT', 'AI分析がタイムアウトしました。');
    }
    if (error instanceof OpenAI.APIError) {
      return new AgentError('AI_PROVIDER_ERROR', message, error);
    }
    return new AgentError('INVALID_AI_OUTPUT', message, error);
  }
}
