# Testing: the app can be used by a script

An Apex app is "done" when a script can sign in as each kind of user, walk the flow, and the screenshots look right. This is what makes it safe for an AI agent to build on: it can check its own work in the real app instead of reasoning about code.

## 1. Test mode (lib/test-mode.ts)

- `TEST_EMAIL_DOMAIN = "@<product>.test"`: a reserved domain that can never receive mail.
- `TEST_ORG` (demo org, slug, timezone), `TEST_TEAM`, `TEST_PROJECT`; `OTHER_ORG`/`OTHER_TEAM` for isolation.
- `TEST_PERSONAS`: `admin`, `lead`, `member`, `member2`, `stakeholder`, `other`, each with email, name, org, org role, team role.
- `testModeEnabled()` = not production **and** `TEST_MODE_SECRET` is 16+ characters.
- `isTestEmail(email)` used by the mailer (never send) and the scripts (never touch a real account).

## 2. Sign-in route (app/api/test-login/route.ts)

`GET /api/test-login?as=<persona>&secret=<TEST_MODE_SECRET>&to=/path`

- 404 unless test mode is on and the secret matches (`timingSafeEqual`).
- Only known personas; the user row must exist and be a `.test` address.
- Inserts a 12-hour row into `sessions`, sets Auth.js's `authjs.session-token` cookie (http; production is https and never has test mode) and the active-org cookie, redirects to a same-site `to` (`safePath`).

## 3. Seed and tidy (scripts/test-accounts.ts + seed-data.ts)

`npm run test:seed | test:status | test:tidy | test:clean`

- Idempotent: users upserted by email (ids survive so sessions stay valid), orgs reset in place.
- Realistic data relative to *now*: ~24 tasks across every status with 1–4 updates each, evidence links, two overdue, two awaiting the lead's approval, three blocked with reasons, six completed in the last two weeks; six requests in every state; a few goals and expectations. Dashboards must look alive.
- Writes `docs/TEST-ACCOUNTS.md` so humans and agents see the roster.
- Only ever resets or deletes an organisation whose **every** member is `.test`; refuses otherwise.

## 4. Screenshots (scripts/test-browser.mjs)

```
node scripts/test-browser.mjs <persona|public> [path] [--width=390 --height=844 --dark --full --base=http://localhost:<port>]
```

Launches Chrome headless over the DevTools protocol, signs in through the test route, waits for hydration, saves `.test-shots/<persona>-<path>-<w>x<h>[-dark].png`, prints horizontal overflow and console errors. Exports `openBrowser()` returning `{ goto, click, type, select, press, waitFor, waitForPath, has, textNear, shot, overflow, evaluate, close }`; `click/type/select` retry for up to 8 s and accept `near: "Sam Dev"` to stay inside one row. **Read the PNG** afterwards; the number in the log is not the check.

## 5. Walkthroughs (scripts/test-walkthrough/)

`lib.mjs` gives `step(name, ok, detail)`, `finish()`, `only(part)`, `withBrowser`, `tidy()`, `query(sql)`, and the seeded names. Scripts:

| Script | Proves |
| --- | --- |
| `01-sign-in` | every persona lands on home with the right navigation; front door routes by audience; org cookie validated; sign-out; test route refuses bad secret, unknown persona, off-site `to` |
| `02-pages` | every screen as every persona at desktop light and phone dark: no error page, no console errors, no overflow; a screenshot of each |
| `03-<core>-flow` | the signature object's whole life (create → update → block → unblock → approval → sent back → approved → reopened); history lists every event; other roles/orgs get not-found |
| `04-<secondary>` | e.g. a request's life: submit → defer → reopen → approve → convert; requester follows; notifications written |
| `05-roles` | what each role may **not** do; another organisation sees nothing by id or by list |

`npm run test:walk` runs them all and tidies. New flows import from `lib.mjs`; each step is one assertion with a human sentence.

## 6. Unit tests (vitest)

- `lib/permissions.test.ts`: each role × each predicate.
- `lib/<feat>/*.test.ts`: transitions, filters, grouping, time formatting (pure, fast).
- `lib/dal/isolation.test.ts`: against the seeded database, behind an env flag.
- `lib/mail/mail.test.ts`: `.test` addresses never reach a provider; templates have text bodies.

`vitest.config.mts` aliases `@` to the root and stubs `server-only`.

## 7. Ground rules

- Never sign in as, or act on, a non-test account. Scripts refuse orgs with a real member.
- Leave things tidy: `npm run test:tidy` after a run.
- The owner's dev server may own the default port; start your own on another port and pass `--base`.
- Phone emulation proves layout, not real-device keyboard, safe areas or scrolling; say so in reports.
- `.claude/settings.json` denies `Read(**/.env)` and `Read(**/.env.*)`; the scripts load secrets, agents never print them.
