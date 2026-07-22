import { AppShell } from '@/components/app-shell';
import { HistoryView } from '@/features/analyses/history-view';

export default function AnalysesPage() {
  return (
    <AppShell>
      <HistoryView />
    </AppShell>
  );
}
