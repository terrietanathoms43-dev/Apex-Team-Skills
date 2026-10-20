---
name: apex-planning
description: >-
  How the Apex team turns an idea or a messy brief into a plan that a person or an AI agent can build from without re-opening decisions. Use it whenever someone asks to plan, scope, spec, estimate, phase, prioritise, "write up what we're building", start a new project or a rebuild, define an MVP, write a PRD/brief/plan/roadmap, decide what not to build, or hand a codebase over to another builder. It produces two short documents (BRIEF.md for intent, PLAN.md for locked decisions: stack, routes, roles, schema, tokens, steps with a definition of done) plus the AGENTS.md handoff, and it fixes the phase order and the done-criteria every Apex build follows. Reach for it before writing any code on a new feature of more than a day's work.
---

# Apex Planning

A plan exists so that the next person (or agent) builds the right thing without asking. Good plans are **short, decided and testable**: a few pages, every choice made, and a way to prove each step is done. Long plans that leave options open are not plans; they are the brief again.

The reference pair is Clarity's `docs/BRIEF.md` and `docs/PLAN.md`; the templates in `references/` are distilled from them.

## 1. Two documents, two jobs

| Document | Job | Length | Changes |
| --- | --- | --- | --- |
| `docs/BRIEF.md` | Intent: what for whom, what good looks like, what not to build. The owner's words, lightly structured. | 2–6 pages | Rarely. When it conflicts with the plan, the plan wins and says why. |
| `docs/PLAN.md` | Decisions: stack, routes, roles, schema, design tokens, behaviours, test personas, steps with done-criteria. | 3–8 pages | Only through the decision log at the top. "Decisions are locked" is the first line. |
| `AGENTS.md` | Handoff to builders (human or AI): how to run, check, sign in as personas, what exists, known pitfalls. | 1–2 pages | Every time the build changes something a builder must know. |

Write the brief first, interview the owner (see §3), then write the plan in one sitting. Put both in `docs/` of the repo they describe.

## 2. Find the smallest compelling experience

Start from journeys, not features. For each primary role write one journey of the form *sign in → see X → do Y → see the result*, with a time budget ("a manager understands team health in under 60 seconds"). Then:

1. List every feature the journeys need. Nothing else goes in Phase 1.
2. Run each feature through the three tests: saves time / improves visibility or accountability / helps a decision. Cut anything that fails all three.
3. Write the **What not to build** list explicitly (AI scoring, Gantt, chat, time tracking, integrations, custom report builders, dozens of statuses…). Saying no in writing is what keeps the product small later.
4. Consolidate features that solve the same problem (comments + progress updates → one update timeline; dashboards + reports → one report page with a range).

A plan that keeps a feature "because the old app had it" needs to name the journey it serves.

## 3. Interview before deciding

Ask the owner, and record the answers in the plan's "Owner context" line:

- Who are the first real users (team size, roles, one org or many)?
- What is the one thing they must be able to do on day one?
- Which existing project is the reference for look, stack and conventions?
- Where does it run (VPS/pm2, Vercel), which database, which auth providers, which email?
- Brand constraints (colours that must stay) and anything that must *not* change.
- What data exists today and must survive (migration vs fresh start)?
- Definition of done they care about (screenshots, walkthroughs, tests).

Make routine calls yourself (naming, defaults, ordering). Ask only when answers lead to materially different work.

## 4. Lock the decisions (the plan's sections)

Use `references/PLAN-template.md`. Every section states a decision, not a discussion:

0. **Ground rules**: framework version and where its docs live, TypeScript strictness, dependency policy ("no react-hook-form, Redis, queues, cron workers"), schema management (`drizzle-kit push`, additive once real data exists), dev port, prod target, both viewports and both themes required.
1. **Stack (exact)**: auth, DB, UI, validation, dates, scripts, fonts. Versions pinned.
2. **Routes**: the full tree with one line each; which are public, which are role-gated; the navigation list and what each role sees.
3. **Tenancy, roles, visibility**: the active-organisation mechanism, org roles, team roles, and the visibility rules in prose that permissions.ts will implement.
4. **Schema**: every table with its columns in one line each; ids, timestamps, enums, indexes for the real queries; append-only tables marked.
5. **Core behaviour**: the heart of the product in numbered rules (create defaults, the signature action, each status transition and what it prompts/records/notifies, list ordering, grouping).
6. **Secondary flows**: requests, goals, reports, notifications; same precision.
7. **Design system**: pointer to apex-ui plus the product's brand slots and anything product-specific (status set, nav icons).
8. **Test personas and the AI dev loop**: the `.test` domain, demo org, personas and their roles, seed shape, `test-login`, screenshot script, walkthrough scripts, unit tests for permissions and isolation.
9. **Code layout**: folders and what lives in each (pointer to apex-architecture).
10. **Steps**: Foundation → Core → Value → Polish, each ending in a named proof.

If something in the plan turns out impossible, the builder says so in their report rather than silently choosing differently. Record the change in the decision log.

## 5. Phases and the definition of done

Every Apex build follows the same order, because each phase makes the next one checkable:

| Phase | Contains | Done when |
| --- | --- | --- |
| **A. Foundation** | deps, schema pushed, auth + login, viewer/DAL/permissions skeleton, test mode + seed + browser script + AGENTS.md, shell + tokens + theme, onboarding, settings | `01-sign-in` walkthrough green: every persona lands right, bad secret refused |
| **B. Core** | the signature object end to end (list, create, detail, the signature action, transitions, history), personal view, command palette | `03-<core>-flow` green; screenshots of the two key screens at both sizes and themes |
| **C. Team & decisions** | team dashboard, request/decision flows, role-aware home, `02-pages`, `04`, `05-roles`, authz unit tests | all walkthroughs green |
| **Phase 2. Value** | goals/expectations, reports with export, impact view | report walkthrough + print check |
| **Phase 3. Polish** | notifications + preferences + emails, saved filters, keyboard, onboarding polish, sample data | notification walkthrough; a fresh org onboarded end to end |

Each step ends with: `npm run typecheck`, `npm run lint`, `npm run build` exit 0; the relevant walkthrough green; screenshots reviewed at 390×844 and 1280×900 in light and dark. "Done" is never claimed without those; "works on my machine" is not a proof.

## 6. Estimating and sequencing work inside a phase

- Slice vertically: one object from schema to screen before the next object. A polished vertical slice beats five half-screens.
- Order slices by the primary journey: what the user sees first is built first.
- Parallelise only across slices that share no files (tasks vs goals vs requests), after the foundation exists. Give each parallel builder the plan, the Apex skills, and the exact files it owns.
- Keep a **risks** list with a mitigation each (framework version drift → read bundled docs first; remote DB latency → timeouts; cross-org leakage → isolation test).

## 7. The decision log

At the top of `PLAN.md`: a dated status line and a short list of deviations ("2026-10-15: /tasks/new is a page as well as a dialog, because deep links from email need a page"). Decisions get changed here or not at all. This is what stops the same debate happening three times in three chats.

## 8. Handoff (AGENTS.md)

Written for someone who has never seen the repo and may be an AI: how to run, the checks that must pass, how to sign in as each persona, what exists, where the plan is, and the pitfalls already hit (stale Turbopack module graph → restart dev server). Keep the persona table current; it is the first thing a builder needs. Template in `references/AGENTS-template.md`.

## Outputs of this skill

1. `docs/BRIEF.md` (from `references/BRIEF-template.md`)
2. `docs/PLAN.md` (from `references/PLAN-template.md`) with decisions locked and steps with done-criteria
3. `AGENTS.md` at the repo root (from `references/AGENTS-template.md`)
4. A one-paragraph summary to the owner: what Phase 1 contains, what was cut and why, the first proof that will be shown.

Writing these takes an hour and saves the week that re-deciding costs.
