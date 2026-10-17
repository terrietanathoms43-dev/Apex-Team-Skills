---
name: delivery-planning
description: Turn project requirements and constraints into a clear delivery plan, ownership map, milestones, risks and next actions.
---

# Delivery Planning

**Workstream:** Delivery  
**AI tool:** ChatGPT  
**Owner for review:** Terri-Etana Thoms  
**Status:** Draft starter skill

## Use this skill when
A team needs to turn a set of requirements, proposed features, meeting notes or a product goal into an actionable delivery plan. Do not use this skill to claim that implementation or testing has occurred.

## Required inputs
- Goal, users and success criteria
- Features, tasks or requirements (even rough notes)
- Available team members and confirmed responsibilities
- Known deadline(s), dependencies and blockers, if any
- Constraints (time, tools, budget, integrations), if known

When something essential is missing, ask focused questions. Otherwise label the assumption **unconfirmed**; never invent a date, owner or completion status.

## Procedure
1. **Define delivery outcome.** State the goal and measurable acceptance criteria in plain language. Separate must-haves from nice-to-haves.
2. **Break down deliverables.** Convert features into individually verifiable tasks. Each must have a description, acceptance criterion and dependency if relevant.
3. **Map ownership.** Use only confirmed owners; set unknown ones to **Unassigned**. Identify reviewers and cross-workstream handoffs.
4. **Sequence the plan.** Order by dependencies and priority, then propose milestones. Where a date is not supplied, use an undated phase or ask for confirmation.
5. **Identify risks.** Flag blockers, uncertainties and external dependencies with a next action and responsible owner (or Unassigned).
6. **Define quality gates.** Identify requirements for testing, documentation, stakeholder approval and handoff. A check is **pending** until evidence is supplied.
7. **Publish update.** Summarize what is planned, what is underway **only if evidenced**, and the next decisions needed.

## Output format
Produce these sections:
1. **Delivery objective** — 1–3 sentences
2. **Scope and success criteria** — must-haves, optional features, measurable acceptance criteria
3. **Task tracker** — `Task | Owner | Priority | Dependency | Status | Acceptance criteria`
4. **Milestones** — expected results, dates if confirmed, otherwise `TBD`
5. **Risks and blockers** — impact, mitigation, next action
6. **Next actions** — who should decide/do what; mark any unknown owner

Use statuses `Not started`, `In progress`, `Blocked`, `In review` and `Complete` only when supported by inputs. Default to `Unverified` if unknown.

## Acceptance checks
- [ ] Every must-have is represented by at least one task.
- [ ] Tasks have observable acceptance criteria.
- [ ] No invented owner, deadline or evidence of completion.
- [ ] Dependencies and handoffs are surfaced.
- [ ] Risks and next decisions are understandable to the team.

## Example invocation
> Use the Delivery Planning skill for our app. Goal: teammates can create and assign tasks. Features: sign-in, team creation, task board, reports. Team: Terri handles delivery, Max UI, Raheem architecture, Matthew UX. We do not yet have a release date. Produce a task tracker, dependency plan, risks and handoffs.

## Guardrails
- Do not assume feature readiness, code quality or deployment success without verification.
- Separate a recommendation from a team decision.
- Avoid sensitive project details and keep access credentials out of output.
