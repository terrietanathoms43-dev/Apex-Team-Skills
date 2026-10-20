# Project layout and scaffolding

What a fresh Apex app looks like after Phase A, with the config files that make it so.

## Tree

```
<repo>/
├── AGENTS.md                      handoff for builders (see apex-planning)
├── README.md                      how to run, where the plan is
├── package.json                   pinned deps, the standard scripts
├── next.config.ts                 cacheComponents, partialPrefetching, tailwind turbopack loader
├── tsconfig.json                  strict, "@/*" alias
├── eslint.config.mjs              eslint-config-next core-web-vitals + typescript
├── vitest.config.mts              "@" alias, server-only stub
├── drizzle.config.ts              schema ./db/schema.ts, dialect postgresql, DATABASE_URL
├── components.json                shadcn: new-york, neutral, cssVariables, lucide
├── ecosystem.config.js            pm2 app definition (prod)
├── deploy.sh                      pull → ci → build → pm2 restart
├── .env.example                   every key with a comment, no values
├── .gitignore                     node_modules, .next, .env*, .test-shots, *.tsbuildinfo
├── .claude/settings.json          deny Read(**/.env), Read(**/.env.*)
├── app/
│   ├── layout.tsx                 fonts, ThemeProvider, TooltipProvider, Toaster
│   ├── globals.css                Apex UI tokens
│   ├── page.tsx                   landing (static) + signed-in redirect in Suspense
│   ├── login/page.tsx, login/check-email/page.tsx
│   ├── invite/[token]/page.tsx
│   ├── onboarding/page.tsx
│   ├── (app)/layout.tsx           shell: sidebar / top bar / bottom tabs, Suspense per part
│   ├── (app)/not-found.tsx
│   ├── (app)/<route>/page.tsx + loading.tsx   one folder per destination
│   └── api/auth/[...nextauth]/route.ts, api/test-login/route.ts
├── actions/<feature>.ts
├── components/ui/*                shadcn
├── components/shell/*             nav-config, sidebar-nav, bottom-tabs, org-switcher, user-menu, shell-sections
├── components/<feature>/*
├── components/{page-header,empty-state,field,status-badge,priority-glyph,user-avatar,relative-time,skeletons,confirm-dialog,submit-button,segmented,native-select,logo,auth-shell,theme-provider}.tsx
├── db/schema.ts, db/index.ts
├── lib/{auth,viewer,permissions,guards,action-result,toast-result,constants,time,log,notify,org-cookie,invite-token,safe-path,test-mode}.ts
├── lib/dal/*.ts, lib/<feature>/*.ts (+ *.test.ts), lib/mail/*
├── scripts/{load-env.ts,test-accounts.ts,seed-data.ts,test-browser.mjs}, scripts/test-walkthrough/*
└── docs/{BRIEF.md,PLAN.md,TEST-ACCOUNTS.md}
```

## package.json scripts

```json
{
  "dev": "next dev --port 3014",
  "build": "next build",
  "start": "next start --port 3014",
  "lint": "eslint",
  "typecheck": "next typegen && tsc --noEmit",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "test:seed": "tsx scripts/test-accounts.ts seed",
  "test:status": "tsx scripts/test-accounts.ts status",
  "test:tidy": "tsx scripts/test-accounts.ts tidy",
  "test:clean": "tsx scripts/test-accounts.ts clean",
  "test:shot": "node scripts/test-browser.mjs",
  "test:walk": "node scripts/test-walkthrough/run-all.mjs",
  "test:unit": "vitest run"
}
```

## next.config.ts

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
};
export default nextConfig;
```

## db/index.ts

One pool per process, kept on `globalThis` in development so hot reloads do not leak connections. Remote database: `keepAlive`, `connectionTimeoutMillis: 10_000`, `idleTimeoutMillis: 30_000`, `statement_timeout: 15_000`, `query_timeout: 20_000`, `max: 10`. Export `db`, `Db`, and `Tx = Parameters<Parameters<Db["transaction"]>[0]>[0]` so DAL helpers accept either.

## Environment (.env.example)

```
# App
AUTH_URL=http://localhost:3014          # the public origin; production sets https://…
AUTH_SECRET=                            # openssl rand -base64 32
AUTH_TRUST_HOST=true

# Database (Postgres 16 on the VPS)
DATABASE_URL=postgres://user:pass@host:5432/dbname

# Google sign-in (OAuth client; redirect URI = AUTH_URL + /api/auth/callback/google)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Email (magic links, invitations, notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL=                                  # SMTP user / from address
EMAIL_PASS=                             # app password
EMAIL_FROM="Product <no-reply@example.com>"

# Agent test mode (development only; never set on the server)
TEST_MODE_SECRET=                       # 16+ characters
```

## .claude/settings.json

```json
{ "permissions": { "deny": ["Read(**/.env)", "Read(**/.env.*)"] } }
```

## Scaffolding order (Phase A)

1. `package.json` + configs, `npm install`.
2. `lib/constants.ts` → `db/schema.ts` → `db/index.ts` → `npm run db:push`.
3. `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `lib/mail/*`, `actions/auth.ts`, `/login`.
4. `lib/viewer.ts`, `lib/permissions.ts`, `lib/action-result.ts`, `lib/dal/orgs.ts`.
5. `lib/test-mode.ts`, `app/api/test-login/route.ts`, `scripts/*`, `AGENTS.md`, `.claude/settings.json`.
6. `app/globals.css` (tokens), `app/layout.tsx`, shadcn components, `components/shell/*`, `(app)/layout.tsx`.
7. Onboarding, org switcher, settings (profile, organisation).
8. `npm run test:seed`, `01-sign-in` walkthrough green, screenshots at both sizes and themes.
