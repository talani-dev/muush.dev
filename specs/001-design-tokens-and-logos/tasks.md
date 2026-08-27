# Tasks: Design tokens and logo assets

**Input**: Design documents from `/specs/001-design-tokens-and-logos/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No test tasks are included. Per Article VII (Testing Discipline),
unit tests are mandatory only for non-trivial logic in `src/i18n/` or
`src/utils/`; this feature adds a CSS value/count edit and static asset
files with no logic (see research.md § 5). `pnpm test` passing means the
existing Vitest suite continues to pass unmodified.

**Organization**: Tasks are grouped by user story (US1, US2, US3 from
spec.md) to enable independent implementation and verification of each.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single project (Astro static site). All paths are relative to repository
root (`/Users/betonajera/Workspaces/muush/muush.dev`).

---

## Phase 1: Setup

**Purpose**: Confirm preconditions before touching any project file.

- [x] T001 Confirm the three source SVG files still exist, unmodified,
  at `/Users/betonajera/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Muush/`
  (`muush-dark.svg`, `muush-light.svg`, `muush-triple-white.svg`) and that
  each still has the `viewBox="14.5 38.5 70.5 39.5"`, `circle cx="21" cy="45" r="6.5"`,
  and `path d="M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0"` geometry
  documented in `data-model.md` — if any file has changed or moved, stop
  and re-sync `docs/business/branding.md` before proceeding

**Checkpoint**: Source assets confirmed present and unchanged — safe to proceed.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites shared by multiple user stories.

*None.* User Story 1/2 (color tokens, same file) and User Story 3 (logo
assets, new directory) touch fully disjoint parts of the repository and
have no shared setup beyond the Phase 1 precondition check. Both tracks
can start immediately after Phase 1.

---

## Phase 3: User Story 1 - Build UI with the real brand color ramps (Priority: P1) 🎯 MVP

**Goal**: `src/styles/global.css` exposes the real muush 5-step brand color
ramps (red, wine, ink, bone) as Tailwind utility classes, replacing the
placeholder 10-step scale.

**Independent Test**: Inspect `src/styles/global.css` and confirm the
`--red-*`, `--wine-*`, `--ink-*`, `--bone-*` custom properties and their
`@theme inline` counterparts resolve to the exact branding-book hex values
from `data-model.md`; run `pnpm build` and confirm a utility class like
`bg-red-400` compiles to `#CF3147`.

### Implementation for User Story 1

- [x] T002 [US1] In `src/styles/global.css`, replace the `:root` block's
  `--red-50` through `--red-900` (10 entries) with exactly 5 entries
  `--red-100` through `--red-500` using the hex values from the Color Ramp
  table in `data-model.md` (`#FAD9DE`, `#F0A3AE`, `#E36B7C`, `#CF3147`,
  `#9E2436`)
- [x] T003 [US1] In `src/styles/global.css`, replace the `:root` block's
  `--wine-50` through `--wine-900` with exactly 5 entries `--wine-100`
  through `--wine-500` using `#E9D3D7`, `#C08A94`, `#8A4552`, `#591F28`,
  `#3B141B` (depends on T002 — same file, sequential edit)
- [x] T004 [US1] In `src/styles/global.css`, replace the `:root` block's
  `--ink-50` through `--ink-900` with exactly 5 entries `--ink-100`
  through `--ink-500` using `#D9D9D9`, `#A6A6A6`, `#737373`, `#404040`,
  `#262626` (depends on T003 — same file, sequential edit)
- [x] T005 [US1] In `src/styles/global.css`, replace the `:root` block's
  `--bone-50` through `--bone-900` with exactly 5 entries `--bone-100`
  through `--bone-500` using `#FBF8F6`, `#F2EBE7`, `#E0D3CC`, `#C7B4A9`,
  `#A38D80` (depends on T004 — same file, sequential edit)
- [x] T006 [US1] In `src/styles/global.css`, shrink the `@theme inline`
  block's `--color-bone-*`, `--color-ink-*`, `--color-red-*`,
  `--color-wine-*` mappings from 10 entries each to 5 entries each
  (100–500), each mapping `--color-<ramp>-<step>: var(--<ramp>-<step>)`,
  matching the new `:root` custom properties exactly (depends on T002–T005)
- [x] T007 [US1] Run `grep -rEn "bone-(50|600|700|800|900)|ink-(50|600|700|800|900)|red-(50|600|700|800|900)|wine-(50|600|700|800|900)" src/` and confirm zero matches outside `src/styles/global.css` itself, verifying no component silently depended on a removed step (depends on T002–T006)

**Checkpoint**: User Story 1 is fully functional — the color token layer is
brand-accurate and independently verifiable via `pnpm build`.

---

## Phase 4: User Story 2 - Preserve the typography scoping rule (Priority: P2)

**Goal**: Confirm (and leave documented as confirmed) that the existing
`--font-poppins` / `--font-instrument` tokens and `@font-face` declarations
in `src/styles/global.css` already match `docs/business/branding.md`'s
typography rule, with no change needed.

**Independent Test**: Read `src/styles/global.css` and
`docs/business/branding.md` side by side; confirm the two font tokens and
four `@font-face` blocks require zero edits.

### Implementation for User Story 2

- [x] T008 [US2] In `src/styles/global.css`, verify the `@theme inline`
  block still declares exactly `--font-poppins: "Poppins", sans-serif;`
  and `--font-instrument: "Instrument Sans", sans-serif;` with no new
  typeface token added and no scope change to either — leave unchanged
  (independent of T002–T007; touches the same file only as a read-only
  check, run after Phase 3 completes to avoid a merge conflict window)
- [x] T009 [US2] In `src/styles/global.css`, verify all four `@font-face`
  blocks (Poppins Regular/Bold, Instrument Sans Regular/Bold) are
  unchanged from their current `src: url("/fonts/...")` declarations —
  leave unchanged (depends on T008)

**Checkpoint**: User Stories 1 AND 2 both verified — the full token layer
in `src/styles/global.css` is now brand-accurate and documented.

---

## Phase 5: User Story 3 - Pick the correct logo variant for a given background (Priority: P1)

**Goal**: The three official isotipo SVG variants exist inside the project
under self-documenting, background-context-first names, with a colocated
mapping document — ready for a future component to consume, with no logo
instance placed on any page.

**Independent Test**: Locate the three SVG assets inside the project (not
just at the external source path) and confirm each is unambiguously
labeled with the single background context it's meant for, matching
`docs/business/branding.md`'s mapping in `data-model.md`.

### Implementation for User Story 3

- [x] T010 [P] [US3] Create directory `src/assets/logo/` and copy
  `muush-dark.svg` from the external source path into it as
  `src/assets/logo/isotipo-on-bone.svg`, without altering its `viewBox`,
  `circle`, `path`, `stroke-width`, `stroke-linecap`, or color attributes
  (stroke `#262626`, dot `#CF3147`)
- [x] T011 [P] [US3] Copy `muush-light.svg` from the external source path
  into `src/assets/logo/isotipo-on-ink.svg`, without altering its geometry
  (stroke `#FBF8F6`, dot `#CF3147`)
- [x] T012 [P] [US3] Copy `muush-triple-white.svg` from the external
  source path into `src/assets/logo/isotipo-on-red.svg`, without altering
  its geometry (stroke `#FBF8F6`, dot `#FBF8F6`)
- [x] T013 [US3] Create `src/assets/logo/README.md` containing the
  background-context → file mapping table from `data-model.md` (background
  context, in-project file name, original source file name, stroke color,
  dot color), so the mapping is discoverable without opening
  `docs/business/branding.md` (depends on T010–T012 existing so the
  documented file names are accurate)
- [x] T014 [US3] Diff the three files in `src/assets/logo/` and confirm
  the `viewBox`, `circle`, and `path` elements are byte-identical across
  all three, and only `fill`/`stroke` color attributes differ (depends on
  T010–T012)

**Checkpoint**: All three user stories independently functional — the
color token layer and the logo asset layer are both brand-accurate,
mapped, and ready for future consumption, with no page or component
touched.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final whole-repo verification per spec.md Success Criteria.

- [x] T015 Run `pnpm check` (Biome) and confirm it passes with no new
  lint/format findings
- [x] T016 Run `pnpm typecheck` (`astro check`) and confirm it passes with
  no new type errors
- [x] T017 Run `pnpm test` (Vitest) and confirm the existing suite passes
  unmodified — no new test files expected per this feature's Testing
  scope decision (research.md § 5)
- [x] T018 Run `pnpm build` and confirm the static build succeeds, then
  spot-check the built CSS output for a brand color value (e.g. confirm
  `#CF3147` appears where `red-400`-based utilities are used)
- [x] T019 Walk through `quickstart.md` end-to-end and confirm every
  verification step in it passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: None — empty phase, nothing blocks the user
  stories beyond Phase 1
- **User Story 1 (Phase 3)**: Depends on Phase 1 only
- **User Story 2 (Phase 4)**: Depends on Phase 3 completing first (same
  file, avoids a concurrent-edit window on `src/styles/global.css`) —
  otherwise has no dependency on User Story 1's *content*, only on not
  editing the file at the same time
- **User Story 3 (Phase 5)**: Depends on Phase 1 only — fully independent
  of Phases 3–4 (disjoint files: `src/assets/logo/` vs
  `src/styles/global.css`)
- **Polish (Phase 6)**: Depends on Phases 3, 4, and 5 all complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — no dependency on US2 or US3
- **User Story 2 (P2)**: Sequenced after US1 only to avoid two tracks
  editing `src/styles/global.css` at once; otherwise independently
  testable and does not require any US1 change to be correct
- **User Story 3 (P1)**: Fully independent of US1 and US2 — different
  directory, can run in parallel with Phase 3/4 the entire time

### Parallel Opportunities

- T010, T011, T012 (the three SVG copies in US3) can run in parallel with
  each other and with all of Phase 3/4 (US1/US2), since they touch a
  different directory entirely
- T002–T007 (US1) and T008–T009 (US2) are sequential within
  `src/styles/global.css` and should not be parallelized with each other
- T015–T018 (Polish verification commands) must run after all
  implementation tasks, but can be run in any order relative to each other

---

## Parallel Example: Cross-story parallelism

```bash
# These two tracks can run at the same time, by different contributors or
# in two passes of the same session, since they touch disjoint files:

# Track A - User Story 1 + 2 (src/styles/global.css)
Task: "T002-T007: replace 10-step color ramps with 5-step branding values"
Task: "T008-T009: verify typography tokens unchanged"

# Track B - User Story 3 (src/assets/logo/)
Task: "T010: copy muush-dark.svg -> isotipo-on-bone.svg"
Task: "T011: copy muush-light.svg -> isotipo-on-ink.svg"
Task: "T012: copy muush-triple-white.svg -> isotipo-on-red.svg"
Task: "T013: write src/assets/logo/README.md mapping doc"
Task: "T014: diff the three files for identical geometry"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002–T007)
3. **STOP and VALIDATE**: `pnpm build` and confirm brand colors compile
   correctly
4. This alone satisfies the color-token half of the feature's acceptance
   criteria

### Incremental Delivery

1. Phase 1 (Setup) → precondition confirmed
2. User Story 1 → color ramps real and Tailwind-exposed (MVP slice)
3. User Story 2 → typography tokens verified unchanged (fast, low-risk)
4. User Story 3 → logo assets in project, correctly mapped (independent
   of 1–2, can be done first, last, or in parallel)
5. Polish → full verification suite (`pnpm check`, `typecheck`, `test`,
   `build`) + `quickstart.md` walkthrough

### Parallel Team Strategy

With two contributors:

1. Contributor A: Phase 1 (T001), then Phase 3–4 (US1 + US2,
   `src/styles/global.css`)
2. Contributor B: Phase 1 (T001, can be done once and shared), then
   Phase 5 (US3, `src/assets/logo/`)
3. Both converge on Phase 6 (Polish) once their tracks are done

---

## Notes

- [P] tasks touch different files with no ordering dependency
- [Story] label maps each task to spec.md's US1/US2/US3 for traceability
- No wrapper `.astro` component, page, header, or logo instance is created
  by any task in this list — that is deliberately deferred to a future
  feature (see plan.md § Constitution Check, Article II row, and research.md § 3)
- No new path alias, no new dependency, no `tests/` directory changes
- Commit after each phase (or after each user story) rather than after
  every single task, given how small and interdependent the `global.css`
  edits are within Phase 3
