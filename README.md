# FocusPlay

Minder doom. Meer doén. FocusPlay is een Next.js 14 MVP dat doomscrollen vervangt door micro-challenges met XP, streaks en realtime leaderboard.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase (Postgres, RLS, Auth, Realtime)
- Stripe Checkout & Billing Portal
- OpenAI Responses API
- Vitest + Playwright

## Installatie
1. Installeer dependencies: `pnpm install`
2. Kopieer `.env.example` naar `.env.local` en vul je sleutels in.
3. Start lokaal met `pnpm dev` en open [http://localhost:3000](http://localhost:3000).

### Demo modus (zonder externe diensten)
- Zet `DEMO_MODE=true` in `.env.local` als je Supabase, Stripe en OpenAI wilt overslaan.
- Start met `pnpm dev` – de app draait volledig in-memory met 50+ demo-kaarten.
- Login is vervangen door “Doorgaan als demo-gebruiker”; XP, streak en daglimiet leven in geheugen.
- Op `/profile` staat een knop “Reset demo-gegevens” om de toestand te wissen.
- Voeg `?premium=1` toe aan de feed-URL om onbeperkte kaarten te testen.

## Configuratie
De app verwacht een draaiende Supabase instantie, Stripe producten en een OpenAI sleutel (niet nodig in demo modus).

### Supabase
1. Maak een Supabase project aan.
2. Draai `supabase/migrations/0001_init.sql` in de SQL Editor.
3. Draai daarna `supabase/migrations/0002_daily_card_limits.sql` voor dagelijkse feed-limieten.
4. Activeer RLS + public leaderboard view met `supabase/migrations/0003_rls_policies.sql`.
5. Zet team rooms + memberships op met `supabase/migrations/0004_team_rooms.sql`.
6. Vul de volledige seed (60+ kaarten) via `supabase/migrations/0005_seed_full.sql`.
7. Maak fact view tracking + streak kolom aan met `supabase/migrations/0006_fact_views_and_streak.sql`.
8. Configureer OAuth (Google/Apple) + Magic link.

> Tip: met `pnpm seed:full` (vereist Supabase CLI) push je alle migraties en seeds in één keer.

### Stripe
1. Maak producten `focusplay_free`, `focusplay_premium_monthly`, `focusplay_pro_monthly`.
2. Zet webhook naar `/api/stripe/webhook` met events `checkout.session.completed` en `customer.subscription.updated`.
3. Vul `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### OpenAI
Stel `OPENAI_API_KEY` in en activeer Responses API toegang.

## Scripts
- `pnpm dev` – start lokale ontwikkelserver.
- `pnpm build` – productie build.
- `pnpm test` – draait Vitest unit tests.
- `pnpm test:e2e` – Playwright e2e.
- `pnpm seed:full` – voert alle Supabase migraties uit (vereist Supabase CLI en geldige `supabase/config.toml`).

## XP en streak
- Quiz: +10 XP bij een juist antwoord.
- Poll: +5 XP bij je eerste stem.
- Fact: +3 XP wanneer je de “Gelezen”-knop indrukt.
- De streak telt maximaal één keer per kalenderdag (UTC) bij de eerste XP-winst. Mis je een dag, dan reset de streak naar 1.

## Tests
- `src/tests/unit/xp.test.ts` – XP helper logica.
- `src/tests/e2e/focusplay.spec.ts` – rooktest: login mock → quiz spelen → XP.
- Daglimieten volgen kolommen `cards_consumed_today` + `last_card_reset` in `users`.

## Rate limiting
- Generate endpoint: Free 30/dag, Premium 200/dag, Pro 500/dag.
- Feed consumptie: Free 10 kaarten/dag, Premium/Pro onbeperkt.

## Seed opnieuw vullen
Gebruik `pnpm seed:full` om alle migraties (inclusief de content-seed) opnieuw toe te passen. Bestaande challenges blijven staan; de seed voegt enkel nieuwe global items toe als ze nog niet bestaan.

## Functies
- Feed met quiz-, poll- en fact-kaarten met infinite scroll en thematische filters (Pro).
- Realtime poll-percentages en leaderboard via Supabase Realtime (mock fallback wanneer env ontbreekt).
- Team rooms (Pro, max 20 leden) met invite-codes en team-feed.
- Create-tool voor premium gebruikers met Zod-validatie en team targeting.
- Stripe checkout + customer portal voor upgrades.

### Team rooms beheren
- Open `/profile` en gebruik het Team rooms-paneel om squads te maken of te joinen.
- Een team heeft maximaal 20 leden; invite-codes zijn zichtbaar voor owners.
- Kies het team in de feed (Home) om een dedicated stream te zien.

## CI
`.github/workflows/ci.yml` lint, typecheck, tests.

## Privacy & Terms
Placeholder pagina's op `/privacy` en `/terms` met NL copy.

## Deploy
1. Deploy naar Vercel met env vars en Supabase service key.
2. Koppel Supabase project.
3. Zet Stripe webhook naar productie URL.
4. Robots.txt blokkeert indexering voor MVP.
