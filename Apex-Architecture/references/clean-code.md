# Clean, teachable code

The test of an Apex codebase: could you open any file with someone new to Next.js and explain it in two minutes? These habits make that true.

## Files

- **One idea per file, named for it.** `components/tasks/task-row.tsx` renders one row; `lib/tasks/transitions.ts` plans status changes; `actions/tasks.ts` holds every task mutation. A reader finds code by guessing the name.
- **A one-line header comment** saying what the file is for when the name is not enough, and the one non-obvious thing about it. Not a changelog, not a licence block.
- **Size limits are smells, not rules**: a page over ~150 lines, a component over ~200, a function over ~40 lines means a second concern crept in. Extract it and name it.
- **Sections** inside longer files use `// --- name ---------` dividers in a fixed order (schemas → helpers → exported functions).
- Imports ordered: node → packages → `@/db` → `@/lib` → `@/components` → relative; types with `type` keyword. Let the formatter sort the rest.

## Names

- Functions are verbs that say the effect: `createTask`, `planTransition`, `listTasks`, `requireViewer`, `canApproveTask`. Predicates start with `can`, `is`, `has`.
- Variables are nouns in the domain's words: `viewer`, `assignee`, `approver`, `nextAction`, `blockedReason`. No `data2`, `tmp`, `res`, `obj`.
- Booleans read as conditions: `pending`, `blocked`, `completing`, `selfOnTeam`.
- Database columns `snake_case`, TypeScript `camelCase`, Drizzle maps between them once in the schema.
- Constants in `UPPER_SNAKE` only for true constants (`TASK_STATUSES`, `INVITE_TTL_DAYS`, `ORG_COOKIE`).
- One word per concept everywhere: "organisation" is not also "workspace" and "tenant" in the same codebase; "update progress" is not also "log work".

## Comments

Explain **why**, **what the rule is**, or **what would surprise**:

```ts
// Sessions last their original 30 days: reads never extend them.
// Claim the invitation first, so a double submit cannot join twice.
/** Who may move a task to `to`: rejecting is an edit, finishing an approval is the approver's, the rest is progress. */
```

Never restate the code (`// increment i`). Never leave commented-out code. TODOs carry an owner and a reason or they are deleted.

## Types

- `strict: true`. No `any`; `unknown` at boundaries then narrow.
- Domain unions come from `as const` arrays in `lib/constants.ts` so the schema enum, the zod enum and the UI labels share one source: `TASK_STATUSES`, `type TaskStatus = (typeof TASK_STATUSES)[number]`, `TASK_STATUS_LABELS: Record<TaskStatus, string>`.
- Row types from Drizzle (`typeof tasks.$inferSelect`); wire types hand-written in `lib/<feat>/types.ts` as plain JSON shapes.
- Props typed inline for small components; exported `type`s for shapes used in more than one file.
- Prefer discriminated unions (`{ ok: true; data } | { ok: false; error }`) over optional fields that imply a state.

## Functions

- Small, pure where possible; I/O at the edges (actions, DAL, routes). Pure code gets `*.test.ts` next to it.
- Parameters as an object when more than three or when two share a type (`{ orgId, taskId, actorId }`).
- Early returns for guards; the happy path at the bottom, un-indented.
- No hidden globals except the one database pool and the logger.

## Components

- Server Component by default; `"use client"` only when it holds state, effects, event handlers or browser APIs. A client file does not import server-only modules.
- Props are plain JSON (strings, numbers, booleans, arrays, plain objects). Dates arrive as ISO strings or `YYYY-MM-DD`.
- Composition over configuration: `PageHeader` takes an `action` ReactNode rather than twelve boolean props.
- Accessibility is part of correctness: labels, `aria-*`, focus, keyboard. A component without them is unfinished.
- Styling is Tailwind classes from the Apex UI scale; `cn()` for conditionals; no inline styles except dynamic values that cannot be classes (a progress width).

## Errors and logging

- Inside the server: throw `GuardError` for expected refusals, let unexpected errors propagate to `runAction`.
- At the boundary: `ActionResult` with a user-safe message. The client never sees a stack, a code or "undefined".
- Log business events at `info` with ids (`orgId`, `taskId`, `by`), failures at `error` with `errorFields(error)`. One JSON line per event; grep-able on the VPS.

## Dependencies

- Add one only when it removes more code than it adds and has no reasonable stdlib/platform alternative. `Intl` over moment, native `<select>` and `<input type="date">` over pickers, `fetch` over axios.
- Pin versions. Read the changelog when bumping the framework; its docs ship in `node_modules`.

## Deleting

Dead code, unused exports, old migrations folders, stale docs and "v2" files are deleted, not kept "just in case". Git remembers.

## A short review script

1. Can I say what this file does from its first line?
2. Does every mutation go through `runAction` with a permission check and a scoped lookup?
3. Are the names the domain's words, used consistently?
4. Is anything here a copy of something elsewhere? Extract or delete.
5. Would a newcomer be surprised by anything? Then there is a missing comment or a wrong abstraction.
