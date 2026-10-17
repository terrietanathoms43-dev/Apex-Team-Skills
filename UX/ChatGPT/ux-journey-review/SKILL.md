---
name: ux-journey-review
description: Evaluate a user journey for friction, missing feedback, navigation problems and accessibility barriers; recommend prioritized, testable improvements.
---

# UX Journey Review

**Workstream:** UX  
**AI tool used to draft:** ChatGPT  
**Owner for review:** Matthew Messado  
**Status:** Draft starter skill

## Use this skill when
A product team wants to analyze onboarding, task completion, navigation or another multi-step user experience. This is a **heuristic review** unless real user research or observed testing data are supplied.

## Required inputs
- Target users and their main goal
- Journey steps, screenshots, prototype or written flow
- Platform and constraints (mobile/desktop, connectivity, permissions)
- Pain points, analytics or usability feedback, if available
- Desired outcome and measures of success

If the journey is not provided, ask for it or state clearly that the analysis is hypothetical.

## Procedure
1. **Define scenario.** Specify who is trying to do what, in which context, and why.
2. **Map journey.** List entry point, each step, decisions, system responses, exceptions and end state.
3. **Find friction.** Look for unclear language, unnecessary choices, excessive effort, hidden actions, lost state, weak feedback and confusing errors.
4. **Include edge cases.** Consider first-time vs returning users, slow networks, wrong inputs, accessibility needs and device changes.
5. **Prioritize issues.** Rate by estimated impact, frequency (if known) and effort; label estimates separately from measured evidence.
6. **Propose improvements.** Give a specific before/after flow and explain the user benefit; avoid aesthetic changes without a UX rationale.
7. **Make it testable.** For each major proposal, specify the success metric or usability test needed to validate it.

## Output format
- **User goal and context**
- **Current journey** — numbered steps, confirmed or assumed
- **Friction table** — `Step | Problem | Evidence or assumption | Severity | Recommendation`
- **Proposed improved journey** — numbered steps, including recovery/error paths
- **Validation plan** — tasks to test, success criteria and outstanding questions

## Acceptance checks
- [ ] Recommendations tie to concrete steps and user needs.
- [ ] Evidence is clearly separated from speculation.
- [ ] Errors, empty states and mobile/desktop constraints are considered.
- [ ] Priorities are justified.
- [ ] Proposed improvements can be evaluated through observation or metrics.

## Example invocation
> Use the UX Journey Review skill for a first-time user joining a project team and creating a task. Current flow: sign up, confirm email, find teams, accept invite, open project, add task. Note friction points and provide a testable improved flow.

## Guardrails
- Never invent interviews, accessibility audit results, statistics or usability test findings.
- Do not confuse an appealing screen with an effective experience.
- Protect sensitive participant data and obtain permission before using real user feedback.
