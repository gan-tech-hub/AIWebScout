import type {
  AgentStepStatus,
  AnalysisStatus,
  CaptureSourceType,
  PageType,
} from '@ai-web-scout/shared';
import type { Json } from '@/infrastructure/supabase/database.types';

export type UserProfile = {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  skills: string[];
  desiredConditions: Record<string, Json | undefined>;
  desiredHourlyRate: number | null;
  availableHours: number | null;
  preferredWorkStyle: string;
  analysisInstruction: string;
  createdAt: string;
  updatedAt: string;
};

export type CapturedPage = {
  id: string;
  userId: string;
  title: string;
  url: string;
  pageText: string;
  selectedText: string;
  metaDescription: string;
  sourceType: CaptureSourceType;
  capturedAt: string;
  createdAt: string;
};

export type PageAnalysis = {
  id: string;
  userId: string;
  capturedPageId: string;
  pageType: PageType | null;
  status: AnalysisStatus;
  summary: string;
  recommendation: string;
  recommendationScore: number | null;
  result: Json;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentStep = {
  id: string;
  analysisId: string;
  stepKey: string;
  stepName: string;
  status: AgentStepStatus;
  description: string;
  inputSummary: string;
  outputSummary: string;
  toolName: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  sortOrder: number;
  createdAt: string;
};

export type AnalysisTag = {
  id: string;
  analysisId: string;
  tag: string;
  createdAt: string;
};

export type AnalysisDetails = {
  analysis: PageAnalysis;
  capturedPage: CapturedPage;
  steps: AgentStep[];
  tags: AnalysisTag[];
};
