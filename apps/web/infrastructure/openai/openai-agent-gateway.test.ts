import type OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { analysisResultSchema } from '@ai-web-scout/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAiAgentGateway } from './openai-agent-gateway';

const result = {
  pageType: 'general' as const,
  title: 'Example',
  summary: 'Summary',
  keyPoints: ['Point'],
  risks: [],
  recommendedActions: ['Read'],
  recommendationScore: 60,
  confidence: 0.8,
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

const config = {
  apiKey: 'test-key',
  model: 'test-model',
  maxInputChars: 50_000,
  maxOutputTokens: 3_000,
  maxToolCalls: 1,
  timeoutMs: 45_000,
};

const request = {
  page: {
    title: 'Example',
    url: 'https://example.com',
    pageText: 'Example page',
    selectedText: '',
    metaDescription: '',
  },
  classification: {
    pageType: 'general' as const,
    confidence: 0.8,
    reasons: ['General'],
    profileRecommended: false,
  },
  additionalInstruction: '',
  loadUserProfile: vi.fn().mockResolvedValue(null),
};

describe('OpenAiAgentGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('converts the analysis contract into a strict object schema', () => {
    const format = zodTextFormat(
      analysisResultSchema,
      'page_analysis',
    ) as unknown as {
      strict: boolean;
      schema: { type?: string; properties?: Record<string, unknown> };
    };

    expect(format.strict).toBe(true);
    expect(format.schema.type).toBe('object');
    expect(format.schema.properties).toHaveProperty('typeSpecificResult');
  });

  it('executes one allowlisted tool and stops with structured output', async () => {
    const parse = vi
      .fn()
      .mockResolvedValueOnce({
        id: 'response-1',
        output: [
          {
            type: 'function_call',
            name: 'load_user_profile',
            call_id: 'call-1',
            arguments: '{"reason":"条件比較"}',
          },
        ],
        output_parsed: null,
        usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
      })
      .mockResolvedValueOnce({
        id: 'response-2',
        output: [],
        output_parsed: result,
        usage: { input_tokens: 4, output_tokens: 6, total_tokens: 10 },
      });
    const client = { responses: { parse } } as unknown as OpenAI;
    const gateway = new OpenAiAgentGateway(config, client);

    const response = await gateway.analyze(request);

    expect(response.result).toEqual(result);
    expect(response.toolEvents).toEqual([
      expect.objectContaining({
        name: 'load_user_profile',
        reason: '条件比較',
        found: false,
      }),
    ]);
    expect(response.usage.totalTokens).toBe(25);
    expect(parse).toHaveBeenCalledTimes(2);
    expect(parse.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        previous_response_id: 'response-1',
        tool_choice: 'none',
      }),
    );
  });

  it('rejects a tool outside the allowlist', async () => {
    const client = {
      responses: {
        parse: vi.fn().mockResolvedValue({
          id: 'response-1',
          output: [
            {
              type: 'function_call',
              name: 'browse_web',
              call_id: 'call-1',
              arguments: '{}',
            },
          ],
          output_parsed: null,
          usage: null,
        }),
      },
    } as unknown as OpenAI;
    const gateway = new OpenAiAgentGateway(config, client);

    await expect(gateway.analyze(request)).rejects.toMatchObject({
      code: 'UNKNOWN_TOOL',
    });
  });

  it('rejects repeated calls to the same tool', async () => {
    const repeatedCall = {
      type: 'function_call',
      name: 'load_user_profile',
      arguments: '{"reason":"条件比較"}',
    };
    const client = {
      responses: {
        parse: vi.fn().mockResolvedValue({
          id: 'response-1',
          output: [
            { ...repeatedCall, call_id: 'call-1' },
            { ...repeatedCall, call_id: 'call-2' },
          ],
          output_parsed: null,
          usage: null,
        }),
      },
    } as unknown as OpenAI;
    const gateway = new OpenAiAgentGateway(
      { ...config, maxToolCalls: 2 },
      client,
    );

    await expect(gateway.analyze(request)).rejects.toMatchObject({
      code: 'TOOL_LIMIT_EXCEEDED',
    });
    expect(request.loadUserProfile).not.toHaveBeenCalled();
  });
});
