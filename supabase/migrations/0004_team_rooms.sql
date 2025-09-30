-- Pro team rooms and membership management

create table if not exists public.team_rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  theme text check (theme in ('general','sports','gaming','productivity')) default 'general',
  owner uuid references public.users(id) on delete cascade,
  invite_code text unique not null,
  is_private boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  team_id uuid references public.team_rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text check (role in ('owner','member')) default 'member',
  created_at timestamptz default now(),
  primary key (team_id, user_id)
);

alter table if exists public.challenges
  add column if not exists team_id uuid references public.team_rooms(id) on delete cascade;

create index if not exists team_members_team_idx on public.team_members (team_id);
create index if not exists team_members_user_idx on public.team_members (user_id);

alter table public.team_rooms enable row level security;
alter table public.team_members enable row level security;

-- Policies ensure only owners manage rooms, members can view and leave
create policy if not exists "team_rooms_owner_manage" on public.team_rooms
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());

create policy if not exists "team_rooms_member_view" on public.team_rooms
  for select
  using (
    owner = auth.uid()
    or exists (
      select 1 from public.team_members m
      where m.team_id = id and m.user_id = auth.uid()
    )
  );

create policy if not exists "team_members_view" on public.team_members
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.team_rooms r
      where r.id = team_id and r.owner = auth.uid()
    )
  );

create policy if not exists "team_members_join_self" on public.team_members
  for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.team_rooms r
      where r.id = team_id and r.owner = auth.uid()
    )
  );

create policy if not exists "team_members_update_roles" on public.team_members
  for update
  using (
    exists (
      select 1 from public.team_rooms r
      where r.id = team_id and r.owner = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.team_rooms r
      where r.id = team_id and r.owner = auth.uid()
    )
  );
create policy if not exists "team_members_leave" on public.team_members
  for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.team_rooms r
      where r.id = team_id and r.owner = auth.uid()
    )
  );
