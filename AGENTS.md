# AGENTS.md — navigation map for AI agents

> Entry point for any agent working in this repository. Read only what you
> need, when you need it.

## 1. Before starting (mandatory)

1. Run `./init.sh` and confirm it exits 0.
2. Read `docs/harness/progress/current.md` for the state of the last session.
3. Read `feature_list.json`.
4. Read `docs/harness/specs.md` before touching any spec or feature with
   `"sdd": true`.
5. Read **all** files in `docs/business/` before writing a spec or making
   architecture decisions.
6. Read `.specify/memory/constitution.md` — the architectural source of truth.

## 2. Repository map

| File / folder | Contains | When to read it |
|---|---|---|
| `feature_list.json` | List of features with status | Always, at start |
| `docs/harness/progress/current.md` | Active session state | Always, at start |
| `docs/harness/progress/history.md` | Past sessions log | If you need history |
| `specs/<num>-<name>/` | `spec.md` + `plan.md` + `tasks.md` (+ optional `data-model.md`, `research.md`, `contracts/`) | Before implementing |
| `docs/business/` | Domain context: what muush.dev is, pages, i18n, stack, deploy | Before spec/architecture decisions — read ALL files |
| `.specify/memory/constitution.md` | Static-site purity, component/island discipline, i18n parity, NON-NEGOTIABLE rules | Before spec/implementation |
| `docs/harness/specs.md` | SDD process: spec-kit flow, approval gate | Before writing a spec |
| `docs/harness/verification.md` | How to verify work is real | Before declaring done |
| `docs/harness/CHECKPOINTS.md` | Objective "correct final state" criteria | To self-evaluate |
| `.claude/agents/` | Subagent definitions | If orchestrating work |
| `.claude/skills/speckit-*` | spec-kit skills (`specify`, `plan`, `tasks`, `clarify`, …) — invoke with a hyphen (`/speckit-specify`), not a dot | When invoking spec-kit |

## 3. Hard rules (non-negotiable)

- **One feature at a time.** No mixing changes from several features.
- **No `done` without green checks.** Run `./init.sh` first.
- **No skipping the spec phase.** Every feature with `"sdd": true` goes
  through `spec_author` and gets explicit human approval before
  `in_progress`.
- **Document in `docs/harness/progress/current.md`** while working, not only
  at the end.
- **If unsure, check `docs/harness/`, `docs/business/`,
  `.specify/memory/constitution.md`, or `specs/<name>/`** before inventing
  an answer.

## 4. SDD flow

```
pending → [spec_author] → spec_ready → ⏸ HUMAN → in_progress
  → [implementer → reviewer] → reviewing → done
```

1. `leader` finds the next `pending` feature with `"sdd": true` in
   `feature_list.json`.
2. `leader` launches `spec_author`, which runs `/speckit-specify` + (`/speckit-clarify`
   if needed) + `/speckit-plan` + `/speckit-tasks`, creates `specs/<num>-<name>/`,
   and moves the feature's status to `spec_ready`.
3. **Pause.** The human reads the spec package and approves or requests changes.
4. Once approved, `leader` moves the status to `in_progress` and launches
   `implementer`.
5. `implementer` executes `tasks.md` in order, checking off `[x]` as it goes.
6. `leader` moves the status to `reviewing`, then launches `reviewer`.
7. If `reviewer` approves, `implementer` moves the status to `done` and
   appends the summary to `docs/harness/progress/history.md`.
8. If `reviewer` rejects, `leader` moves the status back to `in_progress`
   and relaunches `implementer` with the list of what's missing.

## 5. Session close

1. Run `./init.sh` — everything green.
2. Move the summary from `docs/harness/progress/current.md` to the end of
   `docs/harness/progress/history.md`.
3. Clear `docs/harness/progress/current.md` back to its template.
4. Confirm the last feature worked is in its correct status.
5. Leave no temp files or debug prints.
