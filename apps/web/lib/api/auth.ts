import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function authenticateRequest(request: NextRequest): Promise<{
  client: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  user: User | null;
}> {
  const client = await createServerSupabaseClient();
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : undefined;
  const {
    data: { user },
  } = token ? await client.auth.getUser(token) : await client.auth.getUser();
  return { client, user };
}
