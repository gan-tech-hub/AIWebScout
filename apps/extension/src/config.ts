const DEFAULT_WEB_APP_URL = 'http://localhost:3000';

export function normalizeWebAppUrl(value: string | undefined): string {
  const candidate = value?.trim() || DEFAULT_WEB_APP_URL;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('WebアプリのURLはHTTPまたはHTTPSで指定してください。');
  }
  return url.origin;
}

export const extensionConfig = {
  webAppUrl: normalizeWebAppUrl(import.meta.env.VITE_WEB_APP_URL),
  apiTimeoutMs: 30_000,
} as const;
