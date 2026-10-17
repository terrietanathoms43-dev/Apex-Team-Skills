# Apex Team Skills

A reusable, **skills-first AI workflow library** for the Apex team. The folders represent *areas of work*, not individual people. Each skill is a set of repeatable instructions an AI assistant can follow to produce a consistent outcome.

## Team ownership

| Skill area | Assigned owner | Starter AI skills |
| --- | --- | --- |
| [Delivery](./Delivery/) | Terri-Etana Thoms | [Delivery planning](./Delivery/ChatGPT/delivery-planning/SKILL.md) |
| [UI](./UI/) | Maxwell Wedderburn (Max) | [UI design specification](./UI/ChatGPT/ui-design-specification/SKILL.md) |
| [Tech Stack Architecture](./Tech-Stack-Architecture/) | Raheem Gordon | [Architecture review](./Tech-Stack-Architecture/ChatGPT/architecture-review/SKILL.md) |
| [UX](./UX/) | Matthew Messado | [UX journey review](./UX/ChatGPT/ux-journey-review/SKILL.md) |

## Repository layout

```text
Apex-Team-Skills/
├── README.md
├── SKILL-TEMPLATE.md
├── Delivery/
│   ├── README.md
│   └── ChatGPT/
│       └── delivery-planning/
│           └── SKILL.md
├── UI/
│   ├── README.md
│   └── ChatGPT/
│       └── ui-design-specification/
│           └── SKILL.md
├── Tech-Stack-Architecture/
│   ├── README.md
│   └── ChatGPT/
│       └── architecture-review/
│           └── SKILL.md
└── UX/
    ├── README.md
    └── ChatGPT/
        └── ux-journey-review/
            └── SKILL.md
```

## How to use a skill

1. Open the `SKILL.md` for the task you need.
2. Give its instructions to your AI assistant, or install/import the skill using your AI application's documented skill mechanism, if one is supported. **A GitHub file alone does not automatically activate a skill.**
3. Supply relevant project information and any available evidence. Follow the skill's input requirements.
4. Review the AI output before relying on or sharing it. Correct unsupported assumptions.
5. Improve the instructions if the workflow needs to be more repeatable.

## How to contribute

- Store skills under **Area / AI Tool / skill-name / SKILL.md**, e.g. `UI/Claude/component-system/SKILL.md`.
- Use the **AI tool actually used for that skill**. The current `ChatGPT` files are initial ChatGPT-created drafts for team review; they **do not establish which AI tool Max, Raheem or Matthew personally uses**.
- Start from [SKILL-TEMPLATE.md](./SKILL-TEMPLATE.md). Give each skill a distinct purpose, required inputs, step-by-step instructions, specified outputs, practical examples and limits.
- Add supporting assets alongside the skill when needed (e.g. `references/`, `examples/`, `scripts/`). Keep them under the skill's folder.
- The relevant workstream owner should **review and approve** contributed skills before presenting them as team-approved practices.
- Never commit private credentials, access tokens, private personal data or proprietary materials without permission.

## Team profiles

Previously drafted individual bios are retained as supporting documents, **not** as substitutes for reusable skills: [Delivery profile](./Delivery/Terri-Etana-Thoms.md), [UI profile](./UI/Maxwell-Wedderburn.md), [Architecture profile](./Tech-Stack-Architecture/Raheem-Gordon.md), and [UX profile](./UX/Matthew-Messado.md).
