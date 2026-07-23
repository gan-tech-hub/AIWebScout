import type {
  AnalysisResult,
  PageClassification,
  PageType,
} from '@ai-web-scout/shared';
import type { CapturedPage, UserProfile } from '@/domain/models';

export type AgentPageInput = Pick<
  CapturedPage,
  'title' | 'url' | 'pageText' | 'selectedText' | 'metaDescription'
>;

export type AgentTokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type AgentToolEvent = {
  name: 'load_user_profile';
  reason: string;
  calledAt: string;
  found: boolean;
};

export type AnalyzePageRequest = {
  page: AgentPageInput;
  classification: PageClassification;
  additionalInstruction: string;
  loadUserProfile: () => Promise<UserProfile | null>;
};

export type AnalyzePageResponse = {
  result: AnalysisResult;
  toolEvents: AgentToolEvent[];
  usage: AgentTokenUsage;
};

export type AnalysisStrategy = {
  pageType: PageType;
  name: string;
  purpose: string;
  requiresProfile: boolean;
  focus: string[];
};
