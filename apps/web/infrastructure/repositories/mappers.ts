import { z } from 'zod';
import type {
  AgentStep,
  AnalysisTag,
  CapturedPage,
  PageAnalysis,
  UserProfile,
} from '@/domain/models';
import type { Json, TableRow } from '@/infrastructure/supabase/database.types';
import { RepositoryDataError } from './repository-error';

const skillsSchema = z.array(z.string());

function parseSkills(value: Json): string[] {
  const parsed = skillsSchema.safeParse(value);
  if (!parsed.success) {
    throw new RepositoryDataError(
      'プロフィールのskills形式が不正です。',
      parsed.error,
    );
  }
  return parsed.data;
}

function parseJsonObject(value: Json): Record<string, Json | undefined> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new RepositoryDataError('JSONオブジェクトの形式が不正です。');
  }
  return value;
}

export function mapProfile(row: TableRow<'profiles'>): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio,
    skills: parseSkills(row.skills),
    desiredConditions: parseJsonObject(row.desired_conditions),
    desiredHourlyRate: row.desired_hourly_rate,
    availableHours: row.available_hours,
    preferredWorkStyle: row.preferred_work_style,
    analysisInstruction: row.analysis_instruction,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCapturedPage(row: TableRow<'captured_pages'>): CapturedPage {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    url: row.url,
    pageText: row.page_text,
    selectedText: row.selected_text,
    metaDescription: row.meta_description,
    sourceType: row.source_type,
    capturedAt: row.captured_at,
    createdAt: row.created_at,
  };
}

export function mapAnalysis(row: TableRow<'analyses'>): PageAnalysis {
  return {
    id: row.id,
    userId: row.user_id,
    capturedPageId: row.captured_page_id,
    pageType: row.page_type,
    status: row.status,
    summary: row.summary,
    recommendation: row.recommendation,
    recommendationScore: row.recommendation_score,
    result: row.result_json,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAgentStep(row: TableRow<'agent_steps'>): AgentStep {
  return {
    id: row.id,
    analysisId: row.analysis_id,
    stepKey: row.step_key,
    stepName: row.step_name,
    status: row.status,
    description: row.description,
    inputSummary: row.input_summary,
    outputSummary: row.output_summary,
    toolName: row.tool_name,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationMs: row.duration_ms,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function mapAnalysisTag(row: TableRow<'analysis_tags'>): AnalysisTag {
  return {
    id: row.id,
    analysisId: row.analysis_id,
    tag: row.tag,
    createdAt: row.created_at,
  };
}
