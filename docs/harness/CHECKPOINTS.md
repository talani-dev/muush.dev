# CHECKPOINTS — final state evaluation

> In multi-agent systems you don't grade the path, you grade the destination.

## C1 — The harness is complete
- [ ] Base files exist: `AGENTS.md`, `CLAUDE.md`, `init.sh`, `feature_list.json`, `docs/harness/progress/current.md`
- [ ] Harness docs exist: `docs/harness/specs.md`, `docs/harness/verification.md`, `docs/harness/CHECKPOINTS.md`
- [ ] `.specify/memory/constitution.md` exists and is not the template placeholder
- [ ] `docs/business/` has at least one file of project context
- [ ] `./init.sh` exits 0

## C2 — The state is coherent
- [ ] At most one feature in `in_progress` OR `reviewing` (combined) in `feature_list.json`
- [ ] No feature moved from `in_progress` to `done` without passing through `reviewing`
- [ ] Every `done` feature has passing tests associated with it
- [ ] `docs/harness/progress/current.md` is empty or describes the active session

## C3 — The code respects the constitution
- [ ] No hardcoded color/spacing literal in touched components (Article IV)
- [ ] No relative import crosses a directory boundary (Article VI)
- [ ] No new server route, API endpoint, or `server/` directory (Article I)
- [ ] No debug prints or unexplained TODOs

## C4 — Verification is real
- [ ] Every non-trivial function in `src/i18n/` or `src/utils/` has a Vitest test
- [ ] `pnpm test` shows > 0 tests and all green
- [ ] `pnpm build` succeeds

## C5 — The session closed cleanly
- [ ] `docs/harness/progress/history.md` has an entry for the last session
- [ ] The last feature worked is in its correct status

## C6 — Spec Driven Development (spec-kit)
- [ ] Every feature with `sdd: true` in `spec_ready`, `in_progress`, `reviewing` or `done`
      has its `specs/<num>-<name>/` folder with `spec.md`, `plan.md` and `tasks.md`
- [ ] `plan.md` has all Phase -1 Gates checked `[x]`
- [ ] Every `done` feature has all its tasks checked `[x]` in `tasks.md`
- [ ] `spec.md` has no unresolved `[NEEDS CLARIFICATION]` markers
- [ ] Every acceptance criterion in `spec.md` is covered by at least one test

## C7 — i18n parity (muush.dev-specific)
- [ ] Every route under `src/pages/` exists in both `es/` and `en/`
- [ ] Every key in `src/i18n/ui.ts` has both an `es` and an `en` value
