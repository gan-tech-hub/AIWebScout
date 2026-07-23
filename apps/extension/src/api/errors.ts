export type ExtensionErrorCode =
  | 'CAPTURE_BLOCKED'
  | 'CAPTURE_FAILED'
  | 'INVALID_CAPTURE'
  | 'NETWORK_ERROR'
  | 'REQUEST_TIMEOUT'
  | 'UNAUTHORIZED'
  | 'API_ERROR'
  | 'INVALID_RESPONSE';

export class ExtensionError extends Error {
  constructor(
    public readonly code: ExtensionErrorCode,
    message: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ExtensionError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return '予期しないエラーが発生しました。もう一度お試しください。';
}
