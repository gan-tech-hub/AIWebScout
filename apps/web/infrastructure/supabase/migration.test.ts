import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(
    process.cwd(),
    '../../supabase/migrations/20260722000100_create_ai_web_scout_schema.sql',
  ),
  'utf8',
);

const protectedTables = [
  'profiles',
  'captured_pages',
  'analyses',
  'agent_steps',
  'analysis_tags',
];

describe('Supabase migration security', () => {
  it.each(protectedTables)('enables RLS for %s', (table) => {
    expect(migration).toContain(
      `alter table public.${table} enable row level security;`,
    );
  });

  it.each(protectedTables)('does not grant %s access to anon', (table) => {
    expect(migration).toContain(
      `revoke all on table public.${table} from anon;`,
    );
  });

  it('scopes direct ownership policies to authenticated users', () => {
    expect(migration).toContain('to authenticated');
    expect(migration).toContain('(select auth.uid()) = user_id');
  });

  it('checks parent analysis ownership for child tables', () => {
    expect(migration).toContain('agent_steps_select_own_analysis');
    expect(migration).toContain('analysis_tags_select_own_analysis');
    expect(migration).toContain('analysis.user_id = (select auth.uid())');
  });
});
