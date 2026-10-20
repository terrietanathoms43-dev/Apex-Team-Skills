# The data layer

Schema, Viewer, DAL and permissions: the four pieces that make an Apex app multi-tenant safe and easy to reason about.

## Schema conventions (db/schema.ts)

```ts
const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();
const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const day = (name: string) => date(name, { mode: "string" }); // calendar day, never shifted by timezone

export const taskStatusEnum = pgEnum("task_status", TASK_STATUSES); // the list lives in lib/constants.ts
```

- One schema file. Sections in order: enums → Auth.js tables (exactly as the adapter expects) → tenancy (organizations, organization_members, teams, team_members, invitations) → work → notifications → exported row types (`$inferSelect`).
- Every org-scoped table has `org_id` with `references(() => organizations.id, { onDelete: "cascade" })`, even when it could be derived through a parent; it keeps every query one `where` away from safety.
- Membership tables use composite primary keys `(org_id, user_id)`, `(team_id, user_id)` and an index on `user_id` for "my memberships".
- Foreign keys always declare `onDelete`: `cascade` for children, `set null` for references that may outlive the target (assignee, project).
- Append-only tables (`task_updates`, `task_activity`, `request_decisions`) have `created_at` and never an `updated_at`; indexes `(parent_id, created_at desc)`.
- Indexes follow the real queries, named `<table>_<cols>_idx`. The usual set: `(org_id, team_id, status)`, `(org_id, assignee_id, status)`, `(org_id, due_date)`, `(request_id)`, `(goal_id)`, `(user_id, read_at)`.
- Denormalise only what lists need every time (`latest_progress`, `next_action` on tasks). Write it in the same transaction as the source row.
- Tokens are stored hashed (`token_hash` sha256 hex, unique); emails lowercased; slugs unique.
- Managed with `npm run db:push` against the dev database first, then production (owner runs it). Once real data exists: new columns nullable or defaulted, no renames; a rename is add → backfill → switch → drop later.

## Viewer (lib/viewer.ts)

```ts
export type Viewer = { userId: string; orgId: string; orgRole: OrgRole; teamRoles: Map<string, TeamRole>; timezone: string };
```

Resolved once per request with `React.cache`: (1) the session cookie → `sessions ⋈ users` in one query, no token minting; (2) memberships + team roles + the active-org cookie together; the cookie is honoured only if the user really is a member, else the oldest membership is used and the cookie rewritten (best effort during render, firmly in actions). Exposed as `getViewer()` (nullable), `requireViewer()` (redirects to `/login` or `/onboarding`), `requireViewerContext()` (adds user, org, orgs for the shell), `requireUser()` (signed in, org or not).

## DAL (lib/dal/*.ts)

- `import "server-only"` at the top of every file.
- Every exported function takes `viewer: Viewer` first (or `tx: Tx` + explicit `orgId` for helpers used inside transactions) and includes `eq(table.orgId, viewer.orgId)` in its `where`. By-id lookups: `and(eq(t.id, id), eq(t.orgId, viewer.orgId))`.
- Return plain shapes typed in `lib/<feat>/types.ts`, not raw rows, so pages and client components share one vocabulary (`TaskListItem`, `TaskDetail`, `Person`).
- Pagination by cursor `(created_at, id) < (…)`, `limit n + 1` to learn whether there is more.
- Heavy merges (history = updates ∪ activity) are one SQL statement with `db.execute(sql\`…\`)`, typed by a row type and phrased by a pure function.
- `lockTask(tx, orgId, id)` = `select … for update` returning the row and its permission scope; every read-modify-write starts with it.
- `recordActivity(tx, scope, drafts, at)` appends audit rows; it is the only writer of the activity table.

## Permissions (lib/permissions.ts)

Pure functions over the Viewer and a resource's scope; no imports from the database.

```ts
type OrgScoped = { orgId: string };
export type TaskScope = OrgScoped & { teamId: string; assigneeId: string | null; createdBy: string; approverId?: string | null; requesterId?: string | null };

export const inOrg = (v: Viewer, r: OrgScoped) => v.orgId === r.orgId;
export const isAdmin = (v: Viewer) => v.orgRole === "admin";
export const leadsTeam = (v: Viewer, teamId: string) => isAdmin(v) || v.teamRoles.get(teamId) === "lead";

export function canEditTask(v: Viewer, t: TaskScope): boolean {
  if (!inOrg(v, t) || isStakeholder(v)) return false;
  return isAdmin(v) || t.assigneeId === v.userId || t.createdBy === v.userId || leadsTeam(v, t.teamId);
}
export function navFor(v: Pick<Viewer, "orgRole">): NavKey[] { … } // the UI hides what the role can't use
```

Every predicate checks the organisation first: a foreign id is invisible whatever the role. The file has a `permissions.test.ts` beside it that walks each role through each predicate. Guards that need I/O (`requireOrgAdmin`) live in `lib/guards.ts` and throw `GuardError`.

## Isolation test (lib/dal/isolation.test.ts)

Seed two organisations with `.test` members. As the second org's admin, call every list function and every by-id lookup with ids from the first org: lists are empty, lookups are `null`. Run with the real database (`CLARITY_DB_TESTS=1 npx vitest run lib/dal/isolation.test.ts`). This single test is the proof the tenant boundary holds; keep it green.

## Time (lib/time.ts)

Instants are UTC in the database and shown in the viewer's timezone (user override, else the org's). Calendar days (`due_date`) are `YYYY-MM-DD` strings compared as strings. Helpers: `dayKey(date, tz)`, `formatRelative`, `formatAbsolute`, `formatDue(day, today) → { text, overdue }`, `calendarDaysBetween`. Pages compute `today = dayKey(new Date(), viewer.timezone)` once and pass it down.
