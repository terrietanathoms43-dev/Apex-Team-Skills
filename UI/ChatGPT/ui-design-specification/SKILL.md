---
name: ui-design-specification
description: Turn interface requirements into accessible, consistent and responsive UI design specifications that a developer or designer can implement and verify.
---

# UI Design Specification

**Workstream:** UI  
**AI tool used to draft:** ChatGPT  
**Owner for review:** Maxwell Wedderburn  
**Status:** Draft starter skill

## Use this skill when
A team needs a detailed design specification for a new screen, component or visual redesign. This skill produces guidance and specifications; it does **not** produce a finished Figma design or coded interface unless those are separately requested and supported.

## Required inputs
- Product audience and screen/component goal
- Existing design system, brand colours, typography and assets, if available
- Target platforms and viewport sizes
- Mandatory content, interactions and screen states
- Accessibility requirements and known constraints

Ask for existing brand rules when the work must match an established app. If none are provided, present proposed defaults as proposals.

## Procedure
1. **Summarize the UI goal.** Identify primary action, supporting content, user context and design constraints.
2. **Establish design tokens.** Document colours (semantic roles, not only hex values), type scale, spacing, radius, borders and component hierarchy. Preserve supplied branding.
3. **Define layout.** Specify sections, content order, alignment, density and responsive changes for mobile, tablet and desktop. Avoid assuming a single screen size.
4. **Specify components.** Describe reusable component variants and their states: default, hover (when applicable), focus, loading, error, disabled and empty.
5. **Check accessibility.** Account for readable type, keyboard and focus behaviour, text labels, contrast, hit targets and reduced-motion preferences as appropriate.
6. **Identify implementation details.** Clarify assets, design tokens, component reuse, handoff notes and unknowns.
7. **Review consistency.** Confirm that similar actions and components behave and appear consistently across screens.

## Output format
- **Design intent** — purpose and primary action
- **Design tokens** — colours, typography, spacing and components
- **Responsive layout** — mobile/tablet/desktop behaviour
- **Components and states** — table: `Component | Role | Variants/states | Accessibility | Notes`
- **Interaction-to-visual mapping** — how state changes are represented
- **Handoff checklist** — assets, labels, constraints and unresolved decisions

## Acceptance checks
- [ ] Primary action and visual hierarchy are explicit.
- [ ] Existing brand requirements are followed.
- [ ] States include loading, error, focus and empty where applicable.
- [ ] Mobile and desktop designs are considered.
- [ ] Unconfirmed specs are labelled as proposed.

## Example invocation
> Apply the UI Design Specification skill to a team dashboard. Brand: blue and gold. Target: mobile and laptop. Needs: task overview, create-task button, report shortcut, empty/loading/error states. Provide a responsive layout and component specification.

## Guardrails
- Do not pretend to have seen screens or tested contrast without actual assets/measurements.
- Do not equate decorative complexity with usability.
- Do not invent product features or claim an implementation is done.
