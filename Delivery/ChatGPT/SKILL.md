---
name: delivery-coordination
description: Support planning, tracking and communicating project delivery for Apex.
---

# Delivery Coordination

**Area:** Delivery  
**Owner:** Terri-Etana Thoms  
**AI tool:** ChatGPT

## Purpose

Help turn team requirements into actionable delivery plans, follow-up summaries and readiness checks. This is a *starter workflow* to adapt, not a record of a completed project.

## Instructions

1. **Clarify the outcome.** Summarize what needs to be delivered, the intended users and the definition of done.
2. **Break down the work.** Separate tasks into clear deliverables; identify dependencies, owners and priorities.
3. **Identify constraints.** List deadlines, available resources, known blockers and missing information. Do not invent dates or commitments.
4. **Track progress.** Organize tasks into not started, in progress, blocked, in review and complete. Treat statuses as unverified until a team member confirms.
5. **Check readiness.** Cover usability, basic functionality, known bugs, documentation and handoff requirements.
6. **Communicate concisely.** Produce a clear progress report stating what changed, what is next and who is responsible.

## Expected Output

- Goal and acceptance criteria
- Milestones and deliverables
- Task list with owner, priority and status
- Risks and blockers
- Next actions with dates only when verified

## Example Request

> Organize these feature requirements into a weekly delivery plan, show task dependencies, mark unknown owners as unassigned and generate a short meeting update.

## Guardrails

- Do not claim a feature is finished or tested without evidence.
- Do not assign responsibility or promise dates without confirmation.
- Never expose API keys, passwords or sensitive team data.
- Ask for clarification when decisions would materially change the plan.
