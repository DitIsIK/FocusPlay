create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  premium_tier text check (premium_tier in ('free','premium','pro')) default 'free',
  xp int default 0,
  streak_days int default 0,
  last_action timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now()
);

create table if not exists challenges (
  id uuid primary key,
  type text check (type in ('quiz','poll','fact')) not null,
  theme text,
  content jsonb not null,
  author uuid references users(id),
  visibility text check (visibility in ('global','friends')) default 'global',
  created_at timestamptz default now()
);

create table if not exists poll_votes (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  choice int,
  created_at timestamptz default now(),
  unique (challenge_id, user_id)
);

create table if not exists friends (
  user_a uuid references users(id) on delete cascade,
  user_b uuid references users(id) on delete cascade,
  status text check (status in ('pending','accepted')) not null,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

insert into challenges (id, type, theme, content)
values
  (uuid_generate_v4(),'fact','general','{"fact":"Koffie dempt adenosine — daardoor voelt slaap ver weg."}'),
  (uuid_generate_v4(),'quiz','sports','{"question":"Welke NBA speler heeft de meeste MVP’s?","options":["Jordan","LeBron","Kareem","Curry"],"answerIndex":2}'),
  (uuid_generate_v4(),'poll','gaming','{"question":"Controller vs. muis/keyboard?","options":["Controller","M/K"]}'),
  (uuid_generate_v4(),'fact','productivity','{"fact":"Een korte walk break verhoogt je focus met ~20%."}'),
  (uuid_generate_v4(),'quiz','general','{"question":"Hoeveel minuten duurt een Pomodoro blok?","options":["15","20","25","30"],"answerIndex":2}'),
  (uuid_generate_v4(),'poll','sports','{"question":"Buiten sporten of gym?","options":["Buiten","Gym"]}'),
  (uuid_generate_v4(),'fact','gaming','{"fact":"Tetris komt van het Griekse woord tetra (vier)."}'),
  (uuid_generate_v4(),'quiz','productivity','{"question":"Wat is de eerste stap in GTD?","options":["Doen","Verzamelen","Review","Organiseren"],"answerIndex":1}'),
  (uuid_generate_v4(),'poll','general','{"question":"Ochtend- of avondmens?","options":["Ochtend","Avond"]}'),
  (uuid_generate_v4(),'fact','sports','{"fact":"Je verbrandt ~100 kcal per 15 minuten touwtje springen."}'),
  (uuid_generate_v4(),'quiz','gaming','{"question":"Welke studio maakt Zelda?","options":["Capcom","Nintendo","Square","Valve"],"answerIndex":1}')
on conflict do nothing;

alter table users enable row level security;
alter table challenges enable row level security;
alter table poll_votes enable row level security;
alter table friends enable row level security;
