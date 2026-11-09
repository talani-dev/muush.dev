# Research · Feature 51 `faq_content`

Read on 2026-11-08 from the repository, the handoff
`Landing Page/handoff/preguntas-muush-1.0/` and
`handoff/animaciones-muush-1.0/README.md`. The `.pen` was not read (no Pencil
MCP in a subagent, rules.md § R32). Status per item: CONFIRMED (seen in code
or approved handoff), INFERRED, UNVERIFIED.

## R1 · FAQPage structured data with nuxt-schema-org 6.4.3

- **Decision**: replace the page's WebPage node with one typed `FAQPage`
  (both locales) and add one `defineQuestion({ name, acceptedAnswer })` node
  per question, in page order, in the same graph.
- **Rationale** (CONFIRMED in
  `node_modules/.pnpm/nuxt-schema-org@6.4.3_*/…/schema-org-v3/shared/schema-org.*.mjs`):
  the `questionResolver.resolveRootNode` appends each Question to the
  primary WebPage's `mainEntity` when that page's `@type` includes `FAQPage`;
  questions inherit `inLanguage` from the page meta. The module's default
  infers `FAQPage` only from a final `faq` segment (`/en/faq`, not
  `/es/preguntas`), and same-`@id` WebPage nodes merge their types
  (measured in feature 46, `usePageSeo.ts` § `replaceWebPageNode`). So the
  existing replace mechanism (`tagDuplicateStrategy: 'replace'`) is reused,
  generalised from a fixed `'WebPage'` to a `pageType` of `'WebPage' |
  'FAQPage'`, and the Question nodes go in the **same** `nodes` array (a
  separate `useSchemaOrg` tag would be dropped by the replace, INFERRED;
  the implementer measures it in the generated HTML).
- The answer text in JSON-LD is plain text: inline links render as their
  link text, the email as `support@muush.dev`.
- Guarded by `import.meta.server` like every schema call (client bundle
  stays free of schema-org code, feature 35 finding).
- **Alternatives**: keep `WebPage` (rejected, D1); add a `FAQPage` second node
  with its own `@id` (rejected: two page nodes for one URL).
- The test `seo-output.test.ts › should declare both Preguntas pages as a
  plain WebPage, never FAQPage` is rewritten to the opposite assertion: one
  FAQPage per document, 20 `mainEntity` items, identical node-type sets in
  both locales, `ReadAction` kept.

## R2 · Copy with inline links and an email

- **Decision**: every answer is one locale string. Inline links and the
  email are named placeholders (`{privacy}`, `{about}`, `{email}`)
  rendered with vue-i18n's `<i18n-t>` component and named slots; the link
  texts are their own keys (`faq.links.privacy` = "Aviso de privacidad").
  The address `support@muush.dev` is passed as a parameter from TypeScript
  (`data/`), never written in the locale file, which also avoids the `@`
  compile trap (rules.md § R26). The card text uses the same `{email}`
  placeholder.
- **Plain text** for JSON-LD and tests: `t(key, { privacy: t(linkKey),
  email: SUPPORT_EMAIL })`.
- **Rationale**: Article VI (no hardcoded strings), one source for the
  visible answer and the structured-data answer, and the visible link text
  equals the JSON's `enlaces[].texto` verbatim.
- **Alternatives**: HTML in locale strings with `v-html` (rejected: XSS
  surface and Biome/Vue lint); splitting answers into before/after fragments
  (rejected: translators lose the sentence).
- Destinations come from route names (`privacy`, `about` +
  `SECTION_ANCHORS.workWithUs`) through `localePath`, never string
  concatenation (Article VI).

## R3 · Tabs and accordion behaviour

- **Decision**: pure logic in `logic/` composables:
  - `useFaqTopics(topicIds)`: selected index, `select(i)`, `onKeydown`
    (ArrowLeft/Right wrap, Home/End, moves focus), initial selection from
    `route.hash` (unknown → 0), and (OQ-6 = A) `history.replaceState` of the
    hash on select, no scroll.
  - `useFaqAccordion()`: `openIndex` per topic, `toggle(i)`, reset to 0 on
    topic change (spec FR-012). `toggle(i)` emits `faq_question_open` when
    it opens (R9); `reset()` never emits.
  - Pure helpers (`topicIndexFromHash`, `nextTabIndex`) unit-tested.
- The WAI-ARIA pattern already exists in `MapRegionTabs.vue` +
  `useMapRegion().onKeydown` (CONFIRMED); the FAQ tabs follow the same
  roving-tabindex shape, not a new pattern. If the key handling can be
  shared without coupling to map regions, it is lifted to `app/shared/logic`
  (Article III); otherwise duplicated small (Article III prefers that).
- **Rendering**: all 5 panels are in the DOM; the inactive ones carry
  `hidden`. Each answer region is always rendered and `hidden` when closed.
  This satisfies D3 (in the prerendered HTML) without `v-if`.
- **Initial render**: the prerender has no hash, so it renders topic 01 with
  question 1 open; on mount, a valid hash re-selects. A brief switch on deep
  links is accepted (INFERRED harmless; no layout shift above the fold since
  the right column is below the title on mobile and beside it on desktop).
- **Language switch** (OQ-6 = A): today `resolveLocaleDestination` drops the
  hash (CONFIRMED). The FAQ page tells the toggle the counterpart topic id by
  index; the smallest change is a page-level hook that maps the current hash
  to the other locale's id.
- `history.replaceState` bypasses vue-router, so `route.hash` does not
  update and no `page_view` is sent (the page-view logic keys on the path,
  `tracking/logic/pageViews.ts`, CONFIRMED). The selected index is the state
  of record; the language-switch hook reads it, not `route.hash` (INFERRED;
  the implementer verifies in the built site).

## R4 · The acanalado band

- **Decision**: the band is its own absolutely positioned box inside the
  page block (`relative isolate`), a sibling of the centred content layer,
  so it stays at its drawn distance from the page top whatever the content
  does (spec FR-020); `top` = band offset token (68 → 84 px),
  `height` = band height token (300 → 600 px), full width; it hosts the
  existing `ShaderBackground` with the `faq` preset, which keeps filling its
  host (`absolute inset-0`). `ShaderBackground` itself does not change.
- **Preset**: `BACKGROUND_PRESETS.faq` gets the README's new uniforms;
  `compactUniforms` = the same plus `u_ribs: 18`, `u_th: 0.26` (the compact
  set is overrides-only over shader defaults, so it repeats every value).
- **Poster** (OQ-5, answered): the leader exported the band layer
  `Fondo · vidrio acanalado` of `.pen` frames `h3JSJ` (1440 × 600) and
  `xJCj0` (390 × 300) as PNG into the session scratchpad
  (`…/scratchpad/faq-poster/{h3JSJ,xJCj0}.png`, CONFIRMED present on
  2026-11-08, sizes verified with `sips`). The implementer converts
  `h3JSJ.png` with `cwebp` (installed, `/opt/homebrew/bin/cwebp`) and
  overwrites `preguntas-acanalado.webp` (same import, hashed by the build).
  Priority stays `high`. `BackgroundPreset` has one optional `poster` and
  its docblock says "The poster stays one per section" (CONFIRMED), and
  `ShaderBackground.vue` renders a single `<img object-cover>`; a mobile
  poster would need a new preset field and component branch, which this
  feature does not add (spec Out of scope). `xJCj0.png` stays unused.
- All animations-handoff rules are already implemented by
  `useShaderCanvas` (pause off screen / hidden tab, reduced motion, DPR caps,
  poster fallback, `aria-hidden`, `pointer-events: none`) — CONFIRMED in
  `ShaderBackground.vue`.
- Page background Negro 950 comes from the layout (unchanged).

## R5 · Vertical framing (OQ-1 = B, Roberto 2026-11-08)

- **Decision**: the site-wide first-block framing of fix 8c9f79e, as
  `StatusSection.vue` uses it today (CONFIRMED in code): block `relative
  isolate flex min-h-portada-alto flex-col pt-seccion-arriba
  pb-seccion-aire`; content layer `relative z-10 flex flex-1 flex-col
  justify-center`. Tokens (CONFIRMED in `global.css`): `portada-alto` =
  `100lvh`; `seccion-arriba` = header offset (76 → 88) + `--seccion-aire`
  (24 → 32); `seccion-aire` = 24 → 32. No new framing token.
- **Consequence** (DERIVED): at 1440 the content (title + tabs + card, and
  the right column 68 lower) is taller than 900 px, so centring does not
  move it; the pill starts ≈ 120 px from the top, inside the band (84–684).
  The README's "all text on black" no longer holds; Roberto accepted it.
- **Fallback** (only if Roberto rejects the look at review): new fluid
  tokens `--spacing-faq-arriba` (200 → 300) and `--spacing-faq-abajo`
  (64 → 200), no centring. New names, because `tests/design-tokens.test.ts`
  pins that the retired `--spacing-preguntas-*` never come back.

## R6 · Header item (OQ-2 = A, Roberto 2026-11-08)

- `NAV_ITEMS` gains `{ labelKey: 'shell.nav.faq', destination:
  { kind: 'route', name: 'faq' } }` after `about`; `MENU_ITEMS` follows it
  (same array). The active state on a route item already exists for
  Nosotros (CONFIRMED by FR-032 of spec 046 and `NavLinkBar`); the comment
  block in `navigation.ts` that says "permanently" is rewritten with the new
  date and decision. New keys `shell.nav.faq` = "Preguntas" / "FAQ"
  (`muush-1.0.md` § 4.1 already lists them). Tests of NavLinkBar/MobileMenu
  that pin three items are updated. Full list of pins in `tasks.md` T036–T037.
- The bar is centred by the header grid (`lg:grid lg:grid-cols-cabecera`,
  logo `justify-self-start`, group `justify-self-end`, CONFIRMED in
  `SiteHeader.test.ts`); a fourth item widens the bar, so the implementer
  measures 1024 / 1280 / 1440 for overlap.

## R7 · Module placement (OQ-3 = A, Roberto 2026-11-08)

- `app/features/faq/{ui,logic,data,index.ts}`; Constitution Article I's
  module list gains `faq` (PATCH 2.1.4 → 2.1.5, sync report), applied by
  the spec_author on 2026-11-08 with Roberto's written approval. The shell
  keeps `StatusSection` for the 404 only: its `faq` preset entry,
  `shell/data/faq.ts`, `useFaqContent` and their tests are deleted (Article
  VIII, no dead code), and `StatusPreset` narrows to `'notFound'`.
- `faq` imports shared pieces only from `app/shared/` (Pill, Heading,
  PrimaryButton, ShaderBackground, callBooking, sectionAnchors, tracking);
  it uses `usePageSeo` through the shell barrel (`@/features/shell`), as the
  page does today.
- `faq` reaches the tracking bus through `app/shared/logic/trackingBus.ts`
  (shared, like `forms` does), never the `tracking` feature.

## R8 · llms.txt (OQ-4 = A, approved as drafted)

- `public/llms.txt` is a static file; `tests/seo-output.test.ts` compares it
  byte for byte with the fenced block in
  `specs/049-consented-tracking/copy-drafts.md § C`. **Decision**: the new
  approved text is stored as a fenced block in this feature's
  `contracts/llms-txt.md`, and the test's `approvedBlock()` reads that file
  instead. Only the two FAQ lines change. The "links only" and "exactly the
  sitemap URLs" checks stay and pass unchanged.

## R9 · Tracking (OQ-8 = A + B, Roberto 2026-11-08)

- **A (kept)**: `cta_location: 'faq'` already exists in `trackingEvents.ts`
  (CONFIRMED). The card button reuses the shape of the old `FAQ_SECONDARY`
  item (`book_call_click`). The two mail links use the existing
  `contact_click` with `channel` = `email`. The `faq` row of the CTA table
  comment in `trackingEvents.ts` becomes "Agenda una llamada, correo (card
  and question 19)" with source `faq data/faqTopics.ts`.
- **B (new event)**: `faq_question_open` (spec D6, FR-024). Name style:
  `<object>_<action>`, lower snake_case, like `book_call_click`,
  `language_change`, `form_start` (CONFIRMED in the union). Params:
  `faq_topic` ∈ `FAQ_TOPIC_IDS` (locale-neutral, snake_case like
  `ABOUT_SECTIONS`' `work_with_us`) and `faq_question` (integer 1–20).
  Prefixed `faq_` so the GA4 custom dimensions cannot collide with the
  existing `section` / `result` dimensions.
- **Routing** (CONFIRMED): the GA4 sink forwards every catalogue event's
  `params` unchanged (`googleAnalytics.ts` `eventParams`); Meta sends only
  the names in `META_EVENT_BY_NAME` (`book_call_click`, `contact_click`,
  `generate_lead`), and `metaPixel.test.ts` › "should map the three
  conversions and nothing else" pins that. Every other UI event
  (`language_change`, `section_view`, `form_*`, `cv_attached`) is GA4 only.
  Chosen: **GA4 only**, no change to the Meta map, not a key event.
- **Emission**: `useFaqAccordion` (faq `logic/`) calls `emitTrackingEvent`
  from `@/shared/logic/trackingBus` (as `forms` does). No consent logic in
  `faq`: with no sink subscribed the emit is a no-op (feature 49).
- **GA4 admin** (Roberto): register two event-scoped custom dimensions,
  `faq_topic` and `faq_question` (parameter names identical). The tracking
  plan § 4 table and its custom-dimension list gain them (spec FR-026).

## R10 · Icons

- `app/assets/icons/` has `x.svg` and `arrow-right.svg`; it lacks `plus`,
  `chevron-right` and `message-circle` (CONFIRMED). They are added from
  lucide (ISC licence, same source as the existing ones, see the folder
  README), inlined with `?raw` like the others (rules.md § R14), stroke
  `currentColor`.

## R11 · Old Preguntas pins to retire

CONFIRMED in `tests/`:
- `static-output.test.ts:148-149` expects "En construcción 🚧" / "Under
  construction 🚧" → replaced by assertions on the new title, the 20
  questions and the 20 answers.
- `seo-output.test.ts:369` (never FAQPage) → R1.
- `token-literals.test.ts:250,256` lists `shell/data/faq.ts` and
  `pages/faq.vue` → updated to the new files.
- `StatusSection.test.ts` / stories with the `faq` preset → narrowed to the
  404.
- `shell/data/trackedItems.test.ts:9,47` imports `FAQ_PRIMARY` /
  `FAQ_SECONDARY` from `./faq` → the `faq` row moves to the new module's
  tests (card + email links).
- Nav pins of "Preguntas never in the bar/menu" (OQ-2 = A) → `tasks.md`
  T036–T037.
- `i18n` keys `shell.faq.*` and `pages.faq.*`: `shell.faq.*` deleted (no
  reader left); `pages.faq.title/description` keep their keys with the new
  copy.
