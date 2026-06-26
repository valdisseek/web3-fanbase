# Deploying to Render — free (Neon Postgres)

Render's **free** web instance has no persistent disk, so the database lives in
**Neon** (free, durable Postgres). The schema migrated cleanly from SQLite to
Postgres — it uses only `String`/`BigInt`/`Float` columns (no native enums, no
`Json`), so no data-type changes were needed.

## 1. Create the database (Neon — free, no card)

1. Sign up at https://neon.tech → **New Project** (name it e.g. `web3-fanbase`).
2. Copy the **pooled** connection string (the host contains `-pooler`), keeping
   `?sslmode=require`. It looks like:
   `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`

## 2. Deploy on Render

1. Render → **New → Blueprint**, connect `valdisseek/web3-fanbase`, branch `master`.
   It reads [`render.yaml`](../render.yaml): free web service + auto-generated
   `JWT_SECRET` / `CRON_SECRET`.
2. When prompted for `DATABASE_URL`, paste the Neon pooled string from step 1.
3. Deploy. The build runs `prisma db push` against Neon (creates the schema),
   then `next build`; the service starts on `$PORT`.

> Free instances spin down after ~15 min idle and cold-start on the next request
> (~30 s). Fine for a demo; upgrade the instance later if you need always-on.

## 3. Seed once (from your machine — free tier has no Shell)

Render's free instances don't offer a Shell, so seed the Neon database from
your local machine (Neon is reachable from anywhere; it's the same DB Render
uses). With your local `.env` `DATABASE_URL` set to the Neon string:

```bash
npx prisma generate   # regenerate the client for Postgres
npx prisma db push    # ensure the schema exists (no-op if the build already pushed)
npm run db:seed
```

Creates the HOUSE credit account + demo users (`alice@example.com` /
`password123`, 10,000 credits). Login/credits don't work without it. The seed
is idempotent — safe to re-run.

## 4. Load FPL data + schedule cron

Markets appear only after a sync. Run once, then on a schedule:

```bash
curl -X POST https://<your-app>.onrender.com/api/cron/sync   -H "x-cron-secret: <CRON_SECRET>"
```

Recurring — point a scheduler at these with the `x-cron-secret` header
(free external pinger like cron-job.org works; Render Cron Jobs are paid):

| Endpoint | Suggested cadence |
|---|---|
| `POST /api/cron/sync`   | every ~10 min |
| `POST /api/cron/lock`   | every ~1 min near deadlines |
| `POST /api/cron/settle` | every ~10 min |

## Local development

Local dev now also uses Postgres (the schema `provider` is `postgresql`):

1. In `.env`, set `DATABASE_URL` to a Neon string — either a separate Neon
   **branch** of the same project, or the same database for solo work.
2. Re-generate + apply + seed:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
3. `npm run dev` → http://localhost:5000

The local `prisma/dev.db` SQLite file and `.env` stay git-ignored and unused.

## Notes

- No Prisma migrations; schema is applied with `prisma db push`.
- To deploy the Bets redesign instead of current `master`, merge
  `feat/bets-tab-draftea` into `master` first (currently unmerged).
