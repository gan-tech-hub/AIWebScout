import type {
  AgentStepStatus,
  AnalysisStatus,
  CaptureSourceType,
  PageType,
} from '@ai-web-scout/shared';
import type { Json } from '@/infrastructure/supabase/database.types';

export type CreateCapturedPageInput = {
  userId: string;
  title: string;
  url: string;
  pageText: string;
  selectedText: string;
  metaDescription: string;
  sourceType: CaptureSourceType;
  capturedAt: string;
};

export type SaveProfileInput = {
  userId: string;
  displayName: string;
  bio: string;
  skills: string[];
  desiredConditions: Record<string, Json | undefined>;
  desiredHourlyRate: number | null;
  availableHours: number | null;
  preferredWorkStyle: string;
  analysisInstruction: string;
};

export type CreateAnalysisInput = {
  userId: string;
  capturedPageId: string;
};

export type UpdateAnalysisInput = {
  pageType?: PageType | null;
  status?: AnalysisStatus;
  summary?: string;
  recommendation?: string;
  recommendationScore?: number | null;
  result?: Json;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type AnalysisListQuery = {
  userId: string;
  pageType?: PageType;
  status?: AnalysisStatus;
  limit?: number;
  ascending?: boolean;
};

export type CreateAgentStepInput = {
  analysisId: string;
  stepKey: string;
  stepName: string;
  status?: AgentStepStatus;
  description?: string;
  inputSummary?: string;
  outputSummary?: string;
  toolName?: string | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  sortOrder: number;
};

export type UpdateAgentStepInput = Omit<
  Partial<CreateAgentStepInput>,
  'analysisId' | 'stepKey' | 'sortOrder'
>;
