import { AppShell } from '@/components/app-shell';

export default function SettingsPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Scout profile</h1>
      <p className="mt-3 text-sm text-white/50">
        Supabase連携後、プロフィールと分析条件をここで設定できるようになります。
      </p>
    </AppShell>
  );
}
