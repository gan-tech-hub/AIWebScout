import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { mockAnalyses } from '@/features/analyses/mock-data';
import { WorkspaceView } from '@/features/analyses/workspace-view';

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mockAnalyses.some((item) => item.id === id)) notFound();
  return (
    <AppShell>
      <WorkspaceView />
    </AppShell>
  );
}
