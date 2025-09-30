-- Track dagelijkse feed consumptie per gebruiker
alter table if exists public.users
  add column if not exists cards_consumed_today int default 0,
  add column if not exists last_card_reset timestamptz;

create index if not exists users_last_card_reset_idx
  on public.users (last_card_reset);
