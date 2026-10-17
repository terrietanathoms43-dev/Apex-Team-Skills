---
name: architecture-review
description: Review a proposed application's tech stack, components, data flow and integrations; identify tradeoffs, risks, decisions and verification steps.
---

# Architecture Review

**Workstream:** Tech Stack Architecture  
**AI tool used to draft:** ChatGPT  
**Owner for review:** Raheem Gordon  
**Status:** Draft starter skill

## Use this skill when
The team is selecting a tech stack, changing infrastructure, designing component boundaries, or reviewing a proposed system. It is a structured **decision-support** workflow, not proof of production readiness or security.

## Required inputs
- Product goals, user volume/traffic assumptions and nonfunctional requirements
- Current stack, diagrams or code/repository details, if available
- Data entities and service integrations
- Deployment environment, cost limits and team experience
- Security, privacy, reliability and maintenance constraints

Do not infer technologies already in use just because they are popular. Mark unknown traffic, budget and risk requirements.

## Procedure
1. **Capture requirements.** Separate functional needs from quality attributes: availability, scalability, latency, maintainability, privacy and cost.
2. **Document existing architecture.** List confirmed frontend, backend, database, identity, hosting and external services. Label missing information.
3. **Map data and trust boundaries.** Describe key flows, storage, authentication, authorization and places sensitive data enters or leaves the system.
4. **Analyze options.** Compare viable technologies or patterns using requirement fit, operational effort, cost, complexity and future migration risk. Consider a simpler design before adding infrastructure.
5. **Identify risks.** Flag single points of failure, consistency tradeoffs, insecure access patterns, missing monitoring, backup/recovery concerns and vendor lock-in.
6. **Recommend a path.** Record decision, rationale, alternatives rejected, tradeoffs and assumptions in an architecture decision record (ADR).
7. **Define validation.** Suggest tests or prototypes needed before committing or claiming readiness (e.g. performance test, role-access test, restore test).

## Output format
1. **Context and requirements** — confirmed facts vs unknowns
2. **Current/proposed architecture** — components and text-based data-flow diagram
3. **Decision matrix** — `Option | Benefits | Drawbacks | Cost/complexity | Fit`
4. **ADR** — decision, status (`Proposed` unless approved), rationale, consequences
5. **Risks and mitigations** — severity, evidence and validation
6. **Next technical checks** — measurable checks and responsible role

## Acceptance checks
- [ ] Choices are traceable to requirements.
- [ ] Dependencies and trust boundaries are explicit.
- [ ] Alternatives and major tradeoffs are discussed.
- [ ] Security and operations are addressed.
- [ ] Unverified claims are not represented as test results.

## Example invocation
> Review the proposed stack for a multi-team task manager: React frontend, hosted auth and database, real-time task updates and CSV exports. We expect small initial usage but haven't measured scale. Provide architecture options, data flows, an ADR and verification steps.

## Guardrails
- Never reveal passwords, private connection strings or API keys.
- Do not claim that code, cloud settings or RLS policies have been audited unless inspected.
- Present regulatory/legal compliance only as a question for qualified review, not a certification.
