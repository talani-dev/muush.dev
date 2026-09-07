# Session history

Append-only log of closed sessions. Each entry: what was worked on, what
shipped, what's still open.

## 2026-08-26 — Harness setup

- Installed spec-kit (`specify init . --ai claude --no-git`).
- Wrote `.specify/memory/constitution.md` (9 articles, v1.0.0) adapted from
  `talani-site`'s constitution — Feature-Based/Pinia/vue-query/Playwright
  content dropped, replaced with static-site/Astro-island/i18n-parity
  articles that actually match this repo.
- Wrote `CLAUDE.md`, `AGENTS.md` (broke the CLAUDE.md → AGENTS.md symlink
  from the Astro scaffold — they now hold different content per the
  harness convention), `feature_list.json` (empty), `init.sh`,
  `.claude/agents/{leader,spec_author,implementer,reviewer}.md`,
  `.claude/settings.json` hooks, `docs/harness/{specs,verification,CHECKPOINTS}.md`,
  `docs/business/overview.md`.
- Task tracker: `feature_list.json` (not Notion) — chosen explicitly over
  talani-site's Notion tracker to keep this repo dependency-free.
- spec-kit auto-commit hooks left disabled in `.specify/workflows/` — this
  repo's Husky `commit-msg` hook enforces an exact gitmoji↔type pairing that
  a generic auto-commit would violate.

## 2026-08-27 — Business context synced from Notion

- Pulled company/landing context from the Notion "Muush" teamspace
  (Company, Services, Messaging Library, Branding, Project State, Landing ·
  Contenido y copy, Landing · Mapa de UI) and rewrote `docs/business/` as a
  tree: `overview.md`, `services.md`, `messaging.md`, `branding.md`,
  `landing/{content,ui-map,decisions-open}.md`.
- Deliberately excluded internal HR/compensation, sales pipeline, and
  personal data from Notion — out of scope for implementing a public
  marketing site, and not something that belongs in a repo agents read from.
- Found two conflicts worth flagging to any spec that touches the landing:
  1. **Routing**: the scaffold's `prefixDefaultLocale: true` (`/es/`, `/en/`)
     doesn't match the real design (`/` for ES, `/en/` for EN, and
     asymmetric `/nosotros` vs `/en/about`). See
     `docs/business/landing/decisions-open.md`.
  2. **Design tokens**: `src/styles/global.css` still has placeholder color
     values. The real branding-book hex values (5 steps per ramp, not 10)
     are now documented in `docs/business/branding.md` — applying them is
     future work, not done as part of this sync.
- Updated `CLAUDE.md`, `AGENTS.md`, `spec_author.md`, `implementer.md` to
  point at `docs/business/` recursively (it's now a tree, not flat files).

## 2026-08-27 — Feature 1: design_tokens_and_logos (done)

- Implemented `specs/001-design-tokens-and-logos/` end to end (spec, plan,
  research, data-model, quickstart, 19 tasks) via the `implementer` agent,
  reviewed and **APPROVED** by the `reviewer` agent
  (`docs/harness/progress/review_design_tokens_and_logos.md`).
- `src/styles/global.css`: replaced the placeholder 10-step (50-900)
  `--red-*`/`--wine-*`/`--ink-*`/`--bone-*` ramps with the real 5-step
  (100-500) branding-book values (`docs/business/branding.md`), and shrunk
  the matching `@theme inline` `--color-<ramp>-<step>` mappings to 20
  entries (4 ramps x 5 steps). Verified via grep that no removed step
  (50/600/700/800/900) was referenced anywhere outside `global.css`.
  `--font-poppins`/`--font-instrument` tokens and all four `@font-face`
  blocks confirmed unchanged — they already matched the branding book.
- `src/assets/logo/`: brought the three official isotipo SVGs into the
  project, renamed to background-context-first names
  (`isotipo-on-bone.svg`, `isotipo-on-ink.svg`, `isotipo-on-red.svg`,
  copied from `muush-dark.svg`/`muush-light.svg`/`muush-triple-white.svg`
  at the external source path), with a colocated `README.md` mapping
  background context -> file/source/stroke/dot. Diffed all three: shared
  `viewBox`/`circle`/`path`/`stroke-width`/`stroke-linecap`, only
  fill/stroke colors differ.
- Deliberately out of scope, per spec FR-007/FR-008: no wrapper `.astro`
  component, page, header, footer, favicon, or logo instance was added; no
  wordmark or lockup A/B asset — only the three isotipo-only (lockup C)
  variants.
- Verification: `pnpm check`, `pnpm typecheck`, `pnpm test` (existing suite,
  unmodified), `pnpm build` (spot-checked `#cf3147` in compiled CSS) all
  green; `./init.sh` exit code 0.
- `feature_list.json`: feature id 1 status `reviewing` -> `done`.
- Full implementer summary: `docs/harness/progress/impl_design_tokens_and_logos.md`.
  Full reviewer verdict: `docs/harness/progress/review_design_tokens_and_logos.md`.

## 2026-09-06 — Feature 2: primitive_ui_layer (done)

- Full SDD cycle on `specs/002-primitive-ui-layer/` (spec, plan, research,
  data-model, quickstart, `contracts/components.md`, checklist, 41 tasks):
  spec by the `spec_author` agent, implementation by the `implementer`
  agent, **APPROVED** by the `reviewer` agent
  (`docs/harness/progress/review_primitive_ui_layer.md`).
- **Source of measurements**: `docs/business/landing/design-extract.md`,
  extracted from `muush.pen` by the leader on 2026-09-06 precisely because
  the Pencil MCP bridge does not reach subagents. No subagent opened the
  `.pen` file. This supersedes an earlier discarded `002-shared-ui-components`
  spec that described four components which did not match the design.
- `src/styles/global.css` (append-only, 231 insertions / 0 deletions — every
  feature-001 ramp, font token and `@font-face` block byte-identical):
  `--dark-glass` + `--stroke-led` in `:root`; 13 `--color-glass-*` /
  `--color-radar-*` tokens as `color-mix()` over the brand ramps; 22 fluid
  type roles (size + line-height + letter-spacing + font-weight); 19
  `--spacing-*`, 4 `--radius-*`, 3 `--blur-*`; plus 9 radar-geometry spacing
  tokens the task list had not enumerated; `@property --led-angle` and
  `@keyframes led-spin`. **Zero `@media` rules in the file** — the
  desktop/mobile difference lives entirely in `clamp()`.
- `src/components/`: eight static `.astro` primitives — `GlassPanel`,
  `Radar`, `Wordmark`, `Lockup`, `Pill`, `BotonPrimario`, `LinkArrow`,
  `SocialIcon` — matching `contracts/components.md` exactly. Zero client JS,
  no island, no `<script>`; the only inter-component imports are Pill→Radar
  and Lockup→Wordmark, as FR-013 permits.
- `src/assets/social/`: the three vendor glyphs normalized by hand to a
  shared `viewBox="0 0 24 24"` with `fill="currentColor"`, no `<style>` /
  `<defs>` / DOCTYPE / tool metadata, plus a colocated `README.md`.
  Deleting Instagram's global `.cls-1` class was a correctness fix, not
  polish.
- `tsconfig.json`: `"@/assets/*": ["src/assets/*"]` added (Article VI
  compliance — a relative `../assets/…` import would have been the
  violation).
- Verification: 44 fluid tokens evaluated at 390px and 1440px land within
  0.01px of their design endpoints; all 30 GlassPanel checks (6 variants x
  fill/border/blur/radius/padding) read back from the built CSS; no page
  emits a `<script>` or references the Svelte client bundle; Article IV and
  Article II greps over `src/components/` return nothing. `pnpm check`,
  `pnpm typecheck`, `pnpm test` (existing suite, unmodified), `pnpm build`
  and `./init.sh` all green.
- Five implementer deviations were flagged and **all five accepted on their
  merits** by the reviewer: the extra radar geometry tokens (following the
  task literally would have caused an Article IV violation), TikTok's
  `fill-rule="nonzero"` (confirmed against the vendor source, whose per-path
  rule overrides the root), GlassPanel's annotated destructuring target (an
  `as` member makes Astro read `Props` as the polymorphic signature), one
  explained Biome `useAnchorContent` suppression (the rule cannot see through
  an Astro `<slot />`), and `black` in the mask gradients (alpha-only, not a
  colour).
- **Design-file typo confirmed, not a code bug**: `design-extract.md` § 4
  records the LED's third stop as `#cf3247` while red-400 is `#cf3147`. The
  leader verified against the `.pen` — the design file itself contains
  `#cf3247`, so the extract transcribed it faithfully; it is a one-digit
  typo by whoever built the gradient in Pencil. The implementation's
  `var(--red-400)` is correct and stays. Documented in `design-extract.md`.
- **Still open, unchanged by this feature**: `decisions-open.md` #8 (LED on
  touch devices) is implemented conservatively as a static ring via
  `@media (hover: hover)` and remains Clau's call — reversible by deleting
  one media query. Font binaries for weights 500/600 are still missing from
  `public/fonts/` (the TODO left by feature 001).
- `feature_list.json`: feature id 2 status `reviewing` -> `done`.
- Full implementer summary: `docs/harness/progress/impl_primitive_ui_layer.md`.
  Full reviewer verdict: `docs/harness/progress/review_primitive_ui_layer.md`.

## 2026-09-06 — Migración de Astro a Nuxt 4

Decisión de Roberto tras revisar el inventario de JS del diseño (spotlight de
cursor, cursor personalizado, 2 carruseles, efecto lyrics, menú móvil, 2
formularios). El análisis técnico concluía que Astro seguía siendo viable
—ninguna de esas piezas comparte estado, que es donde islands duele— pero
pesó más la productividad: Roberto trabaja en Vue, no en Svelte.

**Qué se hizo**

- `nuxi init` (Nuxt 4.5.2), estructura Feature-Based de talani-site:
  `app/features/<feature>/{ui,logic,data}` + `app/shared/{ui,logic,data,utils}`.
- Tailwind v4 vía `@tailwindcss/vite` — **no** `@nuxtjs/tailwindcss`, que
  sigue siendo el módulo de la era v3 y habría roto la sintaxis `@theme inline`
  de `global.css`.
- `@nuxtjs/i18n` con `strategy: 'prefix'` (ambos locales con prefijo, decisión
  del 2026-09-06). Los locales viven en `i18n/locales/{es,en}.json`.
- Salida estática con `nitro.preset: 'static'` → `.output/public` para
  S3 + CloudFront. Verificado: prerenderiza `/es` y `/en`.
- **Storybook agregado** (`@storybook/vue3-vite`), revirtiendo la prohibición
  del Artículo VII de la constitution v1.0.0. Decisión de Roberto: resuelve el
  problema de no poder ver los componentes antes de componerlos en páginas.
- Constitution reescrita a **v2.0.0** con la estructura de talani-site:
  12 artículos, Feature-Based + Capas, dependency direction y feature
  isolation como NON-NEGOTIABLE.
- `init.sh` reescrito: agrega `nuxt prepare` automático si falta `.nuxt/`
  (si no, un clon fresco falla el typecheck por una razón ajena al cambio),
  más `pnpm generate` y `pnpm storybook:build`.

**Qué sobrevivió intacto**

`docs/business/**` completo (incluido `design-extract.md` con todas las
medidas del `.pen`), `feature_list.json`, los 4 hooks de Husky (llaman
scripts npm, no comandos de framework), `biome.json` (adaptado a `.vue`),
los 6 SVG ya normalizados, y los tokens de color y la escala fluida — CSS
es CSS.

**Qué se descartó**

Los 8 componentes `.astro`, `BaseLayout.astro`, las páginas de Astro, los
utils de i18n hechos a mano (los reemplaza `@nuxtjs/i18n`) y las specs
001/002/003. Todo sigue en el historial de git sobre `master`.

**Features 1 y 2 regresaron a `pending`** — sus implementaciones eran de
Astro. Sus descripciones se reescribieron para Vue; los contratos de props
de los primitivos siguen siendo válidos y están en git.

**Deuda registrada**: el test de i18n de la era Astro se reemplazó por
`tests/i18n-parity.test.ts`, que ahora hace cumplir mecánicamente el
Artículo VI comparando las llaves de `es.json` y `en.json`.
