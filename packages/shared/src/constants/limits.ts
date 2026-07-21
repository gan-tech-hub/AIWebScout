export const CAPTURE_LIMITS = {
  title: 500,
  url: 2_048,
  pageText: 50_000,
  selectedText: 10_000,
  metaDescription: 2_000,
} as const;

export const AGENT_LIMITS = {
  maxWorkflowSteps: 12,
  maxToolCalls: 3,
  maxOutputTokens: 3_000,
  timeoutMs: 45_000,
} as const;
