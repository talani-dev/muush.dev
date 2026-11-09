# Implementation Plan: Preguntas frecuentes (FAQ) with the real questions

**Branch**: `feat/v2-faq-content` | **Date**: 2026-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/051-faq-content/spec.md`

> **Answers**: Roberto answered OQ-1…OQ-8 on 2026-11-08
> ([`open-questions.md`](./open-questions.md)): 1B, 2A, 3A, 4A, 5 (`.pen`
> export), 6A, 7A, 8 A+B. Nothing in this plan is provisional any more.

## Summary

Replace the "En construcción" status block of `/es/preguntas` and `/en/faq`
with the approved FAQ page: header (pill, two-tone title, subtitle), five
topic tabs (chips carousel below 1024), a one-open-at-a-time accordion per
topic, a contact card with one booking button, all over a new acanalado band
at the top. All 20 answers per locale are in the prerendered HTML; the page
gets a `FAQPage` graph with 20 Questions, new meta copy and updated
`llms.txt` entries. Routes and sitemap are untouched. The header gains a
fourth item, "Preguntas" / "FAQ", lit on this page; opening a question sends
a new GA4-only event `faq_question_open`. Approach: a new `faq` feature
module (Constitution 2.1.5) composed by the existing thin page, copy in the
locale files with `<i18n-t>` slots for inline links, pure logic composables
for tabs/accordion, the site-wide section framing (centred, like the other
first blocks), the existing `ShaderBackground` inside a band box positioned
from the page top, and the existing WebPage-replace mechanism generalised to
`FAQPage` (research R1).

## Technical Context

**Language/Version**: TypeScript (strict), Vue 3 `<script setup lang="ts">`, Nuxt 4
**Primary Dependencies**: @nuxtjs/i18n (es/en, translated segments), nuxt-schema-org ~6.4.3, @nuxtjs/sitemap, Tailwind v4 (tokens in `app/assets/css/global.css`), lucide icons as raw SVG
**Storage**: N/A (static content in locale files and `data/`)
**Testing**: Vitest (unit + Vue Test Utils component tests), build-output tests over `.output/public`, Storybook build
**Target Platform**: static site, `nitro.preset: 'static'`, S3 + CloudFront
**Project Type**: static web site (Nuxt prerender)
**Performance Goals**: no new runtime requests beyond the consented GA4 hit per question opened; shader paused off screen; band poster is the only new image (above the fold, `fetchpriority=high`, WebP converted from the `.pen` export)
**Constraints**: no server runtime (Article IV); answers in HTML (D3); 390/1440 anchors match the handoff except the outer vertical framing (site-wide centring rule, spec FR-019); no hardcoded strings, colours or px in components
**Scale/Scope**: 1 page × 2 locales, 5 topics, 20 Q&A per locale, ~5 new components, ~3 composables

## Constitution Check

*GATE: before Phase 0, re-checked after Phase 1.*

### Phase -1 Gates

| Gate | Article | Status | How |
|---|---|---|---|
| **Static-site purity** | IV | PASS | Pure prerender; no `server/api`, no fetch on click; the FAQPage graph is written at prerender (`import.meta.server`); llms.txt stays a `public/` file. |
| **Feature-based layers and direction** | I, II | PASS | `app/features/faq/{ui,logic,data,index.ts}`; `data/` imports nothing upward; page stays a thin wrapper. Article I lists `faq` since amendment 2.1.4 → 2.1.5 (PATCH), approved by Roberto in writing (OQ-3 = A) and applied 2026-11-08. |
| **Feature isolation** | III | PASS | `faq` uses `usePageSeo` via `@/features/shell` barrel only; `SUPPORT_EMAIL` is lifted from `shell/data/footerColumns.ts` to `app/shared/data/` instead of reached into. `faq` emits `faq_question_open` through `app/shared/logic/trackingBus.ts` and never imports `tracking`; the event type and `FAQ_TOPIC_IDS` live in `app/shared/data/trackingEvents.ts`. The shell's nav item points at the `faq` route by name, not at the `faq` module. Tab key logic lifted to `app/shared/logic` only if reused by the map without coupling, else a small local copy. |
| **Component / island discipline** | V | PASS | `<script setup lang="ts">`; presentational `ui/`; logic in composables; each component < 200 lines; interactivity only where needed (tabs, accordion); no `<ClientOnly>` (server and first client render agree). |
| **i18n parity** | VI | PASS | Every string in `i18n/locales/{es,en}.json` with identical keys; inline links by route name via `localePath`; `@` not written in locale files (R26: email passed as a parameter); `tests/i18n-parity.test.ts` stays green; locale switch never string-swaps. |
| **Design tokens** | VII | PASS | All handoff sizes become `global.css` tokens (fluid 390 → 1440); the outer vertical framing reuses the existing `portada-alto` / `seccion-arriba` / `seccion-aire` tokens (no new framing token); colours via existing families (Blanco, Gris 400, Negro 900/950, Carbón 800, Red muush 500) with alpha utilities; `tests/token-literals.test.ts` extended to the new files; retired `--spacing-preguntas-*` names stay retired (research R5). |
| **Clean code** | VIII | PASS | Dead code removed: `shell/data/faq.ts`, shell `useFaqContent`, StatusSection `faq` preset, `shell.faq.*` keys. Named constants for uniforms, ids, counts. |
| **TypeScript strict + Biome** | IX | PASS | No `any`; the existing `@ts-expect-error` in `replaceWebPageNode` keeps its comment. |
| **Testing discipline** | X | PASS | Unit: hash → topic, key navigation, accordion toggle and its event (open only, never auto-open or close), content resolution (20 answers equal the JSON), JSON-LD node builder, topic carry-over on the language switch, nav data with four items. Component: each new `ui/` file. Stories: each new component, ES/EN, 390/1440. Build output: contracts/build-output.md (FAQ page and the four-item nav on every page). Names `should … when …`. No E2E. |
| **Credential hygiene** | XI | PASS | No credentials; cal.com URL and support address are public; tracking IDs untouched. The new event carries no PII (closed ids and a number). |
| **Absolute imports** | XII | PASS | `@/features/faq`, `@/shared/...`; Storybook aliases unchanged (`@/features/` already covered). |

No violation needs Complexity Tracking. Post-design re-check: PASS (same
table; the Article I amendment is in place, constitution 2.1.5).

## Project Structure

### Documentation (this feature)

```text
specs/051-faq-content/
├── spec.md
├── open-questions.md      # OQ-1…OQ-8 and Roberto's answers
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-contract.md
│   ├── build-output.md
│   └── llms-txt.md        # approved text (OQ-4 = A)
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── assets/
│   ├── css/global.css                     # new faq-* tokens (no framing token)
│   ├── icons/{plus,chevron-right,message-circle}.svg   # new (lucide)
│   └── backgrounds/preguntas-acanalado.webp            # replaced by the .pen export h3JSJ (OQ-5)
├── features/
│   ├── faq/                               # NEW module (Constitution 2.1.5)
│   │   ├── data/{faqTopics.ts,types.ts}
│   │   ├── logic/{useFaqContent.ts,useFaqTopics.ts,useFaqAccordion.ts,faqStructuredData.ts,topicHash.ts}
│   │   ├── ui/{FaqSection,FaqBand,FaqTopicTabs,FaqQuestion,FaqCard}.vue (+ .test.ts, .stories.ts)
│   │   └── index.ts
│   └── shell/
│       ├── data/{faq.ts → deleted, navigation.ts (4th item), footerColumns.ts (SUPPORT_EMAIL import), types.ts (StatusPreset)}
│       ├── logic/{useFaqContent.ts → deleted, usePageSeo.ts (pageType 'FAQPage' + extra nodes), resolveLocaleDestination.ts (topic carry-over)}
│       ├── ui/StatusSection.vue           # 404 only
│       └── index.ts
├── pages/faq.vue                          # composes FaqSection, calls usePageSeo
└── shared/data/{backgroundPresets.ts, supportEmail.ts (new), trackingEvents.ts (faq_question_open, FAQ_TOPIC_IDS, faq row comment)}
i18n/locales/{es,en}.json                  # faq.*, pages.faq.*, shell.nav.faq; shell.faq.* removed
public/llms.txt                            # two lines (OQ-4 = A)
tests/{static-output,seo-output,design-tokens,token-literals,shell-copy}.test.ts
docs/harness/progress/tracking-plan-49.md  # § 4 row + custom dimensions (FR-026)
.specify/memory/constitution.md            # 2.1.5, already applied by the spec_author
```

**Structure Decision**: Feature-Based module `faq` (Article I) consumed by
the thin page `app/pages/faq.vue`; shared primitives from `app/shared/`.

## Implementation notes

- **Vertical framing (OQ-1 = B)**: the block copies the first-block framing
  of `StatusSection.vue` today: `relative isolate flex min-h-portada-alto
  flex-col pt-seccion-arriba pb-seccion-aire`, with a `relative z-10 flex
  flex-1 flex-col justify-center` content layer. No `faq-arriba` /
  `faq-abajo` token. The band is a sibling of the content layer, positioned
  from the block's top edge (= the page top; the header floats over it), so
  it does not move with the centred content. At 1440 × 900 and 390 × 844
  the content is taller than the viewport, so it starts at `seccion-arriba`
  (≈ 120 / 100 px) and the title sits over the band; Roberto accepted this.
  Fallback if he rejects it at review: fluid `--spacing-faq-arriba`
  (200 → 300) and `--spacing-faq-abajo` (64 → 200), no centring (new names,
  never the retired `--spacing-preguntas-*`).
- **Desktop layout** (≥ 1024): grid `faq-izquierda` (420) | `1fr`, gap 72;
  right column `mt` 68; title may overflow the left column into the gap
  (EN). Below 1024: stacked header → chips (`28 0 0 24`, no right padding,
  overflow-x auto, scroll snap) → questions (`20 24 0 24`) → card section
  (`32 24 64 24`).
- **Gradient border** for the active tab and the open question: one shared
  utility (e.g. `borde-faq-activo`) with the vertical gradient Red muush 500
  33 % → Blanco 6 %, in `global.css`, mirroring how `borde-luz` is built.
- **SEO**: `usePageSeo({ pageType: 'FAQPage', extraNodes })` where
  `extraNodes` are the 20 `defineQuestion` nodes from
  `faqStructuredData(topics)`; the WebPage node keeps its `ReadAction`.
- **Header (OQ-2 = A)**: add `{ labelKey: 'shell.nav.faq', destination: {
  kind: 'route', name: 'faq' } }` after the about item of `NAV_ITEMS`
  (`MENU_ITEMS` is the same array); the route item's existing current-page
  logic lights it on `/es/preguntas` / `/en/faq` whatever the hash. The bar
  stays centred by the existing `lg:grid-cols-cabecera` grid; measure that
  the four items fit at 1024 next to the logo and the end group. Rewrite the
  "permanently" comment with Roberto's 2026-11-08 decision. Every test that
  pins three items or "no Preguntas in the nav" is updated (tasks T036–T037).
- **Topic in the URL (OQ-6 = A)**: on a user select,
  `history.replaceState(history.state, '', '#' + id)` (no scroll, no new
  entry; vue-router does not see it, so no `page_view`, which reads the path
  only). The page exposes the counterpart topic id to the language toggle
  (small route-scoped hook in the shell's locale-destination resolver).
- **Event (OQ-8 = A + B, spec D6)**: `app/shared/data/trackingEvents.ts`
  gains `FAQ_TOPIC_IDS = ['assessment', 'pricing', 'process', 'delivery',
  'work_with_muush']`, type `FaqTopicId`, and the union member `{ name:
  'faq_question_open'; params: { faq_topic: FaqTopicId; faq_question: number
  } }`. `faq/data/faqTopics.ts` gives each topic its `trackingId`; the
  question number is its 1-based position across the five topics.
  `useFaqAccordion.toggle(i)` calls `emitTrackingEvent` only when the result
  is "open"; `reset()` (entry, hash, topic switch) never emits.
  `META_EVENT_BY_NAME` is unchanged (GA4 only); the GA4 sink forwards params
  unchanged, so it needs no code. Not added to `CLICK_EVENT_NAMES` (emitted
  from logic, not via `data-track` attributes).
- **Poster (OQ-5)**: `cwebp` the `.pen` export `h3JSJ.png` (1440 × 600) to
  `app/assets/backgrounds/preguntas-acanalado.webp` (same file name, same
  import). One poster per preset, so `xJCj0.png` is not used.
- **Constitution**: amendment 2.1.5 already applied by the spec_author on
  2026-11-08 with Roberto's written approval; the implementer does not touch
  the file.

## Complexity Tracking

No violations.
