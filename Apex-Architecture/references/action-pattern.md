# The action pattern

Every mutation in an Apex app is a server action with the same shape. This file gives the helper that provides the shape and a worked example, so a new action is written by filling slots rather than by inventing.

## lib/action-result.ts

```ts
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { errorFields, log } from "@/lib/log";

/** What every server action returns: the UI shows `error` (and `fieldErrors` next to inputs) or a success toast. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export const ok = <T>(data: T, message?: string): ActionResult<T> => ({ ok: true, data, message });
export const fail = <T = never>(error: string, fieldErrors?: Record<string, string[] | undefined>): ActionResult<T> => ({ ok: false, error, fieldErrors });

/** User-safe messages. Nothing internal ever reaches the client. */
export const ERR = {
  unauthorized: "You need to sign in to do that.",
  forbidden: "You don't have permission to do that.",
  notFound: "That doesn't exist, or you can't see it.",
  badRequest: "Some of that didn't look right. Check the form and try again.",
  conflict: "That was just changed by someone else. Refresh and try again.",
  server: "Something went wrong. Please try again.",
} as const;

/** Thrown by guards and DAL lookups; runAction turns it into a failed ActionResult. */
export class GuardError extends Error {
  constructor(public readonly code: "unauthorized" | "forbidden" | "not_found" | "conflict", message?: string) {
    super(message ?? code);
  }
}

function guardMessage(error: GuardError): string {
  if (error.message !== error.code) return error.message; // a specific, user-safe explanation
  return error.code === "not_found" ? ERR.notFound : ERR[error.code];
}

/** zod parse → run (requireViewer → permission → transaction) → ActionResult. redirect()/notFound() still work. */
export async function runAction<S extends z.ZodType, T>(
  name: string,
  schema: S,
  input: unknown,
  run: (data: z.infer<S>) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    return fail(flat.formErrors[0] ?? ERR.badRequest, flat.fieldErrors as Record<string, string[] | undefined>);
  }
  try {
    return await run(parsed.data);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof GuardError) return fail(guardMessage(error));
    log.error("action.failed", { action: name, ...errorFields(error) });
    return fail(ERR.server);
  }
}
```

## A worked action: create a task

```ts
"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { tasks, teamMembers } from "@/db/schema";
import { GuardError, ok, runAction, type ActionResult } from "@/lib/action-result";
import { TASK_PRIORITIES } from "@/lib/constants";
import { recordActivity } from "@/lib/dal/activity";
import { findTeam } from "@/lib/dal/orgs";
import { log } from "@/lib/log";
import { dispatch } from "@/lib/notify";
import { canCreateTask } from "@/lib/permissions";
import { requireViewer } from "@/lib/viewer";

// Shared field rules live at the top of the file so every schema in it agrees.
const id = z.string().min(1).max(64);
const day = z.union([z.literal(""), z.iso.date({ error: "Pick a date." })]).default("");

const createSchema = z.object({
  title: z.string().trim().min(1, "Give the task a title.").max(200),
  teamId: id,
  assigneeId: z.string().default(""),
  priority: z.enum(TASK_PRIORITIES).default("normal"),
  dueDate: day,
  nextAction: z.string().trim().max(1000).default(""),
});

export async function createTask(input: z.input<typeof createSchema>): Promise<ActionResult<{ id: string }>> {
  return runAction("tasks.create", createSchema, input, async (data) => {
    const viewer = await requireViewer();                                   // 1. who, in which org
    const now = new Date();
    const taskId = await db.transaction(async (tx) => {                      // 2. one transaction
      const team = await findTeam(tx, viewer.orgId, data.teamId);            //    scoped lookup
      if (team === null) throw new GuardError("not_found");
      if (!canCreateTask(viewer, team)) throw new GuardError("forbidden");   // 3. pure permission
      if (data.assigneeId) {
        const [member] = await tx.select({ userId: teamMembers.userId }).from(teamMembers)
          .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, data.assigneeId)));
        if (!member) throw new GuardError("forbidden", "The assignee must be on the team.");
      }
      const [created] = await tx.insert(tasks).values({
        orgId: viewer.orgId, teamId: team.id, title: data.title,
        assigneeId: data.assigneeId || null, createdBy: viewer.userId,
        priority: data.priority, dueDate: data.dueDate || null, nextAction: data.nextAction || null,
        createdAt: now, updatedAt: now,
      }).returning({ id: tasks.id });
      await recordActivity(tx, { orgId: viewer.orgId, taskId: created.id, actorId: viewer.userId }, [
        { kind: "created", after: { title: data.title } },
        ...(data.assigneeId && data.assigneeId !== viewer.userId ? [{ kind: "assigned" as const, after: { assigneeId: data.assigneeId } }] : []),
      ], now);
      return created.id;
    });
    log.info("tasks.created", { orgId: viewer.orgId, taskId, by: viewer.userId });
    if (data.assigneeId && data.assigneeId !== viewer.userId) {               // 4. notify after commit
      await dispatch([{ orgId: viewer.orgId, actorId: viewer.userId, recipients: [data.assigneeId], kind: "assigned",
        title: `New task for you: ${data.title}`, body: data.nextAction || null, href: `/tasks/${taskId}` }]);
    }
    refresh();                                                                // 5. the UI behind updates
    return ok({ id: taskId }, "Task created.");                               // 6. toast text
  });
}
```

## Calling it from a client component

```tsx
const [pending, startTransition] = useTransition();
const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

startTransition(async () => {
  const result = await createTask({ title, teamId, assigneeId, priority, dueDate, nextAction });
  if (!result.ok) { setErrors(result.fieldErrors ?? { title: [result.error] }); return; }
  toast.success(result.message ?? "Task created.", { action: { label: "Open", onClick: () => router.push(`/tasks/${result.data.id}`) } });
  onDone?.(result.data.id);
});
```

For `<form action={...}>` server-action forms (sign-in, simple settings), use `formToObject(formData)` then the same `runAction`, and `SubmitButton` (`useFormStatus`) for the pending state.

## Status transitions are a pure plan

Rules about moving between states live in `lib/<feat>/transitions.ts` as `planTransition(current, to, input, now, via) → { ok, patch, activities } | { ok: false, error }`. The action locks the row, calls the plan, applies `patch`, writes `activities`, and derives notices from them. Because the plan is pure it is unit-tested exhaustively and shared by every entry point (status menu, update form, approve/send back buttons).

## Reads for client components

Some client components need data after mount (form options, a palette search, "load more"). Expose them as actions too (`getTaskFormOptions`, `paletteSearch`, `loadMoreTasks`) returning `ActionResult<T>`; they go through `requireViewer` and the DAL like everything else. Never add a public REST route for data the app itself reads.

## Checklist for a new action

- [ ] schema at the top of the file, messages in user words
- [ ] `requireViewer()` (or `requireOrgAdmin()` / `requireUser()`) first thing
- [ ] every row loaded with `orgId` in the `where`
- [ ] permission predicate from `lib/permissions.ts`, never inline role string checks
- [ ] one `db.transaction`, lock before read-modify-write
- [ ] history/activity appended in the same transaction
- [ ] notices collected inside, dispatched after
- [ ] `log.info` for the business event
- [ ] `refresh()` then `ok(...)` with toast text
