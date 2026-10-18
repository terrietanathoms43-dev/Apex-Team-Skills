# Apex Skills

Four Claude Code skills that make every Apex project look, feel, plan and build the same way. Each team member owns one skill and keeps it current; everyone installs all four.

| Skill | Folder | Owns | One line |
| --- | --- | --- | --- |
| `apex-ui` | `Apex-UI/` | visual standard | Tokens, type, spacing, icons, layout, component recipes, screenshot review. |
| `apex-ux` | `Apex-UX/` | interaction standard | One primary action, resume-first screens, forms, empty states, copy, keyboard, mobile. |
| `apex-planning` | `Apex-Planning/` | how we plan | Brief → locked plan → phased steps with a definition of done; the handoff files a build needs. |
| `apex-architecture` | `Apex-Architecture/` | how we build | Next.js App Router + Drizzle + Auth.js conventions, the action skeleton, org scoping, tests, clean code. |
| `apex-recursive-walkthrough` | `Apex-Recursive-Walkthrough/` | how we prove it works | Few unit tests for pure rules, persona walkthroughs for flows, pictures only for new layouts; the run → classify → fix → re-run loop. |

The reference implementation for all four is the **Clarity** project (`C:\Users\max\clarity`). When a skill and Clarity disagree, fix one of them the same day.

## Install

Claude Code reads skills from `~/.claude/skills/<skill>/SKILL.md` (personal) or `<repo>/.claude/skills/<skill>/SKILL.md` (shared with a repo). Either copy the four folders there, or point at this folder with a junction so one copy serves every project:

```powershell
# Windows (PowerShell). Repeat for each skill folder.
cmd /c mklink /J "$HOME\.claude\skills\Apex-UI" "C:\path\to\Apex-Skills\Apex-UI"
```

```bash
# macOS / Linux
ln -s /path/to/Apex-Skills/Apex-UI ~/.claude/skills/Apex-UI
```

Restart Claude Code (or start a new session) and the skills appear in the skill list. Invoke one directly with `/apex-ui`, `/apex-ux`, `/apex-planning`, `/apex-architecture`, or just describe the work: the descriptions are written so Claude reaches for them on its own.

## How the four fit together

1. **Plan** with `apex-planning`: a short brief, then a plan whose decisions are locked (stack, routes, roles, schema, tokens, steps).
2. **Build** with `apex-architecture`: the folder layout, the one action pattern, the data layer scoped by organization, and the test personas that let Claude use the app itself.
3. **Shape screens** with `apex-ux`: what each screen is for, its one primary action, how a flow feels at phone and desktop size.
4. **Style** with `apex-ui`: the tokens and recipes that make it look like ours, and the screenshot checklist that proves it.

## Keeping them current

- Each skill's `SKILL.md` stays under about 500 lines; depth goes in that skill's `references/` folder.
- Change a rule in the skill *and* in the reference implementation. A rule nobody follows is noise.
- Prefer explaining why over shouting MUST. The reader is a capable engineer (or a capable model); give it the reasoning and it will generalise.
- Version: 1.0 (2026-10-17).
