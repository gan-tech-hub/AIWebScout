import { describe, expect, it } from 'vitest';
import {
  buildAnalysisInstructions,
  buildClassificationInstructions,
} from './prompts';

describe('OpenAI prompts', () => {
  it('requires Japanese classification output for every source language', () => {
    const prompt = buildClassificationInstructions();

    expect(prompt).toContain('入力ページの言語にかかわらず日本語');
    expect(prompt).toContain('Tool Callingのreasonも日本語');
  });

  it('requires Japanese analysis text while preserving schema values', () => {
    const prompt = buildAnalysisInstructions(
      {
        pageType: 'github',
        confidence: 0.9,
        reasons: ['Repository page'],
        profileRecommended: true,
      },
      '',
    );

    expect(prompt).toContain(
      'summary、reasons、keyPoints、risks、recommendedActions',
    );
    expect(prompt).toContain('列挙値は翻訳せず');
    expect(prompt).toContain('技術名、コード、URLなどの固有表現は原文');
  });
});
