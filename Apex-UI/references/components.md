# Apex UI component recipes

The app-level components every Apex product has, with the classes that give them the standard look. Each is small enough to live in `components/<name>.tsx`; copy the recipe, keep the names, and keep the props minimal. Primitives (`Button`, `Input`, `Dialog`, …) come from shadcn/ui and are not repeated here.

## PageHeader

Title left, one primary action right. Description is one line, optional.

```tsx
export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
```

## Panel

A bordered card with a title row. Lists inside use `divide-y` and no extra padding; text content uses `px-4 py-4`.

```tsx
<section aria-label={title} className="overflow-hidden rounded-lg border bg-card">
  <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
    <h2 className="text-sm font-semibold">{title}</h2>
    {href ? (
      <Link href={href} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        {hrefLabel ?? "See all"} <ArrowRight className="size-3" aria-hidden />
      </Link>
    ) : null}
  </div>
  {children}
</section>
```

## Count tiles

Operational counts, never ratings. Four or five in a row on desktop, two columns on phone. Each tile links to the filtered list behind it.

```tsx
<Link href={href} className="rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/60">
  <p className="text-xs text-muted-foreground">{label}</p>
  <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
</Link>
```

Grid: `grid grid-cols-2 gap-3 sm:grid-cols-4`. Tone a tile only when the number is a problem (`text-status-blocked-fg` on an overdue count above zero), never decoratively.

## EmptyState

```tsx
<div className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-12 text-center">
  <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted">
    <Icon className="size-5 text-muted-foreground" aria-hidden />
  </div>
  <p className="text-sm font-medium">{title}</p>
  {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
  {action ? <div className="mt-5">{action}</div> : null}
</div>
```

Inside a Panel, use the lighter form: `<p className="px-4 py-5 text-sm text-muted-foreground">Nothing here yet. <InlineAction/></p>`.

## StatusBadge and StatusIcon

One table maps each status to its icon and tokens; both components read it.

```tsx
const STYLES = {
  not_started:       { icon: Circle,       badge: "bg-status-not-started-bg text-status-not-started-fg", dot: "text-status-not-started-dot" },
  in_progress:       { icon: CircleDot,    badge: "bg-status-in-progress-bg text-status-in-progress-fg", dot: "text-status-in-progress-dot" },
  awaiting_approval: { icon: Clock,        badge: "bg-status-awaiting-bg text-status-awaiting-fg",       dot: "text-status-awaiting-dot" },
  blocked:           { icon: OctagonAlert, badge: "bg-status-blocked-bg text-status-blocked-fg",         dot: "text-status-blocked-dot" },
  rejected:          { icon: XCircle,      badge: "bg-status-rejected-bg text-status-rejected-fg",       dot: "text-status-rejected-dot" },
  completed:         { icon: CheckCircle2, badge: "bg-status-completed-bg text-status-completed-fg",     dot: "text-status-completed-dot" },
};
// Icon alone (rows): <Icon className={cn("size-4 shrink-0", dot)} role="img" aria-label={label} />
// Badge: <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap", badge)}><Icon className="size-3.5" aria-hidden />{label}</span>
```

Rejected titles are struck through and muted in lists.

## PriorityGlyph

urgent `ChevronsUp text-priority-urgent` · high `ChevronUp text-priority-high` · normal renders nothing · low `ArrowDown size-3.5 text-priority-low`. Always `role="img"` with an `aria-label` like "High priority".

## DueLabel

Relative calendar text from a `YYYY-MM-DD` day: "Today", "Tomorrow", "in 3 days", "Oct 20", or "2 days overdue". Overdue is `text-status-blocked-fg font-medium` and only while the task is open. Always `text-xs`.

## UserAvatar

shadcn `Avatar` with an initials fallback (`bg-secondary text-secondary-foreground font-medium`). Sizes: `sm` (24px, 10px text) in rows, default (32px) in menus, `lg` on profile. Unassigned is a dashed circle: `<span className="size-6 rounded-full border border-dashed" aria-label="Unassigned" />`.

## RelativeTime

`<time dateTime=…>` with relative text ("3 hours ago", "yesterday", "Mar 4") and the absolute time in the viewer's timezone in a tooltip. Render on the server inside a request-time boundary; the client receives two strings.

## List row

```tsx
<li className="group relative flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/60 sm:px-4">
  <StatusIcon status={task.status} />
  <Link
    href={`/tasks/${task.id}`}
    className="flex min-w-0 flex-1 flex-col gap-0.5 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring md:flex-row md:items-baseline md:gap-3"
  >
    <span className="truncate text-[13px] font-medium md:max-w-[55%] md:shrink-0">{task.title}</span>
    {task.nextAction ? <span className="truncate text-xs text-muted-foreground md:text-[13px]">{task.nextAction}</span> : null}
  </Link>
  <DueLabel … className="relative shrink-0 text-xs" />
  <PriorityGlyph … className="relative" />
  <UserAvatar … size="sm" className="relative" />
  {/* desktop: a ghost "⋯" trigger that appears on hover/focus (opacity-0 group-hover:opacity-100 focus-visible:opacity-100) */}
</li>
```

The stretched `after:` pseudo-element makes the whole row the link; siblings that must stay clickable get `relative` so they sit above it. On touch, a 500ms long-press opens a bottom `Sheet` with the same actions as the hover menu.

## Field

```tsx
<div className="grid gap-2">
  <Label htmlFor={id}>{label}</Label>
  {children}
  {error ? <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
         : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
</div>
```

Set `aria-invalid` on the control when there is an error. Two-up fields: `grid gap-4 sm:grid-cols-2`.

## Segmented

Joined radio buttons for 3–4 short options. Container `inline-flex rounded-md border bg-background p-0.5`; option `h-7 rounded-[5px] px-2.5 text-xs font-medium`; active `bg-primary text-primary-foreground`, inactive `text-muted-foreground hover:bg-accent hover:text-foreground`. `role="radiogroup"` / `role="radio"` + `aria-checked`.

## Skeletons

`PageSkeleton({ rows, withAction })`: header block (`h-7 w-40` + `h-4 w-64`), an `h-9 w-28` action, then `rows` of `size-4 circle · h-4 flex-1 · h-4 w-24 · size-6 circle` inside a `divide-y rounded-lg border bg-card`. `FormSkeleton({ cards })`: stacked `rounded-lg border bg-card p-5` blocks with an `h-5 w-32` title and two input-height bars. Mark the wrapper `aria-busy="true" aria-label="Loading"`.

## Dialog and Sheet

Dialogs for create/confirm (`sm:max-w-lg`, `sm:max-w-md` for confirms). Sheets from the bottom on phone for action menus and "More" navigation: `rounded-t-xl pb-[calc(env(safe-area-inset-bottom)+1rem)]`, items `h-11 px-3 text-sm font-medium hover:bg-accent`. A destructive action always sits behind one explicit `ConfirmDialog` with a `destructive` button and a `Cancel` outline button.

## Toasts

`sonner` `<Toaster position="bottom-right" />`. `toast.success(message, { action: { label: "Open", onClick } })` after creates; `toast.error(result.error)` for failed actions. Keep messages under ~8 words: "Task created.", "Update saved.", "Invitation sent to sam@…".

## Logo

A `size-6 rounded-md bg-primary text-primary-foreground` tile with a 14px mark, then the wordmark in `font-semibold tracking-tight`. `withName={false}` keeps an `sr-only` name.
