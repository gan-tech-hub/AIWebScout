'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/infrastructure/supabase/database.types';
import { getPublicEnv } from '@/lib/env';

let browserClient: SupabaseClient<Database> | undefined;

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;

  const env = getPublicEnv();
  browserClient = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return browserClient;
}
