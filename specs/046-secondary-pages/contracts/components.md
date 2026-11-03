# Component contracts — feature 46

All components: `<script setup lang="ts">`, < 200 lines, no Nuxt composable
in `ui/`, every string and href by props, stories at 390 and 1440 in ES and
EN, a component test `should … when …`.

## Shared

### `app/shared/ui/ReceivesList.vue` (moved from `landing/ui/`)
- Props: `label: string`, `items: readonly string[]`. Unchanged.
- Consumers: `landing/ui/AssessmentSection.vue`, `about/ui/WorkWithMuushSection.vue`.

### `app/shared/ui/ShaderBackground.vue` (extended)
- Props unchanged (`preset`). Below 1024 px, when the preset has
  `compactUniforms`, the canvas draws with them; from 1024 with `uniforms`.
  The poster and its loading are unchanged. Switching across 1024 redraws
  once, also when paused.

### `app/shared/ui/Heading.vue` (extended)
- `HeadingSize` gains `pagina` (Nosotros hero) and `estado` (Preguntas). No
  other change.

## About (`app/features/about/ui/`)

### `AboutHeroSection.vue`
- Props: `AboutHeroContent` (`pill`, `headingFirst`, `headingSecond`, `intro`).
- Renders: `section.relative.isolate` → `ShaderBackground preset="aboutHero"`
  → content `relative z-10`: `Pill.pill-aire`, `Heading level=1 size=pagina`,
  intro `p`.

### `TeamCompositionSection.vue`
- Props: `TeamCompositionContent`.
- Renders: pill (`pill-aire`), `Heading level=2` (per-use size class), `ul`
  of three `CompositionCard`. Centred from `lg`, start-aligned below.

### `CompositionCard.vue`
- Props: `kind: CompositionKind`, `label`, `title`, `text`.
- Renders: `li` card; decorative dot (`aria-hidden`, positioned, `pulso`) in
  the kind's colour; label `p`; title as `h3`; text `p`.

### `WhereWeAreSection.vue`
- Props: `WhereWeAreContent` (`MapCopy` + pill, heading, body).
- Renders: pill (`pill-aire`), `Heading level=2 size=seccion`, `WorldMap`,
  body, `MapLegend` — same classes as `WhoWeAreSection`, mobile body 16 / 1.5.

### `WorkWithMuushSection.vue`
- Props: `WorkContent` + `formContent: ApplicationFormContent`,
  `formSubmitter: ApplicationSubmitter` (from the forms barrel, passed through
  by the page).
- Renders: `section#trabaja-con-muush.relative.isolate` →
  `ShaderBackground preset="workWithUs"` → grid: left (pill `pill-aire`,
  `Heading level=2 size=diagnostico`, body, `ReceivesList`), right
  `ApplicationForm`. No call row.

## Shell (`app/features/shell/ui/`)

### `StatusSection.vue` (exported from the shell barrel)
- Props: `StatusSectionProps` (`preset`, `headingFirst`, `headingSecond?`,
  `primary`, `secondary`).
- Renders: `section.relative.isolate` with the preset's min-height →
  `ShaderBackground :preset` → centred column: `Heading level=1` (`estado`
  for `faq`, `diagnostico` for `notFound`), buttons row: `PrimaryButton
  size=hero :to=primary.href :label=primary.label` (arrow on) and
  `GlassButton` (`:href` + `target="_blank" rel="noopener noreferrer"` when
  `secondary.external`, `:to` otherwise). No pill, no body copy.

## Pages

- `app/pages/about.vue`: composes the four about sections; passes the
  application form content and submitter; `usePageSeo` with `AboutPage`
  (unchanged).
- `app/pages/faq.vue` (new): `StatusSection v-bind="useFaqContent()"`;
  `usePageSeo({ titleKey: 'pages.faq.title', descriptionKey:
  'pages.faq.description' })`.
- `app/error.vue`: `StatusSection v-bind="useNotFoundContent()"` inside
  `NuxtLayout`; `useNotFoundDocument()` unchanged.
- `app/pages/index.vue`: drops `definePageMeta({ fullBleed: true })`.
- `app/layouts/default.vue`: `<main>` without the v1 frame classes.

## Removed

- `about/ui` v1 bodies of `AboutHeroSection` / `WorkWithMuushSection` (files
  rewritten), their v1 stories/tests (rewritten).
- `shell/ui/legacy/NotFoundContent.{vue,stories.ts,test.ts}`,
  `shell/ui/legacy/NotFoundRings.{vue,test.ts}`.
- `landing/ui/ReceivesList.*` (moved).
