# Deploying to Render (SQLite + persistent disk)

The app keeps its SQLite database on a Render **Disk** mounted at `/data`, so it
survives deploys and restarts. Disks require a paid instance (Starter, ~$7/mo);
the free tier has no persistent storage and SQLite would be wiped on every restart.

## One-time deploy

1. **Push is already done** — repo: https://github.com/valdisseek/web3-fanbase
2. In Render: **New → Blueprint**, connect the repo, select branch `master`.
   Render reads [`render.yaml`](../render.yaml) and provisions the web service +
   1 GB disk + auto-generated `JWT_SECRET` / `CRON_SECRET`.
3. Confirm the env vars on the service:
   - `DATABASE_URL = file:/data/prod.db`
   - `JWT_SECRET` — auto-generated (or paste your own)
   - `CRON_SECRET` — auto-generated (note it; you need it for the cron calls below)
4. Let the first deploy finish. `startCommand` runs `prisma db push` against the
   disk, creating the schema, then starts Next on `$PORT`.

## Seed once (after first green deploy)

Open the service **Shell** tab and run:

```bash
npm run db:seed
```

Creates the HOUSE credit account + demo users. Login/credits don't work without it.

## Load FPL data + schedule cron

Markets only appear after a sync. Run once, then on a schedule:

```bash
curl -X POST https://<your-app>.onrender.com/api/cron/sync   -H "x-cron-secret: <CRON_SECRET>"
```

Recurring jobs — point a scheduler at these three endpoints with the
`x-cron-secret` header:

| Endpoint | Suggested cadence |
|---|---|
| `POST /api/cron/sync`   | every ~10 min |
| `POST /api/cron/lock`   | every ~1 min near deadlines |
| `POST /api/cron/settle` | every ~10 min |

Use Render **Cron Jobs** (separate paid service) or a free external pinger
(e.g. cron-job.org) that sends the header.

## Notes

- The repo's `prisma/dev.db` and `.env` are git-ignored — production uses the
  disk DB and Render-managed env vars, never the local files.
- No Prisma migrations are used; schema is applied with `prisma db push`.
- To deploy the Bets redesign instead of current `master`, merge
  `feat/bets-tab-draftea` into `master` first (it is currently unmerged).
