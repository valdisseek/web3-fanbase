# Fanbase — FPL DFS & Betting MVP

A full-stack Daily Fantasy Sports / betting app mixing the Fantasy Premier League
domain with Draftea-style mechanics. Three products, all earning the house a
**rake/margin in play-money credits**:

- **Player-points props + parlays** — bet over/under on a player's gameweek points; combine legs into one slip with a combined multiplier (vig baked in).
- **Head-to-Head** — challenge another user; both stake; winner takes the pot minus rake; ties refund.
- **Prize pools** — pay an entry fee, build a lineup, top finishers split the pot; house takes a rake % (GPP and Double-Up formats).

Player data is **real**, synced from the official FPL public API. All money is
integer play-money credits moved through a single transaction-safe ledger.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Prisma · SQLite · Tailwind v4 ·
JWT cookie auth (jose + bcrypt) · Vitest.

> Note: SQLite + JWT auth were chosen for zero-setup local runnability. Statuses
> are string constants (SQLite has no native enums). Swappable to Postgres /
> Auth.js later — the money/engine logic is unaffected.

## Run it

```bash
npm install
cp .env.example .env          # defaults work for local SQLite
npx prisma migrate deploy     # create the database
npm run db:seed               # HOUSE account + alice/bob (password123), 10k credits each
npx tsx scripts/demo-setup.ts # sync FPL data + open a demo gameweek (markets + pools)
npm run dev                   # http://localhost:5000
```

Log in as `alice@example.com` / `password123` (or register). Open a second browser
/ incognito as `bob@example.com` to play both sides of an H2H.

### Demo lifecycle

FPL is off-season, so there's no naturally-upcoming gameweek. The **Lobby → Demo
controls** (and `scripts/demo-setup.ts`) reopen a real finished gameweek as a
betting demo with real player points. After placing bets:

- **"Finalize + settle GW"** (Lobby) locks the gameweek, marks it final, and settles
  every product — paying out winners and crediting the house its rake.

## Verify

```bash
npm test                  # 19 engine unit tests (pricing, parlay, pool, h2h)
npx tsx scripts/e2e.ts    # full lifecycle: place parlay + join pool + H2H -> settle
```

The e2e asserts the core money invariants: **credit conservation** (total credits
constant), **balance === sum(ledger)** for every account, and **idempotent
settlement** (re-running settle changes nothing). It prints the house rake captured.

## Layout

- `prisma/schema.prisma` — data model (users, ledger, FPL data, markets, slips, pools, h2h)
- `src/lib/engine/` — pure money math: `money` (ledger), `pricing`, `parlay`, `pool`, `h2h`, `lock`, `settle`
- `src/lib/actions/` — transactional product actions (place bet, join pool, create/accept h2h)
- `src/lib/fpl/` — FPL API client + sync
- `src/app/api/` — route handlers (auth, wallet, markets, bets, pools, h2h, cron, dev)
- `src/app/(app)/` — authed UI: lobby, props, pools, h2h, fixtures, players, wallet

## Scheduled jobs (production)

- `POST /api/cron/sync` — pull latest FPL data (header `x-cron-secret`)
- `POST /api/cron/lock` — lock products at gameweek deadline
- `POST /api/cron/settle` — settle finalized gameweeks
