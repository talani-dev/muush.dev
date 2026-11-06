# Tasks: Muush 1.0 visual foundation (feature 42)

**Input**: `specs/042-m1-visual-foundation/` (spec.md, plan.md, research.md, data-model.md, contracts/components.md, quickstart.md)
**Tests**: required (Constitution Article X, spec FR-030). Within each story, write the tests first and see them fail.
**Branch**: stay on `feat/v2-visual-foundation`. Do not commit unless Roberto asks. No version bump (AGENTS.md § 3.1).

Format: `- [ ] Txxx [P?] [Story?] description with path`. `[P]` = different file, no dependency on an unfinished task.

Ground rules for every task:

- Values come from `data-model.md` and `research.md`, which encode the leader's `.pen` extract. Never take a value from the v1 docs, and never invent one. If a value is missing, stop and ask the leader.
- New files must contain no hex, rgb or px literal and no `--bone-*`, `--ink-*`, `--red-*`, `--wine-*` token or v1 utility (`*-ink-*`, `*-bone-*`, `*-red-*`, `*-wine-*`). Literals are allowed only in `global.css` token declarations, the copied GLSL files, the cursor SVG and the Storybook swatch config.
- Components under 200 lines; logic in composables; imports through `@/shared/…` and `@/assets/…`.
- Test names: `should <expected> when <condition>`.

---

> **Historical log.** The file, token and component names in these tasks are
> the ones used when they were done. The naming reorganization approved by
> Roberto 2026-11-01 renamed them (no version marker); the mapping is in
> `docs/harness/progress/impl_42_naming.md`.

## Phase 1: Setup (assets and catalogue)

- [x] T001 [P] Copy `docs/handoff/muush-1.0/shaders/m1-liston.glsl` and `m1-acanalado.glsl` byte-for-byte to `app/assets/shaders/` (research R8). Do not copy `MuushGradient.astro`, `muush-gradient.js` or any brasa-acero file. Verify with `cmp` against the originals. (Since 2026-11-01 `cmp` reports one deliberate difference, the static grain line — research R8 amendment, spec 043 FR-057.)
- [x] T002 [P] Copy the six posters from `docs/handoff/muush-1.0/posters/*.webp` to `app/assets/backgrounds/` with the same file names (research R8, R9). Leave `docs/handoff/` intact.
- [x] T003 [P] Add `app/assets/icons/arrow-right.svg` (lucide `arrow-right`, ISC licence) following the folder contract in `app/assets/icons/README.md` (square `0 0 24 24` viewBox, `currentColor` stroke, a `<title>`, no size attributes) and add its "Per file" entry to that README.
- [x] T004 [P] Add a `negro: { name: 'Negro 950', value: '#050505' }` option to `parameters.backgrounds.options` in `.storybook/preview.ts`, with a comment that it is the v2 canvas swatch. Do not change the default (`ink`) while v1 stories exist.

---

## Phase 2: Foundational (blocking for US2–US5)

- [x] T005 Write `tests/m1-tokens.test.ts` (research R19): read `app/assets/css/global.css` from disk with comments stripped (pattern of `tests/spotlight-red-dots-tokens.test.ts`). Embed the expected handoff table (every variable in `docs/handoff/muush-1.0/componentes/tokens.css`, with its value) in the test, not by reading `docs/`. Assert each name is declared with the same value at 16 px per rem (normalise `px` ↔ `rem`, case-insensitive hex, whitespace), except `--m1-h-hero` and `--m1-p-grande`, which must equal the `.pen` clamps in data-model § 1.3. Assert the four `--m1-tracking-*` heading tokens equal the fluid clamps of research R4 and evaluate to 0 at 390 px and to −3.5 / −1.96 / −1.82 / −2.24 px at 1440 px (evaluate the `rem + vw` expression numerically). Assert `--m1-h-servicio` is 1.5rem and `--m1-tracking-servicio` −0.0375rem, and `--m1-radio-servicio` is 1.5rem (24 px). Assert each `@theme` alias family listed in research R2 exists (`--color-m1-*` for all 14 palette colours and the text-alpha tokens, `--font-m1-titulo`, `--font-m1-texto`, `--text-m1-hero`, `--text-m1-seccion`, `--text-m1-proceso`, `--text-m1-diagnostico`, `--text-m1-servicio`, `--radius-m1-*`, `--spacing-m1-gutter`, `--blur-m1-vidrio`, `--shadow-m1-boton`, `--shadow-m1-vidrio`, `--ease-m1`, `--container-m1-max`). Assert no `@import` of `fonts.googleapis.com`. Assert `#CF3147` is held by `--red-400` only (no m1 token for it). Assert the reduced-motion block sets `--m1-rapido`, `--m1-medio`, `--m1-lento` to `0ms`. Run it: it must fail.
- [x] T006 Add the "Muush 1.0" `:root` block to `app/assets/css/global.css`, after the v1 `:root`, with every token of data-model §§ 1.1–1.4 in `rem`. Keep the handoff names and values. Put a comment on `--m1-h-hero` and `--m1-p-grande` citing pen extract § 4 and `rules.md` § R32 as `.pen` overrides, and a header comment naming the three sources, the rule that new code must not use v1 tokens, and that heading tracking is fluid, 0 at 390 to the 1440 px value (pen extract § 8, Clarifications Q2 resolved).
- [x] T007 Add `--m1-rapido: 0ms; --m1-medio: 0ms; --m1-lento: 0ms;` to the existing `@media (prefers-reduced-motion: reduce) { :root { … } }` block in `app/assets/css/global.css`.
- [x] T008 Add an m1 `@theme inline` block to `app/assets/css/global.css` after the v1 one, mapping every token per data-model §§ 1.1–1.4 and research R2: `--color-m1-*`, `--font-m1-*`, `--text-m1-*` with `--line-height`, `--letter-spacing` and `--font-weight` sub-properties, `--radius-m1-*`, `--spacing-m1-*`, `--blur-m1-*`, `--shadow-m1-*`, `--ease-m1`, `--container-m1-max`. Durations and gradients stay in `:root` only.
- [x] T009 Add the edge utilities of research R6 to `app/assets/css/global.css`: `@utility m1-borde-luz` (the `::before` mask-composite ring, `padding: var(--m1-borde-ancho)`, `border-radius: inherit`, `pointer-events: none`, `-webkit-mask-composite: xor` fallback) and `m1-borde-panel`, `m1-borde-tarjeta`, `m1-borde-boton`, `m1-borde-plano`, each setting `--m1-borde` to its gradient token. Comment why `border-image` was rejected.
- [x] T010 Run `pnpm test tests/m1-tokens.test.ts` (it must pass), then `pnpm generate` and grep `.output/public/_nuxt/*.css` for `bg-m1-negro-950`-style output of one sample per namespace plus `duration-(--m1-rapido)` and `bg-(image:--m1-btn-fondo)` in a scratch usage (research R2 UNVERIFIED item). Record the result as a comment next to the `@theme` block. If either shorthand is not emitted, note it in `docs/harness/findings.md` and use scoped-style `var()` instead in later tasks.
- [x] T011 [P] Write `app/shared/logic/useReducedMotion.test.ts`, then implement `app/shared/logic/useReducedMotion.ts` (research R13, contract § 8): a readonly ref following `(prefers-reduced-motion: reduce)` live, `false` on the server, listener removed on unmount. Cover: initial true/false, live change, listener removal.
- [x] T012 [P] Write `tests/m1-literals.test.ts` (research R19): for every `app/shared/ui/M1*.vue`, `app/shared/logic/use{ReducedMotion,RotatingText,ShaderCanvas}.ts`, `app/shared/logic/shaderRenderer.ts`, `app/shared/data/{glass,background}Presets.ts`, assert no `#[0-9a-f]{3,8}\b`, no `rgba?\(`, no `\d+(\.\d+)?px`, no `--(bone|ink|red|wine)-`, and no class token matching `\b[\w:-]*-(bone|ink|red|wine)-\d`. The test must skip files that do not exist yet and fail once any listed file contains a match.

**Checkpoint**: tokens compile and are tested; the shared reduced-motion composable exists.

---

## Phase 3: User Story 1 — One token vocabulary (P1) 🎯 MVP

**Goal**: builders can use every Kit value as a token and utility; the page canvas is Negro 950; Poppins 500 ships.
**Independent test**: `tests/m1-tokens.test.ts` and the updated `tests/static-output.test.ts` pass; the Tokens story matches pen extract § 1 and § 4.

- [x] T013 [US1] In `tests/static-output.test.ts`: change the canvas assertion (~line 622) to `background-color:\s*var\(--m1-negro-950\)` and the token check to `--m1-negro-950:\s*#050505`; change both layout-root regexes (~lines 246 and 652) from `bg-ink-500` to `bg-m1-negro-950`; add `{ family: 'Poppins', weight: 500 }` to `BRAND_FONT_WEIGHTS` (~line 1670). Leave the footer `bg-ink-500` assertion (~line 312) and the "exactly one background on html/body" assertion unchanged. Run: they must fail.
- [x] T014 [US1] In `app/assets/css/global.css`, change the `html` rule to `background-color: var(--m1-negro-950)` and rewrite its comment (v2 canvas, must match the layout root, footer still Ink 500 until 43). Do not add a `body` background.
- [x] T015 [US1] In `app/layouts/default.vue`, replace `bg-ink-500` with `bg-m1-negro-950` on the root `<div>` and update the doc comment's layer table ("Negro 950 base", feature 42). No other change to the layout.
- [x] T016 [US1] In `nuxt.config.ts`, set the Poppins family to `weights: [500, 600]` and rewrite the fonts comment: v2 uses Poppins 500 for headings, logo and wordmark (Constitution VII); 600 stays for v1 components until feature 47; still build-time self-hosted, no `@import`.
- [x] T017 [P] [US1] Create `app/shared/ui/m1-tokens.stories.ts` (title `Shared/UI/M1/Tokens`, `globals.backgrounds.value: 'negro'`): palette swatches with name and token, text-alpha swatches, the four heading sizes and text sizes rendered with `text-m1-*` utilities (sample copy "Hablamos negocio / y código." and "We speak business / and code."), radii and blur samples, with `Mobile390` and `Desktop1440` stories via `globals.viewport`.
- [x] T018 [US1] Run `pnpm generate` then `pnpm test`; confirm T013's assertions pass and the quickstart grep commands for fonts, canvas, `docs/handoff` and `.output/server` give the expected results.

**Checkpoint**: US1 complete and demonstrable on its own.

---

## Phase 4: User Story 2 — Primitives that match the Kit (P1)

**Goal**: glass surface, pill, primary button, glass button and two-tone heading match pen extract §§ 2–4 at 390 and 1440.
**Independent test**: component tests pass; stories measured per quickstart §§ 2–6.
**Depends on**: Phase 2 and US1 (tokens).

- [x] T019 [P] [US2] Create `app/shared/data/glassPresets.ts` (data-model § 2): the `GlassStyle` types, `GLASS_PRESETS` (`panel`, `servicio`, `franja`) and `GLASS_CLASSES`, a lookup from each style value to complete static Tailwind class strings (`bg-m1-vidrio-fondo`, `bg-m1-negro-900`, `bg-m1-franja-fondo`, `rounded-m1-panel` / `-servicio` / `-franja`, `backdrop-blur-m1-vidrio` / `-boton`, `shadow-m1-vidrio`, `m1-borde-luz m1-borde-panel` / `-tarjeta` / `-plano`, `p-m1-panel`, `py-m1-franja-y px-m1-franja-x`, `overflow-clip`).
- [x] T020 [P] [US2] Write `app/shared/ui/M1GlassSurface.test.ts`: each preset renders exactly its class set; an override prop replaces only its field; `as` sets the root tag; slot content renders; defaults to `panel` with no props.
- [x] T021 [US2] Implement `app/shared/ui/M1GlassSurface.vue` per contract § 1, reading `GLASS_PRESETS` and `GLASS_CLASSES` (merge logic in a small `computed`; no inline literals). Make T020 pass.
- [x] T022 [P] [US2] Create `app/shared/ui/M1GlassSurface.stories.ts` (`Shared/UI/M1/GlassSurface`, negro background): one story per preset with ES and EN sample content from `muush-1.0.md` § 4 (form panel with field placeholders as plain text, service card "Estrategia tecnológica" / "Technology strategy", strip "TAMBIÉN, SI LO NECESITAS" / "ALSO, IF YOU NEED IT"), a story with the three presets side by side on the Negro 950 canvas, and `Mobile390` / `Desktop1440` variants.
- [x] T023 [P] [US2] Write `app/shared/ui/M1Pill.test.ts`: renders `label`; the default slot replaces the label; the dot is `aria-hidden` and has three rings; root is a `div` with the pill classes (`bg-m1-pill-fondo`, `rounded-m1-pill`, `backdrop-blur-m1-pill`, `text-m1-pill`, the border token class).
- [x] T024 [US2] Implement `app/shared/ui/M1Pill.vue` per FR-011 and contract § 2: padding/gap/dot sizes from `--spacing-m1-pill-*`, rings from `--color-m1-punto-halo2`, `--color-m1-punto-halo`, `--color-m1-red-muush-500`, 1 px `border-m1-linea`, Blanco text. Height 36 at both anchors. Make T023 pass.
- [x] T025 [P] [US2] Create `app/shared/ui/M1Pill.stories.ts`: `Es` ("Estrategia tecnológica"), `En` ("Technology strategy"), a long-label story, `Mobile390`, `Desktop1440`.
- [x] T026 [P] [US2] Write `app/shared/ui/M1PrimaryButton.test.ts`: `to` → `NuxtLink` (stubbed), `href` → `<a>`, neither → `<button type>`; `size` `hero` / `nav` / `block` class sets (hero includes the `lg:` desktop metrics and shows the 20 px icon at every width — corrected 2026-11-01, pen extract § 9); `icon=false` removes the icon; icon wrapper is `aria-hidden`; `disabled` sets the attribute and the disabled classes; the label is the accessible name; the focus-visible ring classes are present.
- [x] T027 [US2] Implement `app/shared/ui/M1PrimaryButton.vue` per FR-012, contract § 4 and research R15: fill `bg-(image:--m1-btn-fondo)` (or the T010 fallback), border `border-m1-btn-borde`, `shadow-m1-boton`, `rounded-m1-pill`, Instrument Sans 600 Blanco; size classes from a static lookup; arrow from `@/assets/icons/arrow-right.svg?raw` in an `aria-hidden` wrapper sized by a `:deep(svg)` rule (20 / 16 via tokens); hover `brightness` 1.06, active scale .98 with `duration-(--m1-rapido) ease-m1`; disabled 70 % and `cursor-progress`; `focus-visible` outline from `--m1-foco-ancho`, `--m1-blanco`, `--m1-foco-separacion` (Clarifications Q3). Make T026 pass.
- [x] T028 [P] [US2] Create `app/shared/ui/M1PrimaryButton.stories.ts`: `HeroEs` / `HeroEn` ("Diagnóstico gratis" / "Free assessment"), `Nav`, `Block` ("Quiero mi diagnóstico" / "Get my assessment"), `Disabled` ("Enviando…" / "Sending…"), each with `Mobile390` and `Desktop1440` variants.
- [x] T029 [P] [US2] Write `app/shared/ui/M1GlassButton.test.ts`: link/button rendering as in T026; mobile and `lg:` metric classes; no icon; edge classes `m1-borde-luz m1-borde-boton`; fill `bg-m1-btn2-fondo`; `backdrop-blur-m1-boton`; focus ring classes.
- [x] T030 [US2] Implement `app/shared/ui/M1GlassButton.vue` per FR-013 and contract § 5. Make T029 pass.
- [x] T031 [P] [US2] Create `app/shared/ui/M1GlassButton.stories.ts`: `Es` ("Cómo trabajamos"), `En` ("How we work"), and both side by side with the primary button as the hero pair, at `Mobile390` and `Desktop1440`.
- [x] T032 [P] [US2] Write `app/shared/ui/M1Heading.test.ts`: `level` picks `h1`–`h3`; `size` picks `text-m1-hero` / `-seccion` / `-proceso` / `-diagnostico`; a `class` passed by the caller (a per-use size override, as 44/46 will need for 30/32/34 px mobile headings) reaches the heading element; `font-m1-titulo`; line 1 `text-m1-blanco`, line 2 `text-m1-gris-400`, both `block`; without `second` only one span renders; the heading's text content is both lines in order.
- [x] T033 [US2] Implement `app/shared/ui/M1Heading.vue` per FR-014 and contract § 6. Make T032 pass.
- [x] T034 [P] [US2] Create `app/shared/ui/M1Heading.stories.ts`: hero ("Hablamos negocio / y código." · "We speak business / and code."), seccion ("Lo que hacemos / por tu negocio." · "What we do / for your business."), proceso ("Primero entendemos tu operación, / después decidimos qué se construye." · EN), diagnostico ("Pide tu diagnóstico / sin costo." · "Request your / free assessment."), each at `Mobile390` and `Desktop1440`.
- [x] T035 [US2] Run `pnpm test`, `pnpm check`, `pnpm typecheck` and `pnpm storybook:build`; then measure the stories per quickstart §§ 2–6 at 390 and 1440 (SC-002) and at 360 / 768 / 1024 / 1280 / 1920 (SC-003). Record measured sizes in `docs/harness/progress/current.md`.

**Checkpoint**: US2 complete; primitives reviewable in the catalogue.

---

## Phase 5: User Story 3 — Living section backgrounds (P1)

**Goal**: `M1ShaderBackground` draws the listón or acanalado per preset, with every fallback and pause rule.
**Independent test**: unit tests for helpers, renderer and composable; per-preset stories checked per quickstart § 8.
**Depends on**: Phase 1 (T001, T002), Phase 2 (T011), US1 tokens.

- [x] T036 [P] [US3] Write `app/shared/utils/shaderFrame.test.ts` (contract § 8): `capPixelRatio` (dpr 3 at 767 → 1; at 768 → 1.5; dpr 1 at 1440 → 1; dpr 0/undefined → 1), `canvasPixelSize` (rounds, minimum 1), `shouldAnimate` (all eight combinations), `withShaderDefaults` (adds `u_speed 1`, `u_flip 1`, `u_grain 0.07`; preset values win).
- [x] T037 [US3] Implement `app/shared/utils/shaderFrame.ts` with the named constants of contract § 8. Make T036 pass.
- [x] T038 [P] [US3] Write `app/shared/logic/shaderRenderer.test.ts` against a hand-written minimal `WebGLRenderingContext` stub: returns `null` when vertex or fragment compile fails or link fails (no throw); on success creates the full-screen triangle buffer once, caches uniform locations, sets `u_res` and `u_time`, sets each provided uniform with `uniform1f`, skips uniforms the program does not declare, calls `drawArrays(TRIANGLES, 0, 3)`; `dispose()` deletes program, shaders and buffer.
- [x] T039 [US3] Implement `app/shared/logic/shaderRenderer.ts` (research R7), translating `#build`, `#u` and `#draw` from the handoff into functions of ≤ ~30 lines; the vertex source is a named constant. Make T038 pass.
- [x] T040 [P] [US3] Create `app/shared/data/backgroundPresets.ts` (data-model § 3, research R9): import the six posters from `@/assets/backgrounds/…`, define the seven presets with their uniforms (each including `u_flip: 1`) and priority, and `SHADER_SOURCES` with dynamic `import('@/assets/shaders/m1-liston.glsl?raw')` / `…acanalado…`.
- [x] T041 [P] [US3] Write `app/shared/data/backgroundPresets.test.ts`: seven presets exist; each shader is `liston` or `acanalado`; each has `u_flip: 1`; every uniform name is declared as `uniform float <name>` in its shader file (read `app/assets/shaders/*.glsl` from disk); `workWithUs` uniforms equal `assessment`'s; `homeHero`, `aboutHero`, `faq` and `notFound` are `high`, the rest `lazy`; uniform values equal research R9.
- [x] T042 [US3] Write `app/shared/logic/useShaderCanvas.test.ts` (mount a host component in happy-dom): with `getContext` returning `null`, `isFallback` becomes true and `isReady` stays false; with a stubbed context and observers (mock `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame`, `matchMedia`): no loop before intersecting; loop starts when visible, stops on `visibilitychange` to hidden and when not intersecting, resumes after; under reduced motion exactly one draw at `STILL_TIME_SECONDS` and no loop; `isReady` true after the first draw; `webglcontextlost` sets `isFallback`; DPR cap applied to `canvas.width` on resize at 767 and 1440; unmount disconnects both observers, removes the listeners, cancels the frame and calls `loseContext`.
- [x] T043 [US3] Implement `app/shared/logic/useShaderCanvas.ts` per research R7, R10, R11 and data-model § 4, using `useReducedMotion`, `shaderRenderer`, `shaderFrame` and `SHADER_SOURCES`. All work starts in `onMounted`; everything is released in `onBeforeUnmount`. Make T042 pass.
- [x] T044 [P] [US3] Write `app/shared/ui/M1ShaderBackground.test.ts` (composable stubbed): root has `aria-hidden="true"`, `pointer-events-none`, `absolute inset-0`, `print:hidden`; the poster `<img>` has `alt=""` and the preset's `src`, `loading="eager"` and `fetchpriority="high"` for high presets and `loading="lazy"` otherwise; the canvas is transparent until `isReady`, visible after, and hidden on `isFallback`; the server render (`renderToString`) contains the poster.
- [x] T045 [US3] Implement `app/shared/ui/M1ShaderBackground.vue` per contract § 7 and research R11 (canvas fade with `duration-(--m1-medio) ease-m1`; `object-cover` poster; no `<ClientOnly>`). Make T044 pass.
- [x] T046 [P] [US3] Create `app/shared/ui/M1ShaderBackground.stories.ts`: one story per preset, each inside a `relative isolate` section of the README height (hero 1000, Nosotros hero 820, Preguntas 1100, 404 760; others a viewport height) with an `M1Heading` and button pair on top in ES, plus an EN story for `homeHero`; `Mobile390` and `Desktop1440` variants; a "scroll away" story with two backgrounds stacked to check independent pausing.
- [x] T047 [US3] Run the background checks of quickstart § 8 in `pnpm storybook` (pause offscreen and hidden tab, reduced motion, WebGL disabled, JavaScript disabled, DPR at 767 / 1440, click-through, accessibility tree). Record the results in `docs/harness/progress/current.md`.

**Checkpoint**: US3 complete; backgrounds ready for 44–46 to place.

---

## Phase 6: User Story 4 — Rotating pill (P2)

**Goal**: the hero pill rotates every 2.6 s, pauses on hover and hidden tab, stops under reduced motion, and reads well with a screen reader.
**Independent test**: composable and component tests with fake timers; story checked with VoiceOver.
**Depends on**: US2 (T024 `M1Pill`), Phase 2 (T011).

- [x] T048 [P] [US4] Write `app/shared/logic/useRotatingText.test.ts` with fake timers: index 0 before and at mount; advances every `ROTATION_INTERVAL_MS` and wraps; no advance while `document.hidden`, while `paused` is true, or under reduced motion; no interval with fewer than two items; the interval is cleared on unmount; `current` follows `index`.
- [x] T049 [US4] Implement `app/shared/logic/useRotatingText.ts` per research R12 and contract § 8. Make T048 pass.
- [x] T050 [US4] Add assertions to `tests/m1-tokens.test.ts` that `app/assets/css/global.css` declares `--m1-pill-salida: 220ms`, `--m1-pill-entrada: 260ms` and `--m1-pill-desliz: 0.375rem` (added in T006, data-model § 1.4). They are not zeroed under reduced motion: reduced motion stops the rotation itself (`useRotatingText`).
- [x] T051 [P] [US4] Write `app/shared/ui/M1RotatingPill.test.ts`: renders the first item on the server; a visually hidden `<ul>` lists every item once; the visible label is `aria-hidden`; there is no `aria-live` anywhere; `pointerenter` / `pointerleave` toggle `paused`; the label changes after the interval with motion allowed (composable real, fake timers).
- [x] T052 [US4] Implement `app/shared/ui/M1RotatingPill.vue` per contract § 3: `M1Pill` default slot, `<Transition mode="out-in">` keyed on the index, enter/leave classes in a scoped `<style>` reading `--m1-pill-salida`, `--m1-pill-entrada`, `--m1-pill-desliz` (ease-in out, ease-out in). Make T051 pass.
- [x] T053 [P] [US4] Create `app/shared/ui/M1RotatingPill.stories.ts`: `Es` with "Estrategia tecnológica · Software, web y nube · Automatización, datos e IA · Diseño de producto y UX", `En` with "Technology strategy · Software, web and cloud · Automation, data and AI · Product design and UX", a single-item story, `Mobile390`, `Desktop1440`.
- [x] T054 [US4] Check the story per quickstart § 7 (2.6 s cadence, hover pause, reduced motion after reload, VoiceOver reads the four items once and nothing during 30 s, SC-008). Record in `docs/harness/progress/current.md`.

**Checkpoint**: US4 complete.

---

## Phase 7: User Story 5 — Cursor and spotlight on dark (P2)

**Goal**: same cursor and spotlight behaviour, in Red muush 500, over Negro 950.
**Independent test**: existing cursor and spotlight tests pass with only the pinned colours changed.
**Depends on**: US1 (T006 defines `--m1-red-muush-500`; T014–T015 canvas).

- [x] T055 [US5] In `tests/spotlight-red-dots-tokens.test.ts`, change the expected `--dot-paper-lit-color` to `var(--m1-red-muush-500)` and update that test's description and comment to cite feature 42. Keep every other assertion. Run: it must fail.
- [x] T056 [US5] In `tests/brand-cursor.test.ts`, make the colour helper read `--m1-red-muush-500` instead of `--red-400` (~line 42) and update the comment. Keep every other assertion (size, hotspot, fallbacks, I-beam, forced colours, emitted URL). Run: it must fail.
- [x] T057 [US5] In `app/assets/css/global.css`, set `--dot-paper-lit-color: var(--m1-red-muush-500)` and update its comment (feature 42, Clarifications Q1/FR-027; radius and conditions unchanged).
- [x] T058 [US5] In `public/cursor/you.svg`, replace the three `#CF3147` occurrences with `#E5352F` and update the file's comment (feature 42 recolour to Red muush 500; geometry, size and hotspot unchanged). Make T055 and T056 pass.
- [x] T059 [US5] Confirm `CursorSpotlight.vue`, `useCursorSpotlight.ts`, `DotGrid.vue` and the cursor rules in `global.css` are unchanged (`git diff --stat`), then check on `pnpm generate` + `npx serve .output/public`, at `/es/`, `/en/`, `/es/nosotros`, `/en/about`: cursor, I-beam in fields, red dots near the pointer, no spotlight with reduced motion. Record in `docs/harness/progress/current.md`.

**Checkpoint**: all five stories complete.

---

## Phase 8: Polish and cross-cutting

- [x] T060 Run `pnpm test tests/m1-literals.test.ts` against the finished files and fix any hit (SC-007).
- [x] T061 [P] Check every new `.vue` file is under 200 lines and every new function about 30 lines or fewer (Article V, VIII); split if not.
- [x] T062 [P] Run `pnpm check:fix` and then `pnpm check`, `pnpm typecheck`.
- [x] T063 Run the full gate: `pnpm test`, `pnpm generate`, `pnpm storybook:build`, `./init.sh` (FR-032), plus the quickstart "Automated" greps against `.output/public`.
- [x] T064 Walk the "Live pages" section of `quickstart.md` and confirm the spec's "What changes visually on the live pages after 42" list is exactly what is observed (canvas Negro 950, footer Ink 500 band, red shift on cursor and dots, nothing else).
- [x] T065 Update `docs/harness/progress/current.md` with the results, measured sizes and any deviation, and list the provisional gate answers (Clarifications Q1–Q4) whose confirmation by Roberto is still pending.

---

## Dependencies and execution order

- **Phase 1** (T001–T004): no dependencies, all parallel.
- **Phase 2** (T005–T012): T005 → T006 → T007 → T008 → T009 → T010 sequential (same file); T011 and T012 parallel with them.
- **US1** (T013–T018): after Phase 2. MVP.
- **US2** (T019–T035): after US1. Within it, each test task precedes its component; the five component tracks (glass surface, pill, primary button, glass button, heading) are mutually parallel.
- **US3** (T036–T047): after Phase 1 and Phase 2; independent of US2 except that its stories use `M1Heading` and the buttons (T046 after T033, T027, T030).
- **US4** (T048–T054): after T024 (`M1Pill`) and T011.
- **US5** (T055–T059): after T006 and T014–T015; independent of US2–US4.
- **Polish** (T060–T065): last.

```
Setup ─┬─ Foundational ── US1 ─┬─ US2 ──┬─ US4
       │                       ├─ US3 ◄─┘ (stories only)
       └───────────────────────┴─ US5
                                      └─ Polish
```

## Parallel examples

- Setup: T001, T002, T003, T004 together.
- US2: T019, T020, T023, T026, T029, T032 together; then the implementations; then T022, T025, T028, T031, T034 together.
- US3: T036, T038, T040, T041 together.
- US4 and US5 can run side by side once US1 and T024 are done.

## Implementation strategy

1. **MVP = Setup + Foundational + US1**: the token vocabulary and the Negro 950 canvas, verifiable with tests and the Tokens story.
2. Add US2 (static primitives), then US3 (backgrounds), then US4 and US5.
3. Stop at each checkpoint, run the story's independent test, and record it in `docs/harness/progress/current.md`.
4. The feature goes to `reviewing` only after T063 is green; the reviewer checks every Phase -1 gate in `plan.md`.
