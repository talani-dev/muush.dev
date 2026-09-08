# Implementation · Feature 006 · Site background and brand chrome

- **Feature:** 6 · `site_background_and_brand_chrome`
- **Spec package:** `specs/006-site-background-and-brand-chrome/` (29 tasks, all `[x]`)
- **Agent:** `implementer`
- **Date:** 2026-09-07
- **Status left in `feature_list.json`:** `in_progress` — **unchanged on purpose.**
  The `reviewer` gate has not run and is unconditional (`AGENTS.md` § 4).

---

## T001 · Before-state on the untouched branch

The five gates, run before any file was edited:

| Gate | Result |
|---|---|
| `pnpm check` | pass — 89 files checked |
| `pnpm typecheck` | pass |
| `pnpm test` | pass — 20 files, 216 tests |
| `pnpm generate` | pass — 12 routes prerendered |
| `pnpm storybook:build` | pass |

### `[VUE_ROUTER_R0004]` before → after (FR-016 / SC-009)

**Before: eight warnings, two per missing file.**

```
WARN [VUE_ROUTER_R0004] No match found for location with path "/fonts/Poppins-Regular.woff2"        ×2
WARN [VUE_ROUTER_R0004] No match found for location with path "/fonts/Poppins-Bold.woff2"           ×2
WARN [VUE_ROUTER_R0004] No match found for location with path "/fonts/InstrumentSans-Regular.woff2" ×2
WARN [VUE_ROUTER_R0004] No match found for location with path "/fonts/InstrumentSans-Bold.woff2"    ×2
```

**After (T017): zero.** `pnpm dev` with a clean log, then a real browser load of
`/es` — the whole page, fonts included. `grep -c VUE_ROUTER_R0004` → `0`, and
the log names no `/fonts/` path at all.

> **Method note, so the comparison is honest.** The before-state was captured
> by requesting the four paths explicitly, because a headless `curl` of `/es`
> never fetches a font. The after-check is stronger, not weaker: a full browser
> load that *would* have requested them if anything still referenced them, and
> nothing does.

---

## What was built

### 1 · The background (US1, US4)

- **5 tokens** in the `:root` block of `app/assets/css/global.css` (not in
  `@theme inline` — they are read from hand-written CSS, `rules.md` § R18):
  `--dot-paper-color` (`ink-100` at 12%), `--dot-paper-radius` (`0.078125rem`),
  `--dot-paper-step` (`1.5rem`), `--layer-glow` (`-2`), `--layer-dots` (`-1`).
- **`app/shared/ui/DotGrid.vue`** — the dotted paper as **one element with one
  repeating radial gradient**. No props, `aria-hidden`, `pointer-events-none`,
  `absolute inset-0`, on `--layer-dots`. The design's 288px tile and its 90
  instances appear nowhere in the code and have no token, deliberately.
- **`app/shared/ui/SectionBackdrop.vue`** — the per-section glow container, on
  `--layer-glow`. Its doc comment carries the **section contract** in full,
  including the silent failure mode (spec A-04 / `rules.md` § R28).
- **`app/layouts/default.vue`** — the root gains `relative isolate
  overflow-x-clip` beside its existing `min-h-screen bg-ink-500`, and renders
  `<DotGrid />` once. The comment at 16-20 was rewritten: it now describes the
  four-layer stack, cites `SdEJx`'s child order, records **feature 3's A-03 as
  resolved**, and states why `clip` is not `hidden`. Shell imports, the
  `:inert` wrapper, `<main>`'s classes and `useHead` untouched.
- **Tests:** `DotGrid.test.ts` (7 cases) and `SectionBackdrop.test.ts`
  (6 cases). **Stories:** `DotGrid.stories.ts` (*Default*, *Composed
  Background*) and `SectionBackdrop.stories.ts` (*Additive Contribution*, two
  contributing sections plus one that contributes nothing).
- **Artifact assertions** added to `tests/static-output.test.ts`: all four
  routes carry the isolation/clip classes and the dot layer in the prerendered
  HTML (FR-004, FR-009).

### 2 · The type (US2)

- `@nuxt/fonts@0.14.0` added and configured: `google` provider, Poppins `[600]`,
  Instrument Sans `[400, 500, 600]`, `subsets: ['latin', 'latin-ext']`,
  `styles: ['normal']`, **`throwOnError: true`**.
- The four hand-written `@font-face` blocks, the stale TODO and the empty
  `public/fonts/` directory are gone. The 32 type tokens are untouched (FR-018).
- `.storybook/preview-head.html` gives the catalogue the same two families from
  the Google stylesheet (spec A-05). Site artifact unaffected.
- Artifact assertions added: a face per brand weight, every `src` same-origin,
  zero third-party font hosts anywhere in `.output/public`, zero traces of the
  four deleted paths.

### 3 · The mark (US3)

- `public/favicon.svg` replaced with the isotipo in the `0 0 100 100` +
  `translate(3, -8)` framing `branding.md` § *Isotipo* already documents.
  Light-scheme colours are the **unconditional default**; the dark override
  swaps the stroke only.
- `public/favicon.ico` deleted (A-06). Nothing Nuxt-branded remains in `public/`.
- Icon declared in `nuxt.config.ts` under `app.head.link`, so every prerendered
  page in both locales carries it — asserted per route.
- `.storybook/manager-head.html` gives the catalogue the same file. **This is
  where the surprise was — see R33 below.**

### 4 · Documentation

- `docs/business/branding.md` — the false claim at lines 63-64 corrected in
  place, dated, with the real state recorded. The section heading
  ("ya aplicada en este repo — coincide") carried the same false claim and was
  corrected with it.
- `docs/business/rules.md` — **appended, never overwritten**: R28–R32 were
  re-checked against the implementation and all five stand; **R33, R34 and R35**
  are new findings from implementing.

---

## The three by-eye verifications

`happy-dom` does no painting, so these are the verification, not a formality
(`research.md` § R7). All were done in **Google Chrome 152.0.7977.77, headless (`--headless=new`)**
against the generated artifact in `.output/public`, served over HTTP.

### T010 · The layer order and the background (US1)

| Check | Result |
|---|---|
| Layer order base → glows → dots → content | **Confirmed visually** in the *Composed Background* story: the dot pattern is visible **continuing across** the red/wine bloom, and the text sits above both |
| Dots cover the full scroll height | **Confirmed**, including on a deliberately tall page: with 5060px injected into `<main>`, `documentElement.scrollHeight` = 5752 and the sheet measured 5752 |
| Horizontal scrollbar, 320px → 2560px | **None at any of 320 / 390 / 480 / 768 / 1024 / 1280 / 1440 / 1920 / 2560** — `scrollWidth === clientWidth` at every one, and zero elements past the viewport |
| `overflow-x: clip` did not become a scroll container | **Confirmed** — computed `overflow-x: clip`, `overflow-y: visible` |
| Dot layer is inert | `z-index: -1`, `position: absolute`, `pointer-events: none`, `aria-hidden="true"`; `elementFromPoint` over bare background returns the element beneath, never the sheet |
| Dot recipe resolves | computed `radial-gradient(color(srgb 0.85098 0.85098 0.85098 / 0.12) 1.25px, rgba(0,0,0,0) 1.25px)` / `background-size: 24px 24px` — i.e. `#D9D9D9` at 12%, a 2.5px dot on a 24px grid |
| Mobile menu (390px) | **Opens above everything and its glass now blurs the dots** — visible in the capture. Panel is `fixed inset-0 z-50`, `backdrop-filter: blur(20px)`. **Exactly one `.dot-grid` in the document**: the menu repaints nothing (FR-008) |
| Footer | Opaque `rgb(38,38,38)`; no dots inside it, dots above and below it. That is the design (A-12) |

### T017 · The type (US2)

- Every brand weight resolves to a **real face**: `document.fonts.check()` true
  for `600 24px Poppins`, `400/500/600 16px "Instrument Sans"`, and the loaded
  `FontFace` list shows Poppins 600 plus Instrument Sans 400, 500 and 600.
- **No synthesised bold.** The same string measured on canvas gives
  289.92 / 293.72 / 297.53px at Instrument Sans 400 / 500 / 600, against
  288.16px for a non-existent family — three distinct real faces, not one face
  and two fakes.
- Wordmark computes to `Poppins` at 600; body copy to `Instrument Sans`.
- Visually the site is transformed: before this feature every screenshot was
  the system fallback.
- **Catalogue:** stories render in Instrument Sans (`preview-head.html` works),
  so SC-011 holds.

### T023 · The mark (US3) — including A-08, which was UNVERIFIED

**What I actually observed, in Chrome, rendering the real file:**

- Under `prefers-color-scheme: **light**`: stroke `#262626`, dot `#CF3147`.
- Under `prefers-color-scheme: **dark**`: stroke `#FBF8F6`, dot still `#CF3147`.
- **So Chrome does honour the media query inside the SVG**, which is the half of
  A-08 that was unverified. Rendered at 16, 32, 64 and 128px: centred,
  undistorted, round terminals intact, legible at 16px.
- The colour scheme was driven with `--blink-settings=preferredColorScheme=1`
  (light) and `=0` (dark), verified in-page with
  `matchMedia('(prefers-color-scheme: dark)').matches`. `--force-dark-mode` and
  `--force-light-mode` do **not** move that media query in headless and are not
  what was used.
- The catalogue's tab icon resolves to the muush mark:
  `<link rel="icon" type="image/svg+xml" href="./brand/favicon.svg">` is present
  in the built manager and returns the isotipo (HTTP 200).

> ⚠️ **The one thing I could not do, stated plainly rather than papered over.**
> I could not look at an actual browser **tab chrome**. Screen capture is not
> permitted for this shell (`screencapture` fails with *"could not create image
> from display"*), and headless Chrome has no tab UI. What is CONFIRMED is that
> Chrome's own engine renders the icon correctly at tab sizes in both schemes,
> and that every page declares it. What remains **UNVERIFIED** is the last
> millimetre: the browser painting that file into its tab strip. It costs
> Roberto five seconds to close — open the site and glance at the tab.
> Safari is expected not to show it at all (it does not use SVG favicons),
> which is why the light colours are the file's default rather than a branch.

---

## Findings a reviewer should look at first

### 1 · Storybook was overwriting its own manager document — pre-existing, fixed here (R33)

`storybook-static/index.html` **was not the catalogue**. It was
`public/index.html`, the site's 1480-byte `/` redirect stub — so the built
catalogue's root redirected to `/es`, a page that does not exist inside it.
`public/favicon.svg` shadowed Storybook's icon the same way, which is why the
catalogue's tab has been showing the Nuxt logo.

Two independent copies had to be stopped:

1. `staticDirs: ['../public']` → `[{ from: '../public', to: '/brand' }]`.
2. **Vite's own `publicDir`**, which defaults to `<root>/public` — the same
   directory — and copied it again from the preview build. Now
   `viteConfig.publicDir = false`.

Verified by rebuilding: `index.html` went from 1480 bytes to 3816, and the
manager is back. **`pnpm storybook:build` exited 0 the whole time** — clobbering
the entry document is not a build error, which is why this survived since
feature 003.

This is the only change outside the spec's file list, and T021 anticipated it
("if the two collide at the static root, serve the icon under a distinct path").

### 2 · Headless screenshots lied about the 390px viewport (R34)

At `--window-size=390,844` the captures showed text cut at the right edge, which
looks exactly like `overflow-x: clip` eating content — the thing FR-007 forbids.
It was not real: measured inside the page, **no element passes 390px** and
`scrollWidth === clientWidth` both with the clip and with it removed at runtime.
Chrome lays out wider than the requested window and crops the image. Everything
here was re-verified through a same-width `<iframe>`, which does fix the layout
viewport.

### 3 · `@nuxt/fonts` needed no fallback, and its binaries are not one-per-weight (R35)

The faces were emitted from usage detection alone — **`global: true` was not
needed** (`research.md` § R4's documented fallback went unused). Four `.woff2`
files serve eight `@font-face` declarations: Instrument Sans is a variable font,
so 400/500/600 share one binary per subset. Correct and expected; a check that
counted files per weight would fail.

---

## Verification of the constraints the spec set

| Requirement | Result |
|---|---|
| **FR-011 / SC-006** — `SectionGlow.vue` byte-identical | `git diff app/shared/ui/SectionGlow.vue` → **empty**. Its `'920'` variant, `--spacing-glow-920` and the stale "22 / 12 on Landing" doc comment were left exactly as they are (flagged for Roberto, not this feature's diff) |
| **SC-012** — no existing test modified to accommodate this feature | `tests/static-output.test.ts` is +180/−1, and the single removed line is the `node:fs` import being widened. No existing assertion changed |
| **A-10** — no glow placed on any real page | Correct: the site shows base + dots and no glow. The glows exist only in the two stories |
| **FR-018** — the type tokens unchanged | Correct: only the four `@font-face` blocks and the TODO were removed from `global.css`; five tokens added |
| **Article IX** — no ESLint/Prettier entering the tree | `@nuxt/fonts` added neither; `eslint@10.10.0` appears the same 15 times in the lockfile before and after, as a pre-existing transitive peer |
| Five gates | `pnpm check` ✅ · `pnpm typecheck` ✅ · `pnpm test` ✅ 22 files / **242 tests** ✅ · `pnpm generate` ✅ · `pnpm storybook:build` ✅ · `./init.sh` exits **0** |

---

## Assumptions I had to make that the spec did not cover

1. **`SectionBackdrop` got its own story file** rather than sharing
   `DotGrid.stories.ts`. T024 allowed either; a separate file is what satisfies
   Article X's "every component in `app/shared/ui/` has a story" for
   `SectionBackdrop` itself.
2. **The two components carry a class hook** (`.dot-grid`, `.section-backdrop`)
   for their `<style scoped>` rules. That also gives the static-output test a
   stable selector; a `data-v-*` hash would not be one.
3. **The component tests read the `.vue` source from disk** to assert the
   `<style scoped>` block's token references. `happy-dom` never applies a scoped
   style, so a mounted-component assertion about `z-index` or the gradient would
   have passed against nothing — the same trap `rules.md` § R27 recorded. The
   precedent is `SectionGlow.test.ts`, which reads `global.css` the same way.
4. **`public/index.html` was left where it is.** Moving it would have been the
   other way to fix R33, but it is feature 3's deliberate artifact
   (`rules.md` § R25) and the site needs it at the root. The catalogue is what
   moved.

## Things I noticed but deliberately did **not** change

- **`SectionGlow.vue`'s stale doc comment and dead `'920'` variant.** FR-011 and
  SC-006 are explicit and the spec flags this as Roberto's to schedule.
  `SectionGlow.test.ts` currently asserts every declared glow token is
  reachable, so removing `--spacing-glow-920` means touching that test too —
  worth knowing before it is scheduled.
- **`<body>` sets no font family.** Every text element names `font-instrument`
  or `font-poppins` itself, which is the existing convention and works, but a
  future bare text node would land in the system stack. Out of scope here
  (FR-018), worth a line in a future spec.
- **Vertical glow overflow.** `overflow-x: clip` handles the horizontal axis,
  which is what the design's negative-x glows need. A future section placing a
  glow that extends past the *bottom* of the page would add scroll height.
  Nothing to fix now (no glow is placed), but it belongs to whoever places the
  first one.
