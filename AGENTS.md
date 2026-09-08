# AGENTS.md — navigation map for AI agents

> Entry point for any agent working in this repository. Read only what you
> need, when you need it.

## 1. Before starting (mandatory)

1. Run `./init.sh` and confirm it exits 0.
2. Read `docs/harness/progress/current.md` for the state of the last session.
3. Read `feature_list.json`.
4. Read `docs/harness/specs.md` before touching any spec or feature with
   `"sdd": true`.
5. Read **all** files in `docs/business/` recursively (including
   `docs/business/landing/`) before writing a spec or making architecture
   decisions. Note they are **derived** from the `.pen` design file and can
   lag it — see `docs/business/rules.md` § R32. Only the leader session can
   read the `.pen`, so a measurement the leader supplies outranks a
   `docs/business/` value, and a subagent missing a visual value asks the
   leader instead of falling back to the document.
6. Read `.specify/memory/constitution.md` — the architectural source of truth.

## 2. Repository map

| File / folder | Contains | When to read it |
|---|---|---|
| `feature_list.json` | List of features with status | Always, at start |
| `docs/harness/progress/current.md` | Active session state | Always, at start |
| `docs/harness/progress/history.md` | Past sessions log | If you need history |
| `specs/<num>-<name>/` | `spec.md` + `plan.md` + `tasks.md` (+ optional `data-model.md`, `research.md`, `contracts/`) | Before implementing |
| `docs/business/` | Company (overview, services, messaging, branding) — read ALL files recursively. **Derived from the `.pen`; the design file wins on any visual value (`rules.md` § R32)** | Before spec/architecture decisions |
| `docs/business/landing/` | Landing-specific: approved copy (`content.md`), behavior spec (`ui-map.md`), open decisions and discrepancies (`decisions-open.md`) | Before any spec/feature that touches the landing or Nosotros pages |
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

### Features with `sdd: false`

A small change may skip the spec phase, but **not the review gate**.
`feature_list.json`'s `reviewing_required_before_done` is unconditional:

```
pending → ⏸ HUMAN → in_progress → [implementer] → reviewing → [reviewer] → done
```

The `reviewer` reviews against the feature's `acceptance` array in
`feature_list.json` plus whichever business doc carries the recipe, instead
of against a `spec.md`. The `leader` MUST say so when launching it, since
the reviewer's protocol assumes a spec package exists.

> Verifying the work yourself as `leader` does **not** substitute for the
> reviewer. That shortcut is the exact failure the `reviewing` state was
> introduced to prevent: the work looks obviously complete, so the gate
> feels like ceremony, and it gets skipped. Established 2026-09-06, when
> the `implementer` correctly refused a `done` transition on feature 4
> because no reviewer had run.

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
