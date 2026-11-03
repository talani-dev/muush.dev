# Feature 46 `m1_secondary_pages` · implementation report

- **Branch:** `feat/v2-pages`. No commit, no push, no version change.
- **Status:** feature 46 moved `in_progress` → `reviewing`. Not `done`.
- **Spec:** `specs/046-secondary-pages/`. Tasks T001–T042 are checked. T041
  carries a note (see "Visual check").
- **`./init.sh`:** exit 0 (typecheck, Biome, 205 test files / 2753 tests,
  `pnpm generate`, `pnpm storybook:build`). Baseline before the feature was
  196 files / 2618 tests.

## Roberto's rulings, as recorded

The spec's Clarifications now carry Roberto's rulings as approved on
2026-11-02, replacing the provisional answers:

- Preguntas title at weight 500.
- Preguntas linked from the footers and the sitemap only.
- Compact shader uniforms for the four new sections and the home's three
  sections.
- Radar ping on the three card dots.
- The v2 heading scale for any heading line height the `.pen` leaves unset.
- The 404 loses its v1 pill, subtitle and shortcuts; behaviour tests are kept.
- The new Preguntas copy; the Nosotros SEO description is unchanged.
- The leader defaults.

Specs 044 and 045 each have a dated amendment for the mobile uniforms. The
spec status line now says it is approved.

## Changes

### Tokens (`app/assets/css/global.css`)

**Added:** one "Secondary pages (feature 46)" group in the v2 `:root` and
one in the v2 `@theme inline`.
- **Heading sizes:**
  - `pagina`: 32/36.8 → 64/69.12, with the diagnóstico tracking.
  - `estado`: 34/39.1 → 88/93.28, tracking 0 → −3.08.
- **Nosotros hero:** `pagina-alto`, `pagina-arriba`, `pagina-gap`,
  `pagina-intro`.
- **Cómo se arma:** `composicion-*` and `tarjeta-equipo-*`.
- **Dónde estamos:** `donde-cuerpo` (16/1.5 → 17/1.55).
- **Status blocks:** `estado-gap`, `preguntas-*`, `error-*`.
- No version markers. Everything else is reused: `mapa-*`, `diagnostico-*`,
  `bloque-y`, `recibes-*`, `servicios-titulo` for the 30 → 56 heading,
  `portada-botones-gap`, `portada-abajo`.

**Deleted** (no reader left):
- `--work-*` in `:root` and `--spacing-work-*`.
- `--spacing-about-hero-top` and the six about-hero glow anchors.
- `--not-found-ring*` and every `--spacing-not-found-*`.
- Kept, because the quarantined `HeroStack` still reads them:
  `--spacing-about-hero-gap`, `-body` and `-measure`, plus
  `--spacing-nav-cta-h` for the legacy `SiteNav`.

### Shared
- **`ReceivesList`:** moved with `git mv` from `landing/ui` to `shared/ui`.
  Its story is now `Shared/UI/ReceivesList` and has an "Áreas" variant. The
  fixtures now live in shared (`receivesFixtures.testing.ts`), because shared
  code may not import a feature.
- **Map labels:** one source.
  - `shared/data/mapCopy.ts` holds `MAP_COPY_KEYS` and `MapCopy`.
  - `shared/utils/mapCopy.ts` holds `resolveMapCopy(t)`.
  - The locale keys moved from `landing.whoWeAre.{legend,regions,cities}` to
    a top-level `map.*`, with the values unchanged.
  - The home's `WhoWeAreContent` extends `MapCopy`; `mapFixtures` uses the
    shared type.
- **`backgroundPresets.ts`:** gained an optional `compactUniforms`. It is
  filled for `homeHero`, `howWeWork`, `assessment`, `aboutHero`,
  `workWithUs`, `faq` and `notFound`, with the pen-extract-46 §§ 2–4 and § 6
  values. Trabaja con muush and Diagnóstico share one
  `ASSESSMENT_COMPACT_UNIFORMS`. The mobile menu has no compact set.
- **`ShaderBackground`:** below 1024 (`useDesktopLayout`) it hands the
  canvas `{...preset, uniforms: compactUniforms}`.
- **`useShaderCanvas`:** now watches the preset and re-evaluates. A paused
  canvas (reduced motion, or in view but not animating) redraws once; a
  running loop picks the new values up on its next frame.
- **`Heading`:** gained the `pagina` and `estado` sizes.

### About (Nosotros)
- **Content:** new models and seams for the hero, Cómo se arma
  (`COMPOSITION_ORDER`), Dónde estamos (spreads `resolveMapCopy`) and Work
  (`AREAS_ORDER`).
- **Components:**
  - `AboutHeroSection`: rewritten; `aboutHero` listón, centred, `h1`.
  - `TeamCompositionSection` + `CompositionCard`:
    - The cards are `li` elements: glass-panel fill, 24 radius, flat
      `borde-luz borde-linea` edge.
    - The dot is decorative, with `pulso` in Red muush, Blanco or Acero 200.
    - Start-aligned and stacked below `lg`; centred with three columns from
      `lg`.
  - `WhereWeAreSection`: the home section's classes; the mobile body is 16.
  - `WorkWithMuushSection`: rewritten.
    - The `workWithUs` listón and the diagnóstico grid, with no call row.
    - The shared `ReceivesList` for "Áreas que sumamos".
    - `ApplicationForm` from the forms barrel, with its content and
      submitter passed through. Nothing in `forms/` changed.
- **Barrel and page:** `about.vue` composes Hero → Cómo se arma → Dónde
  estamos → Trabaja and no longer adds `mt-section-gap`.
- **Fixtures:** `aboutFixtures.testing.ts`. The application-form fixture
  moved there from the deleted v1 story.

### Shell, Preguntas and the 404
- **Route:** `nuxt.config.ts` declares `i18n.pages.faq` (`/es/preguntas` ↔
  `/en/faq`), and the sitemap comment now says six URLs.
  `ShellRouteName` gains `'faq'`.
- **Footers:** `FOOTER_DESTINATIONS.faq` is added after Trabaja con muush in
  the MUUSH column, and after Nosotros in `MOBILE_FOOTER_LINKS`.
  - The link bar and the menu are unchanged.
  - The navigation and footer comments now state the permanent rule.
- **`StatusSection.vue`** (new, exported from the barrel) renders Preguntas
  and the 404:
  - The preset picks the shader, the Heading size (`estado` or
    `diagnostico`) and the block tokens.
  - The primary button uses `to` and keeps its arrow.
  - The glass button opens a new tab with `rel="noopener noreferrer"` when
    the link is external, and uses `to` otherwise.
  - Below `lg` the buttons row may extend into the gutters (see deviations).
- **Content seams:** `faq.ts` and `useFaqContent` (new); `notFound.ts` and
  `useNotFoundContent` reshaped.
  - `NOT_FOUND_SHORTCUTS` and the v1 keys are gone.
  - Each seam has a pure half (`faqSectionProps`, `notFoundSectionProps`),
    which is unit-tested, including after an in-place switch.
- **`pages/faq.vue`** (new) uses `usePageSeo` with `pageType: 'WebPage'` (see
  deviations).
- **`error.vue`** renders `StatusSection`.
- **Deleted:** `ui/legacy/NotFoundContent.*` and `NotFoundRings.*`.
- **Untouched (features 36/39):** `notFoundLocale`, `useNotFoundDocument`,
  `switchLocaleInPlace`, `resolveLocaleDestination`, the plugin, the
  `NOT_FOUND_ROUTES` hook and `LanguageToggle`.

### Layout
- `default.vue`: the v1 page frame (`isFullBleed`, `max-w-shell-max
  px-page`) and the footer's `mt-section-gap` are gone, so the footer sits
  flush on every page.
- `index.vue`: no longer sets `definePageMeta({ fullBleed: true })`.

### Copy (both locales, parity green)
- Added: `about.hero|composition|where|work.*` (§ 4.8 verbatim), `map.*`,
  `shell.faq.*`, `shell.footer.muush.faq`, `pages.faq.*` (the approved
  copy), and `shell.notFound.{heading,cta,assessment}`.
- Removed: the v1 `about.*` eyebrow and headline keys and the v1
  `shell.notFound.*` keys.

### Tests (rewritten or extended)
- **Tokens:** `design-tokens` (feature 46 block), `tablet-layout-tokens`
  (the form sections use the diagnóstico grid; no `--work-*` left),
  `not-found-tokens` (no v1 404 token left; `nav-cta-h` kept),
  `token-literals` (new files scanned; `ReceivesList` now under shared).
- **Copy:** `about-copy` (§ 4.8 verbatim), `landing-copy` (map labels under
  `map.*`).
- **Output:**
  - `seo-output`: six pages; Preguntas is indexable with canonical and
    hreflang; both Preguntas documents are a plain `WebPage`, not
    `FAQPage`; pair parity; six sitemap URLs.
  - `static-output`: the Preguntas routes and toggle; Preguntas in both
    footers to the same-locale route; never in the nav; the v2 Trabaja
    section with no v1 glow.
  - `not-found-output`: every 36/39 behaviour case is kept. The v1-look
    cases were replaced by: the two-tone `h1`, one primary link to the
    home, one glass link to `#diagnostico`, no pill/body/v1 body, and one
    hidden shader background with the `404-acanalado` poster.
  - `pill-air`: the four Nosotros pills; no pill on Preguntas or the 404.
- **Unit and component tests:**
  - Shared: mapCopy (data and util), presets, ShaderBackground,
    useShaderCanvas, Heading, ReceivesList.
  - About: data plus every about component.
  - Shell: faq/notFound data, the status-content seams, StatusSection, the
    resolver (faq route), footer data, MobileFooter/SiteFooter link counts.

### Stories (390/1440 × ES/EN)
- AboutHeroSection, TeamCompositionSection, CompositionCard (three kinds),
  WhereWeAreSection, WorkWithMuushSection: group `About/`.
- `Shell/StatusSection`: faq and notFound.
- Shared: `Shared/UI/ReceivesList`, plus the Heading `pagina` and `estado`
  stories.
- The deleted v1 stories (`Legacy v1/About/*`, `Legacy v1/Shell/NotFoundContent`)
  are gone. Storybook builds.

## Deviations

1. **Preguntas structured data.** nuxt-schema-org 6.4.3 infers `FAQPage`
   from the final `faq` segment and unions `@type` when it merges nodes. An
   explicit `'@type': 'WebPage'` therefore still shipped
   `["WebPage","FAQPage"]` on `/en/faq` only, which breaks FR-038 and pair
   parity.
   - **Fix:** `usePageSeo` gained `pageType: 'WebPage'`, which writes the
     WebPage node through `useHead` with `tagDuplicateStrategy: 'replace'`.
     The module's graph resolver honours that per node and replaces the node
     instead of merging it. The tag uses the same key and attributes as
     `useSchemaOrg`.
   - **Cost:** one `@ts-expect-error` with an explanation, because unhead
     types `type` without `application/ld+json`; the module's own
     `useSchemaOrg` carries the same suppression.
   - **Result:** both Preguntas documents now ship a plain `WebPage` node
     with the ReadAction, and their graphs match.
   - The plan said "no `pageType`". The reasoning is in the comment in
     `usePageSeo.ts`.
2. **Buttons row at 390 (Spanish Preguntas).** 178 + 8 + 161 = 347 is wider
   than the 342 between the paddings, so the row wrapped to two lines. The
   frame draws one centred row that runs into the padding.
   - Below `lg` the row now spans the gutters (`self-stretch
     max-lg:-mx-gutter`). At 390 it is one centred row (x 21.9 → 368.1).
   - It still wraps at 320.
3. **The 88 px Preguntas line height** is 1.06. Roberto's scale names 1.08
   at 64 and 1.1 at 56; 88 is not on it, so I used the display ratio of the
   96 px hero, the nearest size the scale draws.
4. **T006 test wording:** under Roberto's ruling, seven presets carry a
   compact set, not four. The test asserts that every preset with a poster
   has one and the mobile menu has none.
5. **The Cómo se arma heading reuses `text-servicios-titulo`.** It is the
   same 30/1.15 → 56/1.1 scale with the section tracking; this avoids a
   second identical token.

## Values I still had to assume (for the leader)

- **Card title wraps at 1440:** "Cuando el proyecto lo pide" measures 354 px
  at Poppins 26/500, but the card's inner width is 336.
  - So all three cards are 232.6 tall instead of the drawn 197, and Cómo se
    arma measures 660 instead of 640 (the heading's 1.1 line height accounts
    for some of that too).
  - The `.pen` either sets tracking on the card title, which the extract
    does not give, or lets the text overflow the padding.
  - I did not invent either. Please confirm the title tracking, or whether
    `nowrap` is intended.
- **Auto line boxes:** card label 1.2 and card title 1.4. The `.pen` sets
  them to auto; I used the Instrument Sans / Poppins auto boxes features
  43–44 measured. With these the drawn 197 px card comes out exactly when
  the title is one line.
- **Glass button height:** 52 at 1440 and 42 at 390. The extract says 53
  and 41. This is the shared feature 42 `GlassButton`, which I did not
  change.
- **CV copy:** the application form copy still says "máximo 5 MB", while
  `muush-1.0.md` § 4.8 says 10 MB. This is feature 45's form; I did not
  change it. Noted for Roberto only.

## Visual check (T041)

**Method:**
- The generated site was served on 127.0.0.1:4646 (python `http.server`).
- Headless Chrome ran on 127.0.0.1:9246, with a scratch CDP script in
  `/tmp/f46/` outside the repo.
- Both are stopped. The scratch files and screenshots are deleted.

**At 390 and 1440 (ES and EN), all six pages:**

| Item | Measured |
|---|---|
| Nosotros hero | 700 / 820 tall; heading 32/36.8 and 64/69.12, −2.24 at 1440; intro 16/1.5 and 20/1.5 at 720 wide |
| Cómo se arma | left-aligned at 390 (x 24); heading 30/34.5 and 56/61.6, −1.96; card padding 24 / 32; cards 342 wide stacked, 400 wide in a row with gap 24 |
| Dónde estamos | heading 28 and 56; body 16 Blanco 70 % at 390, 17/1.55 Gris 400 at 1440; tabs and chip at 390 |
| Trabaja | 953 / 917 tall (drawn 949 / 920); heading 34 and 64/69.12; body 16 and 18/1.55 at 500 wide; form panel 342 / 600 |
| Preguntas | block 720 / 1100; title 34 and 88/93.28, −3.08; buttons 177.8×44 and 160.5×42 at 390, 252.5×55 and 216.9×52 at 1440 |
| 404 | block 720 / 760; heading 34 and 64; 8 px above the buttons at 1440; buttons 152×44 and 146×42 at 390 |
| Footer | gap 0 after the last section on every page; the Preguntas/FAQ links point to the same-locale route |

At 320, 360, 768, 1024, 1280 and 1920 there is no horizontal scroll on any of
the six pages. The cards stack up to 1023 and sit in three columns from 1024.

**Not done:**
- No reduced-motion or WebGL-disabled pass in a browser; those cases are
  covered by unit tests only (`pulso`, `ShaderBackground`/`useShaderCanvas`).
- The canvas was not judged: headless rendering shows the Trabaja listón
  dark.
- No pixel comparison against the frames, no VoiceOver pass, no manual
  keyboard pass.

## Business-rule candidates (for a human, not written anywhere)

- "Preguntas is linked from the footers and the sitemap only, never the
  header link bar" is now a rule in code comments and tests. If it is meant
  to be a business rule, it belongs in `docs/business/` through Roberto.

## Leader answer · card title (2026-11-02)

**The answer.** In the `.pen`, "Cuando el proyecto lo pide" (`wxw3m`) is one
line, 355 × 36, inside the 400 px card with padding 32. It runs about 19 px
into the right padding on purpose. No tracking is set, and the cards are 197
tall.

**The fix.** No type change. From `lg` the card title gets a negative end
margin equal to the card padding (`lg:-me-tarjeta-equipo`, the existing
token), so its box can extend into the end padding. Below `lg` nothing
changes.
- `CompositionCard.test.ts` pins that the margin applies from `lg` only.
- The story has a 1440 row of three cards (`RowEsDesktop1440`).

**Measured** (headless Chrome on 127.0.0.1; servers stopped, scratch files
deleted):

| Width | Cards | Section | Title |
|---|---|---|---|
| 1440 (ES and EN) | 400 × 196.2, all three (drawn 197) | Cómo se arma 623 | one line in all three cards |
| 1024 | 275 wide | — | wraps naturally within the card's outer edge |
| 390 | unchanged (216.6 / 216.6 / 180.2) | — | 24 px from the card edge, as before |

No horizontal scroll at any of these widths.

**Result.** `./init.sh` exits 0 (205 files, 2754 tests). Feature 46 stays at
`reviewing`.

## Fix round 1 (review-46 should-fix items, 2026-11-02)

### 1. Card titles crowded the edge between 1024 and 1439

**Cause.** The title's negative end margin was the whole card padding, so a
wrapped line could run to about 4 px from the edge (1200 EN).

**Fix.** The extension is now its own token, `--spacing-tarjeta-equipo-titulo-fin`,
used as `lg:-me-tarjeta-equipo-titulo-fin`. It equals the card padding minus
a 10 px floor: 14 → 22 px, the same slope as the padding. No title can come
closer than 10 px to the card edge at any width. Mobile is unchanged.

**Why the floor is 10, not the drawn 13.** The `.pen` ES title (`wxw3m`) sits
13 px from the edge at 1440. The EN title "When the project calls for it"
measures 357.1 px, though, and needs at least 357 px of room. With a 13 px
floor the room is 355, so EN wrapped at 1440 (cards 232.6 tall). With 10,
ES keeps its drawn 13.5 and EN sits 10.9 from the edge. The EN frame's
value was not extracted, so please confirm with the leader if 10.9 is not
acceptable.

**Measured** (headless Chrome on 127.0.0.1; servers stopped, scratch files
deleted). Edge = distance from the title's last glyph to the card's outer
edge:

| Width | Card | ES lines / edges | EN lines / edges |
|---|---|---|---|
| 1024 | 275 × 251.7 | 2 / ≥ 33.4 | 2 / ≥ 21.6 |
| 1200 | 332 × 228.9 | ≥ 12.5 | ≥ 10.2 |
| 1280 | 358 × 230.1 | ≥ 21.3 | ≥ 14.5 |
| 1440 | 400 × 196.2 | one line / 13.5 on the long title | one line / 10.9 on the long title |

No horizontal scroll at any of these widths.

**Tests.** `design-tokens` pins the token at 14 / 22. `CompositionCard.test`
pins the `lg:` utility and checks there is no unprefixed margin.

### 2. The hardcoded `data-nuxt-schema-org` attribute

**Fix.** `usePageSeo`'s replacing WebPage tag now spreads
`useRuntimeConfig()['nuxt-schema-org'].scriptAttributes`. That is the
server runtime config `useSchemaOrgConfig()` reads (default `{}`), so a
`schemaOrg.scriptAttributes` change in `nuxt.config.ts` reaches this tag
too. The attributes are spread after `type`, like `useSchemaOrg` does, so
the output is byte-identical:

```
<script type="application/ld+json" data-nuxt-schema-org="true" data-hid="schema-org-graph">
```

**Tests.** `seo-output.test.ts` gained "should open the JSON-LD script with
the module attributes on every page when generated". It checks that the
opening tag on all six pages equals the home's, and that it carries
`data-nuxt-schema-org="true"`.

### Result

`./init.sh` exits 0 (205 files, 2756 tests, generate and Storybook build
pass). Feature 46 stays at `reviewing`.
