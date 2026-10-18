---
name: apex-ui
description: The Apex team's visual standard for web application UI (Next.js App Router, Tailwind v4, shadcn/ui on Radix, lucide icons, Geist type). Use it whenever you build, restyle, theme or review any screen, page, component, dialog, sheet, form, list, table, dashboard tile, email template, loading skeleton or empty state, and whenever a brand colour has to be applied to an app. It fixes the design tokens (oklch, light and dark), the spacing and type scales, icon sizes, the layout grid (240px sidebar, 1200px content, phone top bar and bottom tabs), component recipes and the screenshot review checklist. Reach for it even when the request is only "make it look better", "polish this", "match our design", "it looks messy", or "use our colours": the brand plugs into these tokens and everything else stays standard.
---

# Apex UI

The look of every Apex product: **calm, premium, monochrome-first, with one brand accent**. Strong hierarchy comes from type weight, spacing and a single accent, not from colour everywhere. Think Linear's restraint with Things' friendliness. The reference implementation is the Clarity project (`app/globals.css`, `components/`); when in doubt, open it.

Why this matters: a tracker, a dashboard or a form is used many times a day. Visual noise taxes every one of those visits. The standard below removes decisions (which grey, which gap, which icon size) so screens come out consistent and attention goes to the content.

## 1. Tokens: the only place colour lives

All colour is a CSS variable on `:root` / `.dark`, exposed to Tailwind through `@theme inline`. Components never carry a hex value. The full template, including the status and priority palettes, is in `references/tokens.css`; copy it into `app/globals.css` and fill the brand slots.

Three layers:

| Layer | Tokens | Rule |
| --- | --- | --- |
| Neutrals | `background`, `foreground`, `card`, `popover`, `border`, `input`, `muted`, `muted-foreground`, `secondary`, `accent` (the quiet hover surface), `sidebar` | Fixed. Near-white page, white cards, 1px borders at `oklch(0.92 0 0)`. Dark mode uses a cool, very low-chroma grey (`hue 260, chroma 0.005`), never pure black. |
| Brand | `primary` / `primary-foreground`, `ring`, `link`, `selection`, `sidebar-accent`, optional `highlight` | Where the product's identity shows. Default is foreground-coloured (near-black / near-white) buttons with a blue accent for links and focus. A branded product sets `primary` to its brand hue and may add one warm `highlight` for small moments (active indicator, badge, progress fill). Never a third. |
| Semantic | `destructive`; `status-*-bg/fg/dot` for each workflow state; `priority-urgent/high/low` | Fixed hues so the same state looks the same in every Apex app: not started grey · in progress blue (hue 250) · awaiting approval amber (hue 75–85) · blocked red (hue 25) · rejected slate · completed green (hue 150). Text is AA on its background; dots are 3:1 against the page. |

Rules that keep it calm:

- **Brand colour is for meaning, not decoration.** It marks the primary action, the active nav item, focus, links, selection and one highlight. Backgrounds, cards, headings and body text stay neutral. A page should still read correctly in greyscale.
- **No gradients, no coloured page backgrounds, no shadows** except on popovers, menus and dialogs (`shadow-md` / `shadow-lg`). Elevation comes from a 1px border.
- **oklch everywhere.** Keep lightness steps between neighbouring surfaces at 0.02–0.04 so borders stay visible in both themes.
- **Both themes always.** `.dark` is applied by `next-themes` (`attribute="class"`, system default). Every token has a dark value; every screenshot check runs in both.

### Applying a brand (three steps)

1. Convert the brand colours to oklch (any converter; keep the hue, pick lightness that gives ≥4.5:1 for white text on `primary`). Example, Trackwise: royal blue `#234a9e` → `oklch(0.43 0.14 262)` for `primary` in light, `oklch(0.72 0.14 262)` in dark; gold `#f2c56f` → `oklch(0.84 0.11 82)` as `highlight`.
2. Set `primary`, `primary-foreground`, `ring`, `link`, `selection`, `sidebar-accent` (a 5–8% tint of the brand) and, if there is a second colour, `highlight` / `highlight-foreground`. Leave every neutral and semantic token alone.
3. Check contrast on buttons, links on both backgrounds, and the active nav tint. If the brand hue clashes with the status blue (hue 250) at a glance, nudge the status hue to 240 rather than changing the brand.

## 2. Type

Geist Sans for everything, Geist Mono for identifiers, timestamps in history and code. Load both through `next/font/google` as `--font-geist-sans` / `--font-geist-mono`. Headings get `tracking-tight`.

| Use | Class | Notes |
| --- | --- | --- |
| Page title | `text-xl font-semibold md:text-2xl` | One per page, in `PageHeader`. |
| Section / panel title | `text-sm font-semibold` | `h2` inside a card header. |
| Body | `text-sm` (14px) | The default on `body`. |
| Dense row text | `text-[13px] font-medium` for the row title, `text-xs text-muted-foreground` for the secondary line | Lists, nav items, table cells. |
| Labels, meta, hints | `text-xs text-muted-foreground` | Field hints, timestamps, counts. |
| Big number / next action | `text-base` to `text-lg font-medium` | The one thing the screen is about (a Resume card's next action, a count tile). |
| Landing hero | `text-4xl sm:text-5xl font-semibold leading-[1.1]` | Marketing pages only. |

Never below 11px. Line length under ~70 characters for paragraphs (`max-w-prose` or `max-w-xl`).

## 3. Spacing and layout

A 4px grid. Only these steps: `0.5 1 1.5 2 2.5 3 4 5 6 8 10 12 16` (Tailwind units = 2 4 6 8 10 12 16 20 24 32 40 48 64px).

| Where | Value |
| --- | --- |
| Page content | `mx-auto w-full max-w-[1200px] px-4 pt-6 md:px-6 md:pt-8`; bottom padding `pb-24 md:pb-10` (room for the phone tab bar). |
| Page header → content | `mb-6` |
| Between sections / panels | `gap-6` (`grid gap-6`) |
| Card padding | `p-4` dense, `p-5` settings-style forms, `p-6` empty states and landing tiles |
| Card header | `px-4 py-2.5 border-b`, title left, "See all" link right |
| List row | `px-3 py-2.5 sm:px-4` with `gap-3` between its parts; rows separated by `divide-y` |
| Form fields | `grid gap-4`; label → control `gap-2`; two-up fields `sm:grid-cols-2` |
| Inline icon + text | `gap-2` (buttons) or `gap-2.5` (nav) |
| Sidebar | `w-60` (240px), `px-3`, nav items `h-8 px-2.5 rounded-md` |
| Phone top bar | `h-14`; bottom tab bar `h-16` plus `pb-[env(safe-area-inset-bottom)]` |
| Control heights | 36px default (`h-9`), 32px small (`h-8`), 40px for auth forms and primary onboarding buttons (`h-10`), 44px tap targets on phone sheets (`h-11`) |

Layout shape: desktop = sticky 240px sidebar (org switcher top, nav, notifications, user menu bottom) + content column. Phone = top bar (org name, search, bell, avatar) + content + fixed bottom tabs (up to four destinations, then "More" opens a bottom sheet). The frame itself is static and prerenders; session-dependent parts sit in `<Suspense>` with skeletons the same size as what they replace, so nothing jumps.

Responsive rule: design at **390×844** and **1280×900**. Rows collapse from one line to two (`flex-col md:flex-row`), two-up fields stack, secondary columns hide with `hidden sm:block`. Horizontal page scroll is a defect.

## 4. Icons

`lucide-react` only, outline style, `aria-hidden` unless the icon is the label (then `role="img"` + `aria-label`).

| Context | Size |
| --- | --- |
| Inside buttons, list rows, inputs | `size-4` (16px); buttons get this automatically via `[&_svg]:size-4` |
| Nav items (sidebar) | `size-4`; bottom tabs `size-5` |
| Empty state / notice glyph | `size-5` inside a `size-10`/`size-11` muted circle |
| Status icon in a row | `size-4`, coloured with the status dot token |
| Badge icon | `size-3.5` |
| Tiny affordances (chevrons, kbd hints) | `size-3` to `size-3.5` |

Status icons are fixed per state: `Circle`, `CircleDot`, `Clock`, `OctagonAlert`, `XCircle`, `CheckCircle2`. Priority glyphs: urgent `ChevronsUp` (red), high `ChevronUp` (orange), normal nothing, low `ArrowDown` (muted). Navigation icons are chosen once per product and never swapped per page.

## 5. Shape, borders, elevation, motion

- Radius token `--radius: 0.625rem` (10px): cards, dialogs, inputs `rounded-lg`/`rounded-md`; avatars and dots `rounded-full`; small tags `rounded-md` not pills.
- Borders 1px, `border-border`; dashed border only for "nothing here yet" surfaces and the unassigned avatar placeholder.
- Shadows only on floating layers. Cards have none.
- Motion: `150ms` ease-out on hover/focus/colour (`transition-colors`). Dialogs: 200ms fade + 95% zoom (shadcn default). No page transitions, no bouncing, no animated gradients. Respect `prefers-reduced-motion` by not animating anything essential.
- Focus is always visible: `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px }` globally; shadcn controls use `ring-[3px] ring-ring/50`.

## 6. Components

Use shadcn/ui ("new-york", neutral base, CSS variables) for primitives: button, input, textarea, label, select, dialog, sheet, dropdown-menu, popover, command, tabs, badge, avatar, tooltip, separator, skeleton, checkbox, switch, scroll-area, sonner. Date input is the native `<input type="date">` styled like Input (no calendar library). Long or scripted pickers use a styled native `<select>` (`NativeSelect`), Radix Select is for short rich lists.

The app-level pieces every product has, with the exact classes, are in `references/components.md`:

- **PageHeader**: title (+ optional one-line description) left, the page's single primary action right.
- **Panel**: bordered card with a `px-4 py-2.5` header row and a "See all →" link.
- **EmptyState**: dashed card, muted icon circle, one sentence, at most one action. Never a blank table.
- **StatusBadge / StatusIcon**, **PriorityGlyph**, **DueLabel** (relative, red when overdue), **UserAvatar** (initials fallback), **RelativeTime** (relative text, absolute tooltip).
- **List row**: `status icon · title · secondary text · due · priority · avatar · hover actions`; whole row clickable through a stretched link; long-press on touch opens a bottom sheet of actions.
- **Field**: label, control, then hint *or* error (never both).
- **Segmented**: small joined radio buttons for 3–4 options (priority, size).
- **Skeletons**: `PageSkeleton` for list pages, `FormSkeleton` for settings; matched to the real layout's heights.
- **Toasts**: `sonner` bottom-right, success with an optional "Open" action, errors from `ActionResult.error`.

Buttons: one `default` (brand) per screen region; `outline` for secondary, `ghost` for tertiary and icon buttons, `destructive` only inside a confirm dialog. Button text is a verb phrase in sentence case ("Create task", "Save update").

## 7. Dark mode and print

- Test every component in `.dark`. Watch native date pickers (set `color-scheme: dark`), images with white backgrounds, and borders disappearing (raise `border` lightness to 0.28).
- `::selection` uses the brand tint; `-webkit-tap-highlight-color: transparent` on html.
- Reports print as a document: `@media print` hides `aside, header, nav, [data-print-hide]`, forces black on white, removes link styling and main padding.
- Emails cannot read CSS variables: templates use the light theme's literal values (page `#fafafa`, card `#fff`, border `#e5e5e5`, text `#262626`, muted `#737373`, button = brand `primary` hex) in a 480px card with a 10px radius.

## 8. Review before calling anything done

Take screenshots at **390×844 and 1280×900, light and dark**, signed in as the roles the screen serves, and look at them (open the PNG). The full list is in `references/review-checklist.md`; the ten that catch most defects:

1. One obvious primary action; nothing else competes with it.
2. Text sizes come from the scale; no stray `text-[15px]`.
3. Spacing comes from the grid; equal things are equally spaced.
4. Brand colour appears only where it means something.
5. Status and priority use the shared tokens and icons.
6. No horizontal overflow at 390px; nothing hidden behind the bottom tabs.
7. Dark mode: borders visible, no white flashes, images fine.
8. Every interactive element has a visible focus ring and an accessible name.
9. Loading states exist and match the final layout's shape.
10. Empty states say one sentence and offer one action.

## Anti-patterns (and what to do instead)

| Seen | Instead |
| --- | --- |
| Coloured section backgrounds, gradients, glassmorphism | White card, 1px border, let type carry hierarchy |
| Brand colour on headings or body text | Neutral text; brand on the primary button and active nav |
| Icons at random sizes, mixed icon sets, emoji as icons | lucide only, sizes from §4 |
| Pills, big radii, drop shadows on cards | `rounded-md`/`rounded-lg`, borders |
| Shouting labels (ALL CAPS, `uppercase tracking-widest`) | `text-xs text-muted-foreground` sentence case |
| Tables that disappear on phone | Rows that reflow to two lines, hide tertiary columns |
| Custom hex codes in components | A token; add one to `globals.css` if genuinely missing |
| "Beautiful" skeletons that don't match the page | Skeleton blocks the same height as the rows they stand in for |
