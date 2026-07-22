import type {
  AgentStepStatus,
  AnalysisStatus,
  PageType,
} from '@ai-web-scout/shared';

export type AnalysisListItem = {
  id: string;
  title: string;
  url: string;
  pageType: PageType;
  status: AnalysisStatus;
  summary: string;
  recommendationScore: number | null;
  createdAt: string;
  tags: string[];
};

export type WorkspaceStep = {
  id: string;
  name: string;
  purpose: string;
  status: AgentStepStatus;
  description: string;
  input: string;
  output: string;
  tool: string;
  durationMs: number | null;
  warning?: string;
};

export type WorkspaceAnalysis = {
  item: AnalysisListItem;
  capturedPage: {
    title: string;
    url: string;
    metaDescription: string;
    selectedText: string;
    capturedAt: string;
    excerpt: string;
  };
  steps: WorkspaceStep[];
  insight: {
    keyPoints: string[];
    risks: string[];
    actions: string[];
    evidence: string[];
    missingInformation: string[];
    confidence: number;
    typeSpecific: Array<{ label: string; value: string }>;
  };
};

export type AnalysisFilters = {
  query: string;
  pageType: PageType | 'all';
  status: AnalysisStatus | 'all';
  sort: 'newest' | 'oldest' | 'score';
};
