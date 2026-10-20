# Deployment and operations

Two supported shapes. Pick one per project and write it in `docs/PLAN.md` §0.

| | A. VPS + pm2 | B. Vercel + Postgres on the VPS |
| --- | --- | --- |
| App | pm2 runs `next start` behind nginx | Vercel builds and serves from `main`; a push is a deploy |
| Database | local Postgres on the same box | the team VPS's Postgres, reached over the network (TLS), small pool per function |
| Email | nodemailer SMTP | the same (Vercel allows outbound SMTP on 587) |
| Env | `.env.local` on the server | Vercel project → Environment Variables; `AUTH_URL` only in Production, previews use `VERCEL_URL` |
| Deploy | `deploy.sh` run by a human | git push; GitHub Actions runs typecheck/lint/tests/build in parallel |
| Example | Clarity | Trackwise |

For shape B: keep `db/index.ts`'s pool at `max: 5` and short idle timeouts (each warm function holds its own pool); never set `TEST_MODE_SECRET` in production; schema is pushed from a developer machine before the code that needs it; backups still run on the VPS (below). `after()` for post-response work is supported on Vercel. Add `?sslmode=require` to `DATABASE_URL` when the VPS has TLS.

The rest of this file describes shape A.

## Server layout

- Ubuntu LTS, Node 22 LTS, PostgreSQL 16, pm2 global, nginx (or Caddy) terminating TLS and proxying to the app port.
- One Unix user per app, the repo cloned under its home, `.env.local` created by hand on the server (never committed, never copied over chat).
- One database per app on the shared Postgres (`clarity`, `trackwise`, …), one role per app with rights only on its database.

## ecosystem.config.js

```js
module.exports = {
  apps: [{
    name: "<product>",
    cwd: "./",
    script: "node_modules/next/dist/bin/next",   // pm2 owns the server process (memory stats, signals)
    args: "start -p <port>",
    autorestart: true,
    max_restarts: 20,
    restart_delay: 4000,
    min_uptime: "20s",                           // surface crashes instead of hot-looping on bad config
    max_memory_restart: "600M",
    env: { NODE_ENV: "production" },
  }],
};
```

## deploy.sh (the owner runs it)

```bash
#!/bin/bash
set -euo pipefail
echo "==> Pulling latest (main)";      git pull origin main
echo "==> Installing (npm ci)";        npm ci
echo "==> Building";                   npm run build
echo "==> Schema (additive push)";     npm run db:push   # only when the plan says this release changes schema
echo "==> Restarting";                 pm2 startOrRestart ecosystem.config.js
pm2 save
```

Deploy is a human decision: agents never run `deploy.sh`, `pm2`, or `db:push` against production unless told to in that session.

## Environment on the server

`AUTH_URL=https://<domain>`, `AUTH_TRUST_HOST=true`, `AUTH_SECRET` unique per app, `DATABASE_URL` to the app's own database, SMTP settings, Google OAuth client with `https://<domain>/api/auth/callback/google` as an authorised redirect URI. **No `TEST_MODE_SECRET` in production**; the test route answers 404 in a production build regardless.

## Backups

A nightly `pg_dump -Fc <db>` from cron on the VPS into a directory synced off-box (rclone to object storage or Drive), 14 daily + 8 weekly retained, restore tested quarterly on a disposable database. Backups are an ops concern; the app has no "export my workspace" feature standing in for them.

## Logs and health

`pm2 logs <product>` shows the JSON lines from `lib/log.ts`; `grep '"level":"error"'`. nginx access logs for traffic. A `/api/health` route is unnecessary when pm2 restarts on crash and nginx returns 502 on a dead upstream; add one only if an external monitor needs it.

## Runbook headings (docs/RUNBOOK.md when the app is live)

Weekly checks · URL / OAuth configuration · Backups and restore test · Incident response (deploy fails, data "missing" = check active org and filters first, invitation problems, unauthorised access → disable membership, rotate secrets) · Roles and permissions summary · Change validation (typecheck, lint, build, walkthroughs) before any release.
