begin;

create extension if not exists pgcrypto with schema extensions;

create type public.page_type as enum (
  'job',
  'article',
  'github',
  'company',
  'general'
);

create type public.analysis_status as enum (
  'pending',
  'running',
  'completed',
  'failed'
);

create type public.agent_step_status as enum (
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
  'needs_confirmation'
);

create type public.capture_source_type as enum (
  'chrome_extension',
  'web'
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  bio text not null default '' check (char_length(bio) <= 2000),
  skills jsonb not null default '[]'::jsonb check (jsonb_typeof(skills) = 'array'),
  desired_conditions jsonb not null default '{}'::jsonb check (jsonb_typeof(desired_conditions) = 'object'),
  desired_hourly_rate integer check (desired_hourly_rate is null or desired_hourly_rate >= 0),
  available_hours smallint check (available_hours is null or available_hours between 0 and 168),
  preferred_work_style text not null default '' check (char_length(preferred_work_style) <= 500),
  analysis_instruction text not null default '' check (char_length(analysis_instruction) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.captured_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 500),
  url text not null check (
    char_length(url) between 1 and 2048
    and (url like 'https://%' or url like 'http://%')
  ),
  page_text text not null default '' check (char_length(page_text) <= 50000),
  selected_text text not null default '' check (char_length(selected_text) <= 10000),
  meta_description text not null default '' check (char_length(meta_description) <= 2000),
  source_type public.capture_source_type not null default 'chrome_extension',
  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  captured_page_id uuid not null references public.captured_pages(id) on delete cascade,
  page_type public.page_type,
  status public.analysis_status not null default 'pending',
  summary text not null default '',
  recommendation text not null default '',
  recommendation_score smallint check (recommendation_score is null or recommendation_score between 0 and 100),
  result_json jsonb not null default '{}'::jsonb check (jsonb_typeof(result_json) = 'object'),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check (status <> 'completed' or completed_at is not null),
  check (status <> 'failed' or error_message is not null)
);

create table public.agent_steps (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  step_key text not null check (step_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  step_name text not null check (char_length(step_name) between 1 and 200),
  status public.agent_step_status not null default 'pending',
  description text not null default '' check (char_length(description) <= 1000),
  input_summary text not null default '' check (char_length(input_summary) <= 1000),
  output_summary text not null default '' check (char_length(output_summary) <= 1000),
  tool_name text check (tool_name is null or char_length(tool_name) <= 100),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  sort_order smallint not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (analysis_id, step_key),
  unique (analysis_id, sort_order),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check (status <> 'failed' or error_message is not null)
);

create table public.analysis_tags (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  tag text not null check (
    char_length(tag) between 1 and 50
    and tag = lower(btrim(tag))
  ),
  created_at timestamptz not null default now(),
  unique (analysis_id, tag)
);

create index captured_pages_user_created_idx
  on public.captured_pages (user_id, created_at desc);
create index captured_pages_user_captured_idx
  on public.captured_pages (user_id, captured_at desc);
create index analyses_user_created_idx
  on public.analyses (user_id, created_at desc);
create index analyses_user_status_type_idx
  on public.analyses (user_id, status, page_type);
create index analyses_captured_page_idx
  on public.analyses (captured_page_id);
create index agent_steps_analysis_order_idx
  on public.agent_steps (analysis_id, sort_order);
create index analysis_tags_analysis_idx
  on public.analysis_tags (analysis_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger analyses_set_updated_at
before update on public.analyses
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.captured_pages enable row level security;
alter table public.analyses enable row level security;
alter table public.agent_steps enable row level security;
alter table public.analysis_tags enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.captured_pages from anon;
revoke all on table public.analyses from anon;
revoke all on table public.agent_steps from anon;
revoke all on table public.analysis_tags from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.captured_pages to authenticated;
grant select, insert, update, delete on table public.analyses to authenticated;
grant select, insert, update, delete on table public.agent_steps to authenticated;
grant select, insert, update, delete on table public.analysis_tags to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "captured_pages_select_own"
on public.captured_pages for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "captured_pages_insert_own"
on public.captured_pages for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "captured_pages_update_own"
on public.captured_pages for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "captured_pages_delete_own"
on public.captured_pages for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "analyses_select_own"
on public.analyses for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "analyses_insert_own_capture"
on public.analyses for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.captured_pages capture
    where capture.id = captured_page_id
      and capture.user_id = (select auth.uid())
  )
);

create policy "analyses_update_own"
on public.analyses for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.captured_pages capture
    where capture.id = captured_page_id
      and capture.user_id = (select auth.uid())
  )
);

create policy "analyses_delete_own"
on public.analyses for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "agent_steps_select_own_analysis"
on public.agent_steps for select
to authenticated
using (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "agent_steps_insert_own_analysis"
on public.agent_steps for insert
to authenticated
with check (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "agent_steps_update_own_analysis"
on public.agent_steps for update
to authenticated
using (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "agent_steps_delete_own_analysis"
on public.agent_steps for delete
to authenticated
using (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "analysis_tags_select_own_analysis"
on public.analysis_tags for select
to authenticated
using (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "analysis_tags_insert_own_analysis"
on public.analysis_tags for insert
to authenticated
with check (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "analysis_tags_update_own_analysis"
on public.analysis_tags for update
to authenticated
using (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

create policy "analysis_tags_delete_own_analysis"
on public.analysis_tags for delete
to authenticated
using (
  exists (
    select 1
    from public.analyses analysis
    where analysis.id = analysis_id
      and analysis.user_id = (select auth.uid())
  )
);

commit;
