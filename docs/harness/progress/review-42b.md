# Review 42b · feature 42 `m1_visual_foundation` (full re-review after the S1 fix and the naming reorganization)

- **Reviewer run:** 2026-11-01, fresh reviewer, branch `feat/v2-visual-foundation`, nothing committed (25 staged `git mv` renames, the rest unstaged or untracked).
- **Status at review start:** `reviewing` (CONFIRMED in `feature_list.json`; 42 is the only active feature).
- **Reviewed against:** `specs/042-m1-visual-foundation/` (it carries the 2026-11-01 naming note in spec, plan, data-model, research, tasks, contracts and quickstart), the 12 acceptance items of feature 42 including the new first item, `docs/harness/CHECKPOINTS.md` C1–C8, constitution v2.1.1, AGENTS.md § 3.1, and `pen-extract-42.md` §§ 1–9.

## Verdict

**APPROVED**

There are no blocking findings. One should-fix item is a one-line stale comment. The advisories can wait for features 43–47.

## Findings

### Blocking

None.

### Should fix

**S1 · The cursor asset's comment still names the old prefixed token.** `public/cursor/you.svg:2`
- The comment reads "… to Red muush 500 #E5352F, the m1-red-muush-500 design token …". That token no longer exists; it is now `--red-muush-500`.
- Acceptance item 1's grep (`app tests .storybook`) does not cover `public/`, so the stale marker slipped through. It is a comment, not a name, and it has no runtime effect. The fix is to change the comment only. The fills and geometry must stay as they are, because `tests/brand-cursor.test.ts` pins them.

### Advisory

1. **A rejected shader import becomes an unhandled promise rejection.** `app/shared/logic/useShaderCanvas.ts:85` and `:202`.
   - `start()` awaits `SHADER_SOURCES[...]()`, which is a dynamic chunk import, and is called as `void controller.start()`.
   - If the chunk fails to load (offline, or a stale chunk after a deploy), the rejection goes unhandled and `isFallback` never becomes true.
   - The poster still shows, because it is always in the DOM and the canvas stays at `opacity-0`. So FR-021 holds visually, but the state is wrong and the console logs an error.
   - Suggested fix: wrap the import in `try`/`catch` and call `fallBack()`.
2. **`GlassButton` declares an unused prop.** `app/shared/ui/GlassButton.vue:26`: `size?: 'hero'` is declared but never destructured or used. It is harmless.
3. **Two comments still describe the old canvas.** `app/assets/css/global.css:138` and `:143` (the Spanish layer table) still say the layout "pinta la base ink-500". The new block at `:990` and `app/layouts/default.vue:29` say Negro 950.
4. **`current.md` is still stale** (carried over from review-42, advisory 6). `docs/harness/progress/current.md:3` still says "(spec phase)". `spec.md:6` is now fixed. This is the leader's file.
5. **Shared components that are not quarantined still use v1 utilities.**
   - `SocialIcon` uses `bg-glass-dark` and `rounded-icon`; `Lockup` and `Wordmark` use `text-bone-100` and `text-red-400`.
   - They are not v2 code and were not written by this feature, so this does not break the "new code must not use v1" rule. They are, however, v1-styled code outside `legacy/`, and feature 43 must decide them. See the assessment below.
6. **The footer seam on live pages** (spec-accepted, INFERRED, not seen in a browser).
   - `SiteFooter` keeps the flat `bg-ink-500` (#262626) on purpose (spec, feature 34 A2).
   - On the new #050505 canvas the footer will read as a lighter band. This is a consequence of the approved canvas change, not a new change. Feature 43 replaces the footer.
7. **Items carried over from review-42 and still unverified:**
   - Clipped text and overlap at 360/768/1024/1280/1920 (SC-003) were not machine-checked.
   - Forced-colours mode is verified only in the emitted CSS, not in an emulated browser.
   - The hero buttons still switch padding and size at `lg` (accepted in plan Phase -1).
8. **v1 keys that were not renamed.**
   - Only the colliding v1 keys became `legacy-*`. The non-colliding v1 pill keys `--spacing-pill-start/-end` (`ps-pill-start pe-pill-end` in `legacy/Pill.vue`) keep their names, and so does `--radius-panel-sm`.
   - This is correct under the rule and documented, but feature 47 must delete v1 by consumer and family, not by grepping `legacy-`.

## Part B · the reorganization

### What I checked (CONFIRMED)

- **`grep -rniE "m1" app tests .storybook`.** Every hit is justified:
  - `global.css:782,784` cite the `.pen` variables `m1-red-400` and `$m1-brasa-500` in comments.
  - `gl.uniform1f` (WebGL API) appears in `shaderRenderer.ts` and its test.
  - `'M1'` in `countryOptions.test.ts:17` is a pre-existing invalid country code.
  - The other hits are SVG path data (`m12`, `M13…`).
  - No file name under `app`, `tests`, `.storybook` or `public` contains `m1`.
  - The built site CSS contains no `m1` identifier, and no Storybook title does.
- **v1 file diffs (all 25 staged renames and the 41+ edited v1 files).**
  - The staged renames are pure moves (0 insertions, 0 deletions).
  - I read every changed line in `app/features/**`, `app/shared/ui/legacy/**` and `DotGrid.stories.ts`. Each one is one of:
    - an import path (`@/shared/ui/X.vue` → `@/shared/ui/legacy/X.vue`);
    - a story title (`→ Legacy v1/…`);
    - a class rename (`rounded-control`/`rounded-panel`/`gap-pill-gap`/`py-pill-y`/`text-pill` → `legacy-*`);
    - a comment or test-string rename;
    - or Biome re-wrapping.
  - There is **no logic change** in any v1 file.
- **Values are unchanged.** In `global.css`, every removed declaration reappears under its `legacy-*` name with an identical value:
  - `--text-legacy-pill`: `clamp(0.75rem, 0.7268rem + 0.0952vw, 0.8125rem)`, line-height 1.2, letter-spacing 0.054em, weight 500;
  - `--spacing-legacy-pill-y`: 0.5625rem;
  - `--spacing-legacy-pill-gap`: 0.6875rem;
  - `--radius-legacy-panel`: `clamp(1.125rem, …, 1.375rem)`;
  - `--radius-legacy-control`: 0.75rem.

  So v1 sections render as before. The only exceptions are the approved canvas and accent changes.
- **No v1 consumer was missed.** A grep of `app`, `tests` and `.storybook` for any remaining v1 use of a colliding name finds none outside v2 files and `global.css` declarations.
- **No key collisions.**
  - No `@theme` key is declared twice across the two `@theme inline` blocks.
  - No v1/v2 stem overlap exists in the `radius/spacing/text/color/blur/shadow/container/ease/font` namespaces (scripted comparison).
  - The only duplicated `:root` names are the expected reduced-motion overrides (`--rapido/--medio/--lento`), the `--borde` hook inside utilities, and the pre-existing `--services-float-*`.
- **Storybook titles.**
  - All 44 titles in the source and in the built `storybook-static/index.json` are unique.
  - `storySort` puts `Foundations`, then `Shared/UI`, then `*`, with `Legacy v1/` last (and inside it `Foundations`, `Shared`, `*`). That order is sensible.
  - The "duplicates" `Contact/Contacto` and the others are footer-column fixture `title` props, not Storybook titles. The implementer is correct.
- **Isolation.**
  - No v2 file imports `legacy/`, and no live page imports a v2 primitive.
  - The only v2 utility on a live page is `bg-negro-950` on the layout root.
  - Relative imports exist only inside `legacy/` (same directory: `Pill` → `./Radar`, `HeroStack` → `./Pill`), so Article XII holds.

### Assessment of the implementer's choices

| Choice | Assessment |
|---|---|
| `DotGrid` kept in `app/shared/ui/` | **Agree.** Roberto kept the spotlight and accepted it "on plain black", and `CursorSpotlight` is defined as recolouring `DotGrid`'s dots on the same grid, which the layout mounts. Quarantining it would quarantine a dependency of kept code. Roberto should still confirm in 43 that the dotted paper stays under v2. |
| `SocialIcon` kept | **Acceptable.** Its function (the glyph map for the networks v2 keeps) is neutral. Its 48 px dark-glass box is v1 styling. Feature 43 should restyle it or move it (Advisory 5). |
| Eighth collision `--text-pill--line-height` | **Correct and important.** Without it, v1's `line-height: 1.2` would have leaked into the v2 `text-pill` utility, which declares none, and changed the v2 pill's 36 px height. The built CSS confirms that `.text-pill` has no line-height and `.text-legacy-pill` keeps 1.2. |
| `--fuente-titulo` / `--fuente-texto` | **Correct.** Unprefixed, they would be the `--font-*` theme keys themselves, and the alias would reference itself. Utilities stay `font-titulo` / `font-texto`. |
| `ease-muush` | **Acceptable.** `--ease` is taken by the root curve, and "muush" is the brand, not a version marker. |
| `max-w-contenido` | **Correct.** `--container-max` would generate `max-w-max`, which shadows Tailwind's built-in `max-content`. |
| `token-literals` v1 pattern `/--(bone\|ink\|red\|wine)-\d/` | **Correct.** The v1 families are numeric ramps, and the old pattern would have flagged `--red-muush-500`. |

## Part A · correctness and compliance (CONFIRMED unless marked)

- **Tokens at the anchors** (I recomputed each clamp):
  - hero 34 → 96, line-height 37.4 → 101.76, tracking 0 → −3.4992 px;
  - sección 28 → 56; proceso 28 → 52; diagnóstico 34 → 64; p-grande 17 → 20.
  - The palette has 14 colours, exactly § 1, and `m1-red-400` has no token.
  - Pill:
    - fill Carbón 800 at 60 %;
    - blur 16;
    - padding 8 / 18 / 8 / 10, gap 10;
    - dot 20 / 14 / 7 at 12 / 30 / 100 %;
    - text 13 / 500 / 0.6 px.
  - Primary button:
    - gradient `#EC4A44` 0 %, `#E5352F` 55 %, `#C42A25` 100 %;
    - edge white 20 %, shadow red at 33 % (y 10, blur 32);
    - padding 16 / 30, nav 11 / 20, mobile 12 / 14;
    - text 19 / 15 / 14 at weight 600;
    - arrow 20 / 16, **visible at every width** (§ 9).
  - Glass button: Carbón 800 at 55 % (`0x8C`), edge 25 → 6 %, blur 20, padding 16 / 28 and 12 / 14, text 17 / 14 at 500.
  - Glass family:
    - panel: 70 %, r 28, edge 25 → 4 %, blur 30, shadow y 30 blur 80 at 67 %, padding 36;
    - service card: opaque Negro 900, r 24, edge 18 → 4 %, clip;
    - strip: 40 %, r 20, flat 10 %, blur 20, padding 22 / 28.
  - Focus: 2 px Blanco outline, 3 px offset, on `:focus-visible` (in the built CSS).
- **No literals and no v1 tokens in v2 code.**
  - I grepped the 7 components, 4 logic files, `shaderFrame.ts` and both presets. The only hits were false positives such as `shrink-0`.
  - `tests/token-literals.test.ts` now asserts that every listed file exists, which closes review-42 advisory 2.
- **Size and structure.**
  - Every component is under 200 lines; the largest is `PrimaryButton` at 122.
  - WebGL, rotation and reduced-motion logic live in composables, and the pure rules live in `shaderFrame.ts`.
  - All components use `<script setup lang="ts">`.
- **WebGL.**
  - Everything starts in `onMounted` and is released in `onBeforeUnmount`: observers, listeners, rAF, renderer, `WEBGL_lose_context`, and the unmount-before-load guard.
  - Reduced motion: one draw at t = 12 s, no loop, followed live.
  - The poster is in the SSR HTML and always in the DOM. The canvas stays at `opacity-0` until the first frame and is `hidden` on fallback or context loss.
  - DPR is 1× below 768 and capped at 1.5× above.
  - **A hidden tab now draws nothing.** `update()` (`:105`) and `resize()` (`:150`) both check `!document.hidden`, and the test "should draw nothing at all while the tab is hidden" pins it. This closes review-42 advisory 1.
  - The root has `aria-hidden` and `pointer-events-none`.
  - The uniforms of all seven presets match the handoff README. `workWithUs` reuses the assessment uniforms and the diagnóstico poster.
- **Forced colours (former S1, now fixed).**
  - `borde-luz` gains `@media (forced-colors: active) { outline: var(--borde-ancho) solid CanvasText; outline-offset: calc(var(--borde-ancho) * -1) }`. An outline takes no layout space, so the box sizes are unchanged.
  - It is emitted in the built CSS and pinned by `tests/design-tokens.test.ts:378`.
  - `.foco:focus-visible` has higher specificity, so the focus ring still wins while focused.
- **Rotating pill.**
  - It shows item 0 on the server and rotates every 2600 ms.
  - It holds while hidden, while hovered (pointerenter/leave) and under live reduced motion.
  - A one-item list starts no interval, and the interval is cleared on unmount.
  - Assistive technology gets a `sr-only` `<ul>` of all items, the animated label is `aria-hidden`, and there is no live region.
- **Tests are behavioural.** They use fake timers and observer, rAF and WebGL stubs, with no snapshots.
- **Stories.** All 7 primitives and `Foundations/Tokens` have stories that cover ES and EN at the mobile and desktop viewports.
- **The live-page change is limited** to these items, all confirmed by diff:
  - the `html` and layout-root canvas → `--negro-950` #050505;
  - `--dot-paper-lit-color` → `var(--red-muush-500)`;
  - `public/cursor/you.svg` fills `#CF3147` → `#E5352F`, with geometry and size identical (only the three `fill`/`stroke` values and the comment changed);
  - a Poppins 500 face in the self-hosted set, which no live page uses yet.

  `CursorSpotlight`, `useCursorSpotlight` and `DotGrid.vue` are unchanged.
- **Static site and i18n.**
  - `nitro.preset: 'static'`, there is no `server/`, and `.output/` holds only `nitro.json` and `public/`.
  - There are no `fonts.googleapis.com` or `fonts.gstatic.com` references in `.output/public`.
  - No locale key changed and parity is green. Primitives carry no copy.
- **Process (C2, C7).**
  - All 65 tasks are `[x]`, and the plan Phase -1 gates are `[x]`.
  - There is no `[NEEDS CLARIFICATION]`, and `spec.md` reads "Approved by Roberto on 2026-10-31".
  - No version bump (AGENTS.md § 3.1).

## Security

The trigger of the earlier "Instruction Poisoning" warning is unknown. Below is what I inspected in the full staged, unstaged and untracked diff (about 10,250 lines, `.webp` excluded and scanned separately), and what I found.

| Check | Result |
|---|---|
| Changes outside the feature's scope | **None found beyond expected ones.** Outside `app/`, `tests/`, `specs/` and `docs/harness/progress/`, the diff touches only these files: |
| | `nuxt.config.ts`: Poppins weights `[600]` → `[500, 600]`, plus a comment. |
| | `vitest.config.ts`: adds the `app/shared/utils/**/*.test.ts` include. |
| | `.storybook/preview.ts`: `storySort` and a `negro` background. |
| | `.storybook/preview-head.html`: adds weight 500 to the pre-existing Google Fonts link. |
| | `.specify/feature.json`: points to `specs/042-…`. |
| | `public/cursor/you.svg`: colours only. |
| | `app/assets/icons/README.md`. |
| | The leader's own edits to the constitution, `implementer.md`, `feature_list.json` and `current.md`, which I read: they contain the naming rule only. |
| | `biome.json`, `AGENTS.md`, `.husky/pre-commit` and `.claude/agents/spec_author.md` have recent mtimes but are byte-identical to HEAD. |
| Network calls or new external URLs | **None.** The only URLs in the diff are `http://www.w3.org/2000/svg`, `https://example.com/agenda` (an `href` test fixture in two button tests, never fetched), and the pre-existing Storybook Google Fonts link, whose query only gained weight 500 and which is catalogue-only. There is no `fetch`, XHR, WebSocket, `sendBeacon` or EventSource in any new or changed code. The only dynamic `import()` calls are the two bundled local `?raw` shader files. |
| New dependencies or lockfile changes | **None.** `package.json` and `pnpm-lock.yaml` are unchanged. |
| Scripts or hooks that execute anything | **None.** `.git/hooks` holds only samples, and `core.hooksPath=.husky/_` with husky internals dated 2026-09-06. `.husky/pre-commit` is unchanged. No `child_process`, `exec`, `spawn`, `eval` or `new Function` was found, and `init.sh` is unchanged. |
| Injected instructions aimed at agents | **None found.** I grepped the whole diff for ignore/disregard phrasing, assistant/agent/Claude/LLM addressing, install or curl commands, settings or hook references, and home or `/etc` paths. The only hits were the leader's legitimate `implementer.md` and constitution edits, a lifecycle-hooks code comment, and a plan note about `CLAUDE.md`'s SPECKIT block (an explanation of why the file was not touched). There are no HTML comments in new markdown or SVG. The `you.svg` comment is descriptive, and `arrow-right.svg` holds only a `<title>` and two paths. |
| Obfuscated or encoded content | **None.** There are no strings of 80+ base64-like characters, no `atob`/`btoa`/`fromCharCode`, and no zero-width or bidi control characters. |
| Credentials or secrets | **None.** No keys, tokens, passwords or `process.env` reads in new code. |
| Writes outside the repo | **None.** No `writeFile`, `appendFile`, `rm`, `unlink`, `homedir` or `tmpdir` in new code or tests. The tests read repo files only. |
| Remote code at runtime | **None.** The shaders and posters are bundled from `app/assets/`. The `v-html` in `PrimaryButton` renders the bundled, static `arrow-right.svg?raw`, not user input. |
| Copied assets | `app/assets/shaders/liston.glsl` and `acanalado.glsl` are `cmp`-identical to `docs/handoff/muush-1.0/shaders/m1-*.glsl` (committed in 5d9415a), and I read `liston.glsl`: plain GLSL. All six `app/assets/backgrounds/*.webp` are `cmp`-identical to the handoff posters, are valid RIFF/WebP files, and contain no URL, script or markup strings. `arrow-right.svg` is the genuine lucide glyph (`M5 12h14`, `m12 5 7 7-7 7`) with a `<title>`, the same convention as `x.svg` and `paperclip.svg`. |
| `public/cursor/you.svg` | **Colours only.** Three `fill`/`stroke` values changed from `#CF3147` to `#E5352F`, and the comment was rewritten (S1). Every path `d`, the `rect` attributes, the size and the viewBox are unchanged. |

**Conclusion:** I found no evidence of malicious, injected or out-of-scope content in the feature-42 diff. I cannot determine what triggered the platform warning. The leader's audit and mine agree.

## Gate

- **First run: exit 1, environmental.**
  - `pnpm test`'s global setup and `pnpm generate` failed with "Another Nuxt build is already running (PID 13305, started 12:23:38)". A second `nuxt generate` (PID 14021) was also running.
  - I did not start or kill either process.
  - Typecheck, check and `storybook:build` were OK.
- **Rerun once no build was running: `./init.sh` exited 0.**

| Step | Result |
|---|---|
| `pnpm typecheck` | OK |
| `pnpm check` | OK |
| `pnpm test` | 113 files, 1699 tests, all passed |
| `pnpm generate` | OK |
| `pnpm storybook:build` | OK |

## Not verified by me

- In-browser pixel measurements at 390 and 1440, and the forced-colours emulation. These are implementer-reported; my token math supports the anchors.
- WebGL runtime behaviour on real GPUs. It is verified in code and in tests with stubs.
- VoiceOver.
- Clipped text and overlap at intermediate widths (Advisory 7).
