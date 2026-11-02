# Review · feature 44 `m1_home_page`

- **Date:** 2026-11-01
- **Branch:** `feat/v2-home`, uncommitted working tree (`git status`, `git diff HEAD`, untracked files)
- **Status at review:** `reviewing` (confirmed in `feature_list.json`)
- **Sources:** `specs/044-home-page/` (with § Amendments FR-034…FR-039 and the § 10 line boxes), the feature-44 acceptance list, `docs/harness/CHECKPOINTS.md`, constitution 2.1.2, AGENTS.md § 3.1, `docs/harness/progress/pen-extract-44.md` §§ 1–11, the implementer's report `impl_home_page.md`

## Verdict

**REJECTED.** One blocking item: a component that feature 44 edited is now over the constitution's 200-line limit. Everything else checks out. The behaviour, the anchors and SEO, the quarantine, the tokens, the icons and the gate are all correct. The fix is a few lines. The should-fix story gaps can go in the same round.

## Blocking

1. **`app/features/shell/ui/MobileMenu.vue` is 203 lines, over the 200-line limit (Constitution Art. V, CHECKPOINTS C3).**
   - It was 197 at `HEAD`. Feature 44 added the 5-line `aria-current` comment at lines 126–130 and the `:aria-current="undefined"` binding.
   - It is the only non-legacy `.vue` file over 200 lines (all `app/**/*.vue` files scanned).
   - Fix: shorten the comment to one or two lines, or point it at `SiteHeader.vue`, which carries the same explanation. That gets the file to ≤ 200 with no behaviour change.

## Should fix

2. **FR-032: the leaf-component stories do not cover both viewports and both locales, though the report says they all do.** The report claims "every component has ES/EN stories at 390 and 1440". That is true for the four sections, `AlsoAvailable`, `CommitmentChip`, `MapLegend` and `WorldMap`. It is not true for these:
   - `app/features/landing/ui/ProcessTimeline.stories.ts`: only `EsDesktop1440` and `EnMobile390`.
   - `app/features/landing/ui/ServicesCarousel.stories.ts`: only `EsMobile390` and `EnDesktop1440`.
   - `app/features/landing/ui/ProcessStep.stories.ts`: there is no EN desktop story and no ES lit mobile story.
   - `app/features/landing/ui/ServiceCard.stories.ts`: eight ES/EN variants, but no viewport is set on any of them.
   - `MapPin`, `CarouselIndicator` and `MapRegionTabs` have no text that varies by locale (and the tabs exist only below `lg`), so their single-axis stories are acceptable.
   - The section stories do render these components at all four combinations, so the review is not blocked. Add the missing pairs, or record the exception in the plan's Complexity Tracking.

## Advisory

3. **The icon README cites a path that no longer exists.** `app/assets/icons/README.md` (the "Feature 44 glyphs" section) says the downloads are in `docs/harness/progress/assets-44/lucide/`.
   - The implementer moved them to `/tmp/f44-lucide-raw/lucide/` because Biome's `noSvgWithoutTitle` failed on them (deviation 3). `/tmp` is not kept.
   - The provenance claim is still accurate: I compared the raw files against the normalized ones (below).
   - Suggest rewording the entry to "downloaded to … and not retained". Another option is to keep the raw files under a Biome-ignored path.
4. **`<main class="">` on the home.** `app/layouts/default.vue:143-145` binds `undefined`, which still renders an empty `class` attribute. It is harmless. `:class="{ 'mx-auto max-w-shell-max px-page': !isFullBleed }"` reads better.
5. **A literal separator in a template.** `app/features/landing/ui/AlsoAvailable.vue:56` has `{{ ' · ' }}`. It is decorative, `aria-hidden` punctuation, and the footer follows the same convention. Under a strict reading of Article VI it is a hardcoded string; it is acceptable as is.
6. **Some logic sits in a component.** `WorldMap.vue` builds `cityGroups` (grouping plus the region filter) inside the component. It could become a pure helper next to `mapGeometry.ts`, with a unit test. `useTimelineProgress` is about 85 lines as one composable, built from small inner functions; that is over the ~30-line guide but follows the repo's existing pattern (`useMobileMenu`).
7. **Icon titles show as tooltips.** The README contract requires a `<title>` in every icon. Inlined with `v-html`, the title produces a native hover tooltip ("lucide · compass") over the decorative tile, even inside `aria-hidden`. This is pre-existing (feature 42's `arrow-right`), so it belongs to the README contract, not to this feature.
8. **The map is edge to edge at 1024.** The desktop map spans the full 1024 viewport with no gutter. AGENTS § 3.1 allows this between the anchors. It is noted only so Roberto sees it on the build.

## Security

**Clean.** No out-of-scope changes:
- `package.json`, `pnpm-lock.yaml`, `nuxt.config.ts`, `.husky/`, `biome.json` and `.storybook/main.ts` are untouched. No dependency was added. `nitro.preset` is still `static` and there is no `server/` route.
- The only URL in the diff and new files is `http://www.w3.org/2000/svg` (an SVG namespace).
- No `fetch`, XHR, `sendBeacon`, `eval`, storage, cookie or `process.env` use. No secrets.
- No text aimed at agents or prompt-injection content. The spec docs mention `CLAUDE.md` only as the SpecKit context file.
- Changed outside `app/`, `tests/`, `i18n/`, `specs/` and `docs/`: `.storybook/preview.ts`, which adds a 360 viewport, and `.specify/feature.json`, a pointer to the spec folder. Both are benign.
- `world-dots.svg` is a single `<path fill="currentColor">` with no script and no links. It is byte-identical to the leader's export (`cmp`).
- In the headless runs, the home made zero non-local network requests at 360, 390, 768, 1024, 1280, 1440 and 1920, in both locales.

## What I verified

**Gate**
- `./init.sh` exits **0**. I ran it myself after a hook-started run had finished; I killed nothing.
- `typecheck`, `check`, tests (163 files, 2 208 tests), `generate` and `storybook:build` all pass.

**Status and tasks**
- `feature_list.json` id 44 is `reviewing`.
- `tasks.md` has 72 of 72 checked, `plan.md` has no unchecked box, and the spec has no `NEEDS CLARIFICATION`.

**Constitution**
- **No version markers.** No `m1` or `v2` in any new file, token, utility or story name.
- **Quarantine.**
  - The v1 Hero, Purpose\*, Services\*, ServiceItem and ContactSection are under `landing/ui/legacy/`, and the v1 data and logic under `landing/{data,logic}/legacy/`.
  - All four legacy story files are titled `Legacy v1/Landing/…`.
  - The only `legacy/` reference in v2 code is the barrel's `ContactSection` export, as the contract requires.
- **Tokens.**
  - No hex, rgb or px literal and no v1 or `legacy-*` utility in the v2 components (grep, plus the extended `token-literals` test).
  - New colours are tokens in `global.css`; `#e98a77` and `#141414` were approved because no palette match exists.
  - The only new token declared twice is `--progreso-paso`, and the second declaration is the intended reduced-motion override.
  - I spot-checked the fluid clamps at both anchors: hero 740 → 1000, button-row top padding 8 → 0, head gap 24 → 22, step tracking 0 → −0.4, step line box 20.3 → 22.5.
- **Component sizes.** Every new component is under 200 lines (the largest, `WorldMap`, is 171). The one exception is MobileMenu (Blocking 1).
- **i18n parity.** The key sets in `es` and `en` are identical. The v2 copy matches `muush-1.0.md` §§ 4.2–4.5 verbatim. Short step 01 and the Q2 accessibility copy (tab-list name, city names, EN Dublin, Amsterdam and Los Angeles) are present.

**Visuals at 1440 (ES), headless Chrome on the generated site**
- Hero 1440 × 1000. Pill top at y 290. h1 96 / 101.76 / −3.5, with line 2 in Gris 400. Primary button 252.5 × 55.
- Map 1408 × 470 at opacity 0.8, no role, tabs `display:none`. Nine pins at 28 × 28.
- Cards 305 wide, gap 20, 405.5 tall (383 for the fourth), against the drawn 407 and 384; the residual is the `.pen`'s rounding of 23 px lines, which § 10 records. Servicios padding 120 / 80.
- Cómo trabajamos 729.4 tall against 730, with five 240-wide columns.
- The screenshot shows the listón behind the hero.

**Visuals at 390 (ES)**
- Hero 740 tall, h1 34 / 37.4. The buttons (177.8 × 44 and 144.2 × 42) sit side by side.
- Tabs 178.9 × 40.8. Map box 342 × 240, radius 16, opacity 1.
- Carousel cards 290 wide at x 24, 328, 632 and 936 (gap 14). Indicator 24 below.
- Rail rows 112 each.

**Other widths**
- At 360, 768, 1024, 1280 and 1920, in ES and EN, `scrollWidth` equals the viewport width.
- At 360 the ES buttons wrap with the second centred, and the EN buttons fit on one row.
- At 1920 the map is capped at 1408 and the cards at 305.

**Map tabs (390)**
- ArrowRight, Home, End and ArrowLeft move both selection and focus.
- The roving tabindex goes `[0,-1]` ↔ `[-1,0]`, and `aria-labelledby` follows the selected tab.
- The zoom is 4.94 → 7.41 over 0.7 s, mid-transition 5.99.
- The hidden city list is the six American cities, or Dublín, Ámsterdam and Estonia.
- Under reduced motion the transition is `0s` and the zoom jumps.

**Carousel indicator (EN, 390)**

| Scroll | Lands at | Active mark |
|---|---|---|
| 0 | 0 | 0 |
| 150 | snaps back to 0 | 0 |
| 304 | 304 | 1 |
| 608 | 608 | 2 |
| end | 860 | 3 (the last) |

The widths are 22 / 6 / 6 / 6 and the active colour is Red muush 500.

**Timeline**
- At 1440 it fills from the left by scroll, with step 01 lit first.
- At 390 it fills by scroll per segment (`00000 → 11100 → 11111`) and reverses when scrolled back up.
- The listeners are passive and coalesced with rAF. They are removed in `onBeforeUnmount`, the rAF frame is cancelled, and the watchers are instance-bound.
- Under reduced motion, at both widths: `--progreso:1`, `11111`, and no running animations.
- The SSR and no-script HTML carries `--progreso:1`, five `data-lit`, America selected, and the tabpanel labelled by the America tab.

**Radar ping**
- The `::before` ghost runs `pulso 2.4s ease-out infinite` in the dot's own colour, `rgb(229,53,47)`.
- Keyframes: scale 1 → 3, opacity 0.6 → 0. It is driven by one token, `--pulso`.
- It runs on the Pill (and so the RotatingPill), the team and partner pins and the lit step cores.
- Estonia and unlit steps have no ghost. Under reduced motion `content: none` applies on all 22 hosts, and the dots stay visible.
- Footprints are unchanged: Pill 36 tall with a 7 px dot in a 20 px footprint, pins 28 × 28.
- The static-ring tokens are gone, and no v2 code reads `radar-ping` or `--duration-radar-ping`.

**Deviations the implementer listed**
- **`fullBleed`.** Only `/es` and `/en` drop the frame. `/es/nosotros`, `/en/about` and both 404s still render `<main class="mx-auto max-w-shell-max px-page">`.
  - The v1 contact section now carries the same frame on its own `<section>`, so the content box is identical under border-box.
  - Its glows are inside `SectionBackdrop`, which has been `hidden` since feature 43, so the padding-box shift has no visible effect.
- **404 shortcut.**
  - The shortcut, `shell.notFound.shortcuts.purpose` (in both locales), the `legacyHash` destination member and its resolver branch and test are all gone. Nothing still reads them.
  - The 404 renders two shortcuts with one separator. Roberto approved this (spec § Amendments, extract § 11).
- **Retired v1 keys.**
  - No code reads `landing.purpose.*`, the v1 `landing.hero.*` / `landing.services.*` leaves or `shortcuts.purpose`. The only mentions are two comments in `about-copy` and `forms-application-copy`.
  - The v1 seams `useHeroContent`, `usePurposeContent` and `useServicesContent` (v1) are deleted.
- **Tests changed on purpose.** Each change follows from a superseding spec item:
  - `forms-copy` drops only the `contact.ctaSecondary == hero.ctaSecondary` equality, because the hero key is gone.
  - `tablet-layout-tokens` changes paths only.
  - `not-found-output` goes from three shortcuts to two.
  - `landing-copy` is rewritten for the v2 copy.
  - `static-output` replaces the v1 hero, purpose and services blocks with the v2 block: order, one `h1`, hrefs, no retired ids, map inline, lit with no script, the fragment-target test (home, About and 404 in both locales, with a non-vacuous guard) and logo `aria-current`.
  - `seo-output.test.ts` is unmodified and passes.

**No regressions**
- **Logo links.** In the generated home, none of the three logo links carries `aria-current`. Exactly one header link does (Inicio / Home). Every fragment `href` on the home resolves to an existing id.
- **Feature 43.**
  - The shell tests pass, including the new `ExactActiveLinkStub` cases.
  - `DESKTOP_MEDIA_QUERY` moved to `app/shared/data/layout.ts` with the same value, and `useMobileMenu` imports it.
  - I did not run the language-switch position restore myself. The implementer reports it working, and its tests pass.

**Icons**
- I compared each of the nine normalized SVGs with the raw `lucide-static` 0.469.0 file (the version string is in the raw licence comment).
  - The shape elements are identical in all nine.
  - The only root-level differences are the removed `class`, `width` and `height` and, on the four service glyphs, `stroke-width` 2 → 1.5.
  - The only added element is a `<title>`. Nothing else was added.
- Each README entry cites `lucide-static` 0.469.0 (ISC).

## Not verified

- The language-switch position restore, as noted under No regressions.
- A no-WebGL pass. The poster fallback is feature 42's tested behaviour.
- A JS-disabled browser pass. The no-script state was checked in the generated HTML instead.
- CHECKPOINTS C6 (a `history.md` entry): this is a leader close-out step.

## Re-review 2

- **Date:** 2026-11-01
- **Scope:** the fixes in `impl_home_page.md` § "Review-44 fixes", plus a check that they introduced no regressions
- **Status at re-review:** `reviewing` (confirmed in `feature_list.json`)

### Verdict

**APPROVED.**

### Blocking 1: MobileMenu.vue over 200 lines — resolved

- `app/features/shell/ui/MobileMenu.vue` is now **199** lines.
- The diff against `HEAD` is the binding the feature needs plus a one-line comment: `<!-- No aria-current on the logo (feature 44, FR-028; see SiteHeader). -->` and `:aria-current="undefined"`. Nothing else in the file changed.
- The implementer also shortened the comment in `legacy/ContactSection.vue`, which feature 44 had grown from 196 to 203; it is now 197. Its section classes are unchanged (`relative mx-auto mt-section-gap max-w-shell-max px-page pt-contact-top`).
- No non-legacy `.vue` file is over 200 lines.
- Three legacy files are still over 200: `legacy/PurposeCarousel.vue` (215), `legacy/PurposeConstellation.vue` (272) and `legacy/PurposeSection.vue` (376). They had exactly those line counts at `HEAD`; feature 44 only moved them. They are quarantined v1 code that feature 47 deletes, so they are not a feature-44 violation.

### Should fix 2: story coverage — resolved

- `ProcessTimeline` and `ServicesCarousel` now have ES/EN × 390/1440.
- `ProcessStep` now has lit and not lit, in ES and EN, at both viewports (8 stories).
- `ServiceCard` now has `EsDesktop1440` and `EnDesktop1440` on top of the eight per-card variants. Those variants now carry a `mobile` viewport global.
- The remaining exceptions are documented in their story files and are justified:
  - `CarouselIndicator` has no text and exists only below `lg`.
  - `MapRegionTabs` exists only below `lg`.
  - `MapPin` has no text and the same size at every width; the `WorldMap` stories cover it.
- `storybook:build` passes.

### Advisories

- **3 (icon README): addressed.** `app/assets/icons/README.md` now says the raw downloads were staged and not retained. It still cites `lucide-static` 0.469.0 (ISC).
- **4 (`<main class="">`): changed, but the output is the same.**
  - `app/layouts/default.vue:143` now uses `:class="{ 'mx-auto max-w-shell-max px-page': !isFullBleed }"`.
  - The generated `/es` and `/en` still render `<main class="">`: Vue SSR emits an empty `class` for an object binding that resolves to nothing. The report's claim that it "renders no empty `class`" is therefore inaccurate.
  - It is harmless, and I am not raising a finding.
  - About and both 404s still render `<main class="mx-auto max-w-shell-max px-page">`.
- **6 (logic in `WorldMap`): addressed.**
  - `cityGroups` is now the pure `mapCityGroups()` in `app/shared/utils/mapCityList.ts`, with `mapCityList.test.ts`. `WorldMap.vue` is 158 lines.
  - The SSR output is the same as before. The hidden list holds Equipo with seven cities, Aliados and Estonia. Below `lg`, the cities outside America (Dublín, Ámsterdam, Estonia) and the two empty groups carry `max-lg:hidden`.
- **5, 7 and 8: left as they were.** The `' · '` literal, the icon `<title>` contract and the edge-to-edge map at 1024 were all accepted in the first review.

### Regressions

None found.
- `./init.sh` **exits 0**. I ran it myself after waiting for a hook-started run to finish; I killed nothing. Tests: 164 files and 2 214 tests passed, up from 163 and 2 208, which accounts for the new helper's tests.
- The generated home still has one `h1`, every fragment `href` resolves to an existing id, there are five `data-lit` with `--progreso:1`, and the America tab is selected.
- The fix diffs touch only:
  - a comment and a binding in `MobileMenu.vue`;
  - a comment in `ContactSection.vue`;
  - the class binding in `default.vue`;
  - the extracted helper and its test;
  - stories;
  - the icon README.

### Security

**Clean.**
- `package.json`, the lockfile, `nuxt.config.ts` and `.husky/` are untouched.
- No new URLs; the only one is the SVG namespace.
- No network calls, scripts or secrets added.
- No text aimed at agents.

## Reopen 2026-11-02 review

- **Date:** 2026-11-02
- **Scope:** the reopen only: `feature_list.json` id 44 "REABIERTA / ACLARACIÓN / Y (Roberto, 2026-11-02)" and acceptance items 1–5; spec 044 § Amendments "Roberto review 2026-11-02" (FR-040…FR-047); tasks T073–T079; `impl_home_page.md` § "Reopened 2026-11-02 · Roberto review"
- **Status at review:** `reviewing` (confirmed in `feature_list.json`)

### Verdict

**APPROVED.** No blocking or should-fix findings. Advisories below are for the leader.

### Findings (advisory, non-blocking)

1. **Acceptance item 3 wording is stale.** `feature_list.json:953` still says "al salir vuelve al estado del scroll". Item 4, the ACLARACIÓN and FR-044/FR-045 (`specs/044-home-page/spec.md:733-748`) supersede it: there is no desktop scroll state, and leaving returns to the unlit rest. The implementation follows the spec. The leader may want to align the item's wording.
2. **The design docs still describe the removed desktop fill.**
   - `specs/044-home-page/contracts/components.md:123,125,127,131` still lists `HORIZONTAL_TRAVEL_RATIO`, `horizontalProgress`, `isStepLitHorizontal` and the composable's `progress`, and has no entry for `useTimelineHover` / `dotProgress` / `litUpTo`.
   - `specs/044-home-page/data-model.md:167` still lists `--proceso-linea`.
   - The spec amendment is authoritative, so this is not a code defect. A "superseded by FR-044" note would stop a later reader from reintroducing them.
3. **Two test names are stale.** `app/features/landing/logic/useTimelineHover.test.ts:75` ("leave the scroll in charge") and `:99` ("hand back to the scroll") predate the ACLARACIÓN. The assertions are correct (`null` means rest); only the wording is outdated.
4. **The desktop still listens to scroll.** `app/features/landing/logic/useTimelineProgress.ts:68-73` keeps its passive scroll/resize listeners from `lg`. Each event schedules one rAF that returns at `:49` without measuring. This is correct, cleaned up on unmount and on reduced motion, and costs almost nothing. Detaching from `lg` is optional.
5. **The split point is cached.** `app/features/landing/logic/useTimelineHover.ts:45-47` reads the dot offset only when the active step changes. If the window is resized while a step stays keyboard-focused, the red end stays at the old offset until focus moves. This is an edge case, and the comment at `:43-44` covers only the pointer.
6. **Pointer-out while a step holds keyboard focus.** The preview returns to the focused step, not the rest (`useTimelineHover.ts:31`; verified in Chrome). This follows FR-042 ("the pointer wins over focus while both are present"). FR-045's "returns to rest" then applies once focus also leaves. I read this as intended.
7. **The report's test count is slightly off.** It says 2238 tests; my gate run counted 2239 (165 files). Everything passes.

### Security

**Clean.**
- `package.json`, `pnpm-lock.yaml`, `nuxt.config.ts` and `.husky/` are unchanged against `HEAD` (`git diff --quiet` passes).
- No `.claude/`, `.github/` or hook files changed.
- Every file modified after Re-review 2 (mtime newer than this file before this section) is inside the reopen's scope:
  - `global.css`;
  - `timelineProgress`, `useTimelineHover` and `useTimelineProgress` (+ tests);
  - `AlsoAvailable`, `ProcessStep` and `ProcessTimeline` (+ tests and stories), plus `HowWeWorkSection.stories`;
  - `SiteHeader` (.vue, .test, .stories);
  - `tests/design-tokens`, `tests/static-output` and `tests/token-literals`.
- No network calls, URLs (other than the SVG namespace that already existed), storage, `eval`/`innerHTML` in app code, secrets, or text aimed at agents in the changed files.

### What I verified

- **Composables.**
  - `useTimelineHover` computes `active = isDesktop ? (pointed ?? focused) : null`, so the pointer wins and nothing applies below `lg`.
  - `pointOut` ignores a late leave from another step.
  - `focusIn` accepts only `:focus-visible`.
  - `focusOut` ignores moves inside the step.
  - It registers no listeners of its own (Vue template handlers, plus `useDesktopLayout`, which removes its `change` listener on unmount).
  - `timelineProgress.ts` now holds only the vertical helpers plus `dotProgress`/`litUpTo`.
  - `useTimelineProgress` is rail-only: it returns `lit` and `fills`, does not measure from `lg`, and has an unmount-cleanup test (`useTimelineProgress.test.ts:155`).
- **Removals.** `horizontalProgress`, `isStepLitHorizontal`, `HORIZONTAL_TRAVEL_RATIO`, `--proceso-linea`, `--punto-halo*` and `--spacing-pill-halo` have no references left in `app/` or `tests/` outside `legacy/`. The only exceptions are negative assertions: `ProcessTimeline.test.ts:86` and `tests/design-tokens.test.ts:541,606`.
- **Tests.**
  - The `SiteHeader.test.ts` diff against `HEAD` (feature 43) is additions only: the FR-028 logo test and the FR-040 grid test. No feature-43 assertion was removed.
  - The changed assertions in `ProcessStep`, `ProcessTimeline`, `static-output` (`--progreso: 0`, five rail `data-lit`, no `data-column-lit`) and `design-tokens` (`--proceso-linea` undefined, `pulso-tenue`, `cabecera`, `--paso-escala`) map to FR-044, FR-046 and FR-047.
  - UNVERIFIED: a line-level diff of these test files against the Re-review-2 state is impossible because nothing is committed. The check is by content and mtime.
- **Constitution v2.1.2.**
  - Line counts (`wc -l`): `ProcessStep.vue` 152, `ProcessTimeline.vue` 74, `AlsoAvailable.vue` 63, `SiteHeader.vue` 169. All non-legacy components are ≤ 200; the maximum is `MobileMenu.vue` at 199, untouched.
  - No version markers, `legacy-*` tokens, hex/rgb/px literals or arbitrary values in the changed components and composables.
  - The new tokens live in `global.css`: `--grid-template-columns-cabecera`, `--paso-escala` and the `pulso-tenue` utility.
  - Logic lives in composables; `useTimelineHover.ts` is in the literal scan (`tests/token-literals.test.ts:121`).
- **Gate.** `./init.sh` → **EXIT 0** on the first run: typecheck OK, check OK, 165 files / 2239 tests passed, generate OK, storybook:build OK. A vitest run from another process was active beforehand; I waited for nothing and killed nothing.
- **Headless Chrome.**
  - Setup: my own CDP script, outside the repo; `.output/public` served by `python3 -m http.server`. Chrome and the server were both stopped afterwards.
  - **Header centring:**

    | Width | Bar centre − page centre | Gap logo→bar | Gap bar→group |
    |---|---|---|---|
    | 1024 | 0.00 px | 236.9 | 30.6 |
    | 1280 | 0.00 px | 364.9 | 158.6 |
    | 1440 | 0.00 px | 444.9 | 238.6 |
    | 1920 | 0.00 px | 444.9 | 238.6 |

    - The nav is `display: grid` with equal outer tracks (e.g. 484.9 / 310.1 / 484.9 at 1440). There is no overlap.
    - `/en` at 1440 is −0.01 px and `/es/nosotros` is 0.00 px.
    - At 390 the bar is still `flex` / `space-between`, 342 × 60, and the link bar is `display: none`.
  - **Chips (1440):** both dots are Acero 200 `rgb(166,182,178)`, and the `::before` ghost runs `pulso 2.4s` in the same colour. The chips are 96.4 × 35 and 107.8 × 35. Under reduced motion the ghost is `content: none` and the sizes are unchanged.
  - **Timeline at 1440:**
    - **Rest:** no column lit, red width 0, line `rgba(244,244,242,.2)` with no background image, no scale, five grey ghosts `rgba(244,244,242,.4)`.
    - **Hover step 1 / 3 / 5:** lit [1] / [1–3] / [1–5]. The red ends at 14 / 534 / 1054, which are the measured dot centres. Scale is 1.04 on the hovered step only. Ghosts are red up to the step and grey after it.
    - **Leave:** back to the rest state.
    - **Keyboard:** Tab from step 1 to step 2 gives lit [1–2], red to 274, scale 1.04 and a 2 px solid focus-visible outline. Hovering step 4 while focused gives [1–4]; leaving returns to [1–2].
    - **Click focus:** clicking step 5 and moving away leaves step 5 focused with no ring, and the preview returns to rest (it is not pinned).
    - **Reduced motion:** the same states, no scale anywhere, no ghosts.
    - **Numbers:** all five are Blanco `rgb(244,244,242)`.
  - **Rail at 390:**
    - Above the list nothing is lit; mid-scroll it is `L1 L0.28 - - -`.
    - Rail dots ghost red when lit and grey when unlit; numbers are Blanco.
    - Hover gives no column state and no scale, and the desktop line is `display: none`.
    - The rail has no tab stops (no `tabindex` attribute).
- **No regressions.**
  - `/en` has `lang="en-US"`, a canonical link and hreflang alternates for `x-default`, `es`, `es-MX`, `en` and `en-US`. The language switch points at `/es`, and the page has one `h1` and two shader canvases.
  - `/es/404` renders "Página no encontrada · muush".
  - These files are untouched by the reopen; the SEO, 404 and shell suites pass in the gate.

### Not verified

- A real (non-emulated) pointer and a physical keyboard. CDP input events were used.
- Visual parity with `Tng1t` at rest. FR-044 intentionally departs from the `.pen` (it now shows a grey line and all steps unlit).

## Double-trail fix review

- **Date:** 2026-11-02
- **Scope:**
  - FR-048 (the static halo removed from `ProcessStep.vue`, and `@utility pulso` starting the ghost at the host's outer edge through `--pulso-borde`);
  - the advisory follow-ups 2, 3, 5 and 7;
  - the leader's rewording of acceptance item 3.
- **Status at review:** `reviewing` (confirmed in `feature_list.json`)
- **Timing note:** the FR-048 code (`global.css`, `ProcessStep.vue` and its test, `tests/design-tokens.test.ts`; mtime 00:31) landed during my "Reopen 2026-11-02 review" (appended 00:37). The browser figures in that section that mention a grey halo wrapper may predate it. This section supersedes them for the dots.

### Verdict

**APPROVED.**

### Findings (advisory, non-blocking)

1. **`--blanco-6` has no consumer.**
   - The token is still declared at `app/assets/css/global.css:1018` (with `--color-blanco-6` at `:2892`). Its comment at `:1016` still says "not-lit step halo".
   - FR-048 removed its only consumer: no component outside `legacy/` uses `bg-blanco-6` or `--blanco-6`.
   - It is still pinned in `tests/design-tokens.test.ts:518,562`.
   - Either remove it and its pins, or correct the comment. It is harmless, but it is now a dangling token.
2. **The ghost overhangs by 0.5 px at DPR 1.**
   - Chrome snaps the 1.5 px ring to a used width of 1 px, so the ghost (inset −1.5 px, 13 px wide) overhangs the 12 px dot by 0.5 px per side at scale 1.
   - This is sub-pixel, and it is still one solid disc, not a second ring.
   - The implementer's "exact at DPR 2" is UNVERIFIED by me: my DPR-2 probe still reported a 1 px computed border, possibly an emulation artefact.

### `pulso` correctness

- **`@utility pulso`** (`global.css` ≈3172-3197): `inset: calc(-1 * var(--pulso-borde, 0rem))`, which is 0 by default.
- **`pulso-tenue`** (≈3217-3220): sets `--pulso-fantasma: var(--texto-tenue)` and `--pulso-borde: var(--trazo-anillo)`.
- Both custom properties are set on the dot itself. Dots have no children, so the inheritance cannot leak.
- The ghost keeps `border-radius: inherit` and centred `transform: scale()`, so it stays a circle centred on the dot.
- Reduced motion still sets `content: none`.

### No halo remains

- Desktop `[data-punto-paso]` (`ProcessStep.vue` ≈106-120) now has only `hidden size-paso-punto place-items-center rounded-full lg:grid`.
- The rail dot wrapper has none either.
- In Chrome, both wrappers have a computed background of `rgba(0,0,0,0)` and `box-shadow: none`. The dots have no `box-shadow`, no outline and no `::after`.

### Tests pin it

- `app/features/landing/ui/ProcessStep.test.ts:202-216` asserts that the wrapper has no `bg-`, `border-`, `shadow-` or `ring-` class and no inline style, in both states.
- `tests/design-tokens.test.ts:602-609` pins `inset: calc(-1 * var(--pulso-borde, 0rem))` and `--pulso-borde: var(--trazo-anillo)` in `pulso-tenue`.

### Mid-animation frames (headless Chrome)

- **Method:** my own CDP probe, outside the repo, on the regenerated `.output/public`. Each dot's `::before` animation was paused at fixed times. Chrome and the HTTP server were stopped afterwards; I killed nothing I did not start.
- **Unlit desktop dot, 1440:** 12 px outer, 1 px used border, ghost inset −1.5 px, 13 px wide, Blanco 40 %. Each dot has exactly one animation (`::before:pulso`).

  | Time | Scale | Opacity | Ghost outer radius |
  |---|---|---|---|
  | 0 ms | 1.000 | 0.60 | 6.5 px |
  | 600 ms | 1.756 | 0.37 | 11.4 px |
  | 1200 ms | 2.369 | 0.19 | 15.4 px |
  | 1800 ms | 2.813 | 0.06 | 18.3 px |

  This is one expanding disc, starting at the dot's edge.
- **Rail dot, 390:** same geometry (at 900 ms: scale 2.08, radius 13.5 px), one animation.
- **Unbordered hosts are unchanged** (inset 0, ghost equal to the dot, at 600 ms):
  - Pill 7 px, red;
  - chips 6 px, Acero 200;
  - pins 8 px, red.
- **All `.pulso` hosts:**
  - at 1440: 19 have no border and inset 0; 5 are `pulso-tenue` with a 1 px border and inset −1.5 px;
  - at 390: 14 and 10 (the rail dots).

  No borderless host picked up a negative inset.

### Doc and test-name fixes changed no behaviour

- Files changed after the previous section:
  - `specs/044-home-page/` (`spec.md`, `contracts/components.md`, `data-model.md`, `research.md`, `quickstart.md`);
  - `docs/harness/progress/impl_home_page.md` and `current.md`;
  - `feature_list.json` (the acceptance item 3 rewording only; it now says "al salir vuelve al reposo (todo apagado, línea gris)");
  - `useTimelineHover.test.ts` (two `it` titles, `:75` and `:99`);
  - `useTimelineHover.ts`.
- `useTimelineHover.ts` changed only the comment at ≈43-52. The `progress`, `lit`, `pointIn/Out` and `focusIn/Out` bodies match my earlier reading line for line.
- Advisory 4 was deliberately left alone; `useTimelineProgress.ts` is unchanged.

### Security

**Clean.**
- `package.json`, the lockfile, `nuxt.config.ts` and `.husky/` are unchanged against `HEAD`.
- No new URLs in the touched specs or code, no network calls, no secrets, no text aimed at agents.
- The changes are confined to `global.css`, `ProcessStep` (+ test), `tests/design-tokens.test.ts`, the `useTimelineHover` comment and test titles, and docs.

### Gate

`./init.sh` → **EXIT 0** on the first run: typecheck, check, test (165 files / 2239 tests), generate and storybook:build all OK. No lock contention.

## Final check

- **Date:** 2026-11-02
- **Scope:** the `--blanco-6` removal, the mobile header after the cancelled "Y 2" (transparent bar), and the implementer's focus-ring investigation
- **Status at review:** `reviewing` (confirmed in `feature_list.json`)

### Verdict

**APPROVED.** I have no open findings. My earlier advisory 4 (the desktop scroll listener) remains, deliberately accepted.

### `--blanco-6`

- No declaration and no `--color-blanco-6` alias remain in `app/assets/css/global.css`.
- The comment at `:1016` now reads "Blanco at 10 % (active map tab) and 25 % (inactive carousel dot)" and no longer mentions the step halo.
- The only mentions left in `app/` and `tests/` are negative assertions: `tests/design-tokens.test.ts:543-544` (declaration and alias absent) and `ProcessStep.test.ts:35`.

### Mobile header

- **Unchanged from feature 43 below `lg`.**
  - Against `HEAD`, the `SiteHeader.vue` nav class differs only by the inserted `lg:grid lg:grid-cols-cabecera`.
  - `bg-nav-fondo`, `border border-linea`, `backdrop-blur-header`, `lg:bg-transparent` and `lg:backdrop-blur-none` are byte-identical.
  - The other changes are the ones already approved: `:aria-current="undefined"` with its comment (FR-028), `lg:justify-self-start` on the logo, and `lg:justify-self-end` on the group.
  - The generated `/es` nav still carries `bg-nav-fondo` and `backdrop-blur-header`.
- **No transparent-header leftovers.**
  - `SiteHeader.test.ts` against `HEAD` is additions only (the 2 deleted lines are an import and a function signature that were rewritten). It still asserts `bg-nav-fondo` / `backdrop-blur-header` (`:131-133`).
  - `SiteHeader.stories.ts` adds only the FR-040 note.
  - The `tests/static-output.test.ts` header assertions (`:455-466`, `bg-nav-fondo` and `backdrop-blur-header`) are not part of the feature-44 diff.
  - `specs/044-home-page/` has no amendment, FR or task for a transparent header.
  - `feature_list.json` records "Y 2" followed by "CANCELADO (Roberto, 2026-11-02)".
- **Mobile header in the browser:** I did not re-run headless Chrome for this part. The implementer reports `rgba(11,11,11,.45)` + `blur(20px)` at 390. Feature 43's tests pin the classes, and my earlier runs of this review (1440 grid centring; 390 `flex` / `space-between`, 342 × 60) still hold for unchanged code.

### Focus ring

- There was no code change. My earlier run (Reopen review) agrees with the implementer: focus from a click on a timeline step showed `outline: none`, and keyboard Tab showed a 2 px solid ring.
- A physical-device check remains UNVERIFIED, as the implementer notes.

### Security

**Clean.**
- `package.json`, the lockfile, `nuxt.config.ts` and `.husky/` are unchanged against `HEAD`.
- Since the previous section, only the following changed: `global.css` (token removal), `tests/design-tokens.test.ts`, `SiteHeader.*` (back to the approved state), `tests/static-output.test.ts`, `feature_list.json`, and the progress docs.
- No URLs, network calls, secrets or text aimed at agents.

### Gate

`./init.sh` → **EXIT 0** on the first run: typecheck, check, test (165 files / 2239 tests), generate and storybook:build all OK. There was no lock contention and I killed no processes.
