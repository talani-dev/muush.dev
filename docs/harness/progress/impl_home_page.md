# Implementation · feature 44 `m1_home_page`

- **Date:** 2026-11-01
- **Branch:** `feat/v2-home`. Nothing is committed.
- **Spec:** `specs/044-home-page/`. All 72 tasks are checked, including T067–T072 from the amendments.
- **Result:** `./init.sh` exits 0. Status stays `in_progress`; the leader moves it to `reviewing`.

## 1 · What was built

### Assets

- **Map.** `app/assets/map/world-dots.svg` is a byte-for-byte copy (checked with `cmp`), plus a `README.md`. It is 5 730 B gzipped, has 1 693 dots and is inlined with `?raw`.
- **Icons.** The nine lucide glyphs are in `app/assets/icons/`, normalized and listed in the README with their source (lucide-static 0.469.0, ISC).
  - Removed: the licence comment, `class`, `width` and `height`.
  - Added: a `<title>`.
  - Paint uses `currentColor`.
  - Stroke width: 1.5 on the four service glyphs (the `.pen`'s "weight 300"). The five commitment glyphs keep lucide's 2, because the extract gives them no weight.

### Shared (`app/shared/`)

| Layer | Files |
|---|---|
| data | `layout.ts` (`DESKTOP_MEDIA_QUERY`, moved from `useMobileMenu`), `mapPins.ts`, `mapRegions.ts` |
| logic | `useDesktopLayout.ts`, `useMapRegion.ts` (`nextRegion`) |
| test helpers | `fakeMediaQuery.testing.ts` |
| utils | `mapGeometry.ts` |
| ui | `WorldMap.vue`, `MapPin.vue`, `MapRegionTabs.vue`, `MapLegend.vue`, plus `mapFixtures.testing.ts` |

Every module and component has its tests, and every component has stories. Story coverage by viewport and locale is listed per component in § Review-44 fixes; my first version of this report overstated it.

### Landing (`app/features/landing/`)

| Layer | Files |
|---|---|
| data | `heroContent`, `whoWeAreContent`, `servicesContent`, `howWeWorkContent`, plus the `localeKeys.testing.ts` helper |
| logic | `use{Hero,WhoWeAre,Services,HowWeWork}Content`, `carouselIndicator` / `useCarouselIndicator`, `timelineProgress` / `useTimelineProgress` |
| ui | `HeroSection`, `WhoWeAreSection`, `ServicesSection`, `ServiceCard`, `ServicesCarousel`, `CarouselIndicator`, `AlsoAvailable`, `HowWeWorkSection`, `ProcessTimeline`, `ProcessStep`, `CommitmentChip`, plus `landingFixtures.testing.ts` |

- Every file has tests. After review-44 every component has ES/EN stories at 390 and 1440 wherever both axes mean something; the three exceptions are explained in § Review-44 fixes. (The first version of this report claimed full coverage; that was wrong for four components.)
- The hero also has a 360 story; I added a "Móvil chico (360)" viewport to `.storybook/preview.ts` for it.
- The largest component is `WorldMap.vue`, at 171 lines.

### Moved and deleted

- **Moved with `git mv`** into `landing/{ui,data,logic}/legacy/`: the v1 Hero, Purpose\*, Services\*, ServiceItem and ContactSection (with their tests and stories), and the v1 Purpose and Services data and logic. Their story titles stay under `Legacy v1/`.
- **Deleted:** `useHeroContent`, `usePurposeContent` and `useServicesContent` (the v1 seams), the legacy `heroContent.ts` and its test, and the v1 key lists and content types left with no reader.
- **Locales:** the v1 `landing.hero`, `landing.purpose` and `landing.services` keys are removed. Both locales hold the v2 keys, including the Q2 tab-list name and the city names.

### Edited

- **`app/pages/index.vue`:** composes the v2 sections and the v1 contact section.
- **Barrel:** the only export from `legacy/` is `ContactSection`.
- **Logo links:** `:aria-current="undefined"` on the four logo links (`SiteHeader`, `MobileMenu`, `SiteFooter`, `MobileFooter`).
- **`global.css`:** the new tokens, plus the utilities `borde-tile`, `borde-suave`, `borde-rojo` and `pulso`, and `@keyframes pulso`.

**Tests:**

- **Rewritten:** `landing-copy`.
- **Replaced in `static-output`:** the three v1 landing blocks, by one v2 home block. It covers:
  - copy and order, and the single `h1`;
  - the hero hrefs;
  - no retired ids or links;
  - the map is inline, with America as the no-script state;
  - the timeline renders lit with no script;
  - the fragment-target check (FR-026);
  - no `aria-current` on the logo links.
- **Extended:** `design-tokens` and `token-literals` (it scans every new file and now also rejects `legacy-*`).
- **Edited:** `forms-copy` (the v1 hero equality is gone), `tablet-layout-tokens` (legacy paths) and `not-found-output`.
- **Untouched:** `seo-output.test.ts` passes without edits (FR-027).

## 2 · Deviations and why — the leader should look at these

1. **The layout's page frame is now opt-out.** In `app/layouts/default.vue`, `<main>` carried the v1 frame (`mx-auto max-w-shell-max px-page`). That boxed the full-bleed v2 sections: the hero sat at x 80 instead of 0, and the map was 1280 wide instead of 1408.
   - `<main>` now drops the frame when a page sets `definePageMeta({ fullBleed: true })`. Only the home does.
   - The v1 `ContactSection` carries the same frame classes itself.
   - About and the 404 keep the frame; I confirmed this in the browser.
2. **I removed the 404's "Propósito" shortcut — APPROVED by Roberto 2026-11-01** (pen extract-44 § 11). The still-rendered v1 404 linked to `/es#proposito`, which no longer exists on the home. FR-026, which is approved, forbids that, and the new fragment test caught it.
   - Removed with it: the shortcut, its i18n key in both locales, and the transitional `legacyHash` destination member in the shell types and resolver (it had no other user).
   - The 404 now shows two shortcuts: Servicios and Nosotros.
   - Roberto approved the removal on 2026-11-01. It is recorded in spec § Amendments.
3. **I moved the leader's raw lucide downloads out of the repo.** `docs/harness/progress/assets-44/lucide/` failed `pnpm check` (`noSvgWithoutTitle` on all nine), which made `./init.sh` fail. They are untracked and now redundant with the normalized copies.
   - They are moved, not deleted, to `/tmp/f44-lucide-raw/lucide/`. Move them back if you want them, but they will fail Biome again.
4. **Forced title breaks apply at every width.** Research R10 had them from `lg` only. Pen extract § 8 takes the EN breaks from the mobile frame `mJxKt`, so the breaks are drawn on mobile too.
5. **Tab line box.** `text-pestana` uses line-height 1.2. It is derived from the feature-43 finding that the `.pen` sizes auto-height Instrument Sans at 1.2 × its size. With `normal` the track measured 42 tall; it now measures 179 × 40.8 against the drawn 179 × 41.
6. **Dead tokens removed.**
   - The Pill ring tokens from feature 42 (`--punto-halo`, `--punto-halo2`, `--spacing-pill-halo`) went with the rings, under the ping amendment.
   - My pin ring tokens were never kept.
7. **Mobile rail fill is per segment.** Each step owns the segment from its dot to the next and fills it on its own (`fills` from `useTimelineProgress`). This keeps the red fill from running past the last dot. Visually the segments form one continuous line, which § 8 accepts.
8. **The tab panel takes focus on mobile.** On mobile the map box has `tabindex="0"`, as the APG pattern advises for a panel with no focusable content.
9. **Spec documents.**
   - Every "provisional" is now "confirmed by Roberto 2026-11-01".
   - § 8 corrections went into the spec Assumptions, data-model § 6 and research R14:
     - the indicator's top margin is 24;
     - the mobile map box has opacity 1;
     - mobile Servicios is 72 / 24 with gap 24 and a 30 / 1.15 heading;
     - the mobile hero is vertically centred;
     - the edge-light reading, stroke 1.5, the one-line rail and the EN breaks are accepted.
   - The amendment "Radar ping on markers, Roberto 2026-11-01" was added as spec § Amendments (FR-034…FR-038), with data-model § 8 and tasks T067–T070. FR-009 is amended to match.

### Radar ping amendment

- **Vocabulary.** It is rebuilt in v2: the `--pulso: 2.4s` token, `@keyframes pulso` and the `@utility pulso`. Nothing imports from `legacy/`, and nothing reads the v1 `radar-ping` keyframes or `--duration-radar-ping`, which feature 47 deletes.
- **Ghost.** A `::before` with `background-color: inherit`, so it is always the dot's own solid colour. It scales 1 → 3 while opacity goes 0.6 → 0, ease-out, forever.
- **Reduced motion.** `content: none`, so there is no ghost and the dot stays.
- **Where it applies.** The `Pill` (so also the `RotatingPill`) and the team and partner pins. Estonia has no ping. The static rings are removed.
- **Lit timeline step dots** (pen extract-44 § 11, Roberto 2026-11-01; FR-039), on desktop and on the mobile rail. At rest a lit step shows only its 12 px red core, with no static halo, and it pings. Not-lit steps keep their drawn dot and do not ping. With the halo gone, `--rojo-20` had no reader and was removed.
- **Not changed.** The `MapLegend` dots get no ping; neither amendment names them.

### Pen extract § 10 values applied (leader re-check 2026-11-01)

- **Card title line box.** `--text-servicio--line-height` is now 34 px (2.125rem). The token's only use is the card title, so it was corrected in place rather than overridden.
- **Step title and number.** `--text-paso--line-height` is 1.41 and `--text-paso-numero--line-height` is 1.23.
- **Desktop commitment chip.** Padding is 8 / 10 / 8 / 8 (new `--spacing-compromiso-fin`), the bubble-to-text gap is 6 (`gap-chip-gap`), and the blur is 16.
- **Mobile "Estonia · pronto" chip.** Text is 13 / 400 Blanco, and its marker is a 6 px solid Acero 400 dot.
- **Recorded in:** tests, spec § Amendments, data-model § 9 and tasks T071–T072.

## 3 · Checks, with real output

```
./init.sh → EXIT 0
[OK] pnpm typecheck   [OK] pnpm check
 Test Files  164 passed (164)
      Tests  2214 passed (2214)
[OK] pnpm generate    [OK] pnpm storybook:build
```

- **Negative control on the logo `aria-current` test:** with the attribute removed from `SiteHeader.vue`, the result was `× should never mark the logo as the current page … Tests 1 failed | 21 passed`. With it restored, all 22 pass.
- **Quarantine (T063):** the only `legacy/` import in v2 landing and shared files is the barrel's `ContactSection`. No story inside `legacy/` lacks a `Legacy v1/` title. Ten forms stories and two about stories carry a `Legacy v1/` title outside `legacy/`; they predate this feature and belong to 45 and 46.

## 4 · Browser evidence (headless Chrome over CDP, SwiftShader WebGL)

I served the generated `.output/public` with `python3 -m http.server`. Scripts and captures are in `/tmp/cdp44/`, outside the repo, with shots in `/tmp/cdp44/shots/`. The server and Chrome were stopped afterwards.

**Measurements at 1440 (ES), compared with pen extract-44:**

| Element | Measured | Extract |
|---|---|---|
| Hero | 1440 × 1000; pill top y 290; pill → h1 gap 28; h1 96 / 101.76 / −3.5, line 2 Gris 400; subtitle 640 wide, 20 px, Blanco 70 % | same |
| Hero column end | buttons end at y 728.5 | "about y 729" |
| Primary button | 252.5 × 55 | 253 × 55 |
| Who we are | padding 110, gap 28, h2 56 / 61.6 / −1.96 | same |
| Map | 1408 × 470 at x 16, opacity 0.8 | same |
| Map body | 640 wide, 17 / 26.35, Gris 400 | same |
| Servicios | padding 120 / 80; cards 305 wide, gap 20, top-aligned; strip 1280 × 79 | same |
| Tile and icon | tile 96, icon 40, stroke 1.5 | same |
| Tile shadow | `rgba(0,0,0,.8) 5px 8px 36px` | same |
| Process | five 240 columns; line 1280 × 2 at y 13 of the list | same |

**Measurements at 390 (ES), compared with pen extract-44:**

| Element | Measured | Extract |
|---|---|---|
| Hero | 740 tall, content centred (centre at y 395 = the centre of the 110–680 box); h1 34 / 37.4; subtitle 17, 342 wide | same |
| Hero buttons | 177.8 × 44 and 144.2 × 42, side by side, gap 8 | 178 × 44 and 145 × 41 |
| Hero buttons at 360 | ES wraps, second button centred below; EN fits on one row | wrap only where the row does not fit |
| Who we are | padding 72, gap 24, h2 28 / 32.2 | same |
| Tabs | 178.9 × 40.8 | 179 × 41 |
| Map box | 342 × 240, radius 16, opacity 1 | same |
| Map body | Blanco 70 % | same |
| Servicios | padding 72 / 24; h2 30 / 34.5; cards 290 at x 24, gap 14 | same |
| Indicator | 24 below the carousel | 24 |
| Rail rows | 112 each | 112 |

**Other widths.** At 360, 768, 1024, 1280 and 1920, in ES and EN, there was no horizontal scroll (`scrollWidth` equals the viewport width) and the scan found 0 elements off-screen or clipped. At 1920 the sections stay full bleed with the content at 1280.

**Map tabs by keyboard (390):**

| Key | Selected and focused | Panel labelled by |
|---|---|---|
| ArrowRight | Europa | `…-tab-europe` |
| Home | América | `…-tab-america` |
| End | Europa | `…-tab-europe` |
| ArrowLeft | América | `…-tab-america` |

- The roving tabindex is `[0,-1]` and then `[-1,0]`.
- The scale goes 4.94 → 7.41, at 0.7 s; mid-transition it read 5.36.
- Under reduced motion the transition is `0s` and the map jumps.
- Pins measure 28 × 28 on screen at both zooms.
- The hidden city list holds only the selected region's cities: six for America; Dublín, Ámsterdam and Estonia for Europe.

**Carousel (390):**

| Scroll | Lands at | Active mark |
|---|---|---|
| start | 0 | 0 |
| scrollTo 150 | snaps back to 0 | 0 |
| scrollTo 304 | 304 | 1 |
| scrollTo 608 | 608 | 2 |
| scrollTo end | 860 | 3 (the last) |

- ArrowRight on the focused list scrolls to 304 and the mark follows to 1.
- The active mark is 22 wide; the others are 6.

**Timeline:**

| Width | Scroll positions measured | Result |
|---|---|---|
| 1440 | 7 | `--progreso` 0 → 0.19 → 0.56 → 0.95 → 1; lit 10000 → 11100 → 11111 |
| 390 | 7 | segment fills `1.00, 0.73, 0, 0` → `1, 1, 1, 0.52` → all 1; lit 00000 → 11000 → 11110 → 11111 |

- Scrolling back up reverses it at both widths.
- Under reduced motion, with the section below the fold, it shows `--progreso` 1 and 11111.
- A direct load of `/es/#como-trabajamos` lands the section at 88 (below the header), with the fill already computed (0.84, 11111).
- Clicking either hero button lands its section at 88 (`#como-trabajamos`, `#diagnostico`).

**Listón and acanalado.**

- The hero canvas is at opacity 1 at every width.
- The acanalado canvas is at opacity 0 below the fold (paused off-screen by design) and at opacity 1 once in view, at 390 and 1440, ES and EN.
- The captures show the listón behind the hero and the ribbed acanalado behind the timeline.

**Radar ping:**

| Condition | Result |
|---|---|
| Motion allowed, 1440 and 390 | The ghost runs `pulso` 2.4 s, ease-out, infinite, in the dot's colour (Pill and team dots `rgb(229,53,47)`, partner `rgb(166,182,178)`). Mid-loop it read `scale(2.11)` at opacity 0.27. |
| Estonia | No ghost (`content: none`). |
| Reduced motion | No ghost (`content: none`, `animation: none`); the dot is still visible. |
| Footprints | Pill 36 tall; dot footprint 20 × 20 with a 7 × 7 dot; pins 28 × 28. |

The map section capture taken before the ping change still showed the old static rings; it was superseded once the ping was verified.

**Feature 43 has no regressions.**

- From the Cómo trabajamos section, the ES → EN toggle lands on `/en` at the same section (top 88).
- The 404 renders in both locales, with the v1 frame.
- About keeps the v1 frame.

## 5 · Previously unverified items: now CONFIRMED

These were re-measured after applying pen extract § 10, in headless Chrome on the generated site, ES.

- **CONFIRMED: service card heights.** The desktop cards measure 405.5 / 383, against the drawn 407 / 384. The card title's line box is 34 px (68 tall for two lines).
  - The residual of 1.5 px (three-line description) and 1 px (two-line description) is the `.pen` rounding a 15 px / 1.5 line to 23 px, as § 10 itself notes ("69 for 3 lines = 23 per line"): 0.5 px per description line. I did not change the shared `text-p` token for that.
- **CONFIRMED: mobile carousel end.** It ends at y 630.5 of the section, against the drawn 633. The indicator starts at 654.5, against 657. The same 0.5 px-per-line residual applies.
- **CONFIRMED: Cómo trabajamos height.** It measures 729.4 at 1440 ES, against 730. The process measures 253, against 254.
  - EN measures 720.9 (process 244.5) because the EN step-01 description wraps to one line fewer at 240 wide. That difference comes from the copy; no EN frame height was extracted to compare against.
- **CONFIRMED: commitment chip.** It measures 212.7 × 38, with padding 8 / 10 / 8 / 8, gap 6, `blur(16px)` and a 22 × 22 bubble.
- **CONFIRMED: line boxes.** The step title box is 31.0 px tall and the step number box 16.0 px tall.
- **CONFIRMED: "Estonia · soon" chip.** Text is 13 px, weight 400, `rgb(244,244,242)`. The dot is 6 × 6 in `rgb(74,103,107)`. The chip is 33.5 tall.
- **Lit step ping, verified in the browser at 1440 and 390:**
  - lit steps: the 12 px core is red, the ghost runs `pulso 2.4s ease-out infinite` in red, and the halo is transparent;
  - not-lit steps: Blanco 6 % halo and Negro 950 core, with no ghost;
  - reduced motion: every step is lit and none has a ghost.
- **Overflow.** Still none at 360, 390, 768, 1024, 1280, 1440 and 1920.

### Still open

- **The glass button is not my measurement.** It measures 197 × 52 (desktop) and 144 × 42 (mobile), where feature 42's extract says 198 × 53 and 145 × 41. This is the primitive's own box, not changed here.
- **Not run.** I did not run a separate no-WebGL or JS-disabled browser pass. The no-script state is covered by the output tests on the generated HTML (copy present, America selected, timeline lit). The poster fallback is feature 42's tested behaviour.
- **Storybook gaps.**
  - The `WorldMap` stories cannot preselect Europe (the component has no initial-region prop), so Europe is reached by the tabs.
  - The 1024 width has no Storybook viewport and was checked in the browser instead.
- **Lucide downloads.** The leader's raw downloads are still in `/tmp/f44-lucide-raw/lucide/` (see § 2, item 3).
- **Possibly injected instructions.** None found in the files or tool output I read.

## 6 · Files to look at first

- `app/layouts/default.vue` — the `fullBleed` opt-out.
- `app/features/shell/data/notFound.ts` — the 404 shortcut removal.
- `app/assets/css/global.css` — the feature-44 token block, `@utility pulso` and `@keyframes pulso`.
- `app/shared/ui/WorldMap.vue`, `app/shared/ui/MapPin.vue`, `app/shared/ui/Pill.vue`
- `app/features/landing/ui/`
- `app/pages/index.vue`
- `tests/static-output.test.ts` — the "the Muush 1.0 home (feature 44)" block.
- `specs/044-home-page/spec.md` — § Amendments.

## Review-44 fixes (2026-11-01)

The reviewer rejected the feature (`docs/harness/progress/review-44.md`), and the leader moved it back to `in_progress`.

### 1 · Blocking: `MobileMenu.vue` over 200 lines — fixed

- The 5-line `aria-current` comment that feature 44 added is now one line, pointing at `SiteHeader.vue` for the explanation. No code changed.
- The file is now **199** lines.
- **The same issue in `legacy/ContactSection.vue`.** This file had also grown, from 196 to 203, through my feature-44 comment. The comment is now two lines and the file is **197**.
- **Line counts of every `.vue` file touched.** Every non-legacy file is ≤ 200; the largest are `MobileMenu.vue` at 199 and `default.vue` at 169. Three files are still over 200: `legacy/PurposeCarousel.vue` (215), `legacy/PurposeConstellation.vue` (272) and `legacy/PurposeSection.vue` (376).
  - They were already that long at `HEAD`. Feature 44 only moved them with `git mv` and rewrote their import paths, with no change in line count.
  - They are quarantined v1 files that feature 47 deletes. I left them as they are rather than refactor v1 code.

### 2 · Story coverage — corrected

My earlier claim that "every component has ES/EN stories at 390 and 1440" was wrong for four components. The table shows the coverage now:

| Component | Stories | Notes |
|---|---|---|
| `HeroSection`, `WhoWeAreSection`, `ServicesSection`, `HowWeWorkSection` | ES/EN × 390/1440 | `HeroSection` also has ES 360 |
| `AlsoAvailable`, `CommitmentChip`, `MapLegend`, `WorldMap` | ES/EN × 390/1440 | — |
| `ProcessTimeline` | ES/EN × 390/1440 | **added:** `EsMobile390`, `EnDesktop1440` |
| `ServicesCarousel` | ES/EN × 390/1440 | **added:** `EnMobile390`, `EsDesktop1440` |
| `ProcessStep` | lit and not lit, in ES and EN, at 390 and 1440 | **added:** `EnLitDesktop1440`, `EnNotLitDesktop1440`, `EsLitMobile390`, `EnNotLitMobile390` |
| `ServiceCard` | the eight per-card ES/EN variants at "Móvil (390)" in the 290 slot, plus `EsDesktop1440` and `EnDesktop1440` in a slot of the desktop grid (305 at 1440) | **Exception:** the card has no breakpoint-dependent class, so the viewport only changes the width its parent gives it. The story file says so. |
| `CarouselIndicator` | 390 only, no locale | **Exception:** it has no text, and it renders only below `lg`. Noted in the story file. |
| `MapRegionTabs` | ES and EN at 390 only | **Exception:** the tabs exist only below `lg`. Noted in the story file. |
| `MapPin` | the three kinds, no viewport or locale | **Exception:** no text, and it is 28 × 28 at every width. `WorldMap`'s stories show it in ES/EN at 390 and 1440. Noted in the story file. |

`pnpm storybook:build` passes with the new stories, inside `./init.sh`.

### 3 · Advisories

| # | Advisory | Action |
|---|---|---|
| 3 | The icon README cited a path that no longer exists | Fixed. `app/assets/icons/README.md` now says the raw downloads were staged in `docs/harness/progress/assets-44/lucide/` and **not retained** (they fail Biome), and that the reviewer compared them with the normalized files. |
| 4 | `<main class="">` on the home | Fixed. `app/layouts/default.vue` uses `:class="{ 'mx-auto max-w-shell-max px-page': !isFullBleed }"`, so the full-bleed home renders no empty `class`. |
| 5 | The `' · '` literal in `AlsoAvailable` | Left as is. The reviewer accepted it; it is decorative, `aria-hidden` punctuation, as in the footer. |
| 6 | The `cityGroups` logic inside `WorldMap.vue` | Fixed. It is now the pure `mapCityGroups()` in `app/shared/utils/mapCityList.ts`, with `mapCityList.test.ts` (5 cases) and added to the literal scan. `WorldMap.vue` went from 171 to 158 lines. `useTimelineProgress` is unchanged: it is built from small inner functions, as `useMobileMenu` is, which the reviewer accepted. |
| 7 | Icon `<title>` tooltips | Not changed. The `<title>` is required by the icon README contract and predates this feature (feature 42's `arrow-right`), so it is a decision about the contract. |
| 8 | The map runs edge to edge at 1024 | Not changed. It is noted for Roberto to see on the build; AGENTS § 3.1 allows it between the anchors. |

### 4 · Gate

```
./init.sh → EXIT 0
[OK] pnpm typecheck   [OK] pnpm check
 Test Files  164 passed (164)
      Tests  2214 passed (2214)
[OK] pnpm generate    [OK] pnpm storybook:build
```

The behaviour is unchanged. The review fixes touch only a comment, stories, docs, a class binding and one extraction of pure logic into a helper.


## Reopened 2026-11-02 · Roberto review

Roberto reviewed the page in `pnpm dev` and asked for four changes. Two clarifications followed during the cycle: "ACLARACIÓN 2026-11-02" (no desktop scroll fill) and "Y (Roberto, 2026-11-02)" (unlit dots ping in grey). Spec amendment: `specs/044-home-page/spec.md` § Amendments › "Roberto review 2026-11-02", FR-040…FR-047. Tasks: T073–T079.

### What changed

| # | Change | Files |
|---|---|---|
| 1 | **Header bar centred.** From `lg` the nav is a `1fr auto 1fr` grid (`lg:grid lg:grid-cols-cabecera`, token `--grid-template-columns-cabecera`). The isotipo is `lg:justify-self-start` and the group is `lg:justify-self-end`. The mobile bar keeps `flex justify-between`. | `app/features/shell/ui/SiteHeader.vue`, `.test.ts`, `.stories.ts` (notes), `app/assets/css/global.css` |
| 2 | **Chip ping.** The Creativo and Marketing dots get `relative … pulso` and ping in their own Acero 200. | `app/features/landing/ui/AlsoAvailable.vue`, `.test.ts`, `.stories.ts` (notes) |
| 3 | **Timeline preview (desktop).** New `useTimelineHover` composable: pointer and `:focus-visible` focus, with the pointer winning over focus, and nothing below `lg`. New pure helpers `dotProgress` and `litUpTo`. Each column is a tab stop from `lg` only. The previewed column scales to **1.04** (`--paso-escala`) from `origin-top-left`, so the dot stays on the line. The scale uses `motion-safe:`, so there is none under reduced motion. | `app/features/landing/logic/useTimelineHover.ts` (+ test), `timelineProgress.ts` (+ test), `app/features/landing/ui/ProcessTimeline.vue`, `ProcessStep.vue` (+ tests and stories) |
| 3b | **Clarification: no desktop scroll fill.** At rest the desktop line is `bg-linea-fuerte` (Blanco 20 %) with the red fill at `--progreso: 0`, and every column is unlit. The SSR, no-JS and reduced-motion desktop states rest the same way, which keeps them consistent with "unlit by default". `ProcessStep` now has `columnLit` (desktop, default false) separate from `lit` (mobile rail). `useTimelineProgress` is rail-only and does not measure from `lg`. Removed: `horizontalProgress`, `isStepLitHorizontal`, `HORIZONTAL_TRAVEL_RATIO`, the composable's `progress`, and the now-unused `--proceso-linea` gradient token. The mobile rail keeps its scroll fill. Its own SSR, no-JS and reduced-motion state is still full and lit. | the same files, plus `useTimelineProgress.ts` (+ test), `tests/design-tokens.test.ts`, `tests/static-output.test.ts` |
| 4 | **Numbers in Blanco.** The desktop number is `text-blanco`. The mobile number already inherited the title's Blanco, and a test now pins that. | `ProcessStep.vue` (+ test) |
| 4b | **"Y": unlit dots ping in grey.** The `pulso` ghost now uses `var(--pulso-fantasma, inherit)`. The new `pulso-tenue` utility sets it to `--texto-tenue` (Blanco 40 %, the unlit ring's colour). Unlit dots on desktop and on the rail carry `pulso pulso-tenue`. Lit dots stay red. | `global.css`, `ProcessStep.vue`, tests |

Line counts: `ProcessStep.vue` 152, `ProcessTimeline.vue` 72, `SiteHeader.vue` 169, `AlsoAvailable.vue` 64. All are ≤ 200. No version markers, no v1 tokens, no arbitrary values. `useTimelineHover.ts` was added to the literal scan.

### Choices to confirm (INFERRED)

- **"Unlit-track colour" means Blanco 20 % (`linea-fuerte`).** This is the mobile rail's unlit track. The desktop never had a single grey: its track was the `.pen` gradient. Roberto's clarification then made the whole desktop line grey at rest, and it uses this colour.
- **Scale value 1.04,** the middle of the asked range.
- **Desktop with no JS, SSR or reduced motion rests unlit with a grey line.** Without scripting there is no preview. Under reduced motion the preview works on hover and focus, instantly, with no scale.
- **The unlit ghost covers the dot's padding box.** For the 12 px dot with its 1.5 px ring, the ghost starts at 9 px and grows to 27 px.
- **The `.pen` 1440 frame drew the gradient line with step 01 lit.** After FR-044 the 1440 page at rest shows all steps unlit and a grey line. This is Roberto's decision, recorded in the spec, so a reviewer comparing against `Tng1t` will see this difference.

### Browser evidence (headless Chrome over CDP, generated `.output/public`)

I served the generated site with `python3 -m http.server`. The scripts and raw JSON are in `/tmp/cdp44r/`, outside the repo. The server and Chrome I started were stopped afterwards.

**Header centre** (bar centre − page centre):

| Width | Delta | Gap logo→bar | Gap bar→group |
|---|---|---|---|
| 1024 | 0.00 px | 236.9 | 30.6 |
| 1280 | 0.00 px | 364.9 | 158.6 |
| 1440 | 0.00 px | 444.9 | 238.6 |
| 1920 | 0.00 px | 444.9 | 238.6 |

There is no overlap at any width. At 390 the mobile bar is still `flex` / `space-between`, 60 tall.

**Chips (1440):**
- Both dots are 6 px, Acero 200 `rgb(166,182,178)`.
- The `::before` ghost runs `pulso` 2.4 s in the same colour.
- The chips stay 96.4 × 35 and 107.8 × 35.
- Under reduced motion the ghost is `content: none` and the chip sizes are unchanged.

**Timeline, desktop 1440:**

| State | Lit columns | Red line ends at (px from line start) | Scale | Ghosts |
|---|---|---|---|---|
| Rest: list entering, mid-section, scrolled past | none | 0 (line `rgba(244,244,242,.2)`, no gradient) | none | all grey `rgba(244,244,242,.4)` |
| Hover step 1 | [1] | 14 = dot 1 centre | 1.04 on step 1 | red, then grey ×4 |
| Hover step 3 | [1–3] | 534 = dot 3 centre | 1.04 on step 3 | red ×3, then grey ×2 |
| Hover step 5 | [1–5] | 1054 = dot 5 centre | 1.04 on step 5 | red ×5 |
| Leave | none | 0 | none | back to rest |
| Tab ×1 / Tab ×3 | [1] / [1–3] | 14 / 534 | 1.04 on the focused step | `:focus-visible`, 2 px Blanco outline |
| Reduced motion: rest / hover step 3 | none / [1–3] | 0 / 534 | none | `none` (no ghost) |

Under reduced motion the transition durations measured `0s`.

- **Lit and unlit descriptions:** Blanco 85 % when lit, Gris 400 `rgb(140,140,138)` when unlit.
- **Numbers:** `rgb(244,244,242)` (Blanco) on all five, in ES and EN, and on the 390 rail.

**Mobile rail, 390:**

| Scroll position | Lit steps | Segment fills |
|---|---|---|
| Before the list | none | 0 |
| Mid | 3 | 1, 1, 0.167, 0 |
| Past the list | 5 | all full |

- Unlit rail dots ghost in grey, lit ones in red.
- There are no tab stops on the rail.
- Hovering does nothing: no scale, no column state.
- Under reduced motion the rail is full and every step is lit, with no ghost.

### Gate

```
./init.sh → EXIT 0
[OK] pnpm typecheck   [OK] pnpm check
      Tests  2238 passed (2238)   ← before the FR-048 follow-up; 2239 (165 files) after it, see below
[OK] pnpm generate    [OK] pnpm storybook:build
```

The first `./init.sh` run failed only at `pnpm generate` because "Another Nuxt build is already running". That lock was released on its own, and the run was repeated. No process was killed.

### For the leader

- Feature 43's `SiteHeader` was edited for FR-040, as the task asked.
- This report and the spec amendment are the only records. Nothing was written to `docs/business/`.

### Follow-up 2026-11-02 · one trail on the grey dots (FR-048)

Roberto saw two trails around the unlit desktop dots. The leader traced two causes, and both are fixed.

**(a) Static halo removed.**
- The `data-punto-paso` wrapper no longer paints `bg-blanco-6` in any state.
- A new test in `ProcessStep.test.ts` ("should paint no static halo around the desktop dot in either state") pins that the wrapper has no `bg-`, `border-`, `shadow-` or `ring-` class, and no inline style, whether the column is lit or not.

**(b) The ghost now starts at the outer edge.**
- `@utility pulso` places the ghost at `inset: calc(-1 * var(--pulso-borde, 0rem))`.
- `pulso-tenue` sets `--pulso-borde: var(--trazo-anillo)`. That is the ring width, 1.5 px.
- Borderless hosts keep 0. Both values are pinned in `tests/design-tokens.test.ts`.

**Headless Chrome results, 1440, generated site, scripts in `/tmp/cdp44r/frames.mjs` and `lit.mjs`:**

| Host | Outer box | Border | Ghost inset | Ghost width at rest |
|---|---|---|---|---|
| Unlit timeline dot | 12 × 12 | 1 px used (1.5 declared) | −1.5 px | 13 px |
| Chip dot | 6 | 0 | 0 | 6 |
| Pill dot | 7 | 0 | 0 | 7 |
| Map pin | 8 | 0 | 0 | 8 |

- The wrapper behind the unlit dot is now transparent.
- The Pill, the pins and the chips are unchanged: inset 0 and ghost equal to the dot.
- **Snapping at DPR 1 (INFERRED: harmless).** Chrome snaps the declared 1.5 px border to 1 px used width at DPR 1. The ghost therefore starts 0.5 px outside the ring on each side there. At DPR 2 the border is 1.5 px and the match is exact.

**Mid-animation frames.**
- **Method:** I paused every animation at fixed times with `document.getAnimations()` and captured the first unlit dot at 4× zoom. I then measured a luminance profile from the dot centre outward.
- **Result:** at every time there is exactly one bright band. It starts at the dot's outer edge (radius 6 px) and grows outward:

| Time | Band (radius, px) |
|---|---|
| 0 ms | 6–7 |
| 300 ms | 6–10 |
| 700 ms | 6–13 |
| 1200 ms | 6–16 |
| 1800 ms | 6–8 (faded below threshold) |

- **Frames:** `/tmp/cdp44r/unlit-{0,300,700,1200,1800}.png` show the ring with its Negro 950 core and a single grey disc expanding from it.
- **Lit dot:** `/tmp/cdp44r/lit-700.png` (step 1 hovered) shows the red core with a single red ghost.
- The server and Chrome I started were stopped afterwards.

**Gate:**

```
./init.sh → EXIT 0
      Tests  2239 passed (2239)
[OK] pnpm typecheck  [OK] pnpm check  [OK] pnpm generate  [OK] pnpm storybook:build
```

- **Lock retries:** one run hit "Another Nuxt build is already running" (PID 8605, not mine). That process had already exited when I checked, and the rerun passed.
- **Spec:** FR-048 was added to the amendment, and it supersedes FR-047's last sentence. Task T080 was added.

### Review advisories 2026-11-02 (docs and test names only)

These address `review-44.md` § "Reopen 2026-11-02 review". No behaviour changed.

| # | Advisory | Action |
|---|---|---|
| 2 | Design docs still described the removed desktop fill | **Fixed.** `contracts/components.md`: `ProcessTimeline` / `ProcessStep` entries (`columnLit`, `raised`, `focusable`, no static halo, grey ping, Blanco numbers) and the logic block (removed horizontal functions marked as not to be reintroduced; `dotProgress`, `litUpTo`, the rail-only `useTimelineProgress`, `useTimelineHover` added). `data-model.md`: `--proceso-linea` struck through as superseded by FR-044; `--blanco-6` no longer listed for a step halo (FR-048); composable table updated. `research.md` R8: a superseded note. `quickstart.md`: the desktop and rail checks. `spec.md`: inline "superseded" notes on FR-018a, FR-019, FR-020 and FR-039, pointing at FR-044, FR-047 and FR-048. The double-trail fix (FR-048) is reflected in the contract and data model. |
| 3 | Stale test titles | **Fixed.** In `useTimelineHover.test.ts`: "…leave the timeline at rest when nothing is pointed" and "should return to rest when the pointer leaves the step". |
| 4 | Desktop still listens to scroll | **Left as is,** as instructed. |
| 5 | Cached split point | **Comment only.** The comment at `useTimelineHover.ts` now also covers a resize while a step keeps keyboard focus. Logic unchanged. |
| 7 | Test count | **Fixed.** 2238 was the count before the FR-048 follow-up. After it, the count is 2239 tests in 165 files, which matches the reviewer's run. |

Advisory 1, the wording of `feature_list.json` acceptance item 3, is the leader's to decide. I did not edit it.

**Gate:** `./init.sh` → EXIT 0 on the first run. typecheck, check, generate and storybook:build are OK, and 165 files / 2239 tests passed.

### Y 2 (Roberto 2026-11-02): transparent header cancelled by Roberto; focus ring; `--blanco-6`

**1 · Transparent header cancelled by Roberto.**
- I had started the change: removing the fill and blur from the mobile bar, plus its test, story note and static-output assertion.
- Roberto reversed the decision before it was finished, so I reverted every one of those edits.
- `SiteHeader.vue`, `SiteHeader.test.ts`, `SiteHeader.stories.ts` and the header block of `tests/static-output.test.ts` are back to their state before this item. The nav class string is byte-identical: `… border border-linea bg-nav-fondo … backdrop-blur-header … lg:bg-transparent … lg:backdrop-blur-none`.
- There is no spec amendment and no FR number for it.
- Headless Chrome confirms the restored header:
  - At 390, after scrolling down and back up so the bar overlays content: background `rgba(11, 11, 11, 0.45)` (`#0B0B0B73`), `backdrop-filter: blur(20px)` and a 1 px `rgba(244,244,242,.12)` edge.
  - At 1440 it is unchanged: transparent, no blur, grid `484.9 / 310.1 / 484.9`.

**2 · Focus ring after a tap or click: not reproduced, so there is no fix and no new test.**
- **Method:** headless Chrome at 390 on the generated `/es`, with CDP touch emulation (`Input.dispatchTouchEvent`), then again with mouse clicks. Script: `/tmp/cdp44r/focusring.mjs`.

| Action | Focused element | `:focus-visible` | Outline |
|---|---|---|---|
| Tap, then click, "Abrir menú" | "Cerrar menú" (focus moved there on open) | false | `none` |
| Tap, then click, "Cerrar menú" | "Abrir menú" (focus returned on dismiss) | false | `none` |
| Tap, then click, the language toggle | the toggle | false | `none` |
| Keyboard Tab to "Inicio de muush", the toggle and "Abrir menú" (control) | each in turn | true | `solid 2px` |

- `foco` (`&:focus-visible { outline … }`) behaves as specified: the ring appears only for keyboard focus, including on the programmatic focus-return after a pointer dismiss.
- Screenshots: `/tmp/cdp44r/menu-{open,closed}-{touch,mouse}.png`.
- **What Roberto may have seen (INFERRED, not verified):**
  - the buttons' permanent 1 px Blanco 20 % border (`border-linea-fuerte`);
  - a ring left over from earlier keyboard use in the same tab, since Chrome keeps the focus-visible state across a programmatic focus after keyboard input;
  - a real device or browser whose focus-visible heuristic differs. I did not test a physical device.

  If he can say which browser and device, the leader can re-check there.

**3 · `--blanco-6` removed.**
- It had no reader left in `app/`; the only mention was a negative assertion in `ProcessStep.test.ts`.
- **Removed from `global.css`:** the `:root` declaration and the `--color-blanco-6` theme alias. The comment above the remaining `--blanco-10` / `--blanco-25` was corrected and no longer mentions the step halo.
- **`tests/design-tokens.test.ts`:**
  - It no longer lists `--blanco-6` in the colour-mix and declared-once tests.
  - It now asserts that neither `--blanco-6` nor `--color-blanco-6` is declared.

**Gate:** `./init.sh` → EXIT 0 on the first run. typecheck, check, generate and storybook:build are OK, and 165 files / 2239 tests passed.

The server and Chrome I started were stopped.
