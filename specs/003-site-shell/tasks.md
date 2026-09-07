---

description: "Task list for the site shell — Nav, Footer and mobile menu"
---

# Tasks: Site shell — Nav, Footer and mobile menu

**Input**: Design documents from `/specs/003-site-shell/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: Included and **mandatory**. Constitution Article X names route mapping
as requiring unit tests, requires component tests for `ui/`, and requires a
story per component. Spec FR-054 restates it. These are not optional here.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — disjoint files, no dependency on an incomplete task
- **[Story]**: the user story from `spec.md` the task serves

## Path Conventions

Nuxt 4 with `srcDir: app/`. Feature modules live at `app/features/<name>/` with
`ui/`, `logic/` and `data/`. Tests and stories **colocate** with their subject,
matching the existing `app/shared/ui/*.test.ts` convention.

## Two rules that apply to every task below

1. **`rules.md` § R18** — in hand-written CSS use `var(--bone-100)`, never
   `var(--color-bone-100)`. The theme names emit no runtime custom property;
   the mistake looks correct in Storybook and is broken in production.
2. **Article II** — `data/` imports nothing from `logic/` or `ui/`; `logic/`
   never imports `ui/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: make the test and catalogue harnesses able to see a feature module
at all. Nothing here is feature logic.

- [x] T001 Widen `include` in `vitest.config.ts` to `app/features/**/*.test.ts` alongside the existing `tests/**/*.test.ts` and `app/shared/ui/**/*.test.ts`. Do **not** add `resolve.alias` and do **not** add `projects`/`workspace` — `defineVitestConfig` inherits Nuxt's resolved Vite config (`rules.md` § R15) and Vitest 4 throws on `projects` (§ R16). Satisfies spec A-15.
- [x] T002 [P] Register a global `NuxtLink` stub in `.storybook/preview.ts` using the `setup()` export from `@storybook/vue3-vite`, rendering `<a :href="to"><slot /></a>`. Signature confirmed in `research.md` § R4. This is what lets `ui/` components use `<NuxtLink>` idiomatically and still render with zero Nuxt runtime (FR-052).
- [x] T003 [P] **Verify, do not assume**: confirm `.storybook/main.ts` already declares all six aliases plus `vue()` and `tailwindcss()` in `viteFinal`, and that this feature adds no new alias. Article XII, `rules.md` § R19. Record the result; if an alias is missing, add it in this task.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: the vocabulary, the copy, the routes and the content model. Every
user story depends on all of it.

**⚠️ CRITICAL**: no component may be written before T004–T006. A component
written first will reach for a literal and violate Article VII.

### Tokens — `app/assets/css/global.css`

> All three tasks edit the same file, so none is `[P]`. The `clamp()`
> arithmetic is **already computed** in `data-model.md` § 2 — transcribe it,
> do not recompute it. **Zero edits to existing tokens.**

- [x] T004 Add the 2 colour tokens and 1 blur token from `data-model.md` § 2.1–2.2 to `@theme inline`: `--color-hairline-footer` (bone-100 @12%, FR-042 — the design's desktop `#c9c9c91f` is off-palette and stays flagged for Clau), `--color-divider-menu` (bone-100 @8%, FR-043), `--blur-menu-panel` (`1.25rem`). Use `color-mix(in srgb, var(--bone-100) N%, transparent)` to match the file's existing convention.
- [x] T005 Add the 8 type roles from `data-model.md` § 2.3 with their `--*--line-height`, `--*--letter-spacing` and `--*--font-weight` companions: `--text-nav-link`, `--text-lang`, `--text-footer-tagline`, `--text-footer-category`, `--text-footer-col-title`, `--text-footer-item`, `--text-footer-bottom`, `--text-menu-item`. Tracking in `em` (`rules.md` § R4). Comment `--text-menu-item`'s line height as **1.1 and load-bearing** — § R12's flow gaps are derived from it. Satisfies FR-044, FR-045.
- [x] T006 Add the 23 spacing tokens and 1 radius from `data-model.md` § 2.4: nav (3), hamburger and close control (8, including `--radius-burger-bar`), footer (11), mobile menu (5), and `--spacing-shell-max`. Reuse the existing `--spacing-page` for nav and footer horizontal padding — do not duplicate it. Comment `--spacing-footer-col-w` as a **flex basis, not a fixed width** (FR-060 / A-16) and `--spacing-shell-max` as **UNVERIFIED, no design source** (A-02). Satisfies FR-044.

### Assets

- [x] T007 [P] Add the lucide `x` glyph at `app/assets/icons/x.svg`, normalized to the same contract the social glyphs satisfy: square `viewBox`, no `width`/`height` attributes, every stroke/fill `currentColor`, no `<defs>`, `<style>`, DOCTYPE, XML prolog, comments or tool metadata. Consumed via `?raw` + `v-html` per `rules.md` § R14. Satisfies FR-025.
- [x] T008 [P] Add `app/assets/icons/README.md` recording provenance for `x.svg`: source, original viewBox, transform applied, what was stripped — the same shape as `app/assets/logo/README.md` and `app/assets/social/README.md`.

### Copy

- [x] T009 [P] Add every shell key to **both** `i18n/locales/es.json` and `i18n/locales/en.json` from the ES/EN table in `design-extract.md` § 9.bis, under a `shell.*` namespace matching the keys named in `data-model.md` § 1.4. Three traps: `Work with muush` and `FAQ` carry the **same value in both locales** (proper nouns — that is parity, not a missing translation); `Blog · próximamente` / `Blog · coming soon` is **one string including its `·`**; and the WhatsApp pre-filled message from `ui-map.md` § 8 is locale-specific. `tests/i18n-parity.test.ts` must stay green. Satisfies FR-048, FR-049, FR-050.

### Routing

- [x] T010 Add `customRoutes: 'config'` and the `i18n.pages` entry to `nuxt.config.ts` mapping the `nosotros` route to `/nosotros` (es) and `/about` (en). This is the **single declaration** of the translated segment (FR-018) — no component and no `data/` file may restate it. Confirmed option shape in `research.md` § R2.
- [x] T011 Create `app/pages/nosotros.vue` as a thin page: a locale-aware title and the `#work` anchor target the footer points at, and nothing else. Team, network and the application form are explicitly out of scope (FR-006). Verify it resolves at both `/es/nosotros` and `/en/about`. Satisfies FR-005, FR-051.
- [x] T012 **Run the experiment, do not close by reading.** `research.md` § R1b confirmed `/` produces **no file** today (`ls .output/public/index.html` → no such file), so SC-001 currently fails. Set `i18n.rootRedirect: '/es'` and add `'/'` to `nitro.prerender.routes` in `nuxt.config.ts`, then run:
  ```bash
  pnpm generate && cat .output/public/index.html
  ```
  Confirm the file exists and points at `/es`. If Nitro declines to emit it, fall back to a committed `public/index.html` carrying a meta refresh plus a canonical link. Closes `research.md` § R1d.

### Content model — `app/features/shell/data/`

> `data/` holds i18n **keys** and destination **descriptors**. No copy, no
> resolved paths, and no import from `logic/` or `ui/` (Article II).

- [x] T013 Create `app/features/shell/data/types.ts` with `ShellRouteName`, the `ShellDestination` discriminated union (`route` | `anchor` | `external` | `none`), `ShellItem`, `FooterColumnModel`, `SocialProfile`, and the `ResolvedShellItem` / `ResolvedFooterColumn` / `ResolvedSocial` shapes from `contracts/components.md`. `ResolvedShellItem.href` is **optional** — that is what makes FR-039's no-destination state unrepresentable as a broken link rather than merely discouraged.
- [x] T014 [P] Create `app/features/shell/data/navigation.ts`: the 2 nav items (Proyectos → `anchor index#proyectos`, Nosotros → `route nosotros`), the nav CTA (`anchor index#contacto`), and the 4 mobile-menu items (Propósito, Servicios, Proyectos, Nosotros). Depends on T013.
- [x] T015 [P] Create `app/features/shell/data/footerColumns.ts`: the 4 columns in the exact order and content of `data-model.md` § 1.4. Use `kind: 'none'` for `Agenda una llamada` (decision #2), `FAQ` (decision #3) and `Blog · próximamente` (by design). Note in a comment that `ui-map.md` § 8's Navegación ordering is superseded by `decisions-open.md` D4. Depends on T013. Satisfies FR-037.
- [x] T016 [P] Create `app/features/shell/data/socialProfiles.ts`: the 3 profiles of `data-model.md` § 1.5. This is the **only** place each URL appears, which is the mitigation spec A-11 promised — comment the LinkedIn `/company/` form as **assumed, pending Clau**. Depends on T013.

**Checkpoint**: vocabulary, copy, routes and content model exist. Component work can begin.

---

## Phase 3: User Story 2 — Locale equivalence (Priority: P1)

**Goal**: switching language lands on the equivalent page, never a 404 and
never the home when a counterpart exists.

**Independent Test**: from each of the 4 routes, activate the toggle and confirm
the destination is the other locale's equivalent; assert the same in unit tests
including both segment directions and the round trip.

> **Sequenced before User Story 1** even though both are P1: `useShellNavigation`
> resolves every destination the Nav and Footer render, so US1 cannot be built
> without it. Noted so the ordering does not read as a priority inversion.

- [x] T017 [US2] Create `app/features/shell/logic/resolveLocaleDestination.ts` — a **pure** function `(switchedPath: string, fallbackHome: string, hash?: string) => string`, with no Nuxt import. It guarantees FR-019's totality: `switchLocalePath` is typed `(locale) => string` and returns the **empty string** when the current route has no counterpart, and an empty `href` silently resolves to the current page. Empty → `fallbackHome`; non-empty `hash` → appended. Rationale in `research.md` § R2.
- [x] T018 [US2] Create `app/features/shell/logic/resolveLocaleDestination.test.ts` covering: the empty-string input falling back to the home, a non-empty path passing through, hash appended when present, hash omitted when absent or empty, and no double `#`. Test names read `should <expected> when <condition>` (Article X). These test **repository logic**, not the i18n module — a test asserting `switchLocalePath('en') === '/en/about'` would test the library.
- [x] T019 [US2] Create `app/features/shell/logic/useShellNavigation.ts` — the **only** seam touching the Nuxt runtime. It reads `useI18n`, `useLocalePath`, `useSwitchLocalePath` and `useRoute`, and returns the inert `Resolved*` shapes of `contracts/components.md`. Anchor destinations resolve to the **locale home plus the hash**, never a bare fragment, because a bare `#proposito` does nothing on the About page where the footer also renders (FR-041). Marks the current route with `current: true` (A-04). Depends on T014–T017.
- [x] T020 [US2] Create `app/features/shell/ui/LanguageToggle.vue` per `contracts/components.md`: both labels and the divider, active bone-100 weight 600, inactive ink-200 weight 500, at the § 9.bis sizes and gaps. The click handler is the **anchor enhancement** (FR-021): read `window.location.hash` and navigate to `href + hash` when non-empty. It must **not** intercept modified clicks (middle, ⌘, Ctrl, Shift) or the visitor loses "open in new tab". The rendered `href` stays anchorless so no-JS and crawlers get a valid URL.
- [x] T021 [US2] Create `app/features/shell/ui/LanguageToggle.test.ts`: renders both locales with the correct active/inactive treatment; the plain `href` is the anchorless destination; a plain click with a hash present navigates to `href + hash`; a ⌘-click is **not** intercepted.

**Checkpoint**: locale resolution works and is unit-tested independently of any layout.

---

## Phase 4: User Story 1 — A visitor can get anywhere from anywhere (Priority: P1) 🎯 MVP

**Goal**: Nav and Footer render on every page and every destination resolves.

**Independent Test**: load the Spanish landing, follow every nav and footer
destination in turn — no 404, no dead anchor, no link leaving the visitor on
the wrong page.

- [x] T022 [US1] Create `app/features/shell/ui/FooterColumn.vue`: red-300 title and items at the geometry of `design-extract.md` § 10 · *FooterColumn*, using the T005/T006 tokens. This is the **single place** FR-039 is implemented — an item whose `href` is `undefined` renders a `<span>` in ink-300 with no pointer affordance and no hover, never an `<a>` with a dead `href`.
- [x] T023 [US1] Create `app/features/shell/ui/FooterColumn.test.ts`: renders the title and every item; an item with an `href` renders an `<a>`; an item **without** one renders no anchor element at all; an `external` item carries `target="_blank"` and `rel="noopener noreferrer"`.
- [x] T024 [US1] Create `app/features/shell/ui/SiteFooter.vue`: root `<footer>` on ink-500, the brand block (`Lockup` wrapped in a link to `home`, tagline, category), the 4 columns and the bottom bar with the `--color-hairline-footer` rule. Reflows 4-across to 2×2 below `lg`. **The columns flex; `--spacing-footer-col-w` is a basis** — the design over-constrains that row by 52px (FR-060, A-16). Bottom bar is `space_between` on one row at `lg` and stacked below it (FR-038). Satisfies FR-033–FR-036.
- [x] T025 [US1] Create `app/features/shell/ui/SiteFooter.test.ts`: renders exactly 4 columns; the brand lockup links to `home`; the bottom bar carries both texts; asserts the column count so a silently dropped column fails rather than shrinks.
- [x] T026 [US1] Create `app/features/shell/ui/SiteNav.vue`: root `<nav>`, container padding from `--spacing-nav-y` and `--spacing-page`. At `lg` and above — `Lockup` (linked to `home`), the 2 items, `BotonPrimario` variant `nav` for the CTA, and `LanguageToggle`. Below `lg` — `Lockup`, `LanguageToggle`, hamburger, and **no CTA button**, with a comment recording that as `decisions-open.md`'s 2026-09-06 decision so a future reader does not "fix" it (FR-011). Every `lg:` must change **layout only**, never a size (FR-047). Satisfies FR-010, FR-012–FR-014.
- [x] T027 [US1] Create `app/features/shell/ui/SiteNav.test.ts`: renders the lockup, both items and the toggle; the CTA renders in the desktop arrangement; the hamburger renders in the mobile arrangement; the current route's item carries `aria-current="page"` and **no** visual change (A-04).
- [x] T028 [US1] Create `app/features/shell/index.ts` exporting exactly what `contracts/components.md` lists: `SiteNav`, `SiteFooter`, `useMobileMenu`, `useShellNavigation` and the public types. `MobileMenu`, `FooterColumn` and `LanguageToggle` stay **unexported** — they are composition detail (Article III).
- [x] T029 [US1] Create `app/layouts/default.vue` rendering `SiteNav`, `<slot />` and `SiteFooter`, importing **only** through `@/features/shell` (never a deep path). It supplies the flat ink-500 surface and the page gutter for every page. It does **not** paint the dotted paper or the section glows — spec A-03, out of scope and owner-flagged. `app/app.vue` already renders `<NuxtLayout>`, so no change is needed there. Satisfies FR-004.
- [x] T030 [US1] Reduce `app/pages/index.vue` to page content: remove `bg-ink-500`, `min-h-screen` and the outer padding, now owned by the layout (FR-007). **Delete the dead `p-gutter` class** — `research.md` § R7 confirmed it emits zero CSS (`grep -c 'p-gutter' .output/public/_nuxt/*.css` → `0`) because there is no `--spacing-gutter` token; the token is `--spacing-page`.

**Checkpoint**: every page has chrome; every desktop destination resolves. This is the MVP.

---

## Phase 5: User Story 3 — A visitor on a phone can navigate (Priority: P1)

**Goal**: the hamburger opens a working full-screen menu — the only navigation
that exists on mobile.

**Independent Test**: at 390px, open the menu, try to scroll the page behind it,
close it by each of the three routes, and confirm the scroll position is
unchanged and the background scrolls again.

- [x] T031 [US3] Create `app/features/shell/logic/useMobileMenu.ts` returning `{ isOpen: Readonly<Ref<boolean>>, open, close }`. It owns: the Escape `keydown` listener (attached while open, removed on close); the body scroll lock capturing `window.scrollY` and restoring the **exact** offset; `inert` on the content behind, which gives both halves of FR-031 in one attribute; closing on route change and on crossing `lg` upward; and unconditional lock release in `onScopeDispose`. **No new dependency** — VueUse is absent from the tree and is not added (`research.md` § R5). Satisfies FR-009, FR-028, FR-029, FR-031.
- [x] T032 [US3] Create `app/features/shell/logic/useMobileMenu.test.ts` covering all **four** close triggers (item, close control, Escape, route change), the scroll offset restored to exactly its pre-open value, the background locked while open, and — the failure this composable exists to prevent — the lock released on scope disposal so an unmount cannot strand the page unscrollable.
- [x] T033 [US3] Create `app/features/shell/ui/MobileMenu.vue` per `contracts/components.md` and the layer stack of `design-extract.md` § 9.bis: full-viewport `--color-glass-dark` panel at `--blur-menu-panel`, **no border, no radius, no panel padding**; the nav row with `Lockup`, `LanguageToggle` and the close control carrying the T007 glyph via `?raw` + `v-html` with a `:deep(svg)` scoped rule (`rules.md` § R14); the 4 items; the `--color-divider-menu` divider; the 3 `SocialIcon` buttons. Use the **flow** spacing of `data-model.md` § 2.4 — never the frame's absolute coordinates (§ R12). It does **not** repaint the BG base or dotted paper layers (A-03). Emits `itemChosen` rather than navigating, so FR-030's close-then-scroll ordering is possible. Satisfies FR-023, FR-024, FR-026, FR-027.
- [x] T034 [US3] Create `app/features/shell/ui/MobileMenu.test.ts`: renders 4 items, the divider and 3 social buttons when open; the close control emits `closed`; choosing an item emits `itemChosen` with its href; the panel is absent when `open` is false.
- [x] T035 [US3] Wire `useMobileMenu` into `SiteNav.vue`: the hamburger calls `open()`, the menu receives `isOpen`, and `itemChosen` closes **before** navigating so the scroll happens with the menu already dismissed (FR-030). Verify the hamburger presents itself as inoperable with scripting unavailable, and that no menu destination is reachable only through the menu — all four also exist in the footer (FR-032).

**Checkpoint**: mobile navigation works end to end.

---

## Phase 6: User Story 4 — Nothing in the footer leads nowhere (Priority: P2)

**Goal**: every item either resolves or is provably non-interactive. There is no
third category.

**Independent Test**: enumerate every footer item and assert one of exactly two
outcomes for each.

> The rendering was implemented in T022. This phase is the **audit** that it
> holds across all ~24 destinations — which is the deliverable, since
> `ui-map.md` § 8's failure mode is a 404 in the footer of *every* page.

- [x] T036 [US4] Add a test enumerating every footer item and asserting each is either a link with a non-empty `href` or a non-interactive `<span>` — no item may be an `<a>` without an `href`. Assert explicitly that `Agenda una llamada` (decision #2), `FAQ` (decision #3) and `Blog · próximamente` (by design) are all in the second category and render identically, so the three read as one treatment. Satisfies FR-039.
- [x] T037 [US4] Add a test for the external destinations: `wa.me` and the 3 social profiles carry `target="_blank"` and `rel="noopener noreferrer"`; the **`mailto:` does not** — a new browsing context for a mail link leaves the visitor on a blank tab. Assert the WhatsApp href carries the locale-appropriate pre-filled message. Satisfies FR-040.

**Checkpoint**: no broken link ships on any page.

---

## Phase 7: User Story 5 — The shell can be reviewed before it is trusted (Priority: P2)

**Goal**: the three components render in the catalogue at both frame widths, in
both locales, with **zero** Nuxt runtime.

**Independent Test**: `pnpm storybook:build` passes and the three entries render.

- [x] T038 [P] [US5] Create `app/features/shell/ui/SiteNav.stories.ts` with Spanish and English fixtures, at the 390px and 1440px viewports the preview already configures. Passing fixtures — not calling composables — is what proves FR-008 holds.
- [x] T039 [P] [US5] Create `app/features/shell/ui/SiteFooter.stories.ts` with both locales, including the three no-destination items so a reviewer can see they read as text rather than links.
- [x] T040 [P] [US5] Create `app/features/shell/ui/MobileMenu.stories.ts` in the open state at 390px, both locales. Satisfies FR-052 together with T038–T039.

**Checkpoint**: the shell is reviewable without running the site.

---

## Phase 8: Polish, Verification & Cross-Cutting Concerns

- [x] T041 Add alternate-language metadata via `useLocaleHead`, sourced from the **same** route map as the toggle (FR-022). Emitting an alternate that does not resolve is the failure Article VI names. **This is an addition beyond the feature's acceptance criteria (spec A-09) and may be trimmed at the approval gate** — if trimmed, delete this task rather than half-implementing it.
- [x] T042 Run the two checks the quality gates do **not** cover, both of which must return nothing:
  ```bash
  grep -rn 'var(--color-' app/features/ app/layouts/          # rules.md § R18
  grep -rnE '#[0-9a-fA-F]{3,8}|\[[0-9]+px\]' app/features/shell/   # Article VII
  ```
  Then confirm against the **site** build, not the catalogue: `grep -c -- '--color-' .output/public/_nuxt/*.css` stays `0`.
- [x] T043 Verify the architectural invariants by inspection and record the result: no import from `data/` into `logic/` or `ui/` against the direction (Article II); no import of a shell internal from outside the barrel (Article III); every `lg:` in the module changes layout only, never a font size, padding, radius or blur (FR-047); no component exceeds 200 lines (Article V); no `any` and no `@ts-ignore` (Article IX).
- [x] T044 Run all five quality gates and confirm each passes: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`. Satisfies FR-056, SC-014. Confirm `tests/i18n-parity.test.ts` reports 0 key differences and 0 empty values.
- [x] T045 **Append** to `docs/business/rules.md` — never overwrite — any rule that implementation reveals and the spec cycle did not.
  The four rules this **specification** cycle produced are **already recorded** as **§ R21–R24** and must not be duplicated:
  - **R21** — Nitro's static output shape, correcting § R10's Astro-derived trailing-slash conclusion, plus the finding that `/` emits no file by default
  - **R22** — `switchLocalePath` returns the empty string, and an empty `href` silently means "this page"
  - **R23** — Storybook needs a global `NuxtLink` stub, extending § R19
  - **R24** — the desktop footer Top row is over-constrained by 52px; `space_between` governs and the columns flex

  Candidates likely to emerge while building, each worth recording if it does: whether Nitro prerenders `rootRedirect` into a file (T012's outcome, either way); whether `inert` behaves consistently for the scroll-locked background; and any token whose `clamp()` reads wrong on a real device despite correct arithmetic.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies — start immediately
- **Phase 2 (Foundational)**: blocks every story. T004–T006 in particular block **all** component work
- **Phase 3 (US2)**: depends on Phase 2. Sequenced before US1 because `useShellNavigation` resolves every destination US1 renders
- **Phase 4 (US1)**: depends on Phase 3 — this is the MVP
- **Phase 5 (US3)**: depends on T026 (`SiteNav` must exist to host the menu)
- **Phase 6 (US4)**: depends on T024 (the footer must exist to audit)
- **Phase 7 (US5)**: depends on the components it renders
- **Phase 8**: depends on everything

### Story Independence — stated honestly

These stories are **not** fully independent, and the template's usual promise
does not hold here. The shell is one artefact: the Footer serves US1 and US4,
and the Nav serves US1, US2 and US3. What *is* true:

- **US2** is independently testable at the unit level (T017–T018 need nothing rendered).
- **US1** is the MVP and the first demonstrable increment.
- **US3** adds a self-contained surface on top of US1 without changing it.
- **US4** adds no code — it audits behaviour US1 already implemented.
- **US5** adds no production code at all.

### Within Each Phase

Tests are written **with** their subject, not batched at the end — the pure
resolver (T017/T018) and the menu composable (T031/T032) especially, since each
encodes a failure mode easier to assert than to spot.

### Parallel Opportunities

- T002 and T003 (Phase 1)
- T007, T008, T009 (assets and copy — disjoint from the token file)
- T014, T015, T016 (three `data/` files, all after T013)
- T038, T039, T040 (three story files)

**Not parallel, despite looking it**: T004–T006 all edit
`app/assets/css/global.css`; T010 and T012 both edit `nuxt.config.ts`.

---

## Parallel Example: Phase 2

```bash
# After T013 lands, the three data files are disjoint:
Task: "Create app/features/shell/data/navigation.ts"
Task: "Create app/features/shell/data/footerColumns.ts"
Task: "Create app/features/shell/data/socialProfiles.ts"

# Independent of the token file and of each other:
Task: "Add app/assets/icons/x.svg"
Task: "Add app/assets/icons/README.md"
Task: "Add shell copy to i18n/locales/{es,en}.json"
```

---

## Implementation Strategy

### MVP (Phases 1–4)

1. Setup → Foundational → US2 → US1
2. **STOP and VALIDATE**: every page has chrome; all four routes resolve; the
   toggle lands on the equivalent page from each one
3. This is the first thing on this site a person could look at

### Incremental Delivery

1. MVP above
2. **+ US3** — mobile navigation. Ship-blocking in practice: without it, phone
   visitors have no navigation at all
3. **+ US4** — the audit that no link leads nowhere
4. **+ US5** — the catalogue entries
5. **+ Phase 8** — verification and the rules record

### Notes

- Commit after each task or logical group; Husky runs `pnpm check` and
  `pnpm typecheck` pre-commit and the tests pre-push. `--no-verify` is
  prohibited
- Branch prefixes are enforced by `.husky/pre-commit`
- T012 is the one task that can be closed by mistake through reading rather
  than running. Run the command
- Three values in this feature are **UNVERIFIED against the design file** and
  flagged for Clau: the `lg` breakpoint (A-01), the 1440px cap (A-02) and the
  footer Top row resolution (A-16). Two open decisions (#2 Google Calendar, #3
  FAQ) stay open — FR-039 renders their absence, it does not resolve them
