# Implementation report · Feature 51 `faq_content`

Implementer, 2026-11-08. Branch `feat/v2-faq-content` (not switched, nothing
committed). Spec package `specs/051-faq-content/`, approved by Roberto at
the gate on 2026-11-08. All 41 tasks of `tasks.md` are ticked (T037 was the
spec_author's).

## Result

- `./init.sh` exits 0: typecheck, Biome (594 files), **205 test files /
  2,893 tests**, `pnpm generate`, `pnpm storybook:build`, all green.
- `/es/preguntas` and `/en/faq` render the approved page: pill, two-tone
  `h1`, subtitle, five topic tabs (chip carousel below 1024), one-open
  accordion, contact card with one booking button, the acanalado band from
  the page top. All 20 answers per locale are in the prerendered HTML; the
  head carries the approved meta copy and a FAQPage graph with 20 Questions;
  `llms.txt` carries the two approved lines; the sitemap still lists 10
  URLs. The header has four items with Preguntas / FAQ lit on its page.

## What was built

- **New module `app/features/faq/`** (Constitution 2.1.5):
  - `data/types.ts`, `data/faqTopics.ts` (5 topics, 5/5/4/3/3 questions,
    per-locale anchors, locale-neutral tracking ids, link destinations by
    route name, card and mail-link tracking).
  - `logic/`: `topicHash.ts` (fragment → topic, tab keys, counterpart
    anchor), `useFaqTopics.ts` (selection, fragment read, `replaceState`
    on a visitor's choice), `useFaqAccordion.ts` (one open,
    `faq_question_open` on open only), `useFaqContent.ts` +
    `faqSegments.ts` (resolution), `faqStructuredData.ts`, `chipScroll.ts`,
    `useFaqPage.ts` (`useFaqPageSeo`, `useFaqLocaleSwitch`).
  - `ui/`: `FaqSection`, `FaqBand`, `FaqTopicTabs`, `FaqPanel`,
    `FaqQuestion`, `FaqCard`, `FaqRichText`, each with a component test and
    stories (ES/EN, 390/1440); `faqFixtures.testing.ts`.
  - `index.ts` barrel: `FaqSection`, `useFaqContent`, `useFaqPageSeo`,
    `useFaqLocaleSwitch`, type `ResolvedFaqContent`.
- **Page** `app/pages/faq.vue`: composes `FaqSection`, passes `route.hash`.
- **Shell:** fourth nav item (`navigation.ts`, comment rewritten with
  Roberto's 2026-11-08 decision); `usePageSeo` generalised to
  `pageType: 'FAQPage'` + `extraNodes`; `localeSwitchHash.ts`
  (`useLocaleSwitchHash`, exported) appended by `useShellNavigation` to the
  toggle's href; placeholder removed (`data/faq.ts`, `logic/useFaqContent.ts`,
  their tests, the `faq` status preset and its fixtures/stories);
  `StatusPreset` narrowed to `'notFound'`.
- **Shared:** `supportEmail.ts` (lifted from the shell footer);
  `trackingEvents.ts` gains `FAQ_TOPIC_IDS`, `FaqTopicId`,
  `faq_question_open` (GA4 only, not in `CLICK_EVENT_NAMES` /
  `META_EVENT_BY_NAME`); `backgroundPresets.ts` `faq` preset = README
  uniforms (+ `u_ribs 18`, `u_th 0.26` below 1024); `Heading` gains size
  `faq`.
- **Tokens:** one "Preguntas · feature 51" group in `global.css` (no outer
  framing token; fallback recorded in its comment), utilities
  `borde-faq-activo`, `borde-faq-tenue`, `borde-faq`.
- **Copy:** `faq.*`, `pages.faq.*`, `shell.nav.faq` in both locale files,
  generated from the handoff JSON (verbatim; links/address as `{privacy}`,
  `{about}`, `{email}`); `shell.faq.*` deleted.
- **Icons:** lucide `plus`, `chevron-right`, `message-circle`
  (`app/assets/icons/`, README updated). Nothing downloaded; lucide's
  published path data written to the folder's contract.
- **Docs:** `tracking-plan-49.md` § 4 row, dimension list, § 9 (T038);
  `current.md`.
- **Tests added/updated:** `tests/faq-copy.test.ts` (+ fixtures
  `tests/fixtures/faq-approved.{es,en}.json`, the handoff JSON verbatim),
  `design-tokens` (feature 51 block), `token-literals` (faq module),
  `static-output` (Preguntas block, four-item nav on every page, current
  item), `seo-output` (FAQPage, meta, llms.txt from the 051 contract, no
  question in llms.txt), `shell-copy`, nav/menu/header/status tests,
  tracking catalogue and both sinks.

## Poster (T003)

`specs/051-faq-content/assets/poster-escritorio-h3JSJ.png` (the `.pen`
band layer, 1440 × 600) → `app/assets/backgrounds/preguntas-acanalado.webp`
with `cwebp -q 85 -m 6`: **129,850 bytes, 1440 × 600, quality 85**. Tried
q70 (30 KB), q75 (39 KB), q80 (82 KB), q85 (130 KB), q90 (195 KB): q85 is in
the 75–140 KB range of the other posters and keeps the film grain the lower
qualities smooth away. Old file sha1 `3ccd49d…` → new `57ec8e5…`.
`poster-movil-xJCj0.png` not used (one poster per preset).

## Measurements (T035, T039)

Method: built site served from `.output/public` on localhost, headless
Chrome 156, viewport fixed with `Emulation.setDeviceMetricsOverride`
(findings § R44), DPR 1. Every vendor host (Google Tag Manager, Google
Analytics, Facebook) was blocked with `Network.setBlockedURLs`, so no hit
left the machine.

Captures (session scratchpad, full page):
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-1440.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/en-1440.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-390.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/en-390.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-360.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-768.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-1024.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-1280.png`
- `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/es-1920.png`
- Header strips: the round 1 crops were deleted when the full-page captures were retaken and never re-made (review-51 F3). The round 2 crops of the fixed header are listed under "Round 2" below.
- Raw numbers: `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/measure.json`, `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/interact.json`

Anchors (CONFIRMED, measured):

| | 1440 × 900 | 390 × 844 |
|---|---|---|
| Band top / height | 84 / 600 | 68 / 300 |
| Pill top (= header + air) | 120 | 100 |
| Title | 56 / 61.6 / −1.96 px, Poppins 500; lines at 184, 245.6 | 34 / 37.4 / −1.02 px; lines at 158, 195.4 |
| Where the title lands | inside the band (84–684), as accepted under OQ-1 = B | inside the band (68–368) |
| Tabs / chips | 420 × 52, pitch 60 (gap 8), x 80 | chips 37.5 tall from x 24, row scrolls (1039 px of content in 390), next chip peeks |
| Right column | starts at 188 = 120 + 68; first (open) question 172.8, closed 82, gap 12 | open 237.2, closed 66 / 79.2, gap 10 |
| Card | 420 × 275.6 at y 718 | 342 × 254.8, full-width button |
| Document height | 1399 | 1922 |

Against `referencias/*.png` (everything but the vertical framing): column
widths, gaps, tab and question geometry, colours, icons and copy match. One
residual: the reference card is ≈ 283 tall at 1440, ours 275.6; the
reference shows ≈ 21 px between the card text and the button where the
README's gap is 14. Not chased (no README value explains it); flagged for
the leader to check against the frame.

Other widths (360, 768, 1024, 1280, 1920), both locales:
`scrollWidth === innerWidth` everywhere (no horizontal page scroll), no
clipped element in the block, chips scroll inside their row below 1024. The
EN title at 1440 is 452.9 wide and ends at x 532.9, inside the 72 px gap
(right column starts at 572), as the spec's edge case allows.

**Header with four items (T035), reported, not changed:**

| width | logo | link bar | end group | bar centre vs page centre |
|---|---|---|---|---|
| 1024 | 80–120 | 273.4–697.7 | 697.7–944 | 485.6 vs 512 (−26.4) |
| 1280 | 80–120 | 427.9–852.1 | 953.7–1200 | 640 (centred) |
| 1440 | 80–120 | 507.9–932.1 | 1113.7–1360 | 720 (centred) |
| 1920 | 320–360 | 747.9–1172.1 | 1353.7–1600 | 960 (centred) |

At 1024 there is no overlap and no wrap (all links on one row), but the
424 px bar no longer fits centred: the end group (246 px) is wider than its
`1fr` track, so the bar shifts 26 px left and **touches the ES button with
0 px gap**. Arithmetic: centred from about 1077 px (1024 − 160 − 424 = 440
< 2 × 246). Per T035 I did not shrink tokens; needs a decision (e.g. a
smaller link padding or gap between 1024 and 1080, or accept it).

**Behaviour on the built site (CONFIRMED):**
- `/es/preguntas#precios` and `/en/faq#pricing` on a fresh load select
  Precios / Pricing with its first question open; `scrollY` stays 0;
  `#nada` and no fragment select topic 01.
- Clicking a topic after scrolling 150 px: fragment becomes `#entrega`,
  `scrollY` stays 150, `history.length` unchanged, first question of the
  topic open, toggle href `/en/faq#delivery`.
- ArrowRight ×2 from Entrega wraps to Diagnóstico, focus follows.
- Language switch from `#precios` lands on `/en/faq#pricing` with Pricing
  selected; after leaving for About the toggle there is `/es/nosotros`
  (no stale fragment).
- With "Aceptar todo" (vendors blocked): switching topic sends nothing;
  open → close → open of question 19 pushes exactly two
  `faq_question_open {faq_topic: work_with_muush, faq_question: 19}` to
  `dataLayer`; Meta's queue gets nothing; three topic clicks add no
  `page_view` (1 before, 1 after).
- Scripts disabled: topic 01 with its first answer open.
- Not done: GA4 DebugView / real `collect` hits (quickstart step 9) — that
  would send to the production property; Roberto's check after deploy.
  WebGL-off and reduced-motion were not re-measured: the band uses the
  unchanged `ShaderBackground`, whose poster/reduced-motion paths are
  covered by its own tests.

## Deviations from the spec package, and why

1. **No `<i18n-t>` in `ui/`** (plan, R2, contract `FaqQuestion`). Inline
   links and the address are resolved in `logic/` into text/link/email
   segments (`faqSegments.ts`) and rendered by `FaqRichText.vue`. Reason:
   `<i18n-t>` is a vue-i18n component; Storybook has no i18n plugin and
   rules.md § R23 keeps `ui/` free of the Nuxt runtime. Same copy, same
   placeholders in the locale files, no `v-html`. `ResolvedFaqQuestion`
   therefore carries `answer` segments instead of `answerKey` /
   `answerParams`.
2. **FAQPage `@type` is `["WebPage", "FAQPage"]`, not the string
   `"FAQPage"`** (contract `build-output.md` § 2). Measured: nuxt-schema-org
   6.4.3's WebPage resolver merges its own default type into the node even
   under the `replace` tag, in both locales, exactly as Nosotros ships
   `["WebPage", "AboutPage"]`. Both locales are identical, the Question
   nodes are the `mainEntity` (20, `@id` refs), answers typed `Answer`. The
   WebPage node has no `inLanguage` of its own (true of every page of the
   site); each Question carries `es-MX` / `en-US`. `seo-output.test.ts` pins
   what ships. The Schema.org validator was not run (network); worth a check
   by the leader.
3. **Router fragment from the page** (not in the plan). On a direct load
   Nuxt hydrates a prerendered page at its payload path (no fragment) and
   restores the real URL through `router.replace` after hydration
   (measured: `replaceState` to `/en/faq`, then back to `/en/faq/#pricing`),
   so `window.location.hash` is empty at mount and the deep link selected
   topic 01. `faq.vue` passes `route.hash` (pages may read routing params)
   and `useFaqTopics` follows it, keeping `window.location.hash` /
   `hashchange` for Storybook, tests and manual edits. Recorded in the
   composable's comment.
4. **`topicIndexFromHash` returns `null`** for an unknown fragment (T014
   said 0); the caller selects topic 01. Needed to tell "topic 01 named"
   from "nothing named" for the language switch (Edge Cases).
   `counterpartAnchor` takes the topic index, not a hash (T027 says read the
   selected index).
5. **Feature 46 `estado` heading size retired** (not listed in T023): after
   the status block lost Preguntas it had no user (Article VIII).
   `--h-estado`, `--lh-estado`, `--tracking-estado`, `--text-estado*`,
   `Heading` size `estado` and its stories are gone; a test pins them gone.
   The StatusSection's external call-booking branch went too (the 404's two
   buttons are internal).
6. **Token name `--borde-faq-tenue`** instead of a general `--blanco-6`:
   feature 44 retired `--blanco-6` and a test pins it gone.
7. **Desktop header gap 20 and a few other DERIVED values** measured on the
   reference PNGs where the README gives no number (all commented in
   `global.css`): header gap 16 → 20; tab number → name gap 10 → 12; tab
   name line 1.25 (from the 52 px tab); card title line 1.4 (34 px box);
   title line height 1.1 at both anchors (README gives 1.1 for 1440 only;
   the 390 reference draws the lines 37 px apart). The leader may correct
   any of them from the frames.
8. **Inline links are underlined** (same colour, Blanco on hover). The
   handoff draws them plain; plain same-colour links fail WCAG 1.4.1. A
   value for Clau.
9. **`faqQuestionNodes` not exported** from the barrel (T022 listed it): it
   has no reader outside the module; `useFaqPageSeo` is the public API.
10. **Answer region is a `<section aria-labelledby>`**, not
    `role="region"` on a `div`: same semantics, required by Biome's
    `useSemanticElements`.

## For the leader / Roberto

- **Framing look (OQ-1 = B):** at both anchors the content is taller than
  the viewport, so the pill starts at the header + air (120 / 100) and the
  title sits on the band. Fallback values are in the `global.css`
  "Preguntas · feature 51" comment.
- **Header at 1024:** decision needed (table above).
- **GA4 (Roberto):** register event-scoped custom dimensions `faq_topic`
  and `faq_question` (tracking-plan-49 § 4, § 9).
- **Search Console:** re-request indexing of `/es/preguntas` and `/en/faq`
  after deploy.
- **R32 values for Clau's `.pen`:** the four-item nav; the centred
  framing; `faq.tabsLabel` "Temas" / "Topics"; underlined inline links; the
  card residual above.
- **Business docs (human-only, not edited):** `muush-1.0.md` § 3 line 79
  and § 4.1/4.9 still describe Preguntas as "En construcción" with two CTAs.
- **Not committed;** `feature_list.json` untouched by me (status stays
  `in_progress`).

## Round 2 · review-51 fixes (2026-11-08)

Review `docs/harness/progress/review-51.md`: CHANGES_REQUESTED. Roberto
chose option A for F1 (`open-questions.md`, "Revisión 1").

### F1 · header at 1024–1077 (blocker, FR-021)

- **Change:** the one token the nav items' horizontal padding reads,
  `--spacing-enlace-x` (`app/assets/css/global.css`, used only by
  `NavLinkBar.vue`), goes from a fixed `1.125rem` to
  `clamp(0.5rem, -7.5rem + 12.5vw, 1.125rem)`. That is 18 px from 1104 px
  up, and 1 px less for every 8 px of viewport below 1104 (8 px at 1024).
  Comment next to the token. No component, gap or other token changed.
- **Why the range ends at 1104, not 1080:** before the change the Spanish
  bar was centred from 1077 px but only 1.6 px from the ES button at 1080.
  It reaches the header's own 12 px gap (`--spacing-header-grupo`) only at
  1101 px. To meet "at least the header gap" at 1080, the padding has to
  give way up to 1104. The slope (4 items × 2 sides = 8 px of bar per px of
  padding) keeps the Spanish gap constant at ≈ 13.6 px from 1024 to 1104.
  Above 1104 nothing changes.
- **Measured on the rebuilt site** (served on 127.0.0.1:4321, headless
  Chrome 156, `setDeviceMetricsOverride`, DPR 1, vendors blocked). Pages
  `/es/preguntas`, `/es`, `/en/faq`, `/en/about`. Raw output:
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/header-round2.txt`

  | width | ES bar | ES gap to ES button | EN bar | EN gap | padding | off-centre | rows |
  |---|---|---|---|---|---|---|---|
  | 1024 | 344.3 | 13.6 | 283.3 | 53.0 | 8 | −0.01 | 1 |
  | 1050 | 370.3 | 13.6 | 309.3 | 53.0 | 11.25 | −0.01 | 1 |
  | 1077 | 397.3 | 13.6 | 336.3 | 53.0 | 14.625 | −0.01 | 1 |
  | 1080 | 400.3 | 13.6 | 339.3 | 53.0 | 15 | −0.01 | 1 |
  | 1104 | 424.3 | 13.6 | 363.3 | 53.0 | 18 | −0.01 | 1 |
  | 1280 | 424.3 | 101.6 | 363.3 | 141.0 | 18 | −0.01 | 1 |
  | 1440 | 424.3 | 181.6 | 363.3 | 221.0 | 18 | −0.01 | 1 |

  The bar is 50 px tall at every width. Before the change, at 1024 the
  Spanish bar was 424.3 px wide, 26.43 px off-centre, with a 0 px gap.
- **1440 unchanged:** the token clamps to `1.125rem` there, and the bar
  measures 424.3 / 363.3 px with 18 px padding, the same as before the
  change. I compared the computed values; I did not run a pixel diff,
  because the shader behind the glass bar animates.
- **Not covered by this fix:** a classic, non-overlay scrollbar (Windows)
  narrows the page without changing `vw`. By arithmetic, at 1024 with a
  15 px scrollbar the Spanish bar still centres, with ≈ 6 px to ES. Not
  measured.
- **Test:** `tests/design-tokens.test.ts` › "the four-item link bar
  (feature 51)" checks three things: 18 px from 1104 up, the 1-per-8 slope
  at 1024 / 1050 / 1077 / 1080, and that the Spanish bar leaves at least
  12 px to the group at each width. The last check uses the measured widths
  of the bar and the group. The suite cannot lay out real text, so the
  measured widths are the input.
- **Captures (1024, fixed build):**
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/header-1024-es-crop.png`,
  `/private/tmp/claude-501/-Users-betonajera-Workspaces-muush-muush-dev/2c07f6aa-d4e9-47f7-9f8d-6532277967c6/scratchpad/shots51/header-1024-en-crop.png`

### F2 · JSON-LD contract

`specs/051-faq-content/contracts/build-output.md` § 2 now describes the
shipped shape: `@type` `["WebPage", "FAQPage"]` in both locales, 20
`@id`-referenced Questions with typed Answers and `inLanguage` on each
Question, no `inLanguage` on the WebPage node. It also carries a dated note
and the reminder to run the Rich Results Test or the Schema.org validator
after deploy (SC-005).

### F2 · stale test comment

`tests/seo-output.test.ts`: the docblock above the FAQPage tests said "a
plain string type". It now describes the array the test asserts.

### F3 · missing captures

The two header-crop references in the round 1 "Measurements" list are
corrected (see the note there). The 1024 crops above are new, from the
fixed build.

### Gates

`./init.sh` exits 0: typecheck, Biome, **205 files / 2,896 tests**,
`pnpm generate` (`.output/public` rebuilt; the server on 4321 serves it),
and `pnpm storybook:build`. Nothing committed; `feature_list.json`
untouched.
