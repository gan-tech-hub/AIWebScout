export class RepositoryError extends Error {
  readonly code: string;
  override readonly cause: unknown;

  constructor(operation: string, cause: unknown, code = 'PERSISTENCE_ERROR') {
    super(`${operation}に失敗しました。`);
    this.name = 'RepositoryError';
    this.code = code;
    this.cause = cause;
  }
}

export class RepositoryDataError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super('保存データの変換', cause, 'INVALID_PERSISTED_DATA');
    this.name = 'RepositoryDataError';
    this.message = message;
  }
}
