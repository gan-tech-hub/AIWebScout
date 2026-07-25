'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Save, Sparkles, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import type { UserProfile } from '@/domain/models';
import { profileFormSchema, type ProfileFormValues } from './profile-schema';

const fallbackDefaults: ProfileFormValues = {
  displayName: '',
  bio: '',
  skills: '',
  desiredConditions: '',
  desiredHourlyRate: 0,
  availableHours: 1,
  preferredWorkStyle: 'remote',
  analysisInstruction: '',
};
const fieldClass =
  'mt-2 w-full rounded-xl border border-line bg-panel-strong px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent/50 focus:ring-2 focus:ring-accent/15';

function FieldError({ message }: { message: string | undefined }) {
  return message ? (
    <p className="mt-1.5 text-[11px] text-rose-500">{message}</p>
  ) : null;
}

function defaultsFromProfile(profile: UserProfile | null): ProfileFormValues {
  if (!profile) return fallbackDefaults;
  return {
    displayName: profile.displayName,
    bio: profile.bio,
    skills: profile.skills.join(', '),
    desiredConditions:
      typeof profile.desiredConditions.text === 'string'
        ? profile.desiredConditions.text
        : JSON.stringify(profile.desiredConditions),
    desiredHourlyRate: profile.desiredHourlyRate ?? 0,
    availableHours: profile.availableHours ?? 1,
    preferredWorkStyle: ['remote', 'hybrid', 'office', 'flexible'].includes(
      profile.preferredWorkStyle,
    )
      ? (profile.preferredWorkStyle as ProfileFormValues['preferredWorkStyle'])
      : 'flexible',
    analysisInstruction: profile.analysisInstruction,
  };
}

export function SettingsForm({ profile }: { profile: UserProfile | null }) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultsFromProfile(profile),
  });
  async function onSubmit(values: ProfileFormValues) {
    setSaveError('');
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: values.displayName,
        bio: values.bio,
        skills: values.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        desiredConditions: { text: values.desiredConditions },
        desiredHourlyRate: values.desiredHourlyRate,
        availableHours: values.availableHours,
        preferredWorkStyle: values.preferredWorkStyle,
        analysisInstruction: values.analysisInstruction,
      }),
    });
    const body = (await response.json()) as {
      success: boolean;
      error?: { message: string };
    };
    if (!body.success) {
      setSaveError(body.error?.message ?? '設定を保存できませんでした。');
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2800);
  }
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    void handleSubmit(onSubmit)(event);
  }
  return (
    <form onSubmit={handleFormSubmit}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Surface className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="bg-accent/10 text-accent grid size-10 place-items-center rounded-xl">
                <UserRound className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Basic profile</h2>
                <p className="text-muted mt-1 text-xs">
                  AIが分析時に参照する基本情報
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-medium">
                ユーザー名
                <input {...register('displayName')} className={fieldClass} />
                <FieldError message={errors.displayName?.message} />
              </label>
              <label className="text-xs font-medium sm:col-span-2">
                自己紹介
                <textarea
                  {...register('bio')}
                  rows={4}
                  className={fieldClass}
                />
                <FieldError message={errors.bio?.message} />
              </label>
              <label className="text-xs font-medium sm:col-span-2">
                保有スキル
                <span className="text-muted ml-2 font-normal">
                  カンマ区切り
                </span>
                <input {...register('skills')} className={fieldClass} />
                <FieldError message={errors.skills?.message} />
              </label>
            </div>
          </Surface>
          <Surface className="p-5 sm:p-6">
            <div>
              <h2 className="text-sm font-semibold">Work preferences</h2>
              <p className="text-muted mt-1 text-xs">
                案件ページとの適合度を判断するための希望条件
              </p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-medium sm:col-span-2">
                希望する案件条件
                <textarea
                  {...register('desiredConditions')}
                  rows={4}
                  className={fieldClass}
                />
              </label>
              <label className="text-xs font-medium">
                希望時給（円）
                <input
                  {...register('desiredHourlyRate')}
                  type="number"
                  className={fieldClass}
                />
                <FieldError message={errors.desiredHourlyRate?.message} />
              </label>
              <label className="text-xs font-medium">
                希望稼働時間（週）
                <input
                  {...register('availableHours')}
                  type="number"
                  className={fieldClass}
                />
                <FieldError message={errors.availableHours?.message} />
              </label>
              <label className="text-xs font-medium sm:col-span-2">
                希望する働き方
                <select
                  {...register('preferredWorkStyle')}
                  className={fieldClass}
                >
                  <option value="remote">フルリモート</option>
                  <option value="hybrid">ハイブリッド</option>
                  <option value="office">オフィス</option>
                  <option value="flexible">柔軟に検討</option>
                </select>
              </label>
            </div>
          </Surface>
          <Surface className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-fuchsia-400/10 text-fuchsia-500">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">AI instructions</h2>
                <p className="text-muted mt-1 text-xs">
                  すべての分析に反映する追加指示
                </p>
              </div>
            </div>
            <label className="mt-6 block text-xs font-medium">
              分析時の追加指示
              <textarea
                {...register('analysisInstruction')}
                rows={5}
                className={fieldClass}
              />
              <FieldError message={errors.analysisInstruction?.message} />
            </label>
          </Surface>
        </div>
        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <Surface className="p-5">
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.18em]">
              Profile signal
            </p>
            <p className="mt-4 text-sm font-semibold">分析のパーソナライズ</p>
            <p className="text-muted mt-2 text-xs leading-5">
              登録した情報は、求人の適合度や記事の学習優先度など、ユーザーとの関連性が必要な分析で参照されます。
            </p>
            <ul className="border-line mt-5 space-y-3 border-t pt-5">
              {[
                'スキルとの適合度',
                '希望条件との一致',
                'キャリア上の価値',
                '追加指示の反映',
              ].map((item) => (
                <li
                  key={item}
                  className="text-muted flex items-center gap-2 text-xs"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-emerald-400/10 text-emerald-500">
                    <Check className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="size-4" />{' '}
              {isDirty ? '変更を保存' : 'プロフィールを保存'}
            </Button>
            <p className="text-muted mt-3 text-center text-[10px]">
              Supabaseへ安全に保存されます
            </p>
            {saveError && (
              <p className="mt-3 text-center text-xs text-rose-500">
                {saveError}
              </p>
            )}
          </Surface>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-center text-xs text-emerald-500"
            >
              設定を保存しました
            </motion.div>
          )}
        </aside>
      </div>
    </form>
  );
}
