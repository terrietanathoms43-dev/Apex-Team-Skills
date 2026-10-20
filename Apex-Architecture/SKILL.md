---
name: apex-architecture
description: The Apex team's architecture and clean-code standard for full-stack TypeScript web apps on Next.js App Router (React Server Components, server actions), Drizzle ORM + PostgreSQL (VPS or Neon), Better Auth or Auth.js (Google + email magic link, database sessions, optional company-domain rule), Tailwind + shadcn, Zod, Nodemailer, deployed to a VPS with pm2 or to Vercel. Use it whenever you scaffold a project, add a feature, write a server action, query or schema, design permissions or multi-tenant scoping, structure folders, name things, write tests or seed data, set up sign-in, send email or notifications, or review code for readability and teachability. Also reach for it when asked to "clean up", "refactor", "make this maintainable", "make it teachable", "how should I structure this", migrate from Supabase/Firebase to Postgres + Drizzle, or make an app "work like Clarity". Pair with apex-planning for the plan and apex-ui / apex-ux for the screens.
---

# Apex Architecture

Code is read far more than it is written, often by someone learning the stack from it. Every Apex codebase is therefore built so that a newcomer can open any file and see **what it does, why, and where its neighbours are** without a tour. Three ideas carry the whole standard:

1. **One path for every mutation** (the action skeleton), so correctness lives in one place.
2. **Authorisation is data-layer, pure and tested**, so no screen can leak another organisation's rows.
3. **The app can be driven end to end by a script**, so "done" is proven, not asserted.

The reference implementation is the Clarity project (`C:\Users\max\clarity`). Read its `lib/`, `actions/tasks.ts` and `db/schema.ts` once; the rules below are why they look like that. Deeper material: `references/project-layout.md`, `references/action-pattern.md`, `references/data-layer.md`, `references/testing.md`, `references/clean-code.md`, `references/deploy.md`.

## 1. Stack and versions

Pin exact versions in `package.json`; the framework moves fast and its docs ship in `node_modules/next/dist/docs/`: read them before using an API, not training memory.

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.x App Router, React 19, `cacheComponents` + `partialPrefetching` on, Turbopack |
| Data | PostgreSQL 16 on the VPS, `drizzle-orm` 0.45 + `drizzle-kit` 0.31 (`push`, no migrations folder), `pg` pool |
| Auth | **database sessions** in our own tables, Google + email magic link, sent through `lib/mail`. Two accepted libraries: `better-auth` with its Drizzle adapter (Trackwise; magic-link plugin, `nextCookies()`, hooks for a company-domain rule) or `next-auth@5 beta` + `@auth/drizzle-adapter` (Clarity). Reads never extend a session (`disableRefresh` / direct row read) |
| Validation | `zod` v4, server side, in every action |
| UI | Tailwind v4 (`@tailwindcss/turbopack`), shadcn/ui on `radix-ui`, `lucide-react`, `sonner`, `next-themes`, `cmdk` |
| Tooling | `tsx` scripts, `dotenv`, `vitest` (unit), headless Chrome walkthroughs, ESLint (`eslint-config-next`) |
| Not used | react-hook-form, Redis, queues, cron workers, ORMs other than Drizzle, client-side data fetching libraries |

Scripts every project has: `dev` (fixed port), `build`, `start`, `lint`, `typecheck` (`next typegen && tsc --noEmit`), `db:push`, `db:studio`, `test:seed|status|tidy|clean`, `test:shot`, `test:walk`, `test:unit`.

## 2. Layout: a place for everything

```
app/                routes only; (app)/layout.tsx is the shell; loading.tsx per segment; api/ for Auth.js + test-login
actions/            "use server" files per feature; every exported function is an action
components/ui/      shadcn primitives (generated, rarely edited)
components/<feat>/  app components by feature (tasks/, requests/, shell/, settings/)
components/*.tsx    small shared pieces (page-header, empty-state, field, status-badge, …)
db/schema.ts        the whole schema; db/index.ts the pool + db handle; drizzle.config.ts
lib/auth.ts         NextAuth config; lib/viewer.ts getViewer/requireViewer (React cache)
lib/dal/            queries by object (tasks.ts, requests.ts, orgs.ts, …); every function takes a Viewer
lib/permissions.ts  pure predicates; lib/guards.ts the few async guards built on them
lib/<feat>/         pure domain logic (transitions.ts, filters.ts, my-work.ts) with .test.ts beside them
lib/mail/           provider interface, nodemailer, console (dev), templates
lib/{constants,time,log,action-result,toast-result,notify,org-cookie,test-mode,safe-path}.ts
scripts/            test-accounts.ts, seed-data.ts, test-browser.mjs, test-walkthrough/
docs/               BRIEF.md, PLAN.md, TEST-ACCOUNTS.md (generated)
AGENTS.md           the handoff; .claude/settings.json denies reading .env*
```

Rules of thumb: a file does one thing and says so in a one-line comment at the top; a feature's code is found by its name (`tasks` appears in `actions/`, `lib/dal/`, `lib/tasks/`, `components/tasks/`); shared string unions live in `lib/constants.ts` so the schema enums and the UI read the same list.

## 3. Server first, client where interaction needs it

Pages are async Server Components that call `requireViewer()` (or `requireAppContext()` for the shell), read through the DAL, and render. They are wrapped by a `loading.tsx` skeleton, and anything session-dependent in the shell sits in `<Suspense>`, so the static frame prerenders and dynamic parts stream. Never `use cache` live work data; it must always be fresh.

Client components (`"use client"`) exist for forms, menus, dialogs, keyboard shortcuts and optimistic bits. They receive **plain JSON** props (dates as ISO strings, days as `YYYY-MM-DD`) typed in `lib/<feat>/types.ts`, call server actions with `useTransition`, and show `ActionResult` outcomes with `toastResult`. No client-side fetching of data the server could have rendered.

## 4. The action skeleton (one path for every change)

Every mutation is a server action in `actions/<feature>.ts` with exactly this shape, provided by `runAction` in `lib/action-result.ts`:

```
zod parse (fieldErrors back to the form)
→ requireViewer()                      who is asking, in which org
→ load + lock the row(s) by id AND orgId   never trust an id from the client
→ permission predicate                 throw GuardError("forbidden" | "not_found")
→ one transaction                      write state + append history/activity + collect notices
→ dispatch notices after commit        in-app rows now, email after the response (after())
→ refresh()                            so the UI behind the dialog updates
→ return ok(data, "Toast text.")       or fail(message, fieldErrors)
```

`ActionResult<T>` is `{ ok: true; data; message? } | { ok: false; error; fieldErrors? }`. Guard errors become user-safe messages from one `ERR` table; anything else is logged with `log.error` and becomes "Something went wrong". Next's `redirect()`/`notFound()` are rethrown. Full template and a worked example in `references/action-pattern.md`.

Why one skeleton: a newcomer learns it once and then reads every action in the codebase; permission checks cannot be forgotten because the shape has a slot for them; history is never missing because the transaction always writes it.

## 5. The data layer

- **Viewer**: `{ userId, orgId, orgRole, teamRoles: Map<teamId, role>, timezone }`, resolved once per request (`React.cache`) from the session cookie + membership tables, with the active org from a validated cookie.
- **Every DAL function takes the Viewer and filters by `orgId` in SQL.** Lookups by id add `and(eq(t.id, id), eq(t.orgId, viewer.orgId))`. A foreign id is simply not found. This is the multi-tenant boundary; there is no second one.
- **Permissions are pure predicates** over `(viewer, resourceScope)` in `lib/permissions.ts`: `canReadTask`, `canEditTask`, `canApproveTask`, `canTriageRequest`, `navFor`… No I/O, so they are unit-tested in minutes and callable from queries, actions and the UI alike.
- **Schema conventions**: text UUID ids (`crypto.randomUUID()`), `timestamptz` with `defaultNow()`, `date` as string for calendar days, `pgEnum` from the constants, FKs with explicit `onDelete`, composite PKs for membership tables, indexes for the real queries (`(org_id, team_id, status)`, `(org_id, assignee_id, status)`, `(task_id, created_at desc)`). Append-only tables (`task_updates`, `task_activity`, `request_decisions`) are never updated or deleted; corrections append.
- **Denormalise deliberately**: the task row carries `latest_progress` and `next_action` copied from the newest update so lists never join history.
- **Transactions** (`db.transaction`) wrap every multi-row change; `select … for update` (`lockTask`) before read-modify-write.
- `db:push` applies the schema; once real data exists, changes are additive (new nullable columns, new tables). Details in `references/data-layer.md`.

## 6. Auth, tenancy, email

- Database sessions in our own tables, whichever library: Better Auth (`auth.api.getSession({ headers, query: { disableRefresh: true } })`, so a page render never writes a cookie) or Auth.js (read the `sessions` join `users` row directly). Providers: Google, and an email magic link routed through `lib/mail` so `.test` addresses never reach SMTP and dev links print to the console. A company-domain rule (`ALLOWED_EMAIL_DOMAINS`) lives in the auth library's hooks and in the invitation action, never only in the UI.
- Active organisation in an `httpOnly` cookie, validated against membership on every request; switcher is a server action that sets it and redirects.
- Invitations: 32-byte token in the link, only its sha256 stored, 7-day expiry, signed-in email must match, claimed in the same transaction that joins (no double-accept).
- Mail: `MailProvider` interface, `nodemailer` in prod, `console` in dev/test, templates return `{ to, subject, text, html }` with a plain-text body always.
- Notifications: actions collect `Notice`s and `dispatch` after commit; in-app rows immediately, emails in `after()` per the recipient's preferences. A rolled-back change never notifies anyone.
- Secrets only in `.env.local` (git-ignored), read via `process.env` on the server; `.claude/settings.json` denies reading `.env*`; scripts load env with `dotenv`. `NEXT_PUBLIC_` is reserved for genuinely public values.

## 7. Test mode: the app can be used by a script

Every Apex app ships the dev loop from day one (details in `references/testing.md`):

- `lib/test-mode.ts`: a `.test` email domain, a demo org and a second org, named personas with roles; `testModeEnabled()` only when not production and `TEST_MODE_SECRET` is 16+ chars.
- `app/api/test-login/route.ts`: `GET ?as=<persona>&secret=…&to=/path` inserts a 12-hour session row and sets Auth.js's cookie plus the org cookie; 404 otherwise; timing-safe compare; only `.test` accounts.
- `scripts/test-accounts.ts`: `seed | status | tidy | clean`, idempotent, only ever touches orgs whose every member is `.test`; writes `docs/TEST-ACCOUNTS.md`.
- `scripts/test-browser.mjs`: headless Chrome via the DevTools protocol; signs in, screenshots to `.test-shots/`, reports overflow and console errors; exports `openBrowser` with `goto/click/type/select/waitFor/shot` scoped by `near:`.
- `scripts/test-walkthrough/0N-*.mjs`: whole flows as pass/fail steps; `run-all.mjs` sums them and tidies.
- `vitest` for `lib/permissions.ts`, pure domain logic, and `lib/dal/isolation.test.ts` (two seeded orgs, nothing crosses).

Definition of done for any change: `typecheck`, `lint`, `build`, `test:unit` exit 0; the relevant walkthrough green; screenshots at 390×844 and 1280×900, light and dark, looked at.

## 8. Clean, teachable code

The full guide is `references/clean-code.md`; the essentials:

- **Names say what, comments say why.** A one-line header comment per file; a short JSDoc on exported functions explaining intent or a non-obvious rule ("Sessions last their original 30 days: reads never extend them."). No comments that restate the code.
- **Small, flat files**: pages under ~150 lines, components under ~200, actions files per feature. Extract when a second concern appears, not before.
- **Types that cross the wire are plain** (`lib/<feat>/types.ts`): no Date objects, no Maps, no class instances in props.
- **Pure logic is separated and tested**: transitions, filters, grouping, time formatting live in `lib/<feat>/*.ts` with `*.test.ts` next to them.
- **Constants over literals**: statuses, roles, labels, cookie names, TTLs in `lib/constants.ts`.
- **Errors are values at the boundary** (`ActionResult`), exceptions inside (`GuardError`). The user never sees internals.
- **Structured logs**: `log.info("tasks.created", { orgId, taskId, by })`, one JSON line per event.
- **Formatting is automatic** (Prettier defaults, 2 spaces, double quotes, trailing commas) and never discussed.
- Delete dead code and old migrations folders; keep `README.md` to how to run and where the plan is.

## 9. Deployment

Two shapes, chosen per project in the plan: **VPS + pm2** (Node 22+, Postgres 16, `ecosystem.config.js` runs `next start` under pm2, `deploy.sh` = pull → `npm ci` → build → restart) or **Vercel + Postgres on the VPS** (deploys from `main`, env vars in the Vercel project, small per-function pool, `AUTH_URL` only in Production). Either way `.env.local` never leaves the machine it is for, `TEST_MODE_SECRET` never reaches production, schema is pushed from a developer machine before the code that needs it, and backups are a `pg_dump` cron on the VPS, never a feature of the app. Details in `references/deploy.md`.

## When reviewing or refactoring an existing codebase

Measure it against §2–§8 and fix in this order: (1) every mutation goes through the action skeleton with a permission check; (2) every query is org-scoped through a Viewer; (3) schema in Drizzle with constants-driven enums; (4) test mode + seed + screenshot script exist; (5) files split by feature and size; (6) naming and comments. Working, tested, scoped code first; prettiness last.
