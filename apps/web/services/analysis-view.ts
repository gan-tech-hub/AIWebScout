import { analysisResultSchema } from '@ai-web-scout/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnalysisDetails } from '@/domain/models';
import type { Database } from '@/infrastructure/supabase/database.types';
import { SupabaseAnalysisRepository } from '@/infrastructure/repositories';
import type {
  AnalysisListItem,
  WorkspaceAnalysis,
} from '@/features/analyses/types';

function typeSpecificEntries(
  value: ReturnType<typeof analysisResultSchema.safeParse>,
): Array<{ label: string; value: string }> {
  if (!value.success) return [];
  const data = value.data.typeSpecificResult.data;
  return Object.entries(data)
    .slice(0, 8)
    .map(([label, entry]) => ({
      label,
      value: Array.isArray(entry)
        ? entry.join(' / ') || '—'
        : entry === null
          ? '—'
          : String(entry),
    }));
}

export function toAnalysisListItem(details: AnalysisDetails): AnalysisListItem {
  return {
    id: details.analysis.id,
    title: details.capturedPage.title,
    url: details.capturedPage.url,
    pageType: details.analysis.pageType ?? 'general',
    status: details.analysis.status,
    summary:
      details.analysis.summary ||
      (details.analysis.status === 'failed'
        ? details.analysis.errorMessage || '分析に失敗しました。'
        : 'AIエージェントが分析を準備しています。'),
    recommendationScore: details.analysis.recommendationScore,
    createdAt: details.analysis.createdAt,
    tags: details.tags.map((tag) => tag.tag),
  };
}

export function toWorkspaceAnalysis(
  details: AnalysisDetails,
): WorkspaceAnalysis {
  const parsed = analysisResultSchema.safeParse(details.analysis.result);
  return {
    item: toAnalysisListItem(details),
    capturedPage: {
      title: details.capturedPage.title,
      url: details.capturedPage.url,
      metaDescription: details.capturedPage.metaDescription,
      selectedText: details.capturedPage.selectedText,
      capturedAt: details.capturedPage.capturedAt,
      excerpt: details.capturedPage.pageText.slice(0, 8_000),
    },
    steps: details.steps.map((step) => ({
      id: step.id,
      name: step.stepName,
      purpose: step.description,
      status: step.status,
      description: step.description,
      input: step.inputSummary || '—',
      output: step.outputSummary || '—',
      tool: step.toolName || 'Application workflow',
      durationMs: step.durationMs,
      ...(step.errorMessage ? { warning: step.errorMessage } : {}),
    })),
    insight: {
      keyPoints: parsed.success ? parsed.data.keyPoints : [],
      risks: parsed.success ? parsed.data.risks : [],
      actions: parsed.success ? parsed.data.recommendedActions : [],
      evidence: details.steps
        .map((step) => step.outputSummary)
        .filter(Boolean)
        .slice(0, 6),
      missingInformation: parsed.success ? parsed.data.missingInformation : [],
      confidence: parsed.success ? parsed.data.confidence : 0,
      typeSpecific: typeSpecificEntries(parsed),
    },
  };
}

export async function loadAnalysisItems(
  client: SupabaseClient<Database>,
  userId: string,
  limit = 50,
): Promise<AnalysisListItem[]> {
  const repository = new SupabaseAnalysisRepository(client);
  const analyses = await repository.list({ userId, limit });
  const details = await Promise.all(
    analyses.map((analysis) => repository.findById(analysis.id, userId)),
  );
  return details.filter((item) => item !== null).map(toAnalysisListItem);
}
