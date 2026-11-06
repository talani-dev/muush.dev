# Research — feature 46 `m1_secondary_pages`

Every decision below was taken against the current code on `feat/v2-pages`
(bfa0f55), `pen-extract-46.md`, and specs 036/039/043–045. The spec author did
not open the `.pen`. "Awaiting leader" marks a value only the `.pen` can give.

## R1 · Where each new piece lives

- **Decision**:
  - Nosotros sections in `app/features/about/ui/`: `AboutHeroSection.vue`
    (rewritten v2 in place of the v1 file), `TeamCompositionSection.vue`
    ("Cómo se arma") with `CompositionCard.vue`, `WhereWeAreSection.vue`
    ("Dónde estamos"), `WorkWithMuushSection.vue` (rewritten v2). One content
    model per section in `about/data/`, one `use…Content` seam per section in
    `about/logic/` (the only `useI18n` callers, as today).
  - Preguntas and 404 body: one presentational `StatusSection.vue` in
    `app/features/shell/ui/`, exported through the shell barrel; content seams
    `useNotFoundContent` (existing, reshaped) and `useFaqContent` (new) in
    `shell/logic/`, models in `shell/data/notFound.ts` and `shell/data/faq.ts`.
- **Rationale**: Article I lists four modules (shell, landing, about, forms).
  Preguntas today is a heading plus two links built only from shell vocabulary
  (route names, the `diagnostico` anchor, the call-booking URL, the resolver),
  which is exactly the reason spec 036 R5 placed the 404 in the shell. Putting
  the shared block in the shell (its only two consumers) avoids a premature
  `app/shared/` abstraction (Article III, last paragraph). When Preguntas gets
  real questions it becomes its own module, which needs an Article I
  amendment; noted for Roberto, not done here.
- **Alternatives**: a new `faq` feature module (rejected: needs a constitution
  amendment for a page with no content); `app/shared/ui/StatusSection`
  (rejected: both consumers are the shell).

## R2 · "Lo que recibes" list shared by home and Nosotros

- **Decision**: move `landing/ui/ReceivesList.vue` (+ story and test) to
  `app/shared/ui/ReceivesList.vue`; the story moves to the shared group
  (`Shared/ReceivesList`). `AssessmentSection` imports it from `@/shared/ui/`.
  Its tokens (`recibes-*`, `recibe-*`, `rotulo`, `compromiso-icono`, `rojo-15`)
  stay as they are. No prop change.
- **Rationale**: `about` cannot import a `landing` internal (Article III), and a
  second copy would break DRY (Article VIII). Two consumers justify the lift.
- **Alternatives**: export it from the landing barrel (rejected: a landing
  export consumed by about couples two page modules for a design-system
  piece); duplicate (rejected).

## R3 · One source for the map labels

- **Decision**: move `landing.whoWeAre.{legend,regions,cities}` to a top-level
  `map.{legend,regions,cities}` namespace in both locale files (values
  unchanged). `app/shared/data/mapCopy.ts` holds `MAP_COPY_KEYS` (the
  `satisfies` typing that today lives in `whoWeAreContent.ts`) and the
  `MapCopy` type (`legend`, `soonLabel`, `regions`, `regionsLabel`, `groups`,
  `cityNames`). `app/shared/utils/mapCopy.ts` exports a pure
  `resolveMapCopy(translate)` that builds `MapCopy` from a translate function.
  `useWhoWeAreContent` and the new `useWhereWeAreContent` call
  `resolveMapCopy(t)`; `WhoWeAreContent` and `WhereWeAreContent` extend
  `MapCopy`.
- **Rationale**: FR-017 and SC-007. A pure function taking `t` keeps
  `useI18n` in the feature seams (no Nuxt composable in `app/shared/`), and is
  unit-testable without Nuxt.
- **Alternatives**: about reading `landing.whoWeAre.*` keys (rejected: hidden
  coupling on another feature's namespace); duplicate keys under `about.*`
  (rejected: two copies of nine city names and the legend can drift).

## R4 · Dónde estamos reuses the map pieces, not the home section

- **Decision**: `WhereWeAreSection.vue` composes `Pill`, `Heading`, `WorldMap`
  and `MapLegend` with the same classes and tokens as `WhoWeAreSection`
  (`mapa-*`). The one difference: the mobile body is 16 / 1.5
  (`text-p`-sized) where the home's is 17; desktop is identical (17 / 1.55
  Gris 400).
- **Rationale**: the map, legend and tabs are already shared; the section
  shell is ten lines of layout, and making the home section generic would add
  props for one difference.
- **Alternatives**: lift `WhoWeAreSection` to shared as `MapSection` with a
  body-size prop (rejected: speculative generalisation, Article VIII).

## R5 · Mobile shader uniforms (Clarifications Q3, provisional)

- **Decision**: `BackgroundPreset` gains an optional `compactUniforms`
  (overrides only, like `uniforms`). The four presets of this feature get the
  mobile values of FR-046. `ShaderBackground` builds the effective preset as a
  computed `{ ...preset, uniforms: isDesktop || !compactUniforms ? uniforms :
  compactUniforms }` with `useDesktopLayout()` (1024 px query) and passes that
  getter to `useShaderCanvas`, which already accepts `MaybeRefOrGetter` and
  reads uniforms at draw time. A preset change must trigger one redraw (needed
  when the loop is paused: reduced motion or off screen); add that watch in
  `useShaderCanvas` if it does not already redraw on preset change.
- **Rationale**: 390 is an anchor; the acanalado at 18 ribs is visibly
  different from the default. The shader source does not change between the
  two sets, so no reload. Before mount `isDesktop` is false, but the canvas is
  transparent until its first frame, which happens after mount, so no wrong
  frame is shown. The poster (one per section) is unchanged.
- **Alternatives**: desktop uniforms at all widths, as on the home (rejected
  provisionally: 390 would not match); two `ShaderBackground` instances shown
  by breakpoint (rejected: two WebGL contexts per section).
- **Out of scope**: whether the home's mobile frames also differ (question to
  the leader).

## R6 · The Preguntas route

- **Decision**: `nuxt.config.ts` `i18n.pages.faq = { es: '/preguntas', en:
  '/faq' }`; page `app/pages/faq.vue`; `ShellRouteName` gains `'faq'`. The page
  calls `usePageSeo({ titleKey: 'pages.faq.title', descriptionKey:
  'pages.faq.description' })` with no `pageType` (schema-org default web page,
  FR-038). `definePageMeta` is not needed (R8).
- **Sitemap**: `excludeAppSources: ['@nuxtjs/i18n:pages']` stays; the two
  documents arrive from the prerender crawl (they are linked from the footer
  on every page, and Nuxt prerenders every page route). `tests/seo-output`
  moves from four to six pages, including the hreflang/x-default checks, and
  asserts no `noindex` on Preguntas.
- **Rationale**: Article VI, one declaration of translated segments.

## R7 · Footer entries and the nav (Clarifications Q1, provisional)

- **Decision**: `FOOTER_DESTINATIONS.faq = { kind: 'route', name: 'faq' }`;
  add `{ labelKey: 'shell.footer.muush.faq', destination: faq }` to the MUUSH
  column after "Trabaja con muush", and to `MOBILE_FOOTER_LINKS` after
  "Nosotros". `NAV_ITEMS` / `MENU_ITEMS` unchanged; their comments that promise
  a future Preguntas item are rewritten to state Roberto's decision (link bar
  stays three items). Tests: `navigation.test.ts` keeps "no faq item" as a
  permanent rule; `footerColumns.test.ts`, `contactChannels.test.ts` and the
  static-output footer test assert the new entry and its href in both locales;
  the static-output nav test ("no Preguntas inside the nav") stays.
- **Rationale**: approved copy § 4.7 and pen extract-43 §§ 6–7; FR-024 of spec
  043 deferred exactly these entries to this feature.

## R8 · Retiring the v1 page frame

- **Decision**: `layouts/default.vue` drops the `isFullBleed` computed and the
  conditional `mx-auto max-w-shell-max px-page` on `<main>`; `pages/index.vue`
  drops `definePageMeta({ fullBleed: true })`. The `shell-max` / `page` tokens
  stay (quarantined v1 components still read them; feature 47 deletes).
- **The footer's `mt-section-gap`**: kept unchanged until the leader confirms
  the `.pen` gap between the last section and the footer (it applies to the
  home too). Awaiting leader.
- **Rationale**: after this feature no page is v1; the frame comment in the
  layout already schedules this.

## R9 · The v2 404

- **Decision**: `error.vue` renders `<StatusSection v-bind="content" />` from
  `useNotFoundContent()` inside `NuxtLayout`; `useNotFoundDocument` unchanged.
  `shell/data/notFound.ts`: keep `NOT_FOUND_HOME` (route `index`), add
  `NOT_FOUND_ASSESSMENT` (anchor `index#diagnostico`), delete
  `NOT_FOUND_SHORTCUTS`; copy keys `shell.notFound.heading.{first,second}`,
  `shell.notFound.cta`, `shell.notFound.assessment`; delete
  `shell.notFound.{eyebrow,headline,body,shortcutsLabel,shortcuts.*}`.
  `NOT_FOUND_ROBOTS`, the locale state key, the plugin and every 039 module
  are untouched. Delete `shell/ui/legacy/NotFoundContent.*`,
  `NotFoundRings.*` and the `--not-found-*` / `not-found-*` v1 tokens they
  alone use; `tests/not-found-tokens.test.ts` is deleted if it then asserts
  only those tokens (it guards the v1 glow namespace, which feature 47 owns:
  keep the glow-namespace assertion if it still has a subject).
- **Reactivity after the in-place switch (039)**: the content seam is a
  `computed` over `t` and the shared resolver, so both buttons follow the
  switched locale exactly as the v1 CTA and shortcuts did.
- **Tests** (Clarifications Q5): `tests/not-found-output.test.ts` keeps every
  behavioural case; the v1-look cases (pill, subtitle, LED, shortcuts,
  separators, rings, glow) are replaced by: only `h1` is the two-tone heading;
  one primary link to the same-locale home; one glass link to
  `…/#diagnostico`; one `aria-hidden` shader background with the `notFound`
  poster; no other locale's copy.

## R10 · `StatusSection` (Preguntas and 404)

- **Decision**: props `preset: 'faq' | 'notFound'` (which also selects the
  Heading size, `estado` or `diagnostico`, and the block tokens), `headingFirst`, `headingSecond?`,
  `primary: ResolvedShellItem`, `secondary: ResolvedShellItem`. Host contract of
  `ShaderBackground` (section `relative isolate`, content `relative z-10`).
  Heading level 1. Primary = `PrimaryButton size="hero"` with arrow, `to` for
  internal hrefs; secondary = `GlassButton`, `href` + `target="_blank" rel="noopener
  noreferrer"` when `external`, `to` otherwise. Block min-heights and paddings
  per page come from tokens selected by `preset` (two class maps).
- **Heading sizes**: the 404 is 34 → 64, which is the existing `diagnostico`
  size; its line-height (1.08 desktop / 1.15 mobile) is taken provisionally
  until the leader gives the drawn one. Preguntas is 34 → 88 / 500: a new
  Heading size `estado` (`--h-estado`, `--lh-estado`, `--tracking-estado`).
  Awaiting leader: line heights and tracking of both.
- **Alternatives**: two components (rejected: FR-042).

## R11 · "Cómo se arma" cards

- **Decision**: `CompositionCard.vue` is an `<li>` with classes
  `bg-vidrio-fondo rounded-servicio borde-luz borde-linea` (glass-panel fill,
  24 radius, flat Blanco 12 % hairline, the same utilities the map chip uses),
  padding `p-tarjeta-equipo` (24 → 32), gap 14; label row (gap 10, 8 px dot
  with `pulso`, label 14 / 600 Gris 400), title Poppins 26 / 500 Blanco, text
  17 / 1.5 Blanco 70 %. Dot colour by kind: `team` Red muush 500, `pool`
  Blanco, `partner` Acero 200. The ping inherits the dot colour, so Blanco
  needs nothing new (Clarifications Q4, provisional). Cards row: `ul` grid,
  one column below `md`, three equal columns from `lg`, `items-stretch` for
  equal height; at 768–1023 a single column (sizes may adapt).
- **Awaiting leader**: whether the card has a backdrop blur or shadow and
  whether its stroke is flat or top-lit; title / label line heights.
- **Alternatives**: `GlassSurface` (rejected: no preset matches 24 radius +
  panel fill + flat 12 % edge; adding a fourth preset for one use is
  speculative).

## R12 · Heading tokens for Nosotros

- Hero: 32 → 64, line boxes 90 at 1440 (≈ 1.406) and 1.15 at 390: new Heading
  size `pagina` (`--h-pagina`, `--lh-pagina`, `--tracking-pagina`).
- Cómo se arma: 30 → 56, line boxes 78 at 1440 (≈ 1.393), 1.15 at 390: a
  per-use token (precedent `text-servicios-titulo`), passed as a class.
- Dónde estamos: `seccion` (28 → 56 / 1.1, 1.15 mobile), unchanged.
- Trabaja con muush: `diagnostico` (34 → 64 / 1.08), unchanged.
- **Awaiting leader**: confirm the 90 / 78 line boxes are intended (every other
  v2 heading is 1.06–1.1; 1.4 is the auto value) and give the desktop tracking
  of the hero, Cómo se arma, Preguntas and 404 headings (only Trabaja's
  −2.24 is extracted). Until then the plan follows the drawn boxes (FR-053) and
  the fluid `≈ −0.035 em at 1440` tracking of feature 42.

## R13 · Trabaja con muush layout

- **Decision**: same grid and tokens as `AssessmentSection`
  (`diagnostico-*`, `cuerpo-diagnostico`, `max-w-cuerpo-diagnostico`), without
  the call row: left column (pill, heading, body, `ReceivesList`) in row 1
  centred against the form spanning; mobile order pill → heading → body → list
  → form. Background `workWithUs` with `inset-0` (the `.pen`'s 26 px upward
  offset is not reproduced: it sits inside the 30 % top fade; reported).
  Anchor `SECTION_ANCHORS.workWithUs`.
- **Alternatives**: lift a shared "split form section" (rejected: one
  difference, the call row, would need a slot or prop; two small templates are
  clearer).

## R14 · What is deleted, what is quarantined

- **Deleted** (nothing renders or imports them after this feature):
  `about/ui/AboutHeroSection.*` and `about/ui/WorkWithMuushSection.*` v1
  content (files rewritten in place), `about/data/aboutHeroContent.ts` /
  `workContent.ts` v1 shapes (rewritten), v1 `about.hero.*` / `about.work.*`
  values (replaced), `shell/ui/legacy/NotFoundContent.*`,
  `shell/ui/legacy/NotFoundRings.*`, `NOT_FOUND_SHORTCUTS`, the v1 404 keys,
  and the v1 tokens used only by these (`--about-hero-*`, `--work-*`,
  `--not-found-*` families and their `@theme` utilities). Before deleting a
  token, grep that no quarantined file reads it.
- **Untouched** (still used by other quarantine, feature 47 deletes):
  `app/shared/ui/legacy/*` (HeroStack, SectionBackdrop, SectionGlow, Pill,
  PrimaryButton, …), `shell-max`, `page`, `section-gap` tokens.
- **Rationale**: the feature 45 precedent (v1 contact section deleted, not
  quarantined, because nothing could render it).

## R15 · Copy

- New keys (both locales): `about.hero.{pill,heading.first,heading.second,intro}`,
  `about.composition.{pill,heading.*,cards.{team,pool,partner}.{label,title,text}}`,
  `about.where.{pill,heading.*,body}`, `about.work.{pill,heading.*,body,areasLabel,areas.{engineering,design,creative}}`,
  `map.*` (moved), `shell.faq.{title,assessment,call}`,
  `shell.notFound.{heading.*,cta,assessment}`, `shell.footer.muush.faq`,
  `pages.faq.{title,description}`.
- The eyebrow "Nosotros" no longer reuses the shell's translation by test
  (`tests/about-copy.test.ts` is rewritten to the § 4.8 strings).
- "Áreas que sumamos" is stored in sentence case and drawn uppercase, like
  "Lo que recibes".
- Messaging rules hold: no dashes for pauses, muush lowercase, emoji allowed
  (🚧 is not red).
