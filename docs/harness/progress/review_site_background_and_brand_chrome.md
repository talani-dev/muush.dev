# Review · Feature 006 · Site background and brand chrome

- **Feature:** 6 · `site_background_and_brand_chrome`
- **Agent:** `reviewer`
- **Date:** 2026-09-07
- **Status in `feature_list.json` when review started:** `reviewing` (confirmed)
- **Verdict:** **APPROVED**

Every CONFIRMED claim in `impl_site_background_and_brand_chrome.md` was
re-verified independently. Nothing was taken at face value. No file was
modified by this review — `git status` is byte-identical before and after.

---

## Method

Claims were checked against artifacts, not against the report:

- `git diff` / `git show HEAD:` for every "unchanged" and "pre-existing" claim.
- `.output/public` for every font, favicon and background claim (`rules.md` § R31).
- Headless Chrome 152 driving **same-width iframes** — never screenshots — for
  every layout, paint-order and font-resolution claim (`rules.md` § R34).
- A rebuild of Storybook from the **pre-fix** config to reproduce R33.
- `./init.sh` run to completion by the reviewer.

---

## Gates

`./init.sh` → **exit 0.**

| Gate | Result |
|---|---|
| `pnpm typecheck` | pass |
| `pnpm check` (biome) | pass — 97 files |
| `pnpm test` | pass — **22 files, 242 tests** |
| `pnpm generate` | pass — 12 routes prerendered |
| `pnpm storybook:build` | pass |

> **Note for the leader, not a finding.** The reviewer's *first* `./init.sh`
> exited 1: a **stale Nuxt build lock** from a dead process (PID 60879, started
> 16:23:48) failed `pnpm test`'s `globalSetup` and then `pnpm generate`
> directly. The process was already gone; a clean re-run exited 0. This is
> environmental, not a defect in the feature — but `tests/global-setup.ts`
> shells out to `pnpm generate`, so a leftover `pnpm dev` will fail the suite
> for reasons that have nothing to do with the code. Worth knowing.

---

## The seven claims singled out for verification

**1 · `SectionGlow.vue` byte-identical (FR-011, SC-006) — CONFIRMED.**
`git diff app/shared/ui/SectionGlow.vue` is empty. The `'920'` member of
`GlowSize` (lines 53, 101) and `--spacing-glow-920` (`global.css:545`) are both
still present and untouched. Correct: keeping known dead code the spec
explicitly protected is the right call; removing it would have been the
rejection.

**2 · Glow counts — CONFIRMED.** Everything this feature wrote says **21** total
and **11** on Landing (`SectionBackdrop.vue:26`, `spec.md`, `data-model.md`,
`rules.md` § R32). The only "22 / 12 on Landing" survivors are
`SectionGlow.vue:7` and `SectionGlow.stories.ts:5` — both **untracked by this
diff**, pre-existing, and explicitly out of scope. No stale count was
introduced.

**3 · No glow on any real page (A-10) — CONFIRMED.** Zero occurrences of
`section-glow` or `section-backdrop` across all four prerendered documents.
Glows exist only in the two stories.

**4 · One element, one repeating gradient — CONFIRMED.** `DotGrid.vue` renders
a single childless `<div>`. Measured computed style in Chrome:
`radial-gradient(color(srgb 0.85098 0.85098 0.85098 / 0.12) 1.25px, rgba(0,0,0,0) 1.25px)`
at `background-size: 24px 24px` — i.e. `#D9D9D9` at 12%, a 2.5px dot on a 24px
grid, exactly `design-extract.md` § 10. Neither `288` nor `90` appears anywhere
in the repository.

**5 · Paint order (R28) — CONFIRMED BY MEASUREMENT.** Measured inside the built
catalogue (`shared-ui-sectionbackdrop--additive-contribution`):

```
HOST      position=relative isolation=isolate overflow-x=clip bg=rgb(38,38,38)
backdrops z-index=-2  (×2, 3 glows and 2 glows)  intervening stacking contexts: NONE
dot sheet z-index=-1  spanning the full host
content   z-index=auto
=> glow(-2) < dots(-1) < content : CORRECT
```

Glows render at their real design diameters (1500 / 1100 / 900 / 1000 / 820).
The third stand-in section contributes nothing and still receives base + dots.
The contract is documented **in the component that establishes it**
(`SectionBackdrop.vue`, ~35 lines of doc comment including the silent failure
mode and the escape hatch), and again in `default.vue`, `contracts/components.md`,
`quickstart.md` and `rules.md` § R28 — not only in `rules.md`.

**6 · Zero hardcoded hex or px — CONFIRMED.** Comment-stripped scan of
`DotGrid.vue`, `SectionBackdrop.vue` and both story files: zero hex, zero
px/rem/em, zero arbitrary Tailwind values.

*On `public/favicon.svg`* — **the exception is justified; accepted.** A favicon
is fetched as a standalone document and cannot inherit the app's CSS, so a
custom property is not available to it; the same reason `app/assets/logo/*.svg`
already carry literals, a precedent that predates this feature. Article VII
binds *components*, and this is a static asset. The three values were checked
against the ramp and match exactly: `#262626` = `--ink-500`, `#FBF8F6` =
`--bone-100`, `#CF3147` = `--red-400`. The exception is recorded in `plan.md`
Complexity Tracking and in the file's own provenance comment, which is what the
Constitution's Compliance Review requires.

**7 · Fonts — CONFIRMED, and the arithmetic is right.** Verified against
`.output/public`:

- 10 `@font-face` blocks = **8 real faces + 2 metric-override fallbacks**.
- **4 `.woff2` binaries.** Poppins 600 → 2 binaries (latin, latin-ext).
  Instrument Sans 400/500/600 → **2 binaries total**, one per subset, reused
  across all three weights because it is a variable font. The implementer's
  "four files, eight declarations" is correct.
- Weights emitted: Poppins 600; Instrument Sans 400, 500, 600. **No 700.**
- Every `src` is same-origin (`../_fonts/…`); zero absolute URLs.
- **Zero** occurrences of `fonts.gstatic.com` / `fonts.googleapis.com` in any
  emitted file. **Zero** traces of the four deleted `/fonts/*.woff2` paths.
- In a real browser, `document.fonts.check()` is true for Poppins 600 and
  Instrument Sans 400/500/600 on all four routes.
- Audit of **every text-bearing element** on `/es/`: Instrument Sans 28,
  Poppins 6, system stack 4 — and all four are `<script>` nodes and SVG
  `<title>` labels, none of which renders visible text. **No visible text falls
  back and nothing is synthesised** (FR-017, SC-008).
- The four hand-written faces, the TODO and `public/fonts/` are gone; the 32
  type tokens are untouched (FR-018 — the `global.css` diff is exactly two
  hunks).

**8 · i18n parity and `static-output.test.ts` — CONFIRMED.** 38 keys in each
locale, zero asymmetry; no page and no locale key added. The test diff is
**+180 / −1**, and the single removed line is the `node:fs` import being
widened — **no existing assertion was changed, weakened or deleted** (SC-012).
The new assertions are real and artifact-backed: I confirmed independently that
each thing they assert is actually true of `.output/public`.

---

## The three items the implementer flagged

### R33 · Storybook clobbering its own manager — REAL, PRE-EXISTING, FIX IS MINIMAL

**Reproduced, not accepted on trust.** I rebuilt the catalogue from the
pre-fix config (`git show HEAD:.storybook/main.ts`, in a throwaway config dir
outside the repo):

```
BUILD_EXIT=0
index.html  →  1480 bytes  →  the site's "/" redirect stub, not the catalogue
```

Confirmed on every count:

- **Real.** The built catalogue's root document was the site's meta-refresh to
  `/es`, a page that does not exist inside `storybook-static/`.
- **Pre-existing.** `public/index.html` entered in commit `6d50ad8`
  (feature 003), and `HEAD` still had bare `staticDirs: ['../public']` with no
  `publicDir` override.
- **Silent.** The pre-fix build exits **0**. Clobbering the entry document is
  not a build error, which is exactly why it survived two features.
- **Fixed.** `storybook-static/index.html` is now 3816 bytes and is the
  Storybook manager; `brand/favicon.svg` serves the isotipo.
- **Minimal.** Two functional lines — `staticDirs: [{ from: '../public', to: '/brand' }]`
  and `viteConfig.publicDir = false`. The rest of the diff is explanatory
  comment.

**This is not scope creep.** T021 authorised it in advance, in writing: *"if the
two collide at the static root, serve the icon under a distinct path and point
the link at it. Record which happened."* The implementer did exactly that,
recorded it, and did not touch `public/index.html` — which would have been the
tempting fix and would have broken feature 003's deliberate artifact
(`rules.md` § R25). Good judgement, correctly bounded.

### A-08 · The tab strip — ACCEPTED WITH THE LIMITATION RECORDED

I re-verified the engine-level half myself, rendering the real file in Chrome
under both schemes:

| `preferredColorScheme` | stroke | dot | viewBox | stroke-width | linecap |
|---|---|---|---|---|---|
| light | `rgb(38,38,38)` = ink-500 | `rgb(207,49,71)` = red-400 | `0 0 100 100` | `12px` | `round` |
| dark | `rgb(251,248,246)` = bone-100 | `rgb(207,49,71)` = red-400 | `0 0 100 100` | `12px` | `round` |

Geometry matches FR-021 exactly, and the art fits inside the square in both
axes with no stretching (FR-022, framing per A-07 / `branding.md` § Isotipo).
The `rel="icon"` link is present on all four prerendered routes.

**This does not block approval.** The residual gap — a browser painting the
file into its tab strip — is unreachable in this environment (headless has no
tab UI, screen capture is denied) and the mitigation is *structural*: the
light-scheme colours are the unconditional declaration, so a browser that
ignores the query shows a correct mark rather than a wrong one. The implementer
stated the limit plainly instead of fabricating evidence, which is the
behaviour this harness should reward. **One five-second check remains for
Roberto: open the site and glance at the tab.**

### R34 · Responsive claim — CONFIRMED BY MEASUREMENT, NOT SCREENSHOT

Measured through same-width iframes, `scrollWidth` vs `clientWidth`, plus a
scan for any element crossing the viewport edge:

| Widths | Route(s) | `hScroll` | Overflowing elements |
|---|---|---|---|
| 320, 360, 390, 414, 480, 768, 1024, 1280, 1440, 1920, 2560 | `/es/` | false at all 11 | **0 at all 11** |
| 390, 1440 | `/en/`, `/es/nosotros/`, `/en/about/` | false | **0** |

**SC-004 holds.** The implementer's diagnosis is right: headless captures crop
rather than reflow, and the measurement is what counts.

---

## Additional verification the report did not claim

Measured in a real browser, after hydration:

- **SC-001 (full-page coverage).** With 5060px of content injected into
  `<main>`: `documentScrollHeight = 5611`, layout root `= 5611`, dot sheet
  `= 5611` — an exact match, and the sheet still covers the viewport after
  scrolling to the bottom. No horizontal scrollbar on the tall page.
- **FR-003 / SC-003 (inert).** Dot sheet: `pointer-events: none`,
  `aria-hidden="true"`, `position: absolute`, `z-index: -1`. Hit-testing over
  bare background returns the element beneath, never the sheet.
- **FR-007 (not a scroll container).** Root computes `overflow-x: clip` /
  `overflow-y: visible` — `clip`, not `hidden`, so `position: sticky` survives.
- **FR-008 (mobile menu).** At 390px the menu opens as
  `fixed inset-0 z-50 bg-glass-dark backdrop-blur-menu-panel`, computed
  `z-index: 50`, `backdrop-filter: blur(20px)`, with the `[inert]` wrapper
  present — and **exactly one `.dot-grid` in the document before and after
  opening.** The menu blurs the background; it does not repaint it.
- **FR-004 / FR-009.** All four routes carry `relative isolate overflow-x-clip
  bg-ink-500` and the dot layer in prerendered HTML — zero JavaScript required.

---

## Checkpoints C1–C8

| | Result |
|---|---|
| **C1** Harness complete | ✅ all base and harness docs present; `./init.sh` exits 0 |
| **C2** State coherent | ✅ feature 6 is the only non-`done`; it is in `reviewing`, reached from `in_progress` |
| **C3** Architecture (I–III) | ✅ no new feature module (correct — these are shared primitives); no cross-feature import; `DotGrid` 60 lines, `SectionBackdrop` 77, `default.vue` 122 — all under 200 |
| **C4** Constitution | ✅ zero literals in touched components; **zero relative imports crossing a directory** anywhere in `app/`; no new alias to mirror; no `server/`, `nitro.preset: 'static'` intact; both components `<script setup lang="ts">`; the one TODO in the tree was **deleted** by this feature |
| **C5** Verification real | ✅ 242 tests green; **all 11** `app/shared/ui/` components have a story; `pnpm generate` writes `.output/public`; `pnpm storybook:build` passes |
| **C6** Session close | ⏸ `history.md`'s last entry is feature 003 — correct, feature 006's session closes after this review. Leader's action, not a finding |
| **C7** SDD | ✅ `spec.md` + `plan.md` + `tasks.md` (+ `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `checklists/`) present; **all 29 tasks `[x]`**; all Phase -1 gates `[x]`; zero `[NEEDS CLARIFICATION]`; zero unchecked boxes in the package |
| **C8** i18n parity | ✅ 38 keys each locale, zero asymmetry; both locales resolve; no new page; zero hardcoded user-facing strings in the new components |

## Acceptance criteria — `feature_list.json` feature 6

All **18** covered. Each is backed by a test, an artifact assertion, or a
reviewer measurement recorded above. Criterion 11 (`pnpm dev` emits zero
`[VUE_ROUTER_R0004]` for `/fonts/*`) is CONFIRMED mechanically rather than by
re-running the dev server: **zero `/fonts/*` references survive in `app/`,
`nuxt.config.ts`, `public/` or the artifact**, so no such request can be
issued. The single surviving mention is prose — see the note below.

## Constitution

No violation found. The three trade-offs (`@nuxt/fonts` + build-time fetch, the
catalogue's CDN type, literal hex in `public/favicon.svg`) are each recorded in
`plan.md` Complexity Tracking with the rejected alternative and a reversal
cost, as Compliance Review requires. Article IV governs the deployed artifact,
which is fully self-hosted; `.storybook/preview-head.html` is local tooling only
and reverses in one file (A-05).

**Article IX explicitly re-checked.** `eslint@` appears **15 times in
`pnpm-lock.yaml` before and after** — an unchanged transitive peer, never a
direct dependency. `prettier@` appears **0 times** in both. `package.json` gains
exactly one line: `"@nuxt/fonts": "^0.14.0"`. **No lint or format tooling
entered the toolchain.**

---

## Non-blocking notes for Roberto (no action required to close this feature)

1. **A stale doc comment the feature did not own.**
   `app/shared/ui/Wordmark.stories.ts:8-10` still says *"the font binaries are
   not in the repository yet (`public/fonts/` is empty), so both forms
   currently render in a fallback face. That is a known gap, tracked
   separately."* All three sentences are now false — this feature **is** the
   "tracked separately", and the catalogue renders Poppins. It is the same
   class of false claim FR-027 required fixing in `branding.md`, but in a
   feature-002 file the spec never listed. **Correctly left alone**, by the
   same reasoning that protected `SectionGlow.vue`. Worth folding into the
   follow-up that already owns `SectionGlow.vue`'s stale "22 / 12 on Landing"
   comment and the dead `'920'` variant.
2. **`AGENTS.md` was edited during this cycle** (documenting § R32 — the `.pen`
   outranks `docs/business/`). Outside `app/` and `tests/`, so within the
   leader's own write scope per `CLAUDE.md`, and the wording matches
   `spec.md`'s source-of-truth section. Recorded as an observation, not a
   finding.
3. **`tests/global-setup.ts` shells out to `pnpm generate`**, so a stale Nuxt
   build lock fails the whole suite with an error that names nothing relevant.
   It cost this review one full false-red run. Pre-existing.
4. **A-08's last millimetre** — glance at the browser tab once.

---

**APPROVED**
