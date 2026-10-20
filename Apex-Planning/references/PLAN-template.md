# <Product> — Build Plan (decisions are locked)

> **Status (<date>):** <which steps are built; which walkthroughs are the regression net>. Deviations from this plan are recorded here, dated, with the reason.

This file is the hand-off for anyone building <Product>. Read `docs/BRIEF.md` for intent; this file says *how*. Decisions here were made after reading the brief and the owner's answers on <date>; follow them, don't re-open them. If something is genuinely impossible, say so in the report rather than silently choosing differently.

Owner context: <first users, team size, one org or many, what must survive>.

## 0. Ground rules

- <Framework> **<version>**; read `node_modules/<framework>/dist/docs/` before using any API (it differs from training data). <Framework flags that stay on>.
- Strict TypeScript. `npm run typecheck` and `npm run lint` pass at the end of every step.
- Dependencies stay minimal. **No** <list: react-hook-form, Redis, queues, cron workers, third-party integrations>.
- Schema managed with `drizzle-kit push` (`npm run db:push`), no migrations folder. Additive changes only once real data exists.
- Dev server: `npm run dev` → port **<port>** (`AUTH_URL=http://localhost:<port>` in `.env.local`). Never read or print values from `.env*`; scripts load them with `dotenv`.
- Prod: <VPS + pm2 via `ecosystem.config.js` + `deploy.sh`, owner runs it | other>. Never deploy or commit unless asked.
- Phone **and** desktop both look good: every screenshot check runs at 390×844 and 1280×900, light and dark.

## 1. Stack (exact)

| Concern | Choice |
| --- | --- |
| Auth | `next-auth@<version>` + `@auth/drizzle-adapter`, database sessions, providers <Google + Nodemailer magic link>; reference implementation <path> |
| DB | `drizzle-orm <v>` + `drizzle-kit <v>` + `pg`; `DATABASE_URL` in `.env.local` (Postgres <v>, database `<name>`) |
| UI | Tailwind v4, shadcn/ui (Radix, new-york, neutral), `lucide-react`, `sonner`, `next-themes`, `cmdk` |
| Validation | `zod` v4 on the server in every action |
| Dates | `Intl.DateTimeFormat` + `lib/time.ts`; org timezone default `<zone>`, per-user override |
| Scripts | `tsx`, `dotenv`; tests: walkthrough scripts (headless Chrome) + `vitest` for authorisation |

Fonts: Geist Sans + Geist Mono.

## 2. Routes

```
/                          landing → /overview when signed in
/login, /login/check-email
/invite/[token]
/onboarding
(app) group, authenticated, sidebar shell:
  /overview  /my-work  /tasks  /tasks/[id]  /team  /requests  /requests/review  /requests/[id]
  /goals  /goals/[id]  /reports  /my-impact  /notifications  /settings  /settings/organization
/api/auth/[...nextauth]
/api/test-login            dev-only persona sign-in (§8)
```

Navigation: <list>. Hidden per role: <rules>.

## 3. Tenancy, roles, visibility

- Active organisation = cookie `<product>.org`, validated against membership on every request; fallback to the first membership and rewrite.
- Org role: `admin | member | stakeholder`. Team role: `lead | member`. A manager leads ≥ 1 team; admins act as lead everywhere.
- Visibility rules, one bullet per role, implemented in `lib/permissions.ts` and used by every DAL query and action.
- Every DAL function takes a `Viewer` and filters by `orgId` in SQL; lookups by id also check `orgId`.

## 4. Schema

IDs `text` UUIDs, timestamps `timestamptz` server-generated, enums as `pgEnum`, shared unions in `lib/constants.ts`.

```
organizations        id, name, slug (unique), timezone, created_by, created_at
organization_members org_id, user_id, role, joined_at, invited_by           PK(org_id, user_id)
teams / team_members / invitations (token_hash sha256, expires_at)
<work tables, one line each, append-only ones marked>
notifications / notification_preferences
```

Indexes for the real queries: <list>.

## 5. Core behaviour (the heart of the product)

Numbered rules: create defaults · the signature action and what it writes in one transaction · each status transition (prompts / records / notifies) · list row content · personal grouping and ordering · team dashboard sections.

## 6. Secondary flows

Requests and decisions · goals and expectations · reports and export · notifications. Same precision as §5.

## 7. Design system

Follow the `apex-ui` skill. Brand slots: `primary` = <oklch>, `highlight` = <oklch or none>. Product-specific: status set <list>, nav icons <list>, status icons <list>.

## 8. Test personas and the AI dev loop

Domain `@<product>.test`. Demo org "<Name> Demo" (slug), one team, one project; a second org "Other Co" for isolation tests. Personas (`?as=`): admin · lead · member · member2 · stakeholder · other, with roles. Seed shape: <N tasks across every status with updates and evidence, M requests, goals, expectations>, dates relative to now. Scripts: `test:seed | test:status | test:tidy | test:clean`, `test-browser.mjs`, `test-walkthrough/01…05`, `vitest` for permissions and DAL isolation. `.claude/settings.json` denies reading `.env*`.

## 9. Code layout

Follow the `apex-architecture` skill (`app/`, `actions/`, `components/`, `lib/dal/`, `lib/permissions.ts`, `db/`, `scripts/`, `docs/`).

## 10. Steps

- **A — Foundation**: … Ends with `01-sign-in` passing.
- **B — Core**: … Ends with `03-<flow>` passing and screenshots of <two screens>.
- **C — Team & decisions**: … Ends with `02`, `04`, `05` and authz tests passing.
- **Phase 2**: … **Phase 3**: …

Each step ends with `npm run typecheck`, `npm run lint`, `npm run build` exit 0; the relevant walkthrough green; screenshots reviewed at both sizes and themes.

## Risks

| Risk | Mitigation |
| --- | --- |
| Framework APIs differ from training data | Read bundled docs before each new API |
| Remote database latency / drops | Pool timeouts; fail fast; keepalive |
| Cross-org leakage | `isolation.test.ts` against two seeded orgs |
