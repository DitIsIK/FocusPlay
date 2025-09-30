-- RLS policies for FocusPlay core tables and sanitized leaderboard view

-- Users can view and manage only their own row
create policy if not exists "users_self_select" on public.users
  for select
  using (auth.uid() = id);

create policy if not exists "users_self_update" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Challenges visibility and ownership rules
create policy if not exists "challenges_public_read" on public.challenges
  for select
  using (visibility = 'global');

create policy if not exists "challenges_friend_read" on public.challenges
  for select
  using (
    visibility = 'friends' and (
      author = auth.uid()
      or exists (
        select 1 from public.friends f
        where f.status = 'accepted'
          and ((f.user_a = auth.uid() and f.user_b = public.challenges.author)
            or (f.user_b = auth.uid() and f.user_a = public.challenges.author))
      )
    )
  );

create policy if not exists "challenges_insert_own" on public.challenges
  for insert
  with check (author = auth.uid());

create policy if not exists "challenges_update_own" on public.challenges
  for update
  using (author = auth.uid())
  with check (author = auth.uid());

-- Poll votes: users may insert/update their vote, everyone with access to the
-- challenge can see aggregated choices (no PII exposed)
create policy if not exists "poll_votes_insert_own" on public.poll_votes
  for insert
  with check (user_id = auth.uid());

create policy if not exists "poll_votes_update_own" on public.poll_votes
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "poll_votes_read_challenge" on public.poll_votes
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.challenges c
      where c.id = challenge_id
        and (
          c.visibility = 'global'
          or c.author = auth.uid()
          or exists (
            select 1 from public.friends f
            where f.status = 'accepted'
              and ((f.user_a = auth.uid() and f.user_b = c.author)
                or (f.user_b = auth.uid() and f.user_a = c.author))
          )
        )
    )
  );

-- Friend graph: members may see their own edges and manage invitations
create policy if not exists "friends_self_select" on public.friends
  for select
  using (user_a = auth.uid() or user_b = auth.uid());

create policy if not exists "friends_insert_request" on public.friends
  for insert
  with check (user_a = auth.uid());

create policy if not exists "friends_update_status" on public.friends
  for update
  using (user_a = auth.uid() or user_b = auth.uid())
  with check (user_a = auth.uid() or user_b = auth.uid());

-- Public leaderboard view exposing only non-sensitive columns
create or replace view public.public_profiles as
select id, display_name, xp, streak_days, avatar_url
from public.users;

grant select on public.public_profiles to anon;
grant select on public.public_profiles to authenticated;
