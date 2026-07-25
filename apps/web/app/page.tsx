import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { DashboardView } from '@/features/dashboard/dashboard-view';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { loadAnalysisItems } from '@/services/analysis-view';

export default async function HomePage() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect('/login');
  const analyses = await loadAnalysisItems(client, user.id);
  return (
    <AppShell>
      <DashboardView analyses={analyses} />
    </AppShell>
  );
}
