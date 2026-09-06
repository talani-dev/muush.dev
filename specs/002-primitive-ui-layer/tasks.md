---

description: "Task list for feature 002 — Primitive UI layer"
---

# Tasks: Primitive UI layer

**Input**: Design documents from `/specs/002-primitive-ui-layer/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: No test-authoring tasks. Article VII defers component tests, and the
one candidate for "non-trivial logic" — the isotipo stroke-width formula —
turned out to be performed by SVG viewBox scaling, so there is no function to
test (`research.md` § R6). Verification is the manual + grep checklist in
Phase 8, and the existing `tests/i18n-utils.test.ts` must keep passing
unchanged.

**Organization**: Phases 3–7 map to the user stories in `spec.md`. Because this
feature ships a vocabulary rather than a screen, "independently testable" means
the story's tokens/components can be rendered and measured on a throwaway
scratch route (deleted before commit — see `quickstart.md` § 2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are given in every task

---

## Phase 1: Setup

**Purpose**: The one config change the feature needs. No dependency install, no
scaffolding — `src/components/` already exists (empty but for `.gitkeep`).

- [x] T001 Add `"@/assets/*": ["src/assets/*"]` to `compilerOptions.paths` in `tsconfig.json`, keeping the existing six aliases untouched. Required by Article VI so Lockup and SocialIcon can import assets without a boundary-crossing relative path (`plan.md` § Constitution Check, Article VI row)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Every token in `src/styles/global.css`. Nothing else in this
feature can be built without them — building a component "temporarily" with a
literal is exactly the Article IV violation this phase exists to prevent.

**⚠️ CRITICAL**: T002–T007 all edit the same file (`src/styles/global.css`), so
none of them is `[P]`. Do them in order, appending below the existing
feature-001 content. **No existing ramp value, font token or `@font-face` block
may be modified** (FR-008).

- [x] T002 Append `--dark-glass: #1c1416;` to the existing `:root` block in `src/styles/global.css`, with a comment stating it is the warm near-black of the design's dark glass surfaces and is deliberately **not** `--ink-500` (`#262626`). Source: `data-model.md` § 1.2, FR-031
- [x] T003 Append the 13 glass/radar colour tokens to the `@theme inline` block in `src/styles/global.css`, each as `color-mix(in srgb, var(--<base>) <alpha>%, transparent)`, copying the exact base/alpha pairs from `research.md` § R3: `--color-glass-red-strong` (red-400 17%), `--color-glass-red-soft` (red-400 12%), `--color-glass-red-strong-line` (red-400 47%), `--color-glass-red-soft-line` (red-400 35%), `--color-glass-bone-strong` (bone-100 10%), `--color-glass-bone` (bone-100 6%), `--color-glass-bone-faint` (bone-100 4%), `--color-glass-line` (bone-100 18%), `--color-glass-line-faint` (bone-100 16%), `--color-glass-dark` (dark-glass 65%), `--color-glass-dark-line` (bone-100 23%), `--color-radar-halo-outer` (red-400 12%), `--color-radar-halo-mid` (red-400 30%)
- [x] T004 Append the 22 type roles to the `@theme inline` block in `src/styles/global.css`, each with its four declarations (`--text-<role>`, `--text-<role>--line-height`, `--text-<role>--letter-spacing`, `--text-<role>--font-weight`), copying the `clamp()` strings verbatim from the table in `research.md` § R2: `display`, `h1`, `h2`, `h2-alt`, `h3`, `h3-alt`, `lead`, `copy`, `body-lg`, `body`, `body-sm`, `service-name`, `service-brief`, `form-label`, `input-value`, `pill`, `meta`, `wordmark`, `button`, `button-sm`, `link`, `link-lg`. Do not recompute the values — they are already verified to hit 46/98px at 390/1440px for `display`
- [x] T005 Append the 19 `--spacing-*` tokens to the `@theme inline` block in `src/styles/global.css` from the surface table in `research.md` § R2: `page`, `glass-red`, `glass-bone`, `glass-dark`, `glass-tight`, `form-gap`, `lockup-gap`, `isotipo`, `pill-y`, `pill-start`, `pill-end`, `pill-gap`, `btn-y`, `btn-hero-x`, `btn-submit-x`, `btn-nav-y`, `btn-nav-x`, `social`, `social-glyph`
- [x] T006 Append the 4 `--radius-*` tokens (`panel` 22→18, `panel-sm` 20→18, `control` 12, `icon` 10) and the 3 `--blur-*` tokens (`glass-red` 22→20, `glass` 16, `glass-dark` 22) to the `@theme inline` block in `src/styles/global.css`, values from `research.md` § R2. Do **not** add a `999px` radius token — `rounded-full` already exists (Article IX)
- [x] T007 Append the LED animation primitives to `src/styles/global.css`, outside `@theme` since they are document-level at-rules: `@property --led-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }`, `@keyframes led-spin { to { --led-angle: 360deg; } }`, and `--stroke-led: 0.09375rem` (1.5px) in `:root`. Recipe and rationale in `research.md` § R4

**Checkpoint**: `pnpm dev` starts clean and `text-display`, `p-glass-red`,
`rounded-panel`, `backdrop-blur-glass`, `bg-glass-dark` all resolve on a
scratch element. Components can now be built.

---

## Phase 3: User Story 1 — One size token, both viewports (Priority: P1) 🎯 MVP

**Goal**: Prove the fluid scale delivers the design's numbers at both frames
with no media query.

**Independent Test**: On a scratch route, apply each type role and each surface
token to a bare element and measure at 390px and 1440px.

- [x] T008 [US1] Verify the fluid type scale at both endpoints using a temporary `src/pages/__scratch.astro`: `text-display` → 46px @390 / 98px @1440, `text-h1` → 38/74, `text-pill` → 12/13, `text-service-brief` → 14/14 (unchanged), `text-meta` → 11.5/12.5. Confirm the interpolation is continuous while resizing, and that the values clamp below 390px and above 1440px (spec SC-001, US1 scenarios 1–5)
- [x] T009 [US1] Verify the surface scale on the same scratch route: `--spacing-page` → 24/80, `--spacing-isotipo` → 40/52, `--radius-panel` → 18/22, `--blur-glass-red` → 20/22
- [x] T010 [US1] Confirm `src/styles/global.css` contains no `@media` rule for sizing (only the reduced-motion and hover-capability rules added in Phase 7 are permitted), and that the feature-001 ramps, font tokens and `@font-face` blocks are byte-identical to before this feature (spec SC-002, FR-008, FR-010)

**Checkpoint**: The scale is proven. Every later task consumes it instead of a
literal.

---

## Phase 4: User Story 2 — The glass surface vocabulary (Priority: P1)

**Goal**: The six-variant translucent panel, the highest-impact primitive in
the system.

**Independent Test**: Render all six variants side by side and compare each
against the `design-extract.md` § 1 row.

- [x] T011 [US2] Create `src/components/GlassPanel.astro` with `interface Props { variant: GlassVariant; padding?: GlassPadding; as?: 'div'|'article'|'section'|'aside'; class?: string }` per `contracts/components.md`, exporting the `GlassVariant` and `GlassPadding` types, with a `const` variant→class map declared `satisfies Record<GlassVariant, string>` (never string concatenation — Tailwind's scanner only sees complete class names)
- [x] T012 [US2] Wire the six variants in `src/components/GlassPanel.astro` to their tokens exactly per `data-model.md` § 2.1: `red-strong` (glass-red-strong / glass-red-strong-line / blur-glass-red / radius-panel / spacing-glass-red), `red-soft` (glass-red-soft / glass-red-soft-line / same blur, radius, padding), `bone-strong` (glass-bone-strong / glass-line / blur-glass / radius-panel-sm / spacing-glass-bone), `bone` (glass-bone / glass-line / same), `bone-faint` (glass-bone-faint / glass-line-faint / blur-glass / radius-panel-sm / spacing-glass-red), `dark` (glass-dark / glass-dark-line / blur-glass-dark / radius-panel-sm / spacing-glass-dark). Border width is 1px on all six
- [x] T013 [US2] Implement the orthogonal `padding` prop in `src/components/GlassPanel.astro`: `'default'` → the variant's own padding, `'tight'` → `spacing-glass-tight` (22→18, the photo-frame case), `'none'` → no padding. This is what keeps `bone`'s two documented paddings from forking into a seventh variant (FR-015)
- [x] T014 [US2] Confirm `src/components/GlassPanel.astro` renders its default slot unstyled and unconstrained — no width, no layout, no typography imposed on children (FR-016) — and that `class` is merged for the caller's layout hooks
- [x] T015 [US2] Verify all six variants on the scratch route against the `design-extract.md` § 1 table at both viewports: fill, border colour, backdrop blur, radius and padding — 30 checks (spec SC-003)

**Checkpoint**: Four later features (cards, photo frames, forms) are unblocked.

---

## Phase 5: User Story 3 — The section marker (radar + pill) (Priority: P2)

**Goal**: The most repeated pairing on the site, and the feature's only
component-to-component dependency besides Lockup.

**Independent Test**: Render the radar at all 3 sizes and the pill with each of
the 11 documented labels.

- [x] T016 [P] [US3] Create `src/components/Radar.astro` with `interface Props { size?: RadarSize; class?: string }` (default `'sm'`), rendering three **concentric** circles — the design file's offsets are exactly (outer−inner)/2, verified in `research.md` § R7, so the component centres them rather than replicating offsets. Sizes: `sm` 20/14/7, `md` 30/20/12, `sm-alt` 22/16/10. Colours fixed for all sizes: outer `--color-radar-halo-outer`, middle `--color-radar-halo-mid`, core `--color-red-400`. Mark the root `aria-hidden="true"` — it is decorative, the adjacent label carries the meaning
- [x] T017 [US3] Create `src/components/Pill.astro` (depends on T016) composing `<Radar size="sm" />` plus a caller-supplied `label`, per `data-model.md` § 2.5: `rounded-full`, `bg-glass-dark`, 1px `border-glass-line`, padding 9 top / 20 right / 9 bottom / 10 left via `--spacing-pill-y` / `-end` / `-start`, gap `--spacing-pill-gap` (11), label in `text-bone-200` at the `text-pill` role. `label` is the only content prop (design-extract § 3)
- [x] T018 [US3] Verify on the scratch route that the pill's label moves 13px→12px across viewports with no breakpoint in the component, that the three radar sizes measure correctly at both viewports, and that no ES/EN string is embedded anywhere in either file (FR-029)

**Checkpoint**: Every section heading of both pages can now be assembled.

---

## Phase 6: User Story 5 — The brand mark in text (Priority: P2)

**Goal**: Wordmark and Lockup, the first thing on every page.

**Independent Test**: Render both wordmark forms and the lockup, and check the
rendered isotipo stroke width against the branding formula.

- [x] T019 [P] [US5] Create `src/components/Wordmark.astro` with `interface Props { form?: WordmarkForm; class?: string }` (default `'full'`), rendering three adjacent runs with no gap — `muush` in `text-bone-100`, `.` in `text-red-400`, `dev` in `text-bone-100` — in `font-poppins` at the `text-wordmark` role (19→24, weight 600, −0.03em). `form="short"` omits the dot and `dev` (FR-018). Note in a comment that these three runs are brand identity, not copy: they are locale-invariant per `messaging.md` rule 6, and are the one deliberate exception to FR-029
- [x] T020 [US5] Create `src/components/Lockup.astro` (depends on T019 and T001) importing the isotipo as an Astro SVG component — `import Isotipo from '@/assets/logo/isotipo-on-ink.svg'` — and rendering `Isotipo + Wordmark` cross-axis centred with gap `--spacing-lockup-gap` (9→12). Set **only** the isotipo's width (`--spacing-isotipo`, 40→52) and let height and stroke follow the viewBox: `research.md` § R6 proves this reproduces the branding formula exactly (8.851 at 52px, 6.809 at 40px vs the design's 8.85 and 6.8). Do **not** add a `strokeWidth` prop, and do **not** create a helper in `src/utils/`. Use the `on-ink` variant because the site is dark end to end (spec A-12). Lockup is not itself a link — the nav/footer wraps it
- [x] T021 [US5] Verify on the scratch route: both wordmark forms render correctly, the dot is red-400 in both light and dark contexts, and the isotipo's *computed* stroke width measures 8.85 at a 1440px viewport and 6.8 at 390px (FR-019, US5 scenario 3)

**Checkpoint**: Nav and footer branding is unblocked.

---

## Phase 7: User Story 4 — The primary call to action (Priority: P2)

**Goal**: The conversion element, and the only animation in the control system.

**Independent Test**: Hover each variant, then re-test under reduced motion,
touch emulation and disabled JavaScript.

- [x] T022 [US4] Create `src/components/BotonPrimario.astro` (depends on T007) with `interface Props { variant?: ButtonVariant; href?: string; type?: 'button'|'submit'; class?: string }` per `contracts/components.md`, rendering `<a>` when `href` is set and `<button type={…}>` otherwise, with the default slot as the label — no hardcoded ES/EN copy
- [x] T023 [US4] Wire the three size variants in `src/components/BotonPrimario.astro` per `data-model.md` § 2.6: `nav` (padding `--spacing-btn-nav-y` 13 / `--spacing-btn-nav-x` 24, label `text-button-sm` 14), `hero` (`--spacing-btn-y` 16→18 / `--spacing-btn-hero-x` 26→32, label `text-button` 15→16), `submit` (`--spacing-btn-y` / `--spacing-btn-submit-x` 28→32, same label role). Shared: `bg-glass-dark`, `rounded-control` (12), label `text-bone-100`
- [x] T024 [US4] Implement the LED ring in the scoped `<style>` block of `src/components/BotonPrimario.astro`, copying the recipe from `research.md` § R4: an `inset: 0` `::before` with `border-radius: inherit`, `padding: var(--stroke-led)`, `background: conic-gradient(from var(--led-angle), var(--color-red-400) 0%, var(--color-bone-100) 50%, var(--color-red-400) 100%)`, masked to the band with `mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)` + `mask-composite: exclude`, and `pointer-events: none`. Declare `--led-angle: 0deg` on the element so the ring still paints where `@property` is unsupported. **The `background-clip: padding-box, border-box` shortcut does not work here** — the button's fill is 65% opaque and the conic layer would show through the middle. **Three stops only, and no wine anywhere**: the third stop `#cf3247` *is* `--red-400` (FR-023; design-extract § 4 and § 11 correct the older `branding.md` wording)
- [x] T025 [US4] Gate the animation in `src/components/BotonPrimario.astro`: `@media (hover: hover) { :hover::before { animation: led-spin 2.6s linear infinite } }` so touch devices get the static ring (spec A-02, `decisions-open.md` #8), and `@media (prefers-reduced-motion: reduce) { ::before { animation: none; background: var(--color-red-400) } }` for the flat red fallback (FR-025, `ui-map.md` § 10). Rotation must stop when the pointer leaves — no `animation-fill-mode` that freezes it mid-turn
- [x] T026 [US4] Verify the button per `quickstart.md` § 3: hover rotates at one turn per 2.6s and stops on leave; reduced-motion emulation gives a flat red-400 border; touch emulation gives a static ring; JavaScript disabled changes nothing; and the computed gradient reads red-400 → bone-100 → red-400 with no `--wine-` token present (spec SC-005, SC-006)

**Checkpoint**: The hero and both form submits are unblocked.

---

## Phase 8: User Story 6 — The unboxed secondary link (Priority: P3)

**Goal**: The secondary CTA that must never become a button.

**Independent Test**: Render both sizes in default, hover and focus states and
confirm no box is ever painted.

- [x] T027 [P] [US6] Create `src/components/LinkArrow.astro` with `interface Props { href: string; size?: LinkArrowSize; external?: boolean; class?: string }` (default `'default'`), rendering the default slot plus a component-appended `→` glyph (appended by the component, not the caller, so the hover animation has something to move). Sizes: `default` → `text-link` (16), `large` → `text-link-lg` (20→23). Always `text-bone-100`. Weight 600 in both sizes per spec A-06
- [x] T028 [US6] Ensure `src/components/LinkArrow.astro` paints **no** background and **no** border in any state including `:hover` and `:focus-visible` (FR-026, `ui-map.md` § 3: "nunca un fondo"). Hover affordance is an underline or a small arrow translate and nothing else. When `external` is true, add `target="_blank" rel="noopener noreferrer"`
- [x] T029 [US6] Verify both sizes on the scratch route in default, hover and focus states — no box, correct sizes at both viewports, focus ring visible (`ui-map.md` § 10 requires a visible focus indicator that is never removed)

---

## Phase 9: User Story 7 — Social glyphs that obey the brand token (Priority: P3)

**Goal**: Three normalized glyphs plus the 48×48 glass button that holds them.

**Independent Test**: Inline all three on a page that also defines a `.cls-1`
class; set the container colour to bone-100 and confirm all three follow it.

- [x] T030 [P] [US7] Normalize LinkedIn into `src/assets/social/linkedin.svg`: source `~/Library/Mobile Documents/com~apple~CloudDocs/Pictures/Icons/Redes/Linkedin/linkedin-logo-white.svg`. Its art occupies a 22-unit square starting at (4,4) under `transform="scale(8.53333)"` with viewBox offset 34.13333. Emit `viewBox="0 0 24 24"` with a single wrapping `<g transform="scale(1.090909) translate(-4 -4)">` (24÷22 = 1.090909), drop the original scale and the viewBox offset, drop `width`/`height`, and replace `fill="#ffffff"` with `fill="currentColor"` (`research.md` § R8)
- [x] T031 [P] [US7] Normalize Instagram into `src/assets/social/instagram.svg`: source `…/Icons/Redes/Instagram/Instagram_Glyph_White.svg`, viewBox `0 0 1000 1000`. Emit `viewBox="0 0 24 24"` with `<g transform="scale(0.024)">` (24÷1000 exactly). **Delete `<defs>` and the `.cls-1{fill:#fff}` `<style>` block entirely** and replace every `class="cls-1"` with `fill="currentColor"` — that global class is the collision risk that makes this normalization a correctness issue, not polish (FR-034). Also drop `id="Layer_1"` and `data-name`
- [x] T032 [P] [US7] Normalize TikTok into `src/assets/social/tiktok.svg`: source `…/Icons/Redes/TikTok/tiktok-logo-white.svg`, viewBox `0 0 1419 1627` (not square). Fit the taller axis and centre the narrower one: scale `24÷1627 = 0.0147511`, rendered width `1419 × 0.0147511 = 20.93`, horizontal inset `(24−20.93)÷2 = 1.53` → wrap in `<g transform="translate(1.53 0) scale(0.0147511)">`. Strip the XML prolog, the DOCTYPE, `xmlns:xlink`, `xmlns:serif`, `xml:space` and the root `style` attribute — **but re-attach `fill-rule="evenodd"` and `clip-rule="evenodd"` as presentation attributes on the paths**, or the glyph's counters fill in solid. Set `fill="currentColor"` on the paths (`research.md` § R8)
- [x] T033 [US7] Create `src/assets/social/README.md` recording, per file: source path, original viewBox, the transform applied, and exactly what was stripped — same shape as the existing `src/assets/logo/README.md` from feature 001 (FR-036, `contracts/components.md` § Asset contract)
- [x] T034 [US7] Create `src/components/SocialIcon.astro` (depends on T030–T032 and T001) with `interface Props { network: SocialNetwork; href: string; label: string }`, rendering `<a href aria-label={label} target="_blank" rel="noopener noreferrer">` around a 48×48 (`--spacing-social`) `bg-glass-dark` square with `rounded-icon` (10) and a 1px `border-glass-line`, containing the 24×24 (`--spacing-social-glyph`) glyph centred and coloured `text-bone-100` so `currentColor` resolves to `#FBF8F6` and not pure white. Import the three glyphs as Astro SVG components via `@/assets/social/…` and select with a `const` map declared `satisfies Record<SocialNetwork, …>`
- [x] T035 [US7] Verify the glyphs per `quickstart.md` § 4: `grep -riE '#fff|#ffffff|<style|<defs|DOCTYPE|serif:|class=' src/assets/social/` returns nothing; all three files declare `viewBox="0 0 24 24"`; the three render at the same optical weight; and all three adopt the container colour (spec SC-007)

---

## Phase 10: Verification Sweep & Acceptance Gate

**Purpose**: The hard gates. Nothing here is optional.

- [x] T036 Delete the temporary `src/pages/__scratch.astro` used for verification and confirm `git status --short` shows **no** entry under `src/pages/` (`quickstart.md` § 2, FR-038)
- [x] T037 Run the Article IV literal gate from `quickstart.md` § 5 — `grep -rInE '#[0-9a-fA-F]{3,8}\b' src/components/` and `grep -rInE '\[[0-9]+(px|rem|%)|[0-9]+px' src/components/` — both must return nothing. `src/assets/**.svg` is exempt (assets, not markup, per the feature-001 precedent). Any hit is a defect, not a style preference (spec SC-004)
- [x] T038 Confirm the scope boundary: `git status --short` shows changes only under `src/styles/global.css`, `src/components/`, `src/assets/social/`, `tsconfig.json` and `specs/002-primitive-ui-layer/` — and **nothing** under `src/pages/`, `src/layouts/`, `src/islands/`, `src/i18n/`, `astro.config.mjs`, `package.json` or `tests/` (spec SC-008, FR-037, FR-038)
- [x] T039 Confirm Article II compliance across all eight files in `src/components/`: no `<script>` tag, no `client:*` directive, no import from `src/islands/`, and `grep -c "import" src/components/*.astro` shows only the two permitted dependencies (Pill→Radar, Lockup→Wordmark) plus asset imports (FR-012, FR-013)
- [x] T040 Run `pnpm check:fix` then `pnpm check` — Biome formats CSS and `.astro` at `lineWidth: 80`, so let it wrap the long `clamp()` declarations rather than hand-wrapping them. `pnpm check` runs with `--error-on-warnings`, so warnings fail the gate
- [x] T041 Run `pnpm typecheck && pnpm test && pnpm build`. `astro check` must type the `Props` interfaces and the `*.svg` component imports cleanly with no `any` and no `@ts-expect-error`; the existing `tests/i18n-utils.test.ts` must pass unchanged; and the build must emit no JavaScript chunk attributable to these eight components (FR-039, SC-005, SC-009)

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies. Blocks only T020 (Lockup) and T034 (SocialIcon)
- **Phase 2 (Foundational)**: blocks **every** component phase. T002→T007 are strictly sequential — same file
- **Phase 3 (US1)**: verifies Phase 2; must pass before the component phases are trusted
- **Phases 4–9**: independent of each other once Phase 2 is done; may be worked in parallel
- **Phase 10**: last, after every other phase

### Task-level dependencies

```text
T001 ────────────────────────────► T020, T034
T002 → T003 → T004 → T005 → T006 → T007        (same file, sequential)
       └──────────────────────────► T008–T035  (all components need tokens)
T007 ────────────────────────────► T024        (@property + @keyframes)
T016 ────────────────────────────► T017        (Pill composes Radar)
T019 ────────────────────────────► T020        (Lockup composes Wordmark)
T030, T031, T032 ────────────────► T034        (SocialIcon needs the glyphs)
everything ──────────────────────► T036–T041
```

### Parallel opportunities

```bash
# After Phase 2, four independent components (different files):
Task: "T011 Create src/components/GlassPanel.astro"
Task: "T016 Create src/components/Radar.astro"
Task: "T019 Create src/components/Wordmark.astro"
Task: "T027 Create src/components/LinkArrow.astro"

# The three SVG normalizations are fully independent of each other:
Task: "T030 Normalize src/assets/social/linkedin.svg"
Task: "T031 Normalize src/assets/social/instagram.svg"
Task: "T032 Normalize src/assets/social/tiktok.svg"
```

Not parallelizable: T002–T007 (one file), T012–T014 (one file), T022–T025 (one
file), and every task in Phase 10 (each depends on the full working tree).

---

## Implementation Strategy

### MVP

Phase 1 + Phase 2 + Phase 3 + Phase 4 = the fluid scale and GlassPanel. That
alone unblocks four later features and proves the token discipline works. Stop
there and validate before continuing if time is short.

### Incremental order

1. Setup + Foundational → tokens exist (T001–T007)
2. US1 → the scale is verified (T008–T010)
3. US2 → GlassPanel (T011–T015) — highest leverage, 13 instances in the design
4. US3 → Radar + Pill (T016–T018) — 11 pill instances
5. US5 → Wordmark + Lockup (T019–T021)
6. US4 → BotonPrimario (T022–T026) — the trickiest CSS in the feature
7. US6 → LinkArrow (T027–T029)
8. US7 → glyphs + SocialIcon (T030–T035)
9. Verification sweep (T036–T041)

---

## Notes

- **41 tasks**: 1 setup · 6 foundational · 3 (US1) · 5 (US2) · 3 (US3) ·
  3 (US5) · 5 (US4) · 3 (US6) · 6 (US7) · 6 verification.
- Commit after each task or logical group. The Husky pre-commit hook already
  runs `pnpm check`, so T040 will effectively run on every commit.
- **Do not** build PurposeCard, ProjectCard, TeamMemberCard, ServiceItem,
  FormField, RadioPill, FooterColumn, Nav, Footer, SectionGlow or the dotted
  paper background. `design-extract.md` § 10 describes them only so these
  primitives' interfaces fit them later (FR-037).
- **Do not** open `muush.pen`. Every measurement this feature needs is in
  `docs/business/landing/design-extract.md`, and the values in `research.md`
  are already computed from it.
- If a value seems missing, it is either in `research.md` § R2/R3 or it is
  genuinely undocumented — in which case stop and ask rather than inventing it.
