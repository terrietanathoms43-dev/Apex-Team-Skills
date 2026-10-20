# <Product> — Product Brief

> Supplied by <owner> on <date>. This is the statement of intent. Where it conflicts with `docs/PLAN.md`, the plan wins: the plan records the decisions made after reading this.

## 1. Mission

One paragraph: what the product is, for whom, and the feeling it should leave. One sentence in bold that the team can repeat ("Less time managing work. More time doing it.").

## 2. Technology stack

The stack family (e.g. Next.js App Router + TypeScript · PostgreSQL · Drizzle · Auth.js with Google + magic links · Tailwind + shadcn/ui · Zod · self-hosted Node + Postgres). Exact versions go in the plan.

## 3. Product philosophy

The tests every feature must pass (saves time / improves visibility or accountability / helps a decision). The levels of visibility (employee / manager / stakeholder) as the question each asks. What the product must not become (surveillance, gamification, scoring).

## 4. Roles and organisation model

Multi-tenant or not. Each role in one line: what they can do, what they can see.

## 5–12. Core features

One short section per feature area, each with: what it captures, the statuses or states and what each one means behaviourally, and the critical UX requirement in one sentence. Mark the **signature feature** (the one thing the product does better than anything else).

## 13. Navigation and views

The main destinations (≤ 6). What each role sees. Views explicitly not built yet (Kanban, Gantt, calendar).

## 14. Design direction

Adjectives and references ("calm, premium, Linear's restraint"), the brand constraints that must stay, first-use flow, the small details that matter (inline editing, keyboard, empty states, relative dates).

## 15. Data and security

Expected entities. Scoping rule (every org-scoped row filtered by org in the data layer). Immutable events vs editable state. Auth providers, invitations, sessions.

## 16. Reports and notifications

What managers actually want to see; what interrupts whom.

## 17. Engineering requirements

Strict TypeScript, separation of UI / logic / data, server-side validation, transactions, pagination, indexes, access control, no secrets in client, seed data, structured logging, accessibility, automated tests for authorisation. Minimal dependencies.

## 18. Key user journeys

Lettered journeys (A–E): *sign in → see → do → result*, with a time budget.

## 19. What NOT to build initially

An explicit list. This section earns its place every month.

## 20. Phases

Phase 1 (genuinely useful alone) · Phase 2 (demonstrating value) · Phase 3 (operational polish).

## 21. Success

What each role thinks when it works ("I always know where I stopped and what to do next.").
