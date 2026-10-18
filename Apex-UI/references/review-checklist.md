# Apex UI review checklist

Run this on every screen before calling it done. Take four screenshots per screen (390×844 light, 390×844 dark, 1280×900 light, 1280×900 dark) signed in as each role the screen serves, and open the PNGs: a checklist read against code misses what a glance at the picture catches.

A headless-Chrome script that signs in as a test persona and saves the PNG is part of the Apex architecture (`scripts/test-browser.mjs`); it also prints horizontal overflow and console errors.

## Hierarchy

- [ ] One primary action, visually distinct, in the page header (or the Resume card). Nothing else uses the `default` button variant in that region.
- [ ] The page title is the only `text-xl/2xl`; panel titles are `text-sm font-semibold`.
- [ ] The eye lands on the content first, not on chrome, borders or colour.
- [ ] Secondary information is `text-muted-foreground`, not smaller-and-also-bold.

## Tokens

- [ ] No hex, rgb or named colours in components; only token utilities.
- [ ] Brand colour appears only on: primary button, active nav, links, focus, selection, one highlight.
- [ ] Status and priority use the shared tokens and icons; the same state looks the same everywhere.
- [ ] Destructive red appears only on a destructive confirm button or an error message.

## Spacing and layout

- [ ] Gaps and paddings are on the 4px grid, from the allowed steps.
- [ ] Equal things are equally spaced; lists use `divide-y`, not margins.
- [ ] Content column is `max-w-[1200px]` with `px-4 md:px-6`; the header sits `mb-6` above content.
- [ ] Nothing is cramped at 390px: fields stack, rows wrap to two lines, tertiary columns hide.
- [ ] No horizontal page scroll at 390px (the screenshot script reports it).
- [ ] The bottom tab bar never covers content (`pb-24` on main at phone size).

## Type and icons

- [ ] Sizes come from the scale; no `text-[15px]` or `text-[17px]`.
- [ ] Minimum 11px; body 14px; dense rows 13px.
- [ ] lucide icons only, at the size for their context, `aria-hidden` unless they carry meaning.
- [ ] Numbers in tiles and tables use `tabular-nums`.

## States

- [ ] Loading: a `loading.tsx` skeleton shaped like the real page; no spinner-only pages.
- [ ] Empty: one sentence and at most one action; never a blank table or "No data".
- [ ] Error: an inline message in plain words; form errors next to the field; never a stack trace or a code.
- [ ] Hover/focus/active states exist on every interactive element and use the 150ms transition.
- [ ] Disabled controls are `opacity-50` and not clickable; pending buttons say what is happening ("Saving…").

## Dark mode

- [ ] Borders are visible between card and page.
- [ ] No white flashes from images, iframes, native controls or inline styles.
- [ ] Status badges remain readable (AA) and distinct from one another.
- [ ] Shadows on popovers still separate them from the page.

## Accessibility

- [ ] Every interactive element has a visible focus ring and a name (text, `aria-label`, or `sr-only`).
- [ ] `aria-current="page"` on the active nav item; `aria-label` on every `<nav>` and `<section>`.
- [ ] Dialogs have a title and a description (use `sr-only` if nothing visible fits).
- [ ] Colour is never the only carrier of meaning: status has an icon, overdue has words.
- [ ] Tap targets on phone sheets are ≥44px.

## Print (reports)

- [ ] `@media print` hides the shell; black on white; the table fits portrait A4/Letter.
