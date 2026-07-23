import { describe, expect, it } from 'vitest';
import { normalizeWebAppUrl } from './config';

describe('normalizeWebAppUrl', () => {
  it('uses localhost when no value is configured', () => {
    expect(normalizeWebAppUrl(undefined)).toBe('http://localhost:3000');
  });

  it('keeps only the configured origin', () => {
    expect(normalizeWebAppUrl('https://scout.example.com/some/path')).toBe(
      'https://scout.example.com',
    );
  });

  it('rejects unsafe protocols', () => {
    expect(() => normalizeWebAppUrl('javascript:alert(1)')).toThrow(
      'HTTPまたはHTTPS',
    );
  });
});
