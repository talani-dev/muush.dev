# Tasks: Services float and custom cursor (feature 34)

**Input**: `specs/034-services-float-custom-cursor/` (spec.md, plan.md, research.md, data-model.md, quickstart.md)
**Prerequisites**: human gate passed (OA-1 to OA-8 answered). If the gate changes a value (hotspot, amplitude, period, per-node periods, PNG fallback, asset white), apply it to the task that owns that value; nothing else moves.

**Tests**: included. Article X and this repository's red-first practice
(`findings.md` § R39): every new test is seen failing before the code that
makes it pass.

**Format**: `[ID] [P?] [Story] Description`. `[P]` = different file, no
dependency on an incomplete task.

**Commit grouping (plan § Commit grouping)**: Phases 2–4 = commit 1 (desktop
float + reduced motion); Phase 6 = commit 2 (mobile trial, alone, revertable);
Phase 5 = commit 3 (cursor). Commit only when the leader/human asks.

---

## Phase 1: Setup

- [x] T001 Run `./init.sh` and confirm it exits 0; record the baseline line count of `app/features/landing/ui/ServicesConstellation.vue` (215) and `app/features/landing/ui/ServicesTimeline.vue` (171) in `docs/harness/progress/current.md`
- [x] T002 In a browser, open the current `/es` build at 1280×800 and 1440×900 and record whether connector line ends meet the radar centres today (confirms or refutes OA-3 / research R11) in `docs/harness/progress/current.md`; take reference screenshots of Services at 1440 and 390 for SC-003 and SC-005

---

## Phase 2: Foundational (blocks US1, US2, US3)

- [x] T003 [P] Write failing `tests/services-float-tokens.test.ts` (read `app/assets/css/global.css` from disk, `node:path` + `process.cwd()`, § R27): `@property --services-float-phase` with `syntax: "<angle>"`, `inherits: true`, `initial-value: 0deg`; `@keyframes services-float` from `0deg` to `360deg`; `--services-float-amplitude` numeric in [6, 8]; `--duration-services-float` in [5s, 7s]; `--services-float-phase-step` present; `--services-frame-px: 0.0625rem`; inside `@media (prefers-reduced-motion: reduce)` the amplitude is `0`. Names: `should … when …`
- [x] T004 Add to `app/assets/css/global.css`: in `:root`, next to the Services block, `--services-float-amplitude: 7`, `--duration-services-float: 6s`, `--services-float-phase-step: 137.5deg`, `--services-frame-px: 0.0625rem`, each with a comment (implementation choice inside D-4; golden angle reason; design-pixel unit); a `@media (prefers-reduced-motion: reduce) { :root { --services-float-amplitude: 0; } }`; at document level next to `led-spin`/`radar-ping`, the `@property --services-float-phase` and `@keyframes services-float` from data-model § 2 with a comment on the degradation (no `@property` → discrete 0deg/360deg → static). T003 passes
- [x] T005 Run `pnpm check` on the T004 change plus a scratch use of `sin()`, `atan()`, `skewY()`, `vector-effect`, `transform-box` in a `<style scoped>` to confirm Biome accepts them (plan gate IX); if a rule rejects a valid function, add the narrowest override with a comment in `biome.json` and note it in `docs/harness/findings.md`; remove the scratch use

---

## Phase 3: User Story 1 · Desktop constellation floats, lines stay glued (P1) 🎯 MVP

**Goal**: five desktop nodes float; four lines follow exactly; OA-3 fixed.
**Independent test**: quickstart § 1.

### Tests (red first)

- [x] T006 [P] [US1] Add failing tests in `app/features/landing/data/servicesContent.test.ts` for `connectorFloatVars(connector, index)`: for each of the four outputs of `connectorEndpoints(SERVICE_NODE_CENTRES)` it returns `{ '--x1': String(x1), '--x2': String(x2), '--i-a': String(index), '--i-b': String(index + 1) }`; and with a synthetic connector it echoes that connector's numbers (proves no literals)
- [x] T007 [P] [US1] Create failing `app/features/landing/ui/ServicesConnectors.test.ts`: mounts with the four connectors; renders four `<line>` whose `x1/y1/x2/y2` equal `connectorEndpoints(SERVICE_NODE_CENTRES)` and whose inline style carries the `connectorFloatVars` values; the `<svg>` is `aria-hidden`, has `viewBox="0 0 1440 910"` and no `size-full` class; the `<style scoped>` text (comments stripped, as in the existing constellation test) contains `sin(var(--services-float-phase)`, `skewY(atan(`, `vector-effect: non-scaling-stroke`, `transform-box: view-box`, `transform-origin: 0 0`, and sizes the SVG with `var(--services-canvas-w)` / `var(--services-canvas-h)` and `overflow: visible`
- [x] T008 [US1] Update `app/features/landing/ui/ServicesConstellation.test.ts`: move its connector/SVG assertions to T007; add failing assertions that it renders one `ServicesConnectors` receiving `connectorEndpoints(SERVICE_NODE_CENTRES)`; each `.node` has inline `--i` equal to `node.index`; the style contains the `.node` offset formula (`sin(var(--services-float-phase) + var(--i) * var(--services-float-phase-step))` and `translate:` with `var(--services-frame-px)`); `.canvas` declares `animation: services-float var(--duration-services-float) linear infinite`; a reduced-motion block sets `animation: none` on `.canvas`; no `rotate`, `scale`, `filter` or `opacity` is introduced on `.node`

### Implementation

- [x] T009 [US1] Add `connectorFloatVars` to `app/features/landing/data/servicesContent.ts` (pure, no import, typed return per data-model § 3.1, doc comment naming FR-008). T006 passes
- [x] T010 [US1] Create `app/features/landing/ui/ServicesConnectors.vue` (`<script setup lang="ts">`, prop `connectors: ConnectorEndpoints[]`): move the `<svg>` and `.connector` stroke style out of `ServicesConstellation.vue`; bind each line's inline style with `connectorFloatVars(connector, index)`; replace `size-full` with the frame size + `overflow: visible` (OA-3, research R11); add the shear CSS from plan § Implementation notes (`--dy-a`, `--dy-b`, `--slope`, `--shift`, `transform`, `transform-box`, `transform-origin`, `vector-effect`) with a doc comment carrying the derivation from research R1 in short form. Under 200 lines. T007 passes
- [x] T011 [US1] Edit `app/features/landing/ui/ServicesConstellation.vue`: render `<ServicesConnectors :connectors="connectors" />` in place of the inline SVG; add `:style="{ '--i': String(node.index) }"` to each `.node`; add the `.node` offset (`--float-dy` + `translate`) and the `.canvas` animation + its reduced-motion `animation: none`; update the doc comment (float, single clock, why lines follow). File must end under 200 lines. T008 passes
- [x] T012 [US1] Run `pnpm check`, `pnpm typecheck`, `pnpm test`; then `pnpm generate` and confirm the emitted CSS in `.output/public/_nuxt/*.css` still contains `sin(` and `--services-float-phase` (the build did not fold or drop them); record in `docs/harness/progress/current.md`
- [x] T013 [US1] Manual, quickstart § 1 steps 1–6 in Chrome, Safari and Firefox: float visible and out of phase; ping continues; paused-inspector glue at 8 moments × 1024/1280/1440/1920 (SC-001); 20 px root font; readability; 10 s Performance recording with no float-caused Layout (SC-004). Record results; if any engine fails the glue or renders the shear wrong, stop and report to the leader (fallback is option D, research R1, which needs a new gate decision) — **Closed 2026-10-15 by Roberto's acceptance of the visual result ("me encanta cierra la tarea", after local `pnpm dev` review; relayed by the leader). No per-browser matrix reported (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion): UNVERIFIED per browser.**

**Checkpoint**: desktop float complete and independently demonstrable.

---

## Phase 4: User Story 2 · Reduced motion and fallbacks (P1)

**Goal**: no float under reduced motion; static, glued layout where unsupported.
**Independent test**: quickstart § 2.

- [x] T014 [US2] Verify T003 and T008's reduced-motion assertions are green (amplitude 0 in `app/assets/css/global.css`, `animation: none` in `app/features/landing/ui/ServicesConstellation.vue`); no new code expected
- [x] T015 [US2] Manual, quickstart § 2: emulate `prefers-reduced-motion: reduce` at 1440 and 390 and compare with the T002 screenshots (SC-003); disable JavaScript and confirm the float still runs; record in `docs/harness/progress/current.md` — **Closed 2026-10-15 by Roberto's acceptance of the visual result ("me encanta cierra la tarea", after local `pnpm dev` review; relayed by the leader). No per-browser matrix reported (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion): UNVERIFIED per browser.**

---

## Phase 5: User Story 4 · The site's own cursor (P1)

**Goal**: brand cursor site-wide; same image on pointer state; I-beam on text fields; native fallbacks; forced colours → system cursors.
**Independent test**: quickstart § 3.

### Tests (red first)

- [x] T016 [P] [US4] Create failing `tests/brand-cursor.test.ts` (reads `.output/public`, built by `tests/global-setup.ts`; `node:path` + `process.cwd()`): `cursor/you.svg` exists; root has `width="64" height="64" viewBox="0 0 32 32"` (amendment A1, 2026-10-14; was 32); no `<rect` without an `x` attribute (the 32×32 background is gone); exactly one `<rect` (the pill, `x="8.19095"`) and two `<path`; its red equals the `--red-400` value read from `app/assets/css/global.css` (case-insensitive); the emitted `_nuxt/*.css` contains `url(/cursor/you.svg) 1 9` (A1; was `1 5`) followed by `auto` and, separately, by `pointer` (accept quoted/unquoted minified forms), a rule giving `textarea` `cursor:text`, and an `@media (forced-colors:none)` (or `(forced-colors: none)`) block containing the cursor rules; no emitted CSS references a cursor URL on another host

### Implementation

- [x] T017 [P] [US4] Create `public/cursor/you.svg` from `/Users/betonajera/Documents/Muush/Landing Page/Mouse/01-Mouse.svg` (read only, never modified): copy it, delete exactly the line `<rect width="32" height="32" fill="white"/>`, keep every other element and attribute unchanged (OA-7 default) except the root `width`/`height`, set to 64 (amendment A1, 2026-10-14; `viewBox` stays `0 0 32 32`); optionally add one XML comment after the root tag with provenance and the `--red-400` note (data-model § 5). Diff the result against the source to prove only that line, the root `width`/`height` (A1) and the comment changed
- [x] T018 [US4] Add to `app/assets/css/global.css`: `:root` tokens `--cursor-brand: url("/cursor/you.svg") 1 9, auto` and `--cursor-brand-pointer: url("/cursor/you.svg") 1 9, pointer` (A1; was `1 5`) with a comment (hotspot derivation pointer to research R6 and A1, why `public/`, why the fallback keywords); then, unlayered and inside `@media (forced-colors: none)`, the four rule groups in plan § Implementation notes, in that order, using `:where()`, with a comment explaining why unlayered (beats Tailwind's `cursor-pointer` utility and the user-agent `button` default, findings § R56) and that touch devices are unaffected. T016 passes after `pnpm generate`
- [x] T019 [US4] Run `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build`; confirm Storybook builds with the unresolvable root-relative cursor URL (warning acceptable, error not) and that `storybook-static/index.html` is still the manager document (findings § R33); record
- [x] T020 [US4] Manual, quickstart § 3 matrix in Chrome, Safari, Firefox on macOS (Windows Chrome/Edge if available) across the four routes: brand cursor without white square; same cursor on links/buttons; I-beam in every text field of both forms; hotspot click on a 1 px target (SC-007); Retina sharpness (OA-6); 64×64 size and the >32 px edge caveat (research A1); visibility over the red final-CTA gradient (OA-8); blocked asset → system arrow/hand; High Contrast → system cursors. Record per browser; report any blurry/unsupported engine to the leader for the OA-6 PNG follow-up (Roberto supplies PNGs) — **Closed 2026-10-15 by Roberto's acceptance of the visual result ("me encanta cierra la tarea", after local `pnpm dev` review; relayed by the leader). No per-browser matrix reported (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion): UNVERIFIED per browser.**

**Checkpoint**: cursor complete, independent of Part A.

---

## Phase 6: User Story 3 · Mobile and tablet float trial (P2) · own commit, revertable (D-3)

**Goal**: timeline rows float with the shared parameters; spine static; lyrics intact; removable by deleting one block and one test file.
**Independent test**: quickstart § 4.

- [x] T021 [US3] Create failing `app/features/landing/ui/ServicesTimeline.float.test.ts` (all D-3 assertions live only here): the `<style scoped>` of `ServicesTimeline.vue` contains a block fenced by the comments `Feature 34 · D-3 mobile float trial` / `end D-3`; inside it `.canvas` declares `animation: services-float var(--duration-services-float) linear infinite`, `.item` declares the shared offset formula with `var(--i)` and `translate:` with `var(--services-frame-px)`, and a reduced-motion override sets `animation: none`; outside the fence no rule mentions `--services-float`; `.spine` has no `transform`/`translate`
- [x] T022 [US3] Append the fenced block at the end of the `<style scoped>` in `app/features/landing/ui/ServicesTimeline.vue`, reading only the shared tokens; the opening fence comment says, in two or three lines, that deleting the block and `ServicesTimeline.float.test.ts` reverts the trial and that the spine needs no change because rows move parallel to it (research R4). Do not touch the template, the lyrics rules or `useServicesLyrics`. Keep the file ≤ 200 lines. T021 passes; existing `ServicesTimeline.test.ts` and `useServicesLyrics.test.ts` pass unchanged
- [x] T023 [US3] Revert drill: temporarily delete the fenced block and `ServicesTimeline.float.test.ts`, run `pnpm test` (must pass with no other edit, SC-005 / FR-012), then restore both; record the result in `docs/harness/progress/current.md`
- [x] T024 [US3] Manual for Roberto's local review (quickstart § 4): `pnpm dev`, `/es` at 390×844 and 768×1024: rows drift out of phase, lyrics dimming still works, spine static, radars keep their vertical; reduced motion → static. Hand the leader a short note with the exact revert instructions so Roberto can decide keep or revert — **Closed 2026-10-15 by Roberto's acceptance ("me encanta cierra la tarea", after local `pnpm dev` review; relayed by the leader). Decision: KEEP the mobile/tablet float trial. Per-browser matrix (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion) not reported: UNVERIFIED per browser.**

---

## Phase 7: Polish & cross-cutting

- [x] T025 Run the full gate: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm generate`, `pnpm storybook:build` (FR-021); confirm `ServicesConstellation.vue`, `ServicesConnectors.vue` and `ServicesTimeline.vue` are each under 200 lines; confirm no file under `docs/business/`, `i18n/locales/`, `app/features/shell/` or `app/features/forms/` changed (`git diff --stat`)
- [x] T026 [P] Record any tool behaviour found (Biome and CSS trig, Lightning CSS output, Storybook URL warning, browser quirks) in `docs/harness/findings.md` or as comments next to the code; report anything that looks like a business rule to the leader instead of writing it
- [x] T027 Update `docs/harness/progress/current.md` with the manual results of T013, T015, T020, T024 and the open follow-ups (OA-6 PNGs, OA-8 outline) if any

---

## Dependencies & execution order

- Phase 1 → Phase 2 → {Phase 3, Phase 5} → Phase 4 (needs Phase 3) → Phase 6 (needs Phase 2 tokens; scheduled after Phase 3 so its commit stays separate) → Phase 7.
- Phase 5 (cursor) depends only on Phase 1; it can run in parallel with Phases 2–4.
- Within US1: T006, T007 in parallel → T008 (all three red) → T009 → T010 → T011 → T012 → T013.
- Within US4: T016, T017 in parallel → T018 → T019 → T020.
- Within US3: T021 → T022 → T023 → T024.

## Parallel examples

```text
# After Phase 2:
T006 servicesContent.test.ts   |  T007 ServicesConnectors.test.ts  |  T016 brand-cursor.test.ts  |  T017 public/cursor/you.svg
```

## Implementation strategy

1. MVP = Phases 1–3 (desktop float, glued lines, OA-3 fixed).
2. Phase 4 confirms reduced motion (no new code expected).
3. Phase 5 ships the cursor independently.
4. Phase 6 adds the mobile trial as its own commit, so Roberto's decision
   to keep or revert costs one revert.
5. Phase 7 closes the gate; status moves to `reviewing` only via the leader.

---

## Phase 8: User Story 5 · Amendment A2: red lit dots, no glow, footer on the paper (P1) · own commit

**Source**: spec § *Amendment A2* (approved by Roberto 2026-10-14), FR-022…FR-029, SC-009…SC-012; plan § *Amendment A2*; research A2.1–A2.5; data-model §§ 6–7; quickstart § 5.
**Goal**: no glow; dots within ≈120 px of the pointer turn red-400, fading out; ~~the footer shows the paper and the effect~~ (superseded by A2 revision 1: the footer keeps its flat ink-500 and covers the effect, Phase 8.1); form cards still cover it.
**Independent test**: quickstart § 5.
**Scope note**: this phase edits `app/shared/ui/`, `app/features/shell/ui/` and the `forms` feature's **tests only**; that supersedes T025's "no file under `app/features/shell/` or `app/features/forms/` changed" for these files. Nothing under `docs/business/` or `i18n/locales/` changes. OA-9 does not block these tasks.

### Tests (red first)

- [x] T028 [P] [US5] Create failing `tests/spotlight-red-dots-tokens.test.ts` (reads `app/assets/css/global.css` with `node:path` + `process.cwd()`, § R27; names `should … when …`): `--dot-paper-lit-color` is declared as exactly `var(--red-400)`; the declared `--red-NNN:` names (anchored `^\s*--red-\d+:`) are exactly `--red-100`…`--red-500`; no declaration other than `--red-400` has the value `#cf3147` (case-insensitive); `--spotlight-lit-radius` is declared in rem and its value × 16 is within [112, 128] (and equals 120); no declaration of `--spotlight-red-400-*`, `--spotlight-stop-mid`, `--spotlight-core-size` or `--spotlight-outer-size` remains
- [x] T029 [P] [US5] Update `app/shared/ui/CursorSpotlight.test.ts` so it fails against today's component: `SPOTLIGHT_TOKENS` becomes `--spotlight-lit-radius`, `--dot-paper-lit-color`, `--duration-spotlight-fade`, `--layer-spotlight`; add `should paint no light of its own when rendered` (the `.cursor-spotlight` and `.cursor-spotlight__beam` rules declare no `background` / `background-image`; the comment-stripped style contains exactly one `radial-gradient(` that names a colour token, and it is `var(--dot-paper-lit-color)` in `.cursor-spotlight__lit`); add `should fade the lit dots out at the lit radius when rendered` (mask uses `circle var(--spotlight-lit-radius)` with `black 0%` → `transparent 100%` and `no-repeat`); assert none of `--spotlight-red-400-`, `--spotlight-stop-mid`, `--spotlight-core-size`, `--spotlight-outer-size` appears. Keep every other existing assertion (structure, registration `mod()`, `overflow: clip`, no blend mode, no literal, media guards, § R36 namespace)
- [x] T030 [P] [US5] **SUPERSEDED by A2 revision 1 (2026-10-15), replaced by T041.** Add a failing assertion to `app/features/shell/ui/SiteFooter.test.ts`: `should paint no surface of its own when rendered` — the `<footer>` element has no class starting with `bg-` (and no inline `background` style)
- [x] T031 [P] [US5] Add regression guards to `app/features/forms/ui/ContactForm.test.ts` and `app/features/forms/ui/ApplicationForm.test.ts`: `should keep its glass card covering the page when rendered` — the form's root element has `bg-glass-dark-contact` and `backdrop-blur-glass-dark`. They pass on arrival; prove each can fail by removing the class locally, then restore it (no change to any `.vue` in `forms`)
- [x] T032 [P] [US5] *(The footer half is SUPERSEDED by A2 revision 1, replaced by T042; the spotlight-stylesheet half stands.)* Update `tests/static-output.test.ts`: in `should still ship the spotlight stylesheet …` replace `--spotlight-outer-size:` with `--spotlight-lit-radius:` and assert the emitted CSS contains no `--spotlight-red-400-`; add `should render the footer without its own background when the page is <route>` for `/es` and `/en/about` (the prerendered `<footer` tag carries no `bg-ink-500` / `bg-` class). Red until T033–T036 and `pnpm generate`

### Implementation

- [x] T033 [US5] Edit `app/assets/css/global.css` `:root` per data-model § 6: delete `--spotlight-red-400-42/-17/-37`, `--spotlight-stop-mid`, `--spotlight-core-size` and their comments; replace `--spotlight-outer-size` and its feature-26 comment with `--spotlight-lit-radius: 7.5rem` plus a comment (Roberto A2-3, 2026-10-14: ≈120 px; rem so it scales with the dot grid; the single number to recalibrate; not in the glow namespace, § R36); set `--dot-paper-lit-color: var(--red-400)` and replace its UNVERIFIED/22.6% comment with the A2-2/A2-S1 reasoning in two or three lines (full red-400 at the hotspot, faded by the mask; partial opacity would render a non-brand maroon; fallback is a `color-mix` of red-400 on this same token). Update the layer-table row for `--layer-spotlight` (no light, red lit dots) and the radar comment that cites `--dot-paper-lit-color` as unresolved. T028 passes
- [x] T034 [US5] Edit `app/shared/ui/CursorSpotlight.vue`: declare `--spotlight-size: calc(2 * var(--spotlight-lit-radius))` on `.cursor-spotlight`; replace every `var(--spotlight-outer-size)` with `var(--spotlight-size)`; delete `background-image`, `background-position`, `background-repeat`, `background-size` and their comment from `.cursor-spotlight__beam`; change both mask declarations to `circle var(--spotlight-lit-radius) at center`. Rewrite the doc comment for A2 (red lit dots, no light, radius token; drop the feature-26 sizing divergence and the two-circles description; keep points 1–3 and "no blend mode"; reword point 1's reason to "near the end of the page, which after A2 includes the footer"); mark the fallback-is-a-length table as measured at the pre-A2 size. Keep no props, no imports, no literal. T029 passes
- [x] T035 [P] [US5] Edit `app/shared/ui/CursorSpotlight.stories.ts` doc comments only: "What to look for" describes red dots within ≈120 px fading to the normal dot, no field, no core, no edge, registration; the UNVERIFIED lit-colour note becomes "red-400, Roberto 2026-10-14 (feature 34, A2)". Story code unchanged unless a token it names was deleted
- [x] T036 [US5] **SUPERSEDED by A2 revision 1 (2026-10-15), reversed by T043.** Edit `app/features/shell/ui/SiteFooter.vue`: remove `class="bg-ink-500"` from `<footer>`; update the doc comment (no surface of its own, sits on the page paper so the dots and the spotlight continue under it: Roberto A2-4, 2026-10-14; diverges from `design-extract.md` § 9.bis's `$ink-500` fill pending Roberto's doc edit; adding a background here hides the effect again). T030 passes
- [x] T037 [US5] *(The footer parts, i.e. `SectionBackdrop.vue`'s sentence and `default.vue`'s footer note, are SUPERSEDED by A2 revision 1 and reversed by T044; the spotlight parts stand.)* Comment sweep (no behaviour change): in `app/layouts/default.vue` correct the background-stack notes that call the spotlight a light / "red blob"; in `app/shared/ui/SectionBackdrop.vue` replace "The only opaque block in the design is the footer, which contributes no glows" with the post-A2 fact (no opaque block remains); then `grep -rn` over `app/`, `tests/`, `.storybook/` for `spotlight-outer-size`, `spotlight-red-400`, `spotlight-core-size`, `spotlight-stop-mid`, `22.6`, and footer "opaque"/"opaco" wording, and fix any stale mention. Nothing under `docs/business/`
- [x] T038 [US5] Run `pnpm check`, `pnpm typecheck`, `pnpm test` (T028–T032 green, every other suite unchanged and green, including `DotGrid`, `SectionGlow`, `useCursorSpotlight`), `pnpm generate`, `pnpm storybook:build`; `git diff --stat` shows no change under `docs/business/`, `i18n/locales/`, `app/features/forms/*.vue` or `app/shared/logic/`; record in `docs/harness/progress/current.md`
- [x] T039 [US5] *(A2 revision 1: run steps 3, 4, 7 and 8 as revised in quickstart § 5; the footer check is T046, OA-9 and the footer ink-300 weak spot are moot.)* Manual, quickstart § 5 steps 1–10 in Chrome, Safari, Firefox on macOS: SC-009, SC-010, SC-011, page does not grow, forms cover, A2-5 conditions, the ink-300 weak spot, and OA-9 screenshots at 1440 and 390 on `/es` and `/es/nosotros`. Record per browser; report OA-9 and any weak-spot finding to the leader for Roberto — **Closed 2026-10-15 by Roberto's acceptance of the visual result ("me encanta cierra la tarea", after local `pnpm dev` review; relayed by the leader). No per-browser matrix reported (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion): UNVERIFIED per browser.**
- [x] T040 [US5] *(The list of six is SUPERSEDED by A2 revision 1: three passages remain, handed over by T047.)* Update `docs/harness/progress/current.md` with T038–T039 results and hand the leader, verbatim from spec § *Amendment A2*, the six `docs/business/` passages Roberto edits himself (design-extract § 9.bis fill; rules § R28 opaque-footer sentence, § R37 spotlight row, § R38 lit-dot value; ui-map § 10 spotlight row and recipe; ui-map § 2 opaque-footer note) and the `.pen` frame `gViAx` divergence. Report anything that looks like a business rule to the leader; write none

### Dependencies (Phase 8)

- Phase 8 runs after Phases 1–7 and is its own commit (plan § *Commit grouping (A2)*, item 4).
- T028, T029, T030, T031, T032 in parallel (all red except T031's guards) → T033 → T034 → {T035, T036} in parallel → T037 → T038 → T039 → T040.
- T033 must precede T034 (the component reads `--spotlight-lit-radius`); T032 turns green only after `pnpm generate` in T038.

---

## Phase 8.1: A2 revision 1 · the footer keeps its flat surface (P1) · folds into the Phase 8 commit

**Source**: spec § *A2 revision 1* (Roberto, 2026-10-15: "me quitaste el fondo del footer flat, eso quiero que esté"), US5 scenarios 3 and 7, FR-026 (revised), FR-028 (revision note), SC-010 (revised); plan § *A2 revision 1*; data-model § 7; quickstart § 5 (revised steps 3, 4, 7, 8).
**Goal**: the footer is `<footer class="bg-ink-500">` exactly as before A2, pinned by tests; it covers the dots and the red lit dots. Everything else of A2 stays.
**Independent test**: quickstart § 5 step 3 (revised).
**Scope note**: edits `app/features/shell/ui/SiteFooter.vue` (+ test), `tests/static-output.test.ts`, and comments in `app/shared/ui/SectionBackdrop.vue`, `app/layouts/default.vue`, `app/shared/ui/CursorSpotlight.vue`. No token, no spotlight CSS, no `forms` file, nothing under `docs/business/`, `i18n/locales/` or `public/` changes.

### Tests (red first)

- [x] T041 [P] [US5] In `app/features/shell/ui/SiteFooter.test.ts`, replace `should paint no surface of its own when rendered` (T030) with `should paint its own flat ink-500 surface when rendered`: the `<footer>` element's classes contain `bg-ink-500`. Comment: Roberto, feature 34 A2 revision 1 (2026-10-15); removing the class is a design change. Fails against today's `<footer>` (no class)
- [x] T042 [P] [US5] In `tests/static-output.test.ts`, replace the `should render the footer without its own background when the page is <route>` loop (T032) with `should render the footer on its own ink-500 surface when the page is <route>` for `/es` and `/en/about`: the prerendered `<footer` tag is defined and its `class` attribute contains `bg-ink-500`. Leave T032's spotlight-stylesheet assertions as they are. Red until T043 and `pnpm generate`

### Implementation

- [x] T043 [US5] Edit `app/features/shell/ui/SiteFooter.vue`: restore `<footer class="bg-ink-500">`; restore the pre-A2 first doc-comment paragraph ("The footer of `design-extract.md` § 9.bis: an ink-500 surface carrying the brand block, four columns and the bottom bar…", from `git show HEAD:app/features/shell/ui/SiteFooter.vue`); replace the A2 "No surface of its own" paragraph with a short note: flat ink-500 is Roberto's decision (feature 34, A2 revision 1, 2026-10-15), it covers the dotted paper and the spotlight's red dots by design, and removing it is a design change, not a fix. T041 passes
- [x] T044 [US5] Comment sweep for the footer (no behaviour change): in `app/shared/ui/SectionBackdrop.vue` restore "The only opaque block in the design is the footer, which contributes no glows (spec A-12)." (file ends with no diff against HEAD); in `app/layouts/default.vue` rewrite the A2 paragraph under the layer table so it names the footer (flat ink-500, A2 revision 1) and the form cards' glass as the surfaces that cover the dots and the spotlight, keeping the other A2 edits (red lit dots, no light, "recolour", "red dots"); in `app/shared/ui/CursorSpotlight.vue` doc-comment point 1 drop "which after A2 includes the footer, now that the footer has no surface of its own" and keep the reason (a beam near the end of the page, under the footer, extends the scrollable height). Then `grep -rn` over `app/`, `tests/`, `.storybook/` for `A2-4`, `no surface of its own`, `No opaque block remains`, `sits on the paper`, `continue under` and fix every stale hit. Nothing under `docs/business/`
- [x] T045 [US5] Run `pnpm check`, `pnpm typecheck`, `pnpm test` (T041–T042 green; `spotlight-red-dots-tokens`, `CursorSpotlight`, form suites unchanged and green), `pnpm generate`, `pnpm storybook:build`. Confirm `git diff HEAD -- app/features/shell/ui/SiteFooter.vue` shows only the doc-comment note (the `class="bg-ink-500"` line is identical to HEAD), `git diff HEAD -- app/shared/ui/SectionBackdrop.vue` is empty, and nothing changed under `docs/business/`, `i18n/locales/`, `public/`, `app/features/forms/*.vue` or `app/shared/logic/`
- [x] T046 [US5] Manual, quickstart § 5 revised step 3 (plus step 7) in Chrome, Safari, Firefox on macOS on `/es` and `/en/about`: the footer is flat ink-500 with no dots or red dots inside it, the effect is cut cleanly at its top edge, and the page does not grow. Record per browser — **Closed 2026-10-15 by Roberto's acceptance of the visual result ("me encanta cierra la tarea", after local `pnpm dev` review; relayed by the leader). No per-browser matrix reported (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion): UNVERIFIED per browser.**
- [x] T047 [US5] Update `docs/harness/progress/current.md` with T045–T046 results and hand the leader, verbatim from spec § *Amendment A2*, the three remaining `docs/business/` passages Roberto edits himself (rules § R37 spotlight row, § R38 lit-dot value; ui-map § 10 spotlight row and recipe) and the `.pen` frame `gViAx` divergence; state that design-extract § 9.bis, rules § R28 and ui-map § 2 no longer need an edit. Report anything that looks like a business rule to the leader; write none

### Dependencies (Phase 8.1)

- Runs after Phase 8's code (T028–T038). T039's remaining manual steps can run before or after; its footer steps are covered by T046.
- T041, T042 in parallel (both red) → T043 → T044 → T045 → T046 → T047.
- T042 turns green only after `pnpm generate` in T045.
