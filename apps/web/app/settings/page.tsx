import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SettingsForm } from '@/features/profile/settings-form';
import { SupabaseProfileRepository } from '@/infrastructure/repositories';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect('/login');
  const profile = await new SupabaseProfileRepository(client).findByUserId(
    user.id,
  );
  return (
    <AppShell>
      <header className="mb-7">
        <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em]">
          Scout profile
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          分析プロフィール
        </h1>
        <p className="text-muted mt-2 text-sm">
          あなたのスキルと希望条件を伝え、AIの判断を自分向けに調整します。
        </p>
      </header>
      <SettingsForm profile={profile} />
    </AppShell>
  );
}
