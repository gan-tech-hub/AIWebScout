import { AppShell } from '@/components/app-shell';
import { DashboardView } from '@/features/dashboard/dashboard-view';

export default function HomePage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
