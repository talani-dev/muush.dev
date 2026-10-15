# Review · feature 34 `services_float_and_custom_cursor`

- **Date:** 2026-10-14 · **Agent:** reviewer · **Branch:** `feat/services-float-custom-cursor` (uncommitted tree)
- **Status at review start:** `reviewing` (confirmed in `feature_list.json`).

## Verdict

CHANGES_REQUESTED: no code changes are needed. Four manual tasks in `tasks.md`
(T013, T015, T020, T024) are still unchecked, and this protocol does not allow an
approval while any task is open. Everything that can be verified without human
hardware is green (evidence below). Once the four manual tasks are done and
recorded, the reviewer should re-run and approve if nothing new comes up.

### Required items

1. **T013 (manual desktop float):** Safari and Firefox glue at 1024/1280/1440/1920, shear
   rendering, readability, and a 10 s Performance recording on real hardware
   (headless Chrome measured 1.4 to 2.2 ms of style recalculation per frame from the inherited clock).
2. **T015 (manual reduced motion / no JS):** a human pass in a real browser.
3. **T020 (cursor matrix):** Chrome, Safari and Firefox on the 4 routes, Retina sharpness (OA-6),
   a 1 px hotspot click (SC-007), contrast over the red CTA (OA-8), a blocked asset
   falling back to the system arrow and hand, and High Contrast. **Specifically check Safari on
   `/es/nosotros/` and `/en/about/`.** The build emits
   `--cursor-brand: url(../cursor/you.svg) …`, which is a relative URL inside a custom
   property. Chrome resolves it against the stylesheet (CONFIRMED below). If an engine
   resolves it against the document instead, nested routes would request
   `/es/cursor/you.svg` and silently show the native cursor (UNVERIFIED).
4. **T024:** Roberto keeps or reverts the D-3 mobile trial after reviewing it locally.
5. After that, tick the tasks and record the results in `docs/harness/progress/current.md` (T027).

## Evidence (independently measured by the reviewer)

- **`./init.sh`:** the first run failed only because another Nuxt build held the lock
  (PID 5212, an outside process that had already exited). The second run **exited 0**: typecheck, Biome,
  82 files / 1157 tests, generate and storybook:build all OK. CONFIRMED.
- **Glue (headless Chrome, `.output/public` served locally, `getScreenCTM` line
  ends vs. `.ping` dot centres, 8 paused moments per cycle):** the worst error is
  **0.0001 px** at 1024, 1280, 1440 and 1920, and also at 1280 with a 20 px root.
  This covers the OA-3 fix (each connector `<svg>` is sized to the 90rem × 56.875rem frame,
  not `size-full`). There is one `services-float` animation per visible canvas, and every node and
  connector end reads the same inherited `--services-float-phase`. CONFIRMED (Chrome only).
  - Shear math checked by hand: `translate(0, shift) skewY(atan(slope))` with
    origin 0 0 maps (x1, y1) to y1 + dyA and (x2, y2) to y2 + dyB. Correct.
  - Note: at a 20 px root the amplitude becomes 8.75 px. It is rem-based, consistent
    with the node positions (spec edge case "root font size"). Informational.
- **Reduced motion:** 0 float animations at 1440 and 390, the nodes and items show
  `translate: 0px`/none, and positions do not change over 1.6 s. CONFIRMED (Chrome).
- **Forced colours active:** html `auto`, links and buttons `pointer` (the system cursors). CONFIRMED.
- **Cursor:** on `/es/`, `/en/`, `/es/nosotros/`, `/en/about/` (with and without a trailing
  slash) the html and radio show `url(/cursor/you.svg) 1 5, auto`, links and buttons show
  `… 1 5, pointer`, and text inputs and the textarea show `text`. `/cursor/you.svg` returns 200 and
  decodes 32×32. Only one host is requested (same origin). CONFIRMED (Chrome).
- **SVG:** `diff 01-Mouse.svg public/cursor/you.svg` differs in one line only:
  `<rect width="32" height="32" fill="white"/>` replaced by an XML provenance
  comment (no `--` inside it). The generated copy is identical to `public/`. CONFIRMED.
- **Mobile trial isolation:** removing the fenced block from a scratch copy gives a file
  **byte-identical to HEAD**. The trial's assertions live only in
  `ServicesTimeline.float.test.ts`. The spine has no transform, and the rows float out of phase at 390.
  CONFIRMED.
- **Constitution:** no `package.json`/lockfile/`nuxt.config.ts`/`i18n/` change;
  no `server/`; no `fetch(` outside `logic/`; no hardcoded colour in components
  (the asset's `#CF3147` equals `--red-400` and is pinned by a test); relative imports
  are same-directory only; `<script setup lang="ts">`; line counts are 197 / 121 / 199
  (all ≤ 200); `connectorFloatVars` is pure and tested.
- **Acceptance → tests:** float, translate-only, single clock, reduced motion
  (`ServicesConstellation.test.ts`, `services-float-tokens.test.ts`); connector
  geometry and shear (`ServicesConnectors.test.ts`, `servicesContent.test.ts`);
  mobile trial (`ServicesTimeline.float.test.ts`); cursor asset, hotspot, fallbacks,
  textarea I-beam, forced-colours, same-origin and URL resolution (`tests/brand-cursor.test.ts`).
  Every criterion is covered.

## Checkpoints

C1 green · C2 green (one feature `reviewing`) · C3 green · C4 green · C5 green ·
C6 pending session close (history.md) · C7: tasks 23/27, **not green** (items 1–4).

---

# Round 2 (2026-10-15): cursor 64×64 / hotspot 1 9, and Amendment A2

**Verdict: CHANGES_REQUESTED. The only blockers are the open manual tasks T013, T015, T020, T024 and T039. The code is APPROVABLE as-is.**

The status in `feature_list.json` is `reviewing`. CONFIRMED.

- **Gates:** `./init.sh` exits 0, with 83 test files and 1169 tests passing; generate and storybook:build pass. CONFIRMED.
- **Glow removed:** `.cursor-spotlight__beam` no longer has any `background-*`. The only `radial-gradient` that names a colour is `var(--dot-paper-lit-color)` in `__lit`. All six removed tokens (`--spotlight-red-400-42/17/37`, `--spotlight-stop-mid`, `--spotlight-core-size`, `--spotlight-outer-size`) are gone from `app/`, `tests/` and `.storybook/`. The remaining mentions are negative test assertions plus one historical note in a `global.css` comment. CONFIRMED.
- **Lit colour and radius:** `--dot-paper-lit-color: var(--red-400)` and `--spotlight-lit-radius: 7.5rem`. Both mask declarations use `circle var(--spotlight-lit-radius)`. `--spotlight-size` is component-local (`2 × radius`). The diff of `app/` and `tests/` adds no hex value and no `--red-N:` declaration. The only `#CF3147` occurrences are in a comment and in the cursor asset, which existed in Round 1 and is pinned by a test. CONFIRMED.
- **DotGrid registration:** the `mod()` counter-translate on `__lit` is unchanged, as are the `--dot-paper-radius/step` recipe, `overflow: clip`, the no-blend rule and the three media guards. CONFIRMED by source and tests. Pixel registration is CONFIRMED in Chrome only, per the implementer's evidence.
- **Footer and layering:** `<footer>` has no `bg-*`; the prerendered tag on `/es` and `/en/about` is `<footer class="mt-section-gap">`. The layer tokens and order are unchanged. Nav and mobile menu files are not in the diff. The form cards still carry `bg-glass-dark-contact backdrop-blur-glass-dark`, and the forms `.vue` files are untouched (only their tests changed). Nothing changed under `app/shared/logic/`, `i18n/`, `docs/business/` or package/nuxt config. CONFIRMED.
- **Cursor:** `diff 01-Mouse.svg public/cursor/you.svg` differs in exactly three ways: the root `width`/`height` go from 32 to 64, the white `<rect>` is removed, and one provenance comment is added. `viewBox` and paths are unchanged. The hotspot is `1 9` everywhere: in both `--cursor-brand*` tokens, in the emitted CSS (read through the vars), in `brand-cursor.test.ts`, and in spec A1 and data-model. The only `1 5` mentions left are historical. CONFIRMED.
- **Deviations accepted:**
  1. The story demo sentence changed to "se vuelven rojos". It is catalogue-only.
  2. The comment "teñirlos" was reworded.
  3. Two stale "light" comments remain in `app/shared/logic/useCursorSpotlight.ts` (lines 142 and 170). They are non-blocking and comment-only, and were left because T038 forbids changes under `logic/`. They should be fixed in a later comment-only sweep.
- `CursorSpotlight.vue` went from 305 to 269 lines and still falls under the recorded Article V exception.

## Manual tasks remaining for Roberto (unchecked in tasks.md)

- **T013:** float glue, readability and performance in Chrome, Safari and Firefox (quickstart § 1).
- **T015:** reduced motion at 1440 and 390, and no-JS float (quickstart § 2).
- **T020:** cursor matrix across browsers and routes, including 64×64 sharpness and the hotspot on a 1 px target (quickstart § 3).
- **T024:** keep-or-revert decision on the mobile float trial (quickstart § 4).
- **T039:** A2 in Chrome, Safari and Firefox (quickstart § 5). It covers:
  - the colour against the reference screenshot;
  - the ink-300 weak spot in the footer;
  - the red dots near the final CTA and the cards;
  - the A2-5 conditions;
  - OA-9 in Safari and Firefox. It is already CONFIRMED in Chrome, where no glow shows under the footer.

Also for the leader to take to Roberto (no agent writes these): the six `docs/business/` passages and the `.pen` `gViAx` divergence listed in spec § Amendment A2.

## Checkpoints

C1 through C5 are green. C6 is pending session close. C7 is **not green**: 35 of 40 tasks are done, and the 5 open ones are the manual tasks above.

## Round 3 (2026-10-15)

**Verdict: APPROVED**

Scope: A2 revision 1 (impl report § Round 6, which restores the flat footer), plus closure of the manual tasks.

- **Status:** `feature_list.json` shows feature 34 as `reviewing`. CONFIRMED.
- **Gates:** `./init.sh` exits 0. 83 test files and 1169 tests pass; `pnpm generate` and `storybook:build` pass. CONFIRMED.
- **Footer:** `SiteFooter.vue` again renders `<footer class="bg-ink-500">`. `git diff HEAD` on that file adds only a 4-line doc comment. The prerendered tag is `<footer class="bg-ink-500 mt-section-gap">` in both `.output/public/es/index.html` and `.output/public/en/about/index.html`. CONFIRMED.
- **No regression to the rest of A2 or the cursor:**
  - `--dot-paper-lit-color: var(--red-400)` and `--spotlight-lit-radius: 7.5rem` are unchanged.
  - `--cursor-brand*` is still `url("/cursor/you.svg") 1 9`.
  - `SectionBackdrop.vue` has no diff against HEAD.
  - The `.vue` diff adds no hex or `rgb()` colours.
  - CONFIRMED.
- **Human acceptance:** the leader relayed it as Roberto, 2026-10-15, after a local `pnpm dev` review: "me encanta cierra la tarea". It is recorded as acceptance of the visual result and of the flat footer, plus the T024 decision to KEEP the mobile/tablet float trial. This reviewer did not see the human's message directly; it is recorded as relayed.
- **Manual tasks closed on that acceptance:** T013, T015, T020, T024, T039 and T046 are marked `[x]` in `tasks.md`. Each carries the caveat that no per-browser matrix was reported (Safari/Firefox, Retina, 3× DPR, high contrast, reduced motion), so each is **UNVERIFIED per browser**. Only Chrome evidence from the implementer exists.
- **Checkpoints:** C1 through C5 are green, and C7 is now green (0 open tasks, 47 checked). C6 is still pending session close. Still open for the leader to take to Roberto: the follow-ups from Round 2, which are the `docs/business/` passages and the `.pen` `gViAx` divergence from spec § A2, plus the two stale comments in `useCursorSpotlight.ts`.
