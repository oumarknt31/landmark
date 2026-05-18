-- Landmark — Supabase database setup.
-- Run this once in your Supabase project's SQL Editor.

-- ============================================================================
-- ROLE GRANTS (idempotent)
-- ============================================================================
-- Supabase normally auto-grants tables in `public` to anon + authenticated,
-- but if those grants are missing / were revoked, the client gets "permission
-- denied for table" before RLS even runs. These statements are safe to re-run.

grant usage on schema public to anon, authenticated, service_role;


-- ============================================================================
-- USER PROGRESS  (single row per user, all state as JSONB)
-- ============================================================================

create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

-- Base-table grants: needed in addition to RLS. RLS narrows access, it
-- doesn't unlock the table from a role that has no grants at all.
grant select, insert, update on public.user_progress to authenticated;
grant select, insert, update on public.user_progress to anon;
grant all on public.user_progress to service_role;

drop policy if exists "select own progress" on public.user_progress;
create policy "select own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

drop policy if exists "insert own progress" on public.user_progress;
create policy "insert own progress"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own progress" on public.user_progress;
create policy "update own progress"
  on public.user_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================================
-- QUESTION FEEDBACK  (users report bad / unclear / typo questions)
-- ============================================================================

create table if not exists public.question_feedback (
  id          uuid primary key default gen_random_uuid(),
  question_id text not null,
  topic_id    text,
  user_id     uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('unclear', 'wrong-answer', 'typo', 'other')),
  message     text,
  created_at  timestamptz not null default now()
);

create index if not exists question_feedback_question_id_idx
  on public.question_feedback (question_id);
create index if not exists question_feedback_created_at_idx
  on public.question_feedback (created_at desc);

alter table public.question_feedback enable row level security;

-- Base-table grants: anyone may INSERT (their own report), nobody reads from
-- the client. The backend (service role) reads via the admin connection.
grant insert on public.question_feedback to anon, authenticated;
grant all on public.question_feedback to service_role;

drop policy if exists "insert any feedback" on public.question_feedback;
create policy "insert any feedback"
  on public.question_feedback
  for insert
  with check (user_id is null or auth.uid() = user_id);


-- ============================================================================
-- LEADERBOARD VIEW  (top users by total XP, anonymized handle)
-- ============================================================================

-- Total XP computed from the dailyXp JSON blob.
create or replace function public.total_xp(state jsonb)
returns int
language sql
immutable
as $$
  select coalesce(
    (select sum((value)::int)
     from jsonb_each_text(coalesce(state->'dailyXp', '{}'::jsonb))),
    0
  )::int;
$$;

-- Public view: prefers the user's chosen display name from state.displayName,
-- falls back to an anonymized 'user_xxxxxx' handle from the UUID. Runs as the
-- view owner (no security_invoker), so any role with SELECT on the view gets
-- the leaderboard regardless of RLS on user_progress.
drop view if exists public.leaderboard_view;
create view public.leaderboard_view as
select
  coalesce(
    nullif(state->>'displayName', ''),
    'user_' || substring(user_id::text from 1 for 6)
  ) as handle,
  public.total_xp(state) as total_xp,
  updated_at as last_active
from public.user_progress
where public.total_xp(state) > 0
order by total_xp desc;

-- Grant to `public` so every role (current and future Supabase role names)
-- can read. The view exposes no PII — anonymized handle + total XP only.
grant select on public.leaderboard_view to public;
