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

## C3 — The architecture holds (Articles I–III)
- [ ] Every feature lives under `app/features/<feature>/{ui,logic,data}` with an `index.ts` barrel
- [ ] No file imports another feature's internals — only its `index.ts` or `app/shared/`
- [ ] No `data/` file imports from `logic/` or `ui/`; no `logic/` file imports from `ui/`
- [ ] Cross-cutting reusables live in `app/shared/`, not duplicated inside a feature
- [ ] No component exceeds 200 lines; no function exceeds ~30

## C4 — The code respects the constitution
- [ ] No hardcoded color/spacing literal in touched components (Article VII)
- [ ] No breakpoint used for something a fluid token already covers (Article VII)
- [ ] No relative import crosses a directory boundary (Article XII)
- [ ] Any new alias is mirrored in `.storybook/main.ts` (Article XII)
- [ ] No `server/api/` route; `nitro.preset` is still `'static'` (Article IV)
- [ ] All components use `<script setup lang="ts">`, never the Options API (Article V)
- [ ] No debug prints or unexplained TODOs

## C5 — Verification is real
- [ ] Every non-trivial function in `logic/`, `app/shared/utils/` or `utils/` has a Vitest test
- [ ] Every component in `app/shared/ui/` has a Storybook story (Article X)
- [ ] `pnpm test` shows > 0 tests and all green
- [ ] `pnpm generate` succeeds and writes `.output/public`
- [ ] `pnpm storybook:build` succeeds

## C6 — The session closed cleanly
- [ ] `docs/harness/progress/history.md` has an entry for the last session
- [ ] The last feature worked is in its correct status

## C7 — Spec Driven Development (spec-kit)
- [ ] Every feature with `sdd: true` in `spec_ready`, `in_progress`, `reviewing` or `done`
      has its `specs/<num>-<name>/` folder with `spec.md`, `plan.md` and `tasks.md`
- [ ] `plan.md` has all Phase -1 Gates checked `[x]`
- [ ] Every `done` feature has all its tasks checked `[x]` in `tasks.md`
- [ ] `spec.md` has no unresolved `[NEEDS CLARIFICATION]` markers
- [ ] Every acceptance criterion in `spec.md` is covered by at least one test

## C8 — i18n parity (Article VI)
- [ ] Every route resolves in both `/es/` and `/en/`
- [ ] Every key in `i18n/locales/es.json` exists in `en.json` — `tests/i18n-parity.test.ts` passes
- [ ] The locale switcher resolves routes through the i18n route map, never by swapping the URL prefix
- [ ] No user-facing string is hardcoded in a component
