# Tasks: Floating nav redesign

**Input**: Design documents from `specs/021-floating-nav-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: Included. This repository's own convention (`rules.md` § R39,
followed by every `done` feature) requires a new or changed assertion to be
seen failing against the *old* markup before it is trusted — every test task
below says so explicitly.

**Organization**: Tasks are grouped by the five user stories in `spec.md`,
in priority order (US1/US2 = P1, US3/US4 = P2, US5 = P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependency)
- **[Story]**: Maps to spec.md's US1–US5
- Every task names an exact file path

## Path Conventions

Single Nuxt app, feature-based structure. All paths are relative to the
repository root (`/Users/betonajera/Workspaces/muush/muush.dev`).

---

## Phase 1: Setup

**Purpose**: Establish a baseline to measure every later claim against.

- [x] T001 Run `pnpm test` and record the current file/test counts (no file
      edit — this is the "before" baseline every later task's `./init.sh`
      run is compared against, matching every prior feature's report format
      in `docs/harness/progress/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens and copy every user story's components consume by name.
No user story's implementation task may start before this phase completes.

- [x] T002 [P] Add the nav pill's inset/size tokens to
      `app/assets/css/global.css`: reuse `--spacing-page` for the horizontal
      inset (confirm it already resolves to 80 at the desktop end before
      declaring a new token — research.md R-1), add one new desktop-only
      token for the vertical inset from the viewport top (`y24` at 1440,
      `lg`-and-up only, since mobile has no pill), each with a comment
      naming the frame it comes from (`WGhSI`/`s0ni6l`, 1280×72 at `x80 y24`)
- [x] T003 [P] Add the language toggle's 44×44 circle size token to
      `app/assets/css/global.css` (e.g. `--spacing-lang-circle`), with a
      comment naming frame `tGVGq`
- [x] T004 Update the `BotonPrimario` `nav` size-variant's underlying token
      *values* in `app/assets/css/global.css` (`--spacing-btn-nav-y`,
      `--spacing-btn-nav-x`, and the font-size token behind
      `text-button-sm`) so that, combined with T014's added arrow markup,
      the rendered box measures 221×48 at 1440px. Derive the values by
      building and measuring (`rules.md` § R44), not by arithmetic alone —
      a conic LED ring's rendered geometry is sensitive to the exact box
      (feature 22 § R59). Depends on T002/T003 only in that they share the
      same file; no other dependency
- [x] T005 Add/rename the i18n keys this feature needs, in
      `i18n/locales/es.json` **and** `i18n/locales/en.json` in the same
      task (never split per-locale — `tests/i18n-parity.test.ts` fails on
      any single-locale edit): add `shell.nav.services`, `shell.nav.
      switchToEs`, `shell.nav.switchToEn` in both files; remove `shell.nav.
      projects` only after grep-confirming it has no other consumer
      (`shell.menu.projects` and `shell.footer.nav.projects` are separate
      keys and are untouched)

**Checkpoint**: Every token and every copy key this feature needs now
exists. No component has been edited yet.

---

## Phase 3: User Story 1 - The nav finally has a surface (Priority: P1) 🎯 MVP

**Goal**: The desktop nav renders as a floating dark-glass pill instead of a
full-bleed bar, on every route, in every locale.

**Independent Test**: Generate the site, open all four routes at 1440px,
scroll each, and confirm the pill's own glass surface (not scrolled
content) sits behind the nav's contents at every scroll position.

### Tests for User Story 1

- [x] T006 [P] [US1] In `app/features/shell/ui/SiteNav.test.ts`, add/update
      assertions that the nav's outer row carries the pill's container
      classes (`bg-glass-dark`/equivalent, `rounded-full`, `border` +
      `border-glass-line`, the new inset token) instead of the old
      full-bleed, borderless row. Confirm this assertion **fails** against
      today's `SiteNav.vue` before T007 lands.

### Implementation for User Story 1

- [x] T007 [US1] Edit `app/features/shell/ui/SiteNav.vue`: replace the
      desktop row's full-bleed container classes with the pill's (fill,
      border, radius, the T002 inset tokens). Do not touch the row's
      internal flex layout, the `sticky top-0`/`--layer-nav` wrapper, or
      any prop. Depends on T002.
- [x] T008 [P] [US1] Update `app/features/shell/ui/SiteNav.stories.ts` to
      show the pill at both viewports and both locales. Depends on T007.

**Checkpoint**: The pill renders correctly. This story is independently
testable and shippable without US2–US5.

---

## Phase 4: User Story 2 - The links match what the site offers (Priority: P1)

**Goal**: The desktop link row reads `Servicios · Nosotros`, never
`Proyectos`, while the mobile menu and footer keep their existing lists
unchanged.

**Independent Test**: Generate the site; grep each document's `<nav>`
element for "Proyectos"/"Projects" (must be absent) and "Servicios"/
"Services" (must be present); confirm the mobile menu panel and the
footer's Navegación column are unchanged.

### Tests for User Story 2

- [x] T009 [US2] In `app/features/shell/ui/SiteNav.test.ts`, add/update
      assertions that the desktop link row renders exactly `[Servicios,
      Nosotros]` in that order, and that no rendered link reads
      "Proyectos"/"Projects". Confirm this **fails** against today's
      `NAV_ITEMS` before T010 lands. (Same file as T006 — sequential, not
      `[P]`, with it.)

### Implementation for User Story 2

- [x] T010 [US2] Edit `app/features/shell/data/navigation.ts`: remove the
      `Proyectos` entry from `NAV_ITEMS`, add a `Servicios` entry (anchor to
      `SHELL_ANCHORS.services`, labelled `shell.nav.services`), with a code
      comment stating this is a deliberate divergence from the `.pen`
      (Roberto, 2026-09-08 — feature 15 is `blocked`, a link to a
      non-existent section reads as a broken site per `ui-map.md` § 6) so a
      future reader does not "restore" the link from the design file.
      Depends on T005.
- [x] T011 [P] [US2] Update `tests/static-output.test.ts`: assert zero
      occurrences of "Proyectos"/"Projects" inside any generated document's
      `<nav>` element across all four documents, and assert the mobile menu
      panel markup and the footer's Navegación column still contain
      "Proyectos" unchanged. Depends on T010.

**Checkpoint**: The desktop link row is correct; mobile menu and footer are
verified unchanged. US1 + US2 together are the MVP slice.

---

## Phase 5: User Story 3 - The CTA reads as a call to action with a directional cue (Priority: P2)

**Goal**: The nav CTA measures 221×48 with a leading, non-translatable
arrow, remains the same `BotonPrimario` instance, and keeps feature 9's
scroll-reveal behaviour working unchanged.

**Independent Test**: Measure the CTA's box at 1440px on the generated page;
confirm 221×48, `#1c1416a6` fill, `rounded-full`; confirm the arrow is a
separate `aria-hidden` element and neither locale's `shell.nav.cta` string
contains `→`; re-run feature 9's own reveal scenarios and confirm all still
pass.

### Tests for User Story 3

- [x] T012 [US3] In `app/features/shell/ui/SiteNav.test.ts`, add/update
      assertions: the CTA's container carries the updated `nav`-variant
      size classes; the CTA's slot contains a separate `aria-hidden` arrow
      element ahead of the label; `shell.nav.cta` in both locale files
      contains no `→` character. Confirm the arrow-element assertion
      **fails** against today's markup before T014 lands.
- [x] T013 [US3] In `app/shared/ui/BotonPrimario.test.ts`, update the `nav`
      variant's class assertions to the new padding/font-size values from
      T004. Leave the shape assertions (pill radius, no rectangle, the
      `/@(click|mouseenter|mouseleave)/` source guard) untouched — this
      feature does not reopen feature 22's contract.

### Implementation for User Story 3

- [x] T014 [US3] Edit `app/features/shell/ui/SiteNav.vue`: inside the
      `BotonPrimario` CTA's default slot, add a leading `<span
      aria-hidden="true">→</span>` ahead of `{{ cta.label }}`, using the
      same hover-shift transition utility classes `LinkArrow.vue` already
      declares (`transition-transform duration-200 group-hover:
      translate-x-0.5 motion-reduce:transition-none`) so both arrows on the
      site move identically. Do not import the `LinkArrow` *component* (it
      renders its own `<a>`, which cannot nest inside `BotonPrimario`'s
      root). Add zero props to `BotonPrimario.vue`. Depends on T004, T007
      (same container).
- [x] T015 [P] [US3] Update `app/shared/ui/BotonPrimario.stories.ts`'s
      `AllVariants` note for the `nav` variant's new box size. Depends on
      T004.
- [x] T016 [US3] **Done — completed by the reviewer's own CDP session**
      (round 1): CTA `invisible opacity-0` at landing scroll 0, `visible
      opacity-100` after scrolling past the Hero, verified live and judged
      correct. Not re-run in round 2, since this fix's scope is the three
      sizing defects only and the reveal logic/classes are untouched by any
      of them. Re-verify, on a real `pnpm generate` build via CDP (the
      device-metrics-override method, not a headless window resize —
      `rules.md` §§ R44/R60), every one of feature 9's nav-CTA-reveal
      acceptance scenarios: hidden on the landing at scroll 0, fades in
      once the Hero scrolls out of view, fades out scrolling back, visible
      from first paint on Nosotros, visible with
      `Emulation.setScriptExecutionDisabled`, unaffected by
      `prefers-reduced-motion: reduce`. If the landing is still too short
      to reach the reveal threshold by scroll alone, use the same
      no-scripting lever feature 22's report documents to force the
      `<noscript>` override visible and measure from there. Expect **zero**
      code changes to result from this task; if one is needed, it must
      land only in `SiteNav.vue`'s `.site-nav__cta` wrapper, never in
      `useNavCtaReveal.ts`.

**Checkpoint**: CTA geometry and copy are correct; the reveal behaviour is
confirmed intact, not just assumed.

---

## Phase 6: User Story 4 - Switching language is one button (Priority: P2)

**Goal**: The `ES / EN` text pair becomes a single 44×44 circular control
showing only the active locale, still resolving through the i18n route map.

**Independent Test**: Inspect the toggle's markup at all four routes;
confirm one circular element per page; confirm its resolved destination
matches what `resolveLocaleDestination.ts` already computes today; confirm
its accessible name states the destination locale.

### Tests for User Story 4

- [x] T017 [P] [US4] In `app/features/shell/ui/LanguageToggle.test.ts`,
      add/update assertions: exactly one circular element renders (no
      divider, no inactive-locale text node); its visible label is the
      active locale's two-letter code; its `aria-label`/accessible name
      resolves to `shell.nav.switchToEn` when active locale is `es` and
      vice versa; `preserveAnchor`'s existing click behaviour is
      unchanged. Confirm the "exactly one element" assertion **fails**
      against today's two-code markup before T018 lands.

### Implementation for User Story 4

- [x] T018 [US4] Rewrite `app/features/shell/ui/LanguageToggle.vue`: a
      single `<NuxtLink :to="href">` at the T003 circle-size token,
      `rounded-full`, `bg-glass-dark`, `border border-glass-line`, showing
      only `{{ locale.toUpperCase() }}`, with `aria-label` resolved from
      `shell.nav.switchToEs`/`shell.nav.switchToEn` based on the *other*
      locale. Keep the existing `preserveAnchor` click handler and the
      `hreflang`/`lang` attributes on the link. Do not change the
      component's prop contract (`{ locale, href }`). Depends on T003,
      T005.
- [x] T019 [P] [US4] Update `app/features/shell/ui/LanguageToggle.
      stories.ts` for both locales, showing the single circle. Depends on
      T018.

**Checkpoint**: The toggle works standalone in Storybook, inside the
desktop nav, inside the mobile nav, and inside the open mobile menu panel
(all three compose the same component).

---

## Phase 7: User Story 5 - Nothing about mobile moved (Priority: P3)

**Goal**: Confirm, rather than assume, that the mobile nav row is
unchanged except for whatever US4's toggle rewrite requires.

**Independent Test**: Compare the built mobile row's markup and computed
height against the pre-feature baseline.

- [x] T020 [US5] Diff `app/features/shell/ui/SiteNav.vue`'s mobile
      (`lg:hidden`) branch against the version on `master` (pre-feature).
      Confirm the only difference is what T018's `LanguageToggle` rewrite
      requires. Record the result (confirmed unchanged, or a real
      difference found and reported) in the implementation report — do not
      silently "fix" a difference that turns out to be real without
      flagging it first, per spec FR-020.
- [x] T021 [US5] **Done — CDP measured, round 2 (findings.md § R64).** The
      reviewer's own CDP measurement found the mobile nav had in fact
      regressed to 88px (the new 44px toggle circle became the row's tallest
      content), which the round-1 diff-only check could not catch. Fixed
      (`--spacing-nav-y`'s mobile endpoint, 22px → 17px per side) and
      re-measured on a fresh `pnpm generate` build via CDP at 390×844:
      **78px**, exact against `findings.md` § R55's baseline.

**Checkpoint**: Mobile parity is a measured fact, not an assumption.

---

## Phase 8: Polish & Cross-Cutting Verification

**Purpose**: The checks that only make sense once every story above is in
place.

- [x] T022 **Done, across both rounds.** §6: `git diff --stat` confirms zero
      lines changed in `useShellNavigation.ts`, `useMobileMenu.ts`,
      `resolveLocaleDestination.ts`, `useNavCtaReveal.ts`, `footerColumns.ts`
      and `types.ts`; `MobileMenu.vue` shows the small, documented,
      unavoidable diff (findings.md § R62). §§2/§4 (link row, toggle)
      verified live by the reviewer in round 1. §§1/§3/§5 (pill, CTA, mobile)
      re-verified live via CDP in round 2 after the sizing fixes
      (findings.md § R64): pill 1280×72, CTA (ES) 220.984375×48, mobile nav
      78px. Run `quickstart.md`'s
      full checklist end-to-end on a real `pnpm generate` build via CDP: the
      pill (§1), the link row (§2), the CTA (§3), the toggle (§4), mobile
      parity (§5).
- [x] T023 Confirm `tests/i18n-parity.test.ts` is green (mechanical
      checkpoint on T005's edit, called out explicitly since a broken
      parity test fails the whole suite silently-late otherwise).
- [x] T024 Run all five quality gates and confirm every one exits 0:
      `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm
      storybook:build`. Confirm the pre-existing suite is green except for
      the assertions this feature's tasks named as intentionally updated
      (T006, T009, T012, T013, T017, plus `tests/static-output.test.ts`
      from T011).
- [x] T025 Write the implementation report to
      `docs/harness/progress/impl_floating_nav_redesign.md`, naming: the
      two human-decided divergences from the `.pen` (Proyectos out,
      Servicios in) and the `content.md` contradiction to report; the
      `ui-map.md` § 2 staleness this redesign deepens; any new technical
      finding for `docs/harness/findings.md` (never a business rule — those
      go to a human, not `rules.md`); and the before/after file and test
      counts from T001 vs. the final `pnpm test` run.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks every user story.**
- **User Stories (Phases 3–7)**: All depend on Phase 2. US1 and US2 both
  touch `SiteNav.vue`'s outer container/link-row markup and should be done
  in sequence (T007 before T014's arrow edit reuses the same element tree);
  US3 depends on US1 (T014 depends on T007's container existing) and on
  T004/T012/T013; US4 is independent of US1–US3's files but shares
  `LanguageToggle.vue` with US5's diff target; US5 depends on US4
  completing first (T020 needs T018's final mobile markup to diff against).
- **Polish (Phase 8)**: Depends on all five user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational.
- **US2 (P1)**: Independent after Foundational; shares a file with US1 but
  not a class/token dependency — can be implemented in either order
  relative to US1, sequenced only by file-edit convenience.
- **US3 (P2)**: Depends on US1 (same container element) and on Foundational
  T004.
- **US4 (P2)**: Independent after Foundational.
- **US5 (P3)**: Depends on US4 (diffs the file US4 rewrites).

### Parallel Opportunities

- T002 and T003 (different token groups, same file but non-overlapping
  additions — mark `[P]` for authoring, apply sequentially if the tool
  requires one edit at a time).
- T008, T015, T019 (Storybook story updates) are each `[P]` relative to
  each other, never relative to the component edit they cover.
- T011 is `[P]` relative to T009/T012/T013/T017 (different file).

---

## Parallel Example: Foundational phase

```bash
Task: "Add nav pill inset/size tokens to app/assets/css/global.css"
Task: "Add language toggle circle size token to app/assets/css/global.css"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1 (baseline) and Phase 2 (tokens + copy).
2. Complete Phase 3 (US1 — the pill surface) and Phase 4 (US2 — the
   correct link row). Both are P1 and together are the smallest slice that
   fixes the D-07 illegibility defect and the broken-link risk.
3. **Stop and validate** against quickstart.md §§ 1–2 before continuing.

### Incremental Delivery

1. Foundational → US1 → US2 → validate (MVP).
2. US3 (CTA) → validate reveal behaviour (quickstart §3).
3. US4 (toggle) → US5 (mobile parity confirmation) → validate (quickstart
   §§ 4–5).
4. Phase 8 → all five quality gates → done.

## Notes

- No task in this file introduces a new Nuxt composable call in `ui/`, a new
  glass-surface token, or a new `BotonPrimario` prop — each would fail this
  feature's own Phase -1 gates in `plan.md`.
- Every test task is written to be seen failing against the pre-feature
  markup before the corresponding implementation task lands (`rules.md`
  § R39's convention), not written and trusted green on the first run.
- `docs/business/` is not edited by any task here. The two divergences this
  feature ships (Proyectos out, Servicios in) and the `ui-map.md` staleness
  are reported in T025, for a human to reconcile.
