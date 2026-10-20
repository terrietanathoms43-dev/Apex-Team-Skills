# <Product>

<One line: what it is.> Intent is in `docs/BRIEF.md`; every build decision is locked in `docs/PLAN.md` (stack, routes, roles, schema, design tokens, steps). Follow the plan; if something in it is impossible, say so instead of choosing differently.

- <Framework version and flags>. Session reads sit behind `<Suspense>` (each `(app)` page has a `loading.tsx`); never cache live work data.
- Data access goes through `lib/dal/*` with a `Viewer` (`lib/viewer.ts`), scoped by `org_id` in SQL. Permissions are pure predicates in `lib/permissions.ts` (unit-tested). Mutations are server actions in `actions/`: zod parse → `requireViewer` → permission → transaction → `ActionResult`.
- Schema: `db/schema.ts`, applied with `npm run db:push` (no migrations folder; additive only once real data exists).
- Checks before calling anything done: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:unit`, and the relevant walkthrough.
- What exists: <one paragraph listing the built features>.
- Known pitfalls: <e.g. Turbopack keeps a stale module graph after adding an export; restart `next dev` (delete `.next/dev`) before concluding anything>.

# You can sign in and use the app yourself — do it

Test personas exist so that any change to a flow is **checked in the real app, signed in, before it is called done**. Do not rely on reading code or mock data when a flow can be run.

| `as=` | Who | What they start with |
| --- | --- | --- |
| `admin` | <name, email> | admin of **<Demo org>**, not on a team |
| `lead` | … | member, lead of **<Team>** |
| `member` | … | member, <Team> |
| `member2` | … | member, <Team> |
| `stakeholder` | … | stakeholder (two requests) |
| `other` | … | admin of **Other Co** (isolation checks) |

- **Sign in:** `GET /api/test-login?as=<persona>&secret=<TEST_MODE_SECRET>&to=/overview` on a dev server (port <port>). The secret is in `.env.local`; **do not read `.env*` yourself** (denied in `.claude/settings.json`); the scripts pick it up. Rules in `lib/test-mode.ts`: dev builds only, timing-safe secret, only these personas.
- **Accounts:** `npm run test:seed` (create / reset), `test:status`, `test:tidy` (back to seeded state), `test:clean` (delete everything `.test`).
- **See a screen:** `node scripts/test-browser.mjs <persona|public> [path] [--width=390 --height=844 --dark --full]` → PNG in `.test-shots/`; prints overflow and console errors. **Read the PNG.** Check 390×844 and 1280×900, light and dark.
- **Run a flow:** `npm run test:walk` runs everything in `scripts/test-walkthrough/`; each script runs alone and takes `--only=`. <one line per script>. To write another, import from `scripts/test-walkthrough/lib.mjs`.
- **Scope to the thing you mean:** `near: "Sam Dev"` keeps a click inside that row.
- **Email:** nothing is sent to a `.test` address; in development such mail is printed to the server log.

## Ground rules for test runs

- Scripts only reset or delete organisations whose **every** member is a `.test` account. Never act on a non-test account.
- Leave things tidy (`npm run test:tidy`).
- Port <port> may be the owner's own dev server; check before stopping anything.
- Chrome emulating a phone does not prove real-device keyboard, safe areas or scrolling; say so.
