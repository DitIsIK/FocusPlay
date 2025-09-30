-- Fact views voor XP en streak tracking
alter table if exists public.users
  add column if not exists last_streak_date date;

create table if not exists public.fact_views (
  user_id uuid references public.users(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, challenge_id)
);

alter table public.fact_views enable row level security;

create policy if not exists "fact_views_select_own" on public.fact_views
  for select
  using (user_id = auth.uid());

create policy if not exists "fact_views_insert_own" on public.fact_views
  for insert
  with check (user_id = auth.uid());
