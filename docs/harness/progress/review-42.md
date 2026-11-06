# Review · feature 42 `m1_visual_foundation`

- **Reviewer run:** 2026-11-01, branch `feat/v2-visual-foundation`, uncommitted working tree.
- **Status at review start:** `reviewing` (CONFIRMED in `feature_list.json`).
- **Reviewed against:** `specs/042-m1-visual-foundation/` (all seven documents), the feature-42 acceptance criteria in `feature_list.json`, `docs/harness/CHECKPOINTS.md`, constitution v2.1.0, AGENTS.md § 3.1, and `pen-extract-42.md` §§ 1–9.

## Verdict

**APPROVED**

There are no blocking findings. One should-fix item, S1 (forced-colours boundary), must be resolved before feature 43 or 44 places the buttons or the pill on a live page. The primitives are not on any page yet.

## Findings

### Blocking

None.

### Should fix

**S1 · Buttons and pill lose their boundary in forced-colours mode.**

- **Where:**
  - `app/assets/css/global.css:2606` (`m1-borde-luz`), `:2647`, `:2652`
  - `app/shared/ui/M1PrimaryButton.vue:60`
  - `app/shared/ui/M1Pill.vue:28`
  - `app/shared/ui/M1GlassButton.vue:39`
- **The requirement:** spec § Edge Cases says: "Forced-colours mode: buttons and pills keep a visible boundary and a readable label in system colours."
- **The problem:** implementer deviation 1 replaced the planned CSS borders with the painted `::before` band (`m1-borde-luz`). Forced-colours mode works like this:
  - It drops non-`url()` background images, so it removes the gradient fill and the gradient edges.
  - It forces `background-color` to the system Canvas colour, so the flat `m1-borde-linea` and `m1-borde-btn` bands disappear.
  - Unlike a `border-color`, the band is never repainted in CanvasText.

  As a result, the primary button, glass button and pill have no edge and render as bare text. This is INFERRED from the CSS Color Adjust rules; it was not tested in a browser.
- **Coverage gap:** nothing in `plan.md`, `research.md` or `quickstart.md` covers this edge case, and no test pins it.
- **Suggested fix:** add a boundary that takes no layout space, for example:
  - a `forced-colors:` variant that sets `outline: var(--m1-borde-ancho) solid` with a negative offset, or
  - a transparent outline, which the UA repaints in forced-colours mode.

  Then confirm the result with Chrome DevTools "Emulate forced-colors: active". This keeps the 253 × 55 / 36 measurements intact.

### Advisory

1. **One draw while hidden, and repeated still-frame redraws.** `app/shared/logic/useShaderCanvas.ts:104` and `:149`.
   - `update()` draws one frame whenever it pauses while in view, including the `visibilitychange` that hides the tab. So exactly one frame is drawn at the moment of hiding.
   - Under reduced motion, every re-entry into view and every resize redraws the 12 s still frame. The image is the same each time.
   - This is harmless, and the measured behaviour matches the intent of SC-004 and FR-020. Skipping the draw when `document.hidden` is true would make SC-004 hold literally.
2. **The literal scan misses arbitrary values and inline styles.** `tests/m1-literals.test.ts:41-47`.
   - The scan catches hex, `rgb()` and `px` literals. It does not catch arbitrary Tailwind values (`[…rem]`) or inline `style` lengths. That is how the story frame heights in `app/shared/ui/M1ShaderBackground.stories.ts:40-46` (`62.5rem` and the others, deviation 10) pass. They are story framing, not component values, so this is acceptable.
   - Also, `:63` skips missing files silently. The only guard is "> 0 files scanned", so a renamed file would drop out unnoticed. A fixed expected count would close that gap.
3. **Breakpoint-driven type and padding on the buttons.** `M1PrimaryButton.vue:60` (`SIZE_CLASSES.hero`) and `M1GlassButton.vue:39`.
   - Both switch font size and padding with `lg:`, which Article VII calls "a signal the token is missing".
   - The approved plan's Phase -1 gate and the spec Assumption ("Hero buttons switch at 1024 px") explicitly accept this, and the anchors are exact, so this is not a violation. Note that a 1023 px viewport gets the 178 × 44 mobile button.
4. **`disabled:opacity-70` is a stock Tailwind scale step, not an m1 token.** `M1PrimaryButton.vue:60`, `M1GlassButton.vue:39`. It is not an arbitrary value, so it does not violate Article VII. It could become `--m1-btn-deshabilitado` if 43–46 reuse it.
5. **The "five brand reds" test no longer guards the whole palette.** `tests/spotlight-red-dots-tokens.test.ts:33-46`.
   - It still guards exactly what it guarded before: the five v1 `--red-*` declarations, and `#CF3147` held only by `--red-400`.
   - It no longer means "no new red in the stylesheet", because the m1 palette adds reds by design.
   - FR-002 ("exactly fourteen palette colours") is tested for existence only (`tests/m1-tokens.test.ts:279`), not exclusivity. Optional: assert the full `--m1-*` colour list.
6. **Stale status text.**
   - `docs/harness/progress/current.md:3` still says "(spec phase)".
   - `specs/042-m1-visual-foundation/spec.md:6` still says "Status: Draft".
   - The leader can update both at close-out.
7. **SC-003 is only partly verified.** Clipped text and overlap at 360 / 768 / 1024 / 1280 / 1920 were not machine-checked. The implementer checked horizontal overflow only (report § 4), and I did not open a browser. This needs a by-eye pass in the catalogue before 44 places these primitives. UNVERIFIED.
8. **Caller size overrides on `M1Heading` may not win.** A caller's per-use size class (`class` fallthrough, for the 30/32/34 px mobile overrides) competes with `text-m1-*` by stylesheet order, not by class order. Features 44 and 46 should override with a token utility whose generated rule sorts later, or use a dedicated `size` value. Not a defect in 42.
9. **The first `./init.sh` run failed for an environmental reason.**
   - It exited 1 at `pnpm test` and `pnpm generate` with "Another Nuxt build is already running (PID 80521)". A separate `nuxt generate` held the lock; it was not started by this review.
   - Once no build was running, a rerun exited 0.
   - A stale `nuxt dev` (pid 43034, started 2026-10-31 23:06) is still running. I did not touch it.

## What I verified

### Process (CONFIRMED)

- Status is `reviewing`, and 42 is the only feature in `in_progress`/`reviewing` (C2).
- All 65 tasks in `tasks.md` are `[x]`.
- `plan.md` Phase -1 gates are all `[x]`, and there is no `[NEEDS CLARIFICATION]` in the spec package (C7).
- Q1–Q4 are recorded as confirmed by Roberto 2026-10-31, and the § 9 arrow correction is reflected in the spec, research, contract, tasks, component and test.

### Gate (CONFIRMED)

`./init.sh` exits 0, run by me:

| Command | Result |
|---|---|
| `pnpm typecheck` | OK |
| `pnpm check` | OK, 327 files |
| `pnpm test` | 113 files, 1697 tests, all passed |
| `pnpm generate` | OK |
| `pnpm storybook:build` | OK |

### Constitution (CONFIRMED)

- **No literals in new code.** I grepped the 7 `M1*.vue` files, the stories, the 4 logic files, `shaderFrame.ts` and both presets myself. There are no hex, `rgb()` or `px` literals, no `--bone/ink/red/wine-*` tokens and no v1 utilities. The only literals are the rem story-frame heights in the stories (Advisory 2).
- **No relative imports, no debug prints, no TODOs.** All SFCs use `<script setup lang="ts">`.
- **Component size.** Every `.vue` file is under 200 lines; the largest is `M1PrimaryButton` at 122.
- **Logic in composables.** WebGL, rotation and reduced-motion logic live in `useShaderCanvas`, `useRotatingText` and `useReducedMotion`, with the pure rules in `shaderFrame.ts`.
- **Static only.**
  - `nitro.preset: 'static'`; no `server/` directory.
  - `.output/` holds only `nitro.json` and `public/`.
  - No file in `.output/public` mentions `docs/handoff`.
  - The shaders and posters are `cmp`-identical to the handoff copies, live in `app/assets/`, and `m1-brasa-acero` is not shipped.
- **No Google Fonts in the site.**
  - No `fonts.googleapis.com` or `fonts.gstatic.com` anywhere in `.output/public`, and no font preload was added to `/es/`.
  - Poppins 500 is added to the self-hosted `@nuxt/fonts` set.
  - The only Google Fonts link is the pre-existing Storybook `preview-head.html`, which is catalogue only.
- **i18n.** No user-facing string in any primitive; all copy is props or slots, and parity is green.

### Tokens vs the extract (CONFIRMED by recomputing each clamp)

- **Heading sizes.** Every handoff `tokens.css` variable is present with the same value at 16 px/rem. The two `.pen` overrides are commented. Sizes at the anchors:

  | Token | 390 | 1440 |
  |---|---|---|
  | `--m1-h-hero` | 34 | 96 (not 84) |
  | `--m1-h-seccion` | 28 | 56 |
  | `--m1-h-proceso` | 28 | 52 |
  | `--m1-h-diagnostico` | 34 | 64 |
  | `--m1-p-grande` | 17 | 20 |

- **Line-heights** at 390 and 1440, all exact:

  | Size | Ratio | Px |
  |---|---|---|
  | hero | 1.1 → 1.06 | 37.4 → 101.76 |
  | sección | 1.15 → 1.1 | — |
  | proceso | 1.15 → 1.1 | — |
  | diagnóstico | 1.15 → 1.08 | — |

- **Tracking** is fluid: 0 at 390 (the clamp max) to −3.4992 / −1.96 / −1.82 / −2.24 px at 1440.
- **Service card.** The title is 24 px with −0.6 px tracking. `--m1-radio-servicio` is 1.5rem (24), and `--m1-radio-tarjeta` stays 22.
- **Derived alphas** are correct:
  - pill 60 %, strip 40 %, dot halos 30 % and 12 %
  - edges: panel 25 → 4, card 18 → 4, button 25 → 6, flat 10
  - button border white 20 %, shadow 33 %, panel shadow 67 %
- **Focus ring** is 2 px / 3 px Blanco on `:focus-visible`, as emitted in the Storybook CSS.
- **Emitted utilities.** These 16 utility shorthands are in the built CSS: `bg-(image:…)`, `duration-(…)`, `brightness-(…)`, `scale-(…)`, and `text-m1-hero` with its line-height, tracking and weight 500.

### WebGL lifecycle (CONFIRMED in code and tests)

- **Released on unmount:** both observers disconnected, both listeners removed, rAF cancelled, renderer disposed, `WEBGL_lose_context`, and the media listener removed. The case "unmount before the source loads" is guarded (`disposed`).
- **Reduced motion:** one draw at `STILL_TIME_SECONDS` = 12 and no loop; it is followed live.
- **Poster fallback:** the poster is in the SSR HTML and always in the DOM. The canvas stays at `opacity-0` until the first frame and is `hidden` on fallback, covering no context, compile or link failure, and context lost.
- **DPR cap:** 1× below 768, 1.5× from 768 up, re-applied on resize.
- **Pausing:** pauses off screen (100 px look-ahead) and when the tab is hidden.
- **Root element:** `aria-hidden="true"`, `pointer-events-none`, `print:hidden`.
- **Poster loading:** eager plus `fetchpriority=high` for `homeHero`, `aboutHero`, `faq` and `notFound`; lazy for the rest.
- **Uniforms:** every preset's uniforms match the handoff README table, `u_flip: 1` is everywhere, and `workWithUs` reuses the assessment uniforms and poster.

### Rotating pill (CONFIRMED)

- Item 0 on the server and at mount.
- Rotates every 2600 ms and wraps.
- Holds while the tab is hidden, while hovered (via `pointerenter`/`pointerleave` falling through to `M1Pill`'s single root) and under reduced motion, which is followed live.
- A one-item list starts no interval, and the interval is cleared on unmount.
- A visually hidden `<ul>` lists every item, the animated label is `aria-hidden`, and there is no `aria-live`.

### Tests are behavioural (CONFIRMED)

The composables and the background are tested with fake timers and observer, rAF and WebGL stubs:

- gating, the DPR values, the still-frame time, fallback paths and release on unmount;
- the renderer against a WebGL stub (compile and link failure, uniform caching, dispose);
- the rotating pill's server render, rotation, hover hold and the a11y structure.

There are no snapshot tests.

### Edited v1 tests (CONFIRMED)

Each still guards what it did, with only the colour or canvas target changed:

- `brand-cursor.test.ts`: the SVG fills equal the token value.
- `spotlight-red-dots-tokens.test.ts`: the lit colour, five v1 reds, `#CF3147` in `--red-400` only, the radius, and no glow tokens.
- `static-output.test.ts`:
  - the layout root carries `relative isolate overflow-clip` and the canvas class;
  - `html` holds the canvas token, and the token is reachable;
  - the footer `bg-ink-500` and "one background on html/body" assertions are untouched;
  - Poppins 500 is added to the closed weight set.

### Deviations (§ 2) and edits outside the task list

| Deviation | Verdict |
|---|---|
| 1 · painted band | Sizes are justified, but see S1. |
| 2 · `m1-foco` utility | Emits the same CSS. Fine. |
| 3 · arrow slot | Superseded by § 6: the arrow is now visible at every width, and the test asserts it. |
| 4 · `line-height: normal` | Fine. |
| 5 · extra tokens | Fine. |
| 6 · `--m1-h-seccion` re-anchored | Equal to the handoff at and beyond the anchors. Fine. |
| 7 · two edits outside the task list | Both fine: |
| | `.storybook/preview-head.html` adds Poppins 500 to the catalogue only. It is pre-existing catalogue behaviour, needed so M1 headings render at the right weight. |
| | `vitest.config.ts` adds the `app/shared/utils/**` include. Without it `shaderFrame.test.ts` would never run. |
| 8 · root `bg-m1-negro-950` | Fine. |
| 9 · space text node | Fine. |
| 10 · story heights | Advisory 2. |
| 11, 12 · test techniques | Fine. |

### Live-page effect (CONFIRMED by diff)

- The only live-page diffs are:
  - `html` → `var(--m1-negro-950)`;
  - the layout root `bg-ink-500` → `bg-m1-negro-950`;
  - `--dot-paper-lit-color` → `var(--m1-red-muush-500)`;
  - `public/cursor/you.svg` fills `#CF3147` → `#E5352F`, with geometry unchanged;
  - the Poppins 500 face, which no live page uses yet.
- No M1 primitive or utility is used in `app/features`, `app/pages` or the layout beyond the root class.
- `CursorSpotlight.vue`, `useCursorSpotlight.ts` and `DotGrid.vue` are unchanged.
- The v1 footer keeps Ink 500, as the spec states.
- The other `global.css` additions (m1 `:root`, `@theme inline`, `@utility`, the reduced-motion zeros) have no effect until something uses them.

### Not verified by me

- In-browser pixel measurements (SC-002) and the WebGL runtime checks (SwiftShader, `--disable-webgl`, hidden tab). These are implementer-reported. My token math independently supports the 390 and 1440 anchors.
- VoiceOver, which was not run by anyone.
- Forced-colours rendering (S1).
- Clipped text and overlap at intermediate widths (Advisory 7).
