import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { WorkspaceView } from '@/features/analyses/workspace-view';
import { SupabaseAnalysisRepository } from '@/infrastructure/repositories';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { toWorkspaceAnalysis } from '@/services/analysis-view';

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect('/login');
  const details = await new SupabaseAnalysisRepository(client).findById(
    id,
    user.id,
  );
  if (!details) notFound();
  return (
    <AppShell>
      <WorkspaceView workspace={toWorkspaceAnalysis(details)} />
    </AppShell>
  );
}
