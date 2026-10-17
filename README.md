# Apex Team Skills 🚀

A collaborative library of the **Apex team's skills, workflows, and AI-assisted work**. Folders are organized by **skill area**, not by individual.

## Workstreams and Owners

| Area | Owner | Responsibilities |
| --- | --- | --- |
| [Delivery](./Delivery/) | **Terri-Etana Thoms** | Planning delivery, coordinating tasks, tracking progress and preparing handoffs |
| [UI](./UI/) | **Maxwell Wedderburn (Max)** | Visual design, interface components and responsive layouts |
| [Tech Stack Architecture](./Tech-Stack-Architecture/) | **Raheem Gordon** | Technology decisions, system structure, integrations and engineering standards |
| [UX](./UX/) | **Matthew Messado** | User journeys, interactions, usability and accessibility |

## Folder Convention

Each top-level folder is a **skill area**. Its `README.md` introduces the area and names the owner. AI-assisted skills are stored **under the AI tool actually used**:

```text
Apex-Team-Skills/
├── Delivery/
│   ├── README.md
│   ├── Terri-Etana-Thoms.md
│   └── ChatGPT/
│       └── SKILL.md
├── UI/
│   ├── README.md
│   └── Maxwell-Wedderburn.md
├── Tech-Stack-Architecture/
│   ├── README.md
│   └── Raheem-Gordon.md
└── UX/
    ├── README.md
    └── Matthew-Messado.md
```

For example, if Max develops a UI skill using Claude, the skill file can be added at `UI/Claude/SKILL.md`. If another tool is used, create a folder with **that tool's actual name**. Do not assume every teammate uses the same AI.

## Contributing

1. Open the README for your assigned area.
2. Add your workflow or skill files in a subfolder named for the AI tool used (such as `Claude` or `ChatGPT`).
3. Describe the goal, inputs, instructions, expected outputs, limitations and an example in your skill file.
4. Keep credentials, private data and other secrets out of this public repository.
5. Update your area README with links to new skills.

Individual profiles are preserved inside their assigned areas for reference. Skills and tools mentioned in profiles should be confirmed by their respective owners.
