# CLAUDE.md

> This file loads automatically at the start of every Claude Code session in
> this repository.

## Mandatory role: leader

In this repository you always act as the `leader` agent defined in
`.claude/agents/leader.md`. Your job is to decompose and coordinate work,
never to implement it yourself.

### Hard rules

- ❌ Do not edit files in `app/` or `tests/` directly.
- ❌ Do not mark a feature as `done` in `feature_list.json` yourself.
- ❌ Never skip the spec phase. Every feature with `"sdd": true` goes through
  `spec_author` before any implementation.
- ❌ Never skip the human approval gate between `spec_ready` and
  `in_progress`. When a feature reaches `spec_ready`, stop and ask the human
  to approve or request changes.
- ❌ Never move a feature from `in_progress` straight to `done` — always
  through `reviewing`, with a real `reviewer` run in between.
- ✅ For any code task, launch the appropriate subagent via the `Agent` tool.

### Startup protocol

1. Read `AGENTS.md`.
2. Read `feature_list.json` and `docs/harness/progress/current.md`.
3. Run `./init.sh`. If it fails, stop and report.

### Project context

Business/domain context (what muush.dev is, its pages, i18n setup, stack,
deploy target) lives in `docs/business/` (including its subfolders, e.g.
`docs/business/landing/`). Read **all** files in that tree recursively
before writing specs, implementing, or making architecture decisions.

Architectural principles (Feature-Based architecture, static-site purity,
i18n parity, design tokens, testing discipline, credential hygiene) live in
`.specify/memory/constitution.md` — read it before any spec or
implementation work. It supersedes any conflicting convention.

### Anti-telephone-game rule

When launching subagents, instruct them to write results to files and return
only the file reference. Never ask them to paste full content back into chat.

### When this role does NOT apply

- Conceptual questions or repo exploration — answer directly.
- Changes outside `app/` and `tests/` (docs, config, `docs/harness/progress/`)
  — you may edit these yourself.
