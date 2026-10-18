---
name: apex-recursive-walkthrough
description: How the Apex team proves a web app works by using it, cheaply: a few unit tests for pure rules, headless-browser walkthroughs that sign in as seeded personas and check real behaviour through page text and database rows, and screenshots only when a layout is new or something failed. Use it whenever you need to verify a feature, flow, role rule or fix in a Next.js app, write or repair a walkthrough script, decide what deserves a unit test versus a walkthrough versus a picture, set up test personas and a dev-only sign-in, or when a request says "make sure it works", "test this", "walk through the app", "check every screen", "regression", "QA", or "before we ship". The loop is recursive: run, classify each failure as script or app, fix the right one, re-run only that part, repeat until green, then run the whole suite.
---

# Apex Recursive Walkthrough

Reading code tells you what it should do. Using the app tells you what it does. Every Apex app ships with the means to use itself from a script (`apex-architecture` §7), and this skill is how to spend that capability well: **prove behaviour, not pixels**, and loop on failures until the suite is green.

## 1. Three tiers, cheapest first

| Tier | What it proves | How many | Cost |
| --- | --- | --- | --- |
| **Unit tests** (vitest) | Pure rules that have many combinations and no I/O: who may do what, status transitions, decision tables, grouping/ordering, CSV or token safety | As few as the rules: 4–8 files, under 100 tests | seconds |
| **Walkthroughs** (headless Chrome + database reads) | Whole flows as a user: sign in as a persona, click, type, read the page, read the rows the action should have written, who got notified, who gets Not found | One script per flow, 20–45 steps each, 6–8 scripts for a whole app | 2–4 minutes each |
| **Screenshots** (same browser) | Layout at 390×844 and 1280×900, light and dark | Only for a new screen or a changed layout, once; and automatically when a step fails | seconds, but reading each PNG costs attention |

Do not write a unit test for something a walkthrough proves in passing (a filter parser, a date helper), and do not write a walkthrough for a rule table a unit test covers in one line. Do not take a picture to check logic: the page's text and the database say whether it worked.

## 2. The loop (why "recursive")

1. **Write the flow as steps.** Each step is one assertion with a sentence a person can read: `step("the leader sees Approve and Send back", ok, detail)`. The detail is what you would want to see when it fails (the landed path, the JSON row, the button list).
2. **Run it** against a dev server with seeded personas: `node scripts/test-walkthrough/03-task-flow.mjs --base=http://localhost:3021`.
3. **Classify every failure** before touching anything:
   - *Script mistake*: wrong selector or label, waiting for text that is not page text (placeholders, aria-labels), text that legitimately persists elsewhere (a blocker reason stays in the history), a required field left blank, an expectation the product never promised (the actor is not notified of their own change). Fix the script.
   - *App bug*: the row, status, notification or redirect is wrong. Fix the app, and keep the step: it must fail before the fix and pass after.
   - *Harness artifact*: synthetic pointer events inside a toast raising `setPointerCapture`, a stale Turbopack module graph, a port owned by someone else. Change the approach (navigate by id from the database instead of clicking the toast; restart the dev server) rather than the check.
4. **Re-run only the part that failed** (`--only=approval`), then the whole script, then the whole suite (`npm run test:walk`), then `npm run test:tidy`.
5. Never loosen a check to make a bug pass, and never "fix" the app to satisfy a wrong script. If a step cannot be made to pass honestly, report it as a bug with the exact repro.

## 3. The toolkit (what every Apex app has)

- `lib/test-mode.ts` + `app/api/test-login/route.ts`: dev-only sign-in as `admin`, `leader`, `member`, `member2`, `stakeholder`, `other` (`.test` addresses in a demo workspace and a second workspace for isolation). Off in production builds; needs `TEST_MODE_SECRET` which scripts read themselves. Never read `.env*` yourself.
- `scripts/test-accounts.ts`: `seed | status | tidy | clean`, idempotent, only ever touches workspaces whose every member is `.test`.
- `scripts/test-browser.mjs`: `openBrowser({ role, width, height, dark, baseUrl })` → `goto(path, wait)`, `path()`, `click(label, { exact, within, near, wait })` (text or aria-label), `type(placeholderOrSelector, text, { near })`, `select(selector, option)`, `press(key)`, `waitFor(text)`, `waitForAny([...])`, `waitForGone(text)`, `waitForPath(pathOrRegex)`, `has(text)`, `hasNear(near, text)`, `waitForNear(near, text)`, `textNear`, `text()`, `evaluate(js)`, `overflow()`, `shot(name, { full })`, `problems` (console errors), `close()`. `near:` keeps a click inside the row that mentions a name, which is how you avoid pressing the first row's button.
- `scripts/test-walkthrough/lib.mjs`: `step`, `finish`, `note`, `only`, `flag`, `BASE_URL`, `openBrowser` (pointed at BASE_URL), `withBrowser`, `stoppedOn` (screenshots every open browser when a flow throws), `pageBroken` (Next's error/not-found/blank detection), `query(sql, params)` (one-off reads of `.test` rows), `tidy()`, `PEOPLE`, `ORG`, `OTHER_ORG`, `HOME`.
- `scripts/test-walkthrough/run-all.mjs`: runs every `0N-*.mjs` in order, sums up, tidies, sets the exit code.

The template for a new script is `references/walkthrough-template.mjs`.

## 4. What to prove, per kind of flow

| Flow | Prove it with |
| --- | --- |
| Create / update / transition | the toast; the visible state afterwards (the next action on the Resume card); the row in the database (`status`, `completed_at`, denormalised fields); the append-only history kinds in order; who was notified and who was not |
| Approval / decision | the approver sees the controls and the assignee does not (`main button` texts); the decision rows; the notification to the person who must act |
| Role rules | redirects by landed path; "Not found" text for ids the role may not see; absence of buttons and inputs by selector, not by prose words that appear everywhere ("decided") |
| Lists and filters | presence/absence by title; the URL after a filter; a `Load more` that neither skips nor repeats (temporarily shrink the page size) |
| Exports | `fetch` from the signed-in browser via `evaluate`; content-type, filename, the rows, nothing from another workspace |
| Invitations | the copied link's token (stub `navigator.clipboard.writeText`); each page state; expiry by backdating the row with `query` |
| Every screen (sweep) | `pageBroken`, console errors, `overflow()`, the landed path; a screenshot only on failure |
| Cross-workspace isolation | the other workspace's admin by id on every object type, every list, every export: nothing |

## 5. When a picture is worth taking

- A screen is new, or its layout changed: one shot per size (390×844, 1280×900), light and dark, **read each PNG** against the `apex-ui` review checklist, then stop taking it.
- A step failed and you cannot tell why from the text: `stoppedOn` already saved one per open browser; look at it.
- A dialog, sheet or menu state that text cannot describe (a long-press sheet, a palette).

Everything else is text and rows. A suite that screenshots every step is slow, fills the disk, and nobody reads the pictures.

## 6. Pitfalls that cost an hour each

- A placeholder is not page text: `waitFor("What needs doing?")` never passes; check the input exists (`#task-title`) instead.
- Text persists in history: after unblocking, the reason is still on the page in the feed. Prove the change with the button that disappears or with the row.
- Forms enforce their rules on the server: sending for approval needs a next action; rejecting needs a reason. Fill what the product requires.
- Nobody is notified of their own change. Count notices for the other person.
- Clicking inside a toast with synthetic events throws `setPointerCapture`; navigate by id from the database instead.
- Next allows one dev server per folder, and Auth.js redirects to `AUTH_URL`: start `AUTH_URL=http://localhost:3021 npx next dev --port 3021` and pass `--base=http://localhost:3021`.
- Git Bash rewrites `/goals/<id>` arguments into Windows paths: `MSYS_NO_PATHCONV=1`.
- After adding an export to an existing module, Turbopack may keep a stale graph ("x is not a function"); restart the dev server before concluding anything.
- Chrome's phone emulation proves layout, not real-device keyboards or scrolling. Say so.

## 7. Budget and shape

A flow script: 20–45 steps, two to four minutes, one `tidy()` at the end if it wrote anything. A whole suite: under fifteen minutes; split a script that grows past that. A script that only reads (roles, the sweep) does not tidy. Name scripts `0N-<flow>.mjs` in the order they should run; keep the seeded ids out of them (look them up with `query`) so a reseed does not break the suite.

Done means: `typecheck`, `lint`, `test:unit` exit 0; `npm run test:walk` green; the pictures for any new layout looked at; the database left tidy.
