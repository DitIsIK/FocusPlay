# FocusPlay

Minder doom. Meer doén. FocusPlay is een Next.js 14 MVP dat doomscrollen vervangt door micro-challenges met XP, streaks en realtime leaderboard.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase (Postgres, RLS, Auth, Realtime)
- Stripe Checkout & Billing Portal
- OpenAI Responses API
- Vitest + Playwright

## Installatie
```bash
pnpm install
pnpm dev
```

App draait op [http://localhost:3000](http://localhost:3000).

## Configuratie
Maak een `.env.local` op basis van `.env.example`.

### Supabase
1. Maak een Supabase project aan.
2. Draai `supabase/migrations/0001_init.sql` in de SQL Editor.
3. Draai daarna `supabase/migrations/0002_daily_card_limits.sql` voor dagelijkse feed-limieten.
4. Zet RLS policies op tabellen volgens README (coming soon).
4. Configureer OAuth (Google/Apple) + Magic link.

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

## Tests
- `src/tests/unit/xp.test.ts` – XP helper logica.
- `src/tests/e2e/focusplay.spec.ts` – rooktest: login mock → quiz spelen → XP.
- Daglimieten volgen kolommen `cards_consumed_today` + `last_card_reset` in `users`.

## Rate limiting
- Generate endpoint: Free 30/dag, Premium 200/dag, Pro 500/dag.
- Feed consumptie: Free 10 kaarten/dag, Premium/Pro onbeperkt.

## Functies
- Feed met quiz-, poll- en fact-kaarten met infinite scroll.
- Realtime leaderboard via Supabase Realtime (mock fallback). 
- Create-tool voor premium gebruikers met Zod-validatie.
- Stripe checkout + customer portal voor upgrades.

## CI
`.github/workflows/ci.yml` lint, typecheck, tests.

## Privacy & Terms
Placeholder pagina's op `/privacy` en `/terms` met NL copy.

## Deploy
1. Deploy naar Vercel met env vars en Supabase service key.
2. Koppel Supabase project.
3. Zet Stripe webhook naar productie URL.
4. Robots.txt blokkeert indexering voor MVP.
