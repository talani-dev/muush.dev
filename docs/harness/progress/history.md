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

## 2026-09-06 (tarde) — Cierre de feature 1 y orden de dependencias

**Feature 1 cerrada sin ciclo SDD propio.** La migración a Nuxt llevó
`global.css` y los 6 SVG intactos, y `./init.sh` los verifica en cada
corrida, así que sus criterios de aceptación ya se cumplían. El único
pendiente —una story del set de tokens— se absorbió en la feature 2, que
de todos modos crea stories para todos los primitivos. Registrar un ciclo
completo para escribir un archivo habría sido ceremonia sin valor.

**Dependencias declaradas explícitamente** en `feature_list.json` (campo
`depends_on`, nuevo). Se agregó porque no estaban registradas y eso ya
causó una confusión: se asumió que se podía saltar a la feature 3, cuando
el Nav compone `Lockup`, `Wordmark` y `BotonPrimario`, el menú móvil
compone `SocialIcon` y el footer compone `Lockup` y `LinkArrow` — ninguno
existe todavía como componente Vue. La 3 está bloqueada por la 2.

Los contratos de props de los 8 primitivos siguen siendo válidos y viven en
el historial de git sobre `master`
(`specs/002-primitive-ui-layer/contracts/components.md`), que es de donde
conviene partir al reconstruirlos en Vue.

## 2026-09-06 (noche) — Feature 2: primitive_ui_layer, reconstruida en Vue (done)

Ciclo SDD completo sobre Nuxt: `spec_author` → aprobación humana →
`implementer` → `reviewer` → **APROBADA**. Reemplaza la implementación en
Astro que descartó la migración; el ciclo anterior con el mismo nombre sigue
más arriba en este archivo, sin tocar.

**Qué shippeó.** Ocho SFC en `app/shared/ui/` — `GlassPanel`, `Radar`,
`Wordmark`, `Lockup`, `Pill`, `BotonPrimario`, `LinkArrow`, `SocialIcon` —
cada uno con su story y su test de componente, más `tokens.stories.ts` con
las 4 rampas × 5 pasos y los 22 roles tipográficos fluidos (absorbido de la
feature 1). El catálogo queda en **9 entradas / 39 stories**; `pnpm test`
corre **63 pruebas en 9 archivos**. Ninguna página, layout, feature module ni
token nuevo. `./init.sh` sale 0 en los 8 checks.

**Las tres greps del Artículo VII salen limpias** sobre los ocho `.vue`: cero
literales de color, cero literales de tamaño, cero valores arbitrarios y cero
breakpoints de tamaño. Ni siquiera hicieron falta las dos excepciones que la
spec había presupuestado.

### Tres hallazgos que corrigen al propio `research.md` (R18–R20)

- **R18 — en el build del sitio no existen las variables `--color-*`.** El
  plan pedía el degradado LED con `var(--color-red-400)`; con `@theme inline`
  eso resuelve a nada y el anillo no se pinta. Va con `var(--red-400)`, igual
  que la implementación de Astro. Lo peligroso del caso: **Storybook sí
  declara esas dos variables** —porque su escaneo de Tailwind alcanza los
  `.md` de `specs/` y `docs/`, donde están escritas— así que el error se
  habría visto bien en el catálogo y roto en producción.
- **R19 — Storybook no compilaba ni un `.vue`.** `@storybook/vue3-vite@10` no
  aporta `@vitejs/plugin-vue` y este repo no tiene `vite.config.*` porque Nuxt
  es el dueño de esa config. Con solo la story placeholder (plantillas en
  línea) el hueco era invisible. Se registró `vue()` en
  `.storybook/main.ts` y `@vitejs/plugin-vue@^6.0.8` pasó a devDependency
  explícita — misma versión y mismo hash que ya estaba en el árbol como
  dependencia transitiva de Nuxt, no entra código nuevo. Sin esto el
  Artículo X es inimplementable. El reviewer lo verificó **en el código
  fuente del preset**, no desde el mensaje de error.
- **R20 — `useVueMultiWordComponentNames` sí emite diagnóstico**, de nivel
  `info`, para `Radar`/`Wordmark`/`Lockup`/`Pill`. `pnpm check` igual sale 0
  porque no promueve `info` a error, así que la conclusión operativa de R17 se
  sostiene y `biome.json` no se tocó. Los 4 `info` son esperados.

Las tres desviaciones quedaron justificadas en el Complexity Tracking de
`specs/002-primitive-ui-layer/plan.md` (se agregó la fila de R19 después del
review) y las tres las avaló el reviewer.

### Lo que sigue abierto

- 🔴 **Falta la pasada visual del catálogo.** T015/T034 piden abrir cada
  primitivo en fondo `ink`, cambiar a `bone` y alternar los dos viewports. Ni
  el `implementer` ni el `reviewer` tuvieron navegador: se verificó
  estructuralmente (9 entradas, build limpio, cada utilidad presente en el CSS
  emitido), **no con ojos humanos**. Storybook existe justamente para que una
  persona haga esa pasada. Queda para el humano.
- **A-02 · LED en táctil** — `@media (hover: hover)` se mantiene, anillo
  estático. `decisions-open.md` #8 sigue abierta, dueña Clau. Se revierte
  borrando un media query.
- **A-07 · Geometría del foco** — el único valor de la spec sin fuente de
  diseño. Va `focus-visible:outline-red-400` y nada más, con la geometría por
  defecto de la plataforma. Ojo para Clau: **Chrome dibuja su anillo
  `outline-style: auto` con su propio color**, así que el rojo puede no
  aparecer ahí hasta que se especifique una geometría.
- **A-11 · Binarios de las fuentes** — `public/fonts/` sigue vacío, así que el
  Wordmark y todos los especímenes renderizan con una tipografía de respaldo.
- **Deuda heredada:** los criterios de aceptación de la feature 3 en
  `feature_list.json` todavía dicen "isla de Svelte en `src/islands/`",
  redacción de la era Astro. Va a confundir a quien especifique el shell.

Feature 3 (`site_shell`) queda **desbloqueada**: su nav compone `Lockup`,
`Wordmark` y `BotonPrimario`, el menú móvil compone `SocialIcon` y el footer
compone `Lockup` y `LinkArrow`. Los ocho ya existen.

## 2026-09-06 (noche) — Feature 4: radar_pulse (done)

Sin fase de spec (`sdd: false`): un componente, una animación y un media
query. Secuencia real: `implementer` → corrección de diseño de Roberto →
rework → verificación del leader → **`reviewer` → APROBADA** →
`in_progress` → `reviewing` → `done`. La verificación del leader (leyó
`Radar.vue`, confirmó que los halos y sus tokens no dejan referencias, corrió
`./init.sh`: exit 0, 8/8) fue previa e independiente, pero **no fue la que
autorizó el cierre**: eso lo hizo la pasada del `reviewer`, con los 11 ítems
confirmados contra la fuente y contra un `./init.sh` propio
(`docs/harness/progress/review_radar_pulse.md`).

**Qué shippeó.** El radar late: un pseudo-elemento sale del punto rojo, se
expande a `scale(3)` y se desvanece de `0.6` a `0`, en `ease-out infinite`
sobre el token `--duration-radar-ping: 2.4s`. CSS puro, cero JavaScript, cero
nodos DOM extra. `@keyframes radar-ping` vive en `global.css` junto a
`led-spin`, por ser at-rule de documento. Con `prefers-reduced-motion: reduce`
el fantasma se retira con `content: none` —no se pausa, que dejaría un anillo
congelado encima del punto— y queda el punto rojo, visible y completo.
Cuatro archivos tocados, ninguna página, layout ni feature module.

### La lección: la documentación era correcta y aun así llevaba al error

La primera implementación cumplía la spec al pie de la letra y estaba mal
contra el diseño. `design-extract.md` § 2 describía las 3 elipses concéntricas
del `.pen` como si las tres fueran reales, y el ping se montó encima de ellas.

Pero **un mockup estático no puede dibujar movimiento**: la diseñadora congeló
el pulso del radar como círculos concéntricos para comunicar la intención, y
el extract transcribió ese dibujo literalmente. Renderizar los halos *y* el
ping da un punto con aros que además pulsa — el efecto dibujado más el efecto
real, duplicado.

En código el radar es **el punto rojo y su ping, nada más**. Lo que sí se
conserva es el **footprint reservado** (20/30/22, con el punto centrado
dentro): el `gap: 11` y el `padding: [9,20,9,10]` de la Pill y los layouts de
sección están medidos contra esa caja, así que encoger el componente al punto
habría reflowed silenciosamente las 19 instancias.

Roberto corrigió **las dos fuentes** —`design-extract.md` § 2 (con aviso
⚠️ y una tabla "Cómo se traduce a código") y `ui-map.md` § Receta del ping del
radar— antes de la rework, así que el malentendido no se puede repetir leyendo
los documentos vivos.

**Corolario para el harness**: que un agente cumpla la spec no prueba que la
spec describa el diseño. Un extract de un `.pen` transcribe lo que está
dibujado, y lo dibujado puede ser la representación de algo, no la cosa.

### Limpieza y ambigüedad de origen

- **Cinco tokens muertos eliminados** (Artículo VIII), tras grep de todo el
  árbol: `--color-radar-halo-outer`, `--color-radar-halo-mid` y los tres
  `--spacing-radar-*-halo` (14/20/16). Cero coincidencias restantes en `app/`
  y cero en los dos builds. Las únicas menciones a "halo" que quedan en el
  código son comentarios que explican por qué no se renderizan.
- **El color del ping quedó `var(--red-400)` sólido**, con la atenuación a
  cargo de la animación. `ui-map.md` decía "red-400 a baja opacidad" *y*
  `0.6 → 0`, que compuestas daban un pico de ~7% de opacidad: un ping
  invisible. El implementer lo marcó como juicio propio en vez de decidirlo en
  silencio y Roberto corrigió la redacción de origen — ahora dice "red-400
  sólido — la atenuación la hace la animación, no el color".
- `--red-400` es nombre de rampa en `:root`, no `--color-*`: **R18** sigue
  aplicando a todo bloque CSS escrito a mano.
- `specs/002-primitive-ui-layer/` **no se reescribió**: describe lo que
  shippeó la feature 2 y es registro histórico. La corrección la cargan
  `design-extract.md` y `ui-map.md`, que son las fuentes vivas.

### Lo que sigue abierto

- 🔴 **Sin pasada visual.** El ping se verificó **desde el CSS emitido**, nunca
  se vio moverse en un navegador. Si 2.4s se lee como latido, y si el pico de
  60% de rojo es el peso correcto ahora que no hay halos, son preguntas que
  solo responde una persona mirando. Se suma a la pasada visual del catálogo
  que la feature 2 dejó pendiente.
- 🟡 **Los 2.4s siguen pendientes del visto bueno de Clau.** El `.pen` no
  especifica timing; el valor se eligió distinto de los 2.6s del borde LED
  para que los dos loops no entren en fase. El marcador 🟡 de `ui-map.md`
  **se dejó puesto**: implementar el ping no es aprobar la duración.
- Los pendientes heredados de la feature 2 no los toca esta feature: pasada
  visual del catálogo, `decisions-open.md` #8 (LED en táctil), A-07 (geometría
  del foco), A-11 (binarios de las fuentes).

### La segunda lección: `sdd: false` salta la spec, no el review

Al pedírsele cerrar la feature, el `implementer` **se negó**: su protocolo solo
permite pasar a `done` desde `reviewing` y con aprobación previa del
`reviewer`, y el estado era `in_progress` sin verdict. Reportó en vez de
proceder, aunque el leader ya había verificado el trabajo por su cuenta.

Tenía razón, y la negativa destapó dos huecos:

1. **`reviewing_required_before_done` en `feature_list.json` es incondicional**
   y también aplica a las features `sdd: false`. El leader había asumido que su
   propia verificación sustituía la compuerta. No la sustituye: verificar no es
   la compuerta, es una entrada más. Quedó documentado en `AGENTS.md` § 4
   ("Features with `sdd: false`") — **se puede saltar la fase de spec, no la de
   review**; el `reviewer` trabaja desde el array `acceptance` y el documento de
   negocio que carga la receta, en lugar de un `spec.md`.
2. **El array `acceptance` de la feature 4 estaba obsoleto.** Lo detectó el
   `reviewer`: los ítems 1 y 2 seguían con la receta pre-corrección
   (`scale(2.2)`, "in the outer halo colour"), así que leído al pie de la letra
   el contrato de registro describía justo el bug que la rework eliminó. Se
   reescribieron para que coincidan con lo shippeado, y la `description`
   registra la corrección. No bloqueó la aprobación —gobiernan los documentos
   de diseño vivos— pero se arregló antes de cerrar.

Corolario: la compuerta de review sirvió para lo que existe. Encontró un
defecto de registro que ni el implementer ni el leader vieron, en una feature
que ambos ya daban por buena.

- Resumen completo del implementer:
  `docs/harness/progress/impl_radar_pulse.md`. Verdict del reviewer:
  `docs/harness/progress/review_radar_pulse.md`.
- `feature_list.json`: feature id 4 status `reviewing` → `done`.

## 2026-09-06 (noche) — Feature 5: section_glow (done)

`sdd: false`. Sin `specs/005-*`: el brief fue el entry de `feature_list.json`
más `docs/business/landing/design-extract.md` § 10 · SectionGlow. Se respetó
la compuerta de review que la feature 4 dejó documentada en `AGENTS.md` § 4.

### Lo que shippeó

`app/shared/ui/SectionGlow.vue` — el fondo entero del sitio: un `<span>`, una
lista de clases, sin `<style>`. La receta es un círculo (`rounded-full`) con
`radial-gradient(circle closest-side, <color base a su opacidad>, transparent)`
y un diámetro que interpola 390 → 1440.

**Sin sistema de variantes**, que era la advertencia central de § 10. Las props
son `color`, `opacity` y `size` explícitas; las palabras `foco`, `wine` y
`cierre` no existen en la API, solo como captions de las stories junto al par
que describen — que es donde se puede *ver* el desajuste del propio diseño
(`Propósito · red` es wine-300, no rojo) en vez de quedar codificado.

- 12 tokens de relleno (`--color-glow-<rampa>-<opacidad>`), exactamente los 12
  pares que el diseño dibuja. Un par que el diseño no dibuja no tiene token y
  **es un error de tipo en el call site**: las props son una unión discriminada
  por color, así que `color="red-400"` solo acepta 65/60/12.
- 13 tokens de diámetro (`--spacing-glow-<escritorio>-<móvil>`), un `clamp()`
  por par distinto de la tabla.
- 31 → 32 casos de test, 5 stories, `./init.sh` exit 0 con 97 → 98 tests.

### La decisión de tamaño, y por qué el reviewer la sostuvo

El brief pedía juicio explícito: ¿`clamp()` o que el caller pase el tamaño?
Se resolvió como `clamp()`, un token por par, elegido por la prop `size`. Tres
hallazgos lo forzaron:

1. **No hay una fracción única.** Móvil va de 0.47× (1500→700) a 0.60×
   (860→520). Normalizar habría redibujado la mitad de los 22.
2. **El diámetro de escritorio no es una clave.** 1500→700 y 1500→760,
   1000→560 y 1000→520, 860→480 y 860→520 colisionan en escritorio. El *par*
   es la identidad, y por eso los tokens se llaman por el par.
3. **El caller no puede pasar el número.** Un diámetro crudo en 22 call sites
   es un literal de spacing (Artículo VII); un `clamp()` del lado del caller es
   ese literal dos veces más un breakpoint — justo la señal que el Artículo VII
   nombra como "falta un token".

El `reviewer` evaluó a mano los 13 `clamp()` en ambos anclajes y confirmó que
cada uno cae en el px exacto del diseño a 390 y a 1440. También sostuvo el
**no** a fusionar los diámetros casi duplicados (860/880/900, 480/500/520):
§ 10 dice "verificar caso por caso", y colapsarlos habría sido el implementer
pasando por encima del diseño. Quedan visibles lado a lado en la story `Sizes`
para que la llamada la haga una persona.

### `closest-side` era el detalle que sostenía todo

`bg-radial` de Tailwind emite el `ellipse farthest-corner` por defecto, cuyo
degradado termina en las **esquinas** de la caja: √2 ≈ 1.41× el radio del
círculo. Sobre un cuadrado recortado con `rounded-full` eso deja el gradiente
todavía al ~29% donde el círculo termina — un borde duro en los 22, en la capa
que justamente no debe tener bordes. `bg-radial-[circle_closest-side]` iguala
gradiente y círculo. Es el único valor arbitrario del componente y no es color
ni longitud, así que queda fuera de lo que gobierna el Artículo VII.

La parada exterior del diseño es `#26262600` (ink-500 con alfa 0) y se
implementó como `to-transparent`: CSS premultiplica por alfa antes de
interpolar un degradado, así que el matiz de una parada totalmente transparente
nunca se lee y las dos pintan idéntico. Documentado en vez de omitido.

### La lección: un test puede pasar sin probar nada

El `reviewer` aprobó pero marcó como observación no bloqueante que el test
`should map each colour to exactly the opacities…` era **tautológico**:
reconstruía un map desde el array declarado 80 líneas más arriba en el mismo
archivo y lo comparaba contra un literal, sin montar nunca el componente. Lo
que decía proteger ya lo protegía la unión de TypeScript.

Se **reemplazó**, no se borró ni se dejó tal cual. En su lugar hay dos tests
que sí montan y que cubren lo que el compilador no puede ver: **el contrato
entre el componente y `global.css` cruzando archivos**. El componente nombra
sus tokens como strings de clase, `global.css` los declara como custom
properties, y nada conecta las dos cosas — un token renombrado de un solo lado
typechequea, buildea y renderiza un glow sin relleno. Es la misma clase de
fallo silencioso por la que existe **R18**.

- `should name a token global.css actually declares when every accepted
  combination is mounted` — monta los 12 pares y los 13 tamaños, lee los
  nombres de token de vuelta desde el elemento renderizado y verifica que la
  hoja de estilos real los declare.
- `should leave no glow token in global.css unreachable when every accepted
  combination is mounted` — la dirección contraria, que es como se acumulan
  los tokens muertos.

Ambos se verificaron **por mutación** antes de darlos por buenos: renombrar un
token en `global.css` y agregar uno que ninguna prop alcanza hace fallar uno
cada uno. Un test que no se ve fallar no se sabe si prueba algo — que era
exactamente el defecto que se estaba arreglando.

Detalle de implementación que costó un intento: `@/assets/css/global.css?raw`
devuelve **string vacío**, porque el plugin de Tailwind reclama toda petición
`.css`. Con eso los dos tests habrían pasado contra la nada. Se lee con
`readFileSync` desde la raíz de Vitest, y el comentario del test lo explica
para que nadie lo "arregle" de vuelta a un import.

### Corrección de documento

§ SectionGlow decía "**nueve** opacidades distintas" cuando sus tablas cargan
**diez** (65, 60, 40, 37, 30, 28, 20, 17, 14, 12) repartidas en 12 pares
color+opacidad. Lo levantó el implementer, lo confirmó el reviewer por conteo
independiente, y Roberto corrigió `design-extract.md` — era error suyo al
escribir el extract. Las tablas se trataron como autoritativas y las diez están
implementadas.

### Lo que sigue abierto

- 🔴 **Sin pasada visual.** Todo se verificó desde el CSS emitido y los
  manifiestos de build; nada se vio renderizar. Las tres preguntas que solo
  responde una persona mirando: que `Edge` no muestre un aro donde termina el
  círculo, que las escalas de `Fills` se lean en orden (40 → 37 → 17 → 14 y
  30 → 28 → 20 → 14 → 12) y que `HeroStack` construya un solo campo sin costura.
  Se suma a las pasadas visuales pendientes de las features 2 y 4.
- 🟡 **El hero de Nosotros cambia de opacidad según el viewport** (60/37/28 en
  escritorio vs 65/40/30 en móvil, donde Landing es 65/40/30 en ambos). § 10 ya
  lo marca como posible deriva y no como intención. Ningún token puede
  expresarlo y **no se inventó ninguno**: caerá sobre el caller que monte ese
  hero. **Necesita decisión de Clau antes de construir la página Nosotros** —
  se registra, no se resuelve.
- `Glow origen` (`920`) renderiza a tamaño completo en móvil si alguien lo
  monta ahí. Es coherente con delegar la posición al caller y el JSDoc de la
  prop dice "desktop-only", pero la feature que lo consuma tiene que ocultarlo.
- No se construyó ningún consumidor: los offsets absolutos de las 22 instancias
  no están en `design-extract.md` y no se inventaron.

- Resumen completo del implementer:
  `docs/harness/progress/impl_section_glow.md`. Verdict del reviewer:
  `docs/harness/progress/review_section_glow.md`.
- `feature_list.json`: feature id 5 status `reviewing` → `done`.

## 2026-09-07 — Feature 3: site_shell (done)

`sdd: true`. Ciclo SDD completo en `specs/003-site-shell/` (spec, clarify,
plan, research, data-model, contracts, quickstart, 45 tasks). **La primera
feature que pone algo visible en el sitio**, y la primera que construye un
módulo de feature real: `app/features/shell/` en la forma `data/` · `logic/` ·
`ui/` con barrel, que es lo que los Artículos I–III describían sin que nadie
los hubiera ejercido todavía.

### Lo que shippeó

Nav responsiva, menú móvil a pantalla completa, Footer de 4 columnas y toggle
ES/EN, más el layout que los pone en toda página y la segunda ruta para que los
links del nav resuelvan en vez de dar 404.

- **5 componentes** (`SiteNav`, `MobileMenu`, `SiteFooter`, `FooterColumn`,
  `LanguageToggle`), 3 con story; `MobileMenu`, `FooterColumn` y
  `LanguageToggle` quedan **sin exportar** — son detalle de composición.
- **3 piezas de `logic/`**: `resolveLocaleDestination` (pura, sin Nuxt, el
  objetivo real de las pruebas unitarias), `useShellNavigation` (la única
  costura con el runtime de Nuxt) y `useMobileMenu` (estado, bloqueo de scroll,
  Escape, `inert`, sin dependencia nueva — VueUse se rechazó explícitamente).
- **39 tokens** nuevos en `global.css`, cero ediciones a tokens existentes.
- `app/pages/nosotros.vue` resolviendo en `/es/nosotros` y `/en/about` desde un
  solo componente, con el segmento traducido declarado **una vez** en
  `nuxt.config.ts` bajo `i18n.pages`.
- `./init.sh` exit 0 · **216 tests en 20 archivos** · 3 entradas nuevas en el
  catálogo.

### Los dos hallazgos de i18n que condicionan todo lo que venga

Ninguno de los dos estaba anticipado en la spec y los dos son de sistema, no de
esta feature. Quedan como **R26** y **R27** en `docs/business/rules.md`.

1. **Una arroba literal en un archivo de locale rompe la compilación de
   vue-i18n.** `support@muush.dev` produjo
   `Invalid linked format (error code: 10)` y dejó de compilar el archivo
   entero — vue-i18n lee `@` como el inicio de un *linked message*. Se escapa
   como `{'@'}`, que renderiza un `@` normal. **Aplica solo al copy**: el
   `mailto:` y la URL de TikTok viven en TypeScript y no pasan por el
   compilador de mensajes. Cualquier feature que mueva una URL con arroba al
   archivo de locale lo vuelve a romper.

2. **El JSON de locales llega como AST de mensajes, no como objeto**, por la
   transformación de Vite de `@nuxtjs/i18n` — desde `app/` y también desde
   `tests/`. Un nodo del AST nunca es la cadena vacía, así que la aserción
   "ningún valor vacío" de `tests/i18n-parity.test.ts` **venía pasando con
   cualquier entrada**: era verde falso, y lo había sido desde que se escribió.
   Se arregló leyendo del disco (`readFileSync` + `JSON.parse`) y se verificó
   con control negativo — poner `""` en una clave ahora hace fallar la suite.
   Toda prueba futura sobre el *contenido* de un locale lee del disco.

   Detalle asociado: el path se arma con `node:path`, no con
   `new URL(..., import.meta.url)`. El entorno global es `happy-dom` (§ R16),
   que reemplaza el `URL` global por uno que `node:fs` rechaza; el síntoma es
   un `ENOENT` sobre la ruta `[object Object]`.

**R25** también salió de aquí: `i18n.rootRedirect` **no** emite archivo, ni
agregando `'/'` a `nitro.prerender.routes` — se corrió, la ruta se descarta del
crawl y `.output/public/index.html` no aparece. El redirect es de runtime y un
sitio estático no corre nada. El objeto en la raíz es un `public/index.html`
versionado con meta refresh, canonical y `hreflang`. La entrada de prerender se
**borró** en vez de dejarse como no-op.

### El review: rechazo en la primera ronda, y de qué

La primera ronda salió **REJECTED** por dos motivos, y **uno de los dos no era
del implementer**: el reviewer marcó un ensanchamiento no declarado de la
supresión de lint en `biome.json` y un § R20 sobreescrito y con fecha hacia
atrás en `rules.md`. Los dos cambios eran del **leader**, hechos el 2026-09-06
y dejados sin commitear por instrucción de Roberto para que viajaran con la
feature 3; ya estaban en el working tree cuando arrancó el implementer.

Vale la pena registrar cómo quedó resuelto, porque es un límite del arnés y no
un incidente: el leader lo verificó con `git diff master` y el reviewer
**registró la corrección como atestiguada, no como verificada de forma
independiente**. El reviewer no puede distinguir por sí solo un cambio ajeno
sin commitear de uno propio no declarado; en un working tree compartido, la
autoría solo la puede aportar quien la tiene.

El motivo real del rechazo era **C7**: el criterio de aceptación 6, SC-001 y
SC-003 no tenían prueba. Se cerró con `tests/static-output.test.ts` — 20 casos
que afirman sobre `.output/public`, el artefacto que se despliega, porque
ninguna de esas tres afirmaciones es observable desde un componente montado.

Dos cosas de ese test que conviene imitar:

- **Se construye el sitio de cero antes de cada corrida**
  (`tests/global-setup.ts`), en `globalSetup` y no en un `beforeAll`: Vitest
  paraleliza archivos y un build reescribiendo `.nuxt/` por debajo es una
  carrera. Se rechazó una guarda del tipo "construir solo si falta", que habría
  dejado pasar un artefacto viejo — exactamente el defecto de R27. El reviewer
  lo confirmó por accidente: al borrar `public/index.html` tenía un
  `.output/public/index.html` viejo de sus propios experimentos en disco, **y
  el test falló igual**. Un generate en frío son 3.3s.
- **Se verificó por mutación**, no por lectura. Tres controles negativos:
  romper el segmento traducido pone **10 de 20** casos en rojo a la vez, borrar
  el documento raíz pone 1, quitar el `<SiteFooter>` del layout pone 4.

Un cuarto detalle que el reviewer destacó: la aserción de "nav byte-idéntica
entre Landing y Nosotros" tuvo que **excluir los `href` y la marca de página
activa** antes de comparar, y documentar por qué cada uno *debe* diferir. Sin
eso el test habría afirmado en silencio que SC-003 estaba roto — el toggle
resuelve a `/en` desde la landing y a `/en/about` desde Nosotros, y que
coincidieran sería el bug.

También en la segunda ronda: `messageKey` se movió de `ShellItem` a la variante
`external` de `ShellDestination`, que era una alternativa dentro del contrato
que el implementer no había considerado. Deja `ShellItem` tal cual lo fija
`contracts/components.md` y vuelve **irrepresentable** adjuntar un mensaje
precargado a una ruta, un ancla o un ítem sin destino.

### Lo que sigue abierto

- 🔴 **Sin pasada visual.** Nada de esto se vio renderizar en un navegador. Se
  verificó contra el HTML emitido, el CSS que ships y los manifiestos de build.
  Se suma a las pasadas visuales pendientes de las features 2, 4 y 5 — **son
  cuatro acumuladas**, y esta es la primera que un visitante vería.
- 🔴 **A-01 · el breakpoint de 1024px no tiene fuente de diseño.** Se
  implementó y quedó marcado UNVERIFIED en el código. **De Clau.**
- 🔴 **A-02 · el tope de contenido de 1440px no tiene fuente de diseño.**
  Mismo tratamiento. **De Clau.**
- 🔴 **Decisión #2 (link de Google Calendar) y #3 (página de FAQ) siguen
  abiertas.** `Agenda una llamada` y `FAQ` renderizan como texto ink-300 inerte
  — sin `<a>`, sin cursor, sin hover — igual que el `Blog · próximamente` que
  el diseño ya especifica así. **No se inventó ninguna URL.**
- 🔴 **El footer de escritorio del diseño se pasa 52px de su propia caja**
  (Marca 340 + gap 80 + Columnas 912 = 1332 contra 1280). En código cede el
  gap y las columnas flexionan (R24); **el archivo de diseño sigue mal.**
  **De Clau.**
- 🟡 El filete del footer fuera de paleta (`#c9c9c91f`, R11) se unificó a
  bone-100 @12%; el `.pen` sigue con los dos colores. **De Clau.**
- 🟡 La forma de la URL de LinkedIn sigue asumida como `/company/` (R13). Una
  línea en `data/socialProfiles.ts`. **De Clau.**
- 🟡 La reescritura de documento índice en CloudFront (R21/R1c) es un
  **requisito de despliegue** y no se puede verificar desde este repo.
  **De Roberto.**
- El fondo de papel punteado y los glows no tienen feature dueña (A-03), y
  recordar el idioma en `localStorage` quedó diferido (A-10). **De Roberto.**

- Resumen completo del implementer:
  `docs/harness/progress/impl_site_shell.md`. Verdict del reviewer (rechazo de
  la ronda 1 y aprobación de la ronda 2, ambas intactas):
  `docs/harness/progress/review_site_shell.md`.
- `feature_list.json`: feature id 3 status `reviewing` → `done`.

---

## 2026-09-07 — Feature 6: site_background_and_brand_chrome (done)

`sdd: true`. Ciclo SDD completo en
`specs/006-site-background-and-brand-chrome/` (spec, plan, research,
data-model, contracts, quickstart, 29 tasks). **Tres fundaciones de chrome que
ninguna feature era dueña**, agrupadas porque comparten un solo ciclo de
review: el fondo del sitio, la tipografía de marca y el favicon. Cierra el flag
de alcance **A-03** que la feature 3 había dejado abierto.

### Lo que shippeó

- **Fondo · 4 capas** en el orden del frame `SdEJx`: base `ink-500` → glows de
  sección (`--layer-glow: -2`) → papel punteado de página completa
  (`--layer-dots: -1`) → contenido. `DotGrid.vue` es **un solo elemento con un
  `radial-gradient` repetido**; el `Dot tile` de 288px y sus 90 instancias del
  archivo de diseño son artefacto de autoría de Pencil y no aparecen en el
  código ni tienen token. `SectionBackdrop.vue` es el contenedor por sección, y
  su comentario de doc carga el contrato de sección completo.
- **El layout es el único contexto de apilamiento de la página**
  (`relative isolate overflow-x-clip`) y renderiza `<DotGrid />` una vez. Con
  eso, **un glow escrito dentro de una sección se pinta debajo de una hoja
  declarada en el layout**: sin registro, sin lista central de los 21, sin
  estado de cliente, sin JavaScript. Era el requisito explícito de Roberto del
  2026-09-07.
- **Tipografía**: `@nuxt/fonts` 0.14.0 con Poppins 600 e Instrument Sans
  400/500/600, `throwOnError: true`, binarios descargados en build y servidos
  desde `/_fonts`. Se borraron los cuatro `@font-face` escritos a mano (que
  declaraban pesos que el diseño no usa y apuntaban a archivos inexistentes),
  el TODO y `public/fonts/`. **El sitio se ve por primera vez en su propia
  tipografía**; todo lo revisado hasta ahora se había revisado en la fuente de
  sistema.
- **Marca**: `public/favicon.svg` es el isotipo en el encuadre cuadrado que
  `branding.md` ya documentaba (`0 0 100 100` + `translate(3,-8)`), adaptativo
  por `prefers-color-scheme`; `favicon.ico` borrado; el ícono declarado en
  `app.head.link` para toda página en ambos idiomas.
- `./init.sh` exit 0 · **242 tests en 22 archivos** (216 → 242) · 3 entradas
  nuevas en el catálogo · 5 tokens nuevos, **cero ediciones a tokens
  existentes**.
- **`SectionGlow.vue`: cero líneas cambiadas.** Se consume tal como lo dejó la
  feature 5.

### D-01 y la regla que salió de revertirlo — R32

A media especificación apareció una discrepancia: el frame `SdEJx` tiene
**once** glows en Landing y `design-extract.md` § 10 documenta **doce**. La
primera pasada de la spec la resolvió **a favor del documento**.

**Roberto la revirtió el 2026-09-07**, y esa reversión es más importante que la
discrepancia: **el `.pen` es el artefacto más actualizado y la fuente de verdad
de todo lo visual; `docs/business/` es derivado y puede quedarse atrás. Cuando
se contradicen, gana el `.pen` y lo que se corrige es el documento** — nunca al
revés, y nunca "se registra la discrepancia y se sigue con el documento", que
deja el error vivo en el archivo que todos leen.

Con eso: Landing tiene **once** glows, el total del sitio es **21 y no 22**, y
`Glow origen` es documentación vieja, no un nodo que falte encontrar.
Corregir § 10 es de Clau.

La segunda mitad de R32 es la operativa y la que muerde: **el puente MCP de
Pencil solo existe en la sesión interactiva principal.** Un subagente no puede
verificar la fuente de verdad por su cuenta — no es disciplina, la herramienta
no responde. **Extraer valores del `.pen` es responsabilidad del líder**, que
los pasa hacia abajo en el prompt; y **si a un subagente le falta un valor, lo
pide**, no cae al documento.

### Los tres hallazgos de implementación — R33, R34, R35

**R33 · Storybook llevaba desde `6d50ad8` pisando su propio documento de
manager, por dos rutas a la vez.** `storybook-static/index.html` **no era el
catálogo**: eran los 1480 bytes del `public/index.html` del sitio, el
`<meta http-equiv="refresh" content="0; url=/es">` de R25. El catálogo
construido redirigía desde su propia raíz a una página que no existe dentro de
él, y `public/favicon.svg` pisaba al ícono de Storybook por la misma vía —
que es por qué la pestaña del catálogo venía mostrando el logo de Nuxt. Hay que
apagar **dos** copias: `staticDirs` (ahora mapeado a `/brand`) y **el
`publicDir` de Vite**, que por defecto vale `<root>/public`, el mismo
directorio, y lo copiaba de nuevo desde el build del preview (ahora `false`).
Sobrevivió meses porque **`pnpm storybook:build` sale con código 0**:
sobreescribir el documento de entrada no es un error de build. El reviewer lo
reprodujo reconstruyendo Storybook desde `git show HEAD:.storybook/main.ts` y
confirmó el stub de 1480 bytes.

**R34 · Una captura headless no sirve como evidencia de layout a un ancho
dado.** A `--window-size=390,844` las capturas salían con el texto cortado en
el borde derecho: se veía idéntico a `overflow-x: clip` recortando contenido,
que es justo lo que la spec prohíbe. **Era falso.** Chrome renderiza con un
viewport más ancho que el `--window-size` pedido y **recorta la imagen**.
Medido dentro de la página no hay un solo elemento que rebase el viewport, ni
con el clip puesto ni quitándolo en caliente. La salida: cargar la página en un
`<iframe>` del ancho exacto dentro de una página contenedora — el `<iframe>` sí
fija el viewport de layout. El reviewer volvió a medirlo en **11 anchos sobre
las 4 rutas**. Es la disciplina de R25 aplicada a los píxeles: la pregunta es
"¿qué mide el documento?", no "¿qué parece la foto?".

**R35 · `@nuxt/fonts` no necesitó `global: true`.** La inyección por detección
de uso emitió las caras sola; el fallback documentado en `research.md` § R4
quedó sin usar. Y los binarios **no son uno por peso**: Google sirve Instrument
Sans como fuente variable, así que 400/500/600 comparten archivo por subset —
4 binarios, 10 declaraciones `@font-face` (8 caras + 2 fallbacks métricos).
Cualquier verificación que cuente archivos esperando uno por peso falla.

### La trampa del build lock — para el siguiente agente

El **primer** `./init.sh` del reviewer salió 1. La causa no tenía nada que ver
con la feature: **un `pnpm dev` muerto había dejado un lock de build de Nuxt**
(PID 60879), y como `tests/global-setup.ts` invoca `pnpm generate`, la suite
entera se cayó con un error que no nombra nada relevante. Una corrida limpia
salió 0. **Costó una pasada completa en rojo falso.** Si `pnpm test` o
`pnpm generate` fallan con algo que no se parece a ningún cambio hecho, lo
primero es buscar un `pnpm dev` huérfano.

### La verificación, y su límite declarado

`happy-dom` no pinta, así que **ninguna prueba de este repo puede afirmar que
un glow se renderizó debajo de un punto** (`research.md` § R7). Se verificó en
tres niveles, cada uno haciendo solo lo que puede: pruebas de componente
(tokens, inercia, un solo elemento), aserciones sobre `.output/public` (las
capas en el HTML prerenderizado de las 4 rutas, las caras de fuente
same-origin, cero `gstatic`/`googleapis`, el ícono por ruta) y **ojos sobre el
catálogo construido**, que es donde el orden de pintado se ve: los puntos
continúan **a través** del bloom rojo, con el texto encima.

**A-08 quedó cerrado a medias, y así se reportó.** Chrome **sí** honra
`prefers-color-scheme` dentro del SVG del favicon — verificado renderizando el
archivo real a 16/32/64/128px bajo ambos esquemas, con
`--blink-settings=preferredColorScheme`. Lo que **no** se pudo ver es la
pestaña del navegador: la captura de pantalla no está permitida para esa shell
y Chrome headless no tiene UI de pestaña. **Se declaró el límite en vez de
fabricar la evidencia**, y el reviewer lo aceptó como no bloqueante porque la
mitigación es estructural: los colores del esquema claro son el valor por
defecto incondicional del archivo, así que un navegador que ignore la consulta
igual muestra una marca correcta. **Una mirada de Roberto a una pestaña lo
cierra.**

### Lo que sigue abierto

- 🔴 **A-10 · no hay ni un glow colocado en una página real.** Lo que shippeó
  son las dos capas de página completa más el mecanismo, demostrado en el
  catálogo con el tríptico real del Hero. **Hasta que aterrice la primera
  sección, el sitio muestra base + puntos y ningún glow. Eso es correcto.**
- 🔴 **El modo de falla de R28 es silencioso.** Si una sección futura crea un
  contexto de apilamiento (`transform`, `filter`, `opacity < 1`, `isolation`,
  `contain: paint`, `sticky`/`fixed` con `z-index`) o se pinta un fondo opaco,
  sus glows saltan **encima** de los puntos sin que nada falle. La regla vive
  en tres lugares: el comentario de `SectionBackdrop.vue`, el `quickstart.md`
  de la feature y `rules.md` § R28.
- 🟡 **`SectionGlow.vue` carga código muerto que esta feature no tocó a
  propósito**: su comentario repite el "22 / 12 en Landing" viejo, y su
  variante `'920'` con el token `--spacing-glow-920` existía solo para
  `Glow origen`. FR-011 y SC-006 lo dejaron intacto. Ojo al programarlo:
  `SectionGlow.test.ts` afirma que **todo** token declarado es alcanzable, así
  que quitar el token obliga a tocar esa prueba. **De Roberto.**
- 🟡 **`design-extract.md` § 10 sigue con el doceavo glow y el total de 22.**
  La fila, el total y el bullet de "Observaciones". **De Clau.**
- 🟡 **El catálogo pide las fuentes al CDN de Google** (A-05). Es tooling local
  y nunca se despliega; el artefacto del sitio sigue autocontenido. Revertirlo
  cuesta un archivo.
- 🟡 **`pnpm generate` ahora tiene una dependencia de red en tiempo de build**
  (A-09), aprobada por Roberto. Un build en frío y sin red produce un sitio sin
  caras embebidas — por eso `throwOnError: true`, para que falle en vez de
  publicar tipografía de respaldo en silencio.
- 🟡 **`<body>` no fija familia tipográfica.** Cada elemento nombra
  `font-instrument` o `font-poppins`, que es la convención vigente y funciona,
  pero un nodo de texto suelto futuro caería en la pila del sistema.
- 🟡 **Desbordamiento vertical de los glows.** `overflow-x: clip` resuelve el
  eje horizontal, que es lo que piden los glows en x negativa del diseño. Un
  glow que se extienda por **debajo** del final de la página sí agregaría
  altura de scroll. Es de quien coloque el primero.
- Siguen abiertos de ciclos anteriores: A-01/A-02 (breakpoint 1024 y tope 1440
  sin fuente de diseño), decisiones #2 (link de Google Calendar) y #3 (FAQ), el
  footer de escritorio que se pasa 52px en el `.pen`, el filete fuera de paleta
  (R11) y la forma de la URL de LinkedIn (R13). **De Clau**, salvo la
  reescritura de documento índice en CloudFront (R21), que es **de Roberto**.

- Resumen completo del implementer:
  `docs/harness/progress/impl_site_background_and_brand_chrome.md`. Verdict del
  reviewer: `docs/harness/progress/review_site_background_and_brand_chrome.md`
  — **aprobado**, con cada afirmación reverificada contra artefactos y no
  contra el reporte (diff vacío de `SectionGlow.vue`, conteos 21/11 en todo lo
  nuevo, cero glows en los 4 documentos prerenderizados, orden de pintado
  medido en el catálogo construido, cero `gstatic`/`googleapis` en
  `.output/public`, y la aritmética de la fuente variable confirmada).
- `feature_list.json`: feature id 6 status `reviewing` → `done`.

---

## 2026-09-07 — Feature 8: cursor_spotlight (done)

**Ciclo SDD completo**: `spec_ready` → ⏸ aprobación de Roberto → `in_progress`
→ `implementer` (29 tareas, 7 fases) → `reviewing` → `reviewer` **RECHAZA** →
`in_progress` → corrección → `reviewing` → `reviewer` **APRUEBA** → `done`.

La luz roja que sigue al puntero por toda la página, más el brillo que le da al
papel punteado por debajo (`ui-map.md` § 10, fila 1; frame `gViAx`). Compone
sobre la feature 6 sin tocarla: `DotGrid.vue`, `SectionBackdrop.vue`,
`SectionGlow.vue`, `SectionGlow.stories.ts`, `SectionGlow.test.ts` e `i18n/`
tienen **cero líneas cambiadas**, verificado con `git diff` por el implementer
y de nuevo por el reviewer.

- **Entregado**: `app/shared/ui/CursorSpotlight.vue` (raíz → beam → window →
  lit; sin props, sin imports), `app/shared/logic/useCursorSpotlight.ts`
  (primer habitante real de esa carpeta), sus dos suites, dos stories
  (`Pinned` + `Live`), **9 tokens nuevos**, el layout cableado, el `include` de
  `vitest.config.ts` extendido y aserciones **aditivas** sobre el artefacto.
- **Gates**: 102 archivos en Biome, **24 archivos / 276 pruebas** (desde
  22/242), `generate`, `storybook:build`, `./init.sh` **exit 0**. Ninguna
  prueba existente modificada, debilitada ni borrada.
- **§ R28 enmendada a tres niveles negativos** (§ R37): `--layer-glow` → −3,
  `--layer-dots` → −2, nuevo `--layer-spotlight` → −1. Los dos tokens
  existentes conservan su **nombre**, que es exactamente por qué ningún
  consumidor cambió.

### El rechazo de la ronda 1, dicho en claro

El reviewer rechazó por **un comentario que afirmaba un hecho falso sobre CSS**.
El código era correcto; la razón registrada no. Yo había escrito que un
fallback `50%` dentro de `mod()` *"invalidaría silenciosamente la declaración"*
— lo **deduje** del aviso de `research.md` § R3 en vez de medirlo, y es falso:
`CSS.supports(...)` devuelve `true` y `mod()` acepta un porcentaje.

Vale la pena dejarlo escrito tal cual: **es el defecto más barato de corregir y
el más caro de dejar**, porque el siguiente agente razona a partir de él y no
tiene forma de saber que nadie lo midió. El gate lo atrapó; el arnés funcionó.

La razón verdadera **sí** verificada: *un porcentaje se resuelve contra la caja
de cada elemento*. El beam mide 660px y la hoja iluminada 756px, así que el
mismo `50%` vale 330 donde lo usa la luz y 378 donde lo usa el registro, y las
dos mitades dejan de coincidir.

- **La coincidencia del `50%`**, que es lo que hace este caso instructivo: a ese
  valor **ninguna de las dos hipótesis es falsable**, porque 378 − 330 = 48 son
  exactamente dos pasos de retícula y el `mod()` cancela la discrepancia. Tanto
  mi afirmación original como la evidencia de la ronda 1 del reviewer eran
  indistinguibles ahí. **55%** discrimina (medido −13.8; caja propia predice
  −13.8, caja declarante −9) y el reviewer agregó **70%** como segundo
  discriminador independiente (medido −7.2; caja propia −7.2, declarante −12.0).
  Dos valores independientes, misma conclusión.

### Reglas nuevas — **R40–R45**

R36–R39 se reverificaron una por una y **quedan vigentes**; se levantó el
aviso de "aún no vigente" de la § R37, que ya está en el árbol.

- **R40** · Nuxt inlinea el CSS con scope de un componente en cada documento
  prerenderizado de la ruta **aunque el `v-if` no lo renderice**. Una aserción
  de ausencia tiene que acotarse al `<body>`; sobre el documento completo
  reprueba a la feature por enviar justo lo que debe.
- **R41** · Leer `window.scrollX` dentro de un `requestAnimationFrame` fuerza
  estilo **aunque sea lo primero del callback**: el rAF corre antes del pase de
  estilo del cuadro. Corrige al `research.md` § R2 de esta feature, que pedía
  leer-primero-escribir-después. Medido: **≈609 actualizaciones forzadas por 5s**
  con el orden que pedía la spec, contra **≈0** con el offset cacheado que se
  publicó. El reviewer lo reprodujo por su cuenta (609 vs mi ≈600, 2%).
- **R42** · `mask-repeat` vale `repeat` por defecto: un degradado de máscara se
  tesela. No molestó hasta ahora porque la única máscara previa
  (`BotonPrimario.vue`) es uniforme.
- **R43** · Una composable con listeners de `window` se **filtra entre pruebas
  del mismo archivo** — `happy-dom` da un solo `window` por archivo. Produjo un
  rojo falso que señalaba al sujeto y no al arnés.
- **R44** · La contrapartida que le faltaba a la § R34: el viewport **sí** se
  fija con `Emulation.setDeviceMetricsOverride` del protocolo de DevTools, y de
  una captura **sí** se puede medir color (nunca layout). Node 22+ trae
  `WebSocket` global, así que el cliente son ~80 líneas y **cero dependencias**.
- **R45** · Lo que este repositorio verifica es **Chrome**. `mod()`,
  `mask-image` y `overflow: clip` no están verificados fuera de él. Donde
  `mod()` no exista, **la declaración `transform` completa se invalida y se ven
  puntos dobles**. Se aceptó publicar así —el efecto es decorativo, solo de
  escritorio, no se pierde contenido ni se rompe interacción— pero es **lo más
  probable que sorprenda a alguien que abra Safari**, y el fallback ya está
  escrito y costeado en `research.md` § R3.

### Medido, no supuesto

Todo contra `.output/public` de un `pnpm generate` real, servido por HTTP,
desde dentro de la página. Nada se juzgó por una captura.

- Orden de pintado `−3 / −2 / −1 / auto`; beam centrado exactamente en el
  puntero; máscara de radio 330px, el mismo de la luz.
- **SC-002 en píxeles**: dentro del radio los puntos miden luma **84** sobre
  papel **55** (separación **29**); fuera, **60** sobre **38** (separación
  **22**) — más brillantes **y** más nítidos. La derivación de la § R38 salió
  **exacta**: predecía ≈133 R y el píxel central de un punto iluminado mide
  `rgb(133, 43, 56)`. El reviewer midió en otra posición y obtuvo separación
  29.3 contra mi 29.0.
- **SC-005**: 2147 eventos de puntero → **301 actualizaciones** en 5s,
  `Layout: 0`, `Paint: 0` en todas las trazas.
- Registro de los puntos iluminados exacto a ±1px en 21 celdas consecutivas
  cruzando el borde del radio; los tres estados apagados sin elemento ni
  listener; el cambio de `prefers-reduced-motion` **sin recargar**.

### Excepción registrada al Artículo V

`CursorSpotlight.vue` mide **286 líneas** (`wc -l`; 277 no vacías) contra el
límite de 200, de las cuales **110 son código**. **No se reestructuró**: partir
root → beam → window → lit rompe la cadena de herencia de `--spotlight-beam-*`
y cambiaría un archivo documentado por uno roto. Queda registrada en dos
lugares — arriba del propio archivo, donde alguien que lea el Artículo V contra
él se la va a encontrar, y como cuarta fila de la tabla *Complexity Tracking*
de `plan.md`, que es donde la Constitución (§ *Compliance Review*) exige que
viva una justificación. La fila **cita y corrige** el "~90 lines" de
`plan.md:111` en vez de reescribirlo, para no destruir la evidencia de que la
estimación estaba mal ni romper el C7.

> ⚠️ El número crudo **se queda viejo cada vez que se edita un comentario, y ya
> pasó una vez**: se escribió "~265" midiendo *antes* de agregar la propia nota
> de excepción. Mismo error que el "~90" que corrige. Solo el **110** es
> estable, y es la cifra que le importa a la cláusula de remedio del Artículo V.

### Límites declarados (no bloqueantes, se cierran solos)

- **`z-index: -3` se midió en el catálogo, no en el sitio**: ninguna página
  renderiza todavía un `SectionBackdrop`. Lo cierra la primera feature de
  sección.
- **El scroll necesitó un espaciador inyectado**: las dos páginas stub miden un
  viewport de alto. Lo que se midió es el mecanismo.
- **Un solo navegador** — ver § R45.

### Pendientes de **Clau**

- 🟡 `--dot-paper-lit-color` (**A-03**, § R38) — **UNVERIFIED**. Ningún mockup
  estático puede dibujar un brillo que responde al puntero. Derivado como la
  receta base pintada dos veces (`1 − (1 − 0.12)² = 22.6%`) y **medido exacto**.
  Token delante: cambiarlo cuesta una línea.
- 🟡 `--duration-spotlight-fade` (**A-08**) — **UNVERIFIED**, `0.2s`, mismo
  trato que los 2.4s del ping del radar.
- 🟡 **D-01** — `ui-map.md:270` omite la parada intermedia del degradado que el
  frame sí dibuja. `ui-map.md` **no se editó**: fuera del alcance de escritura
  de este ciclo.
- 🟡 La curva de la máscara de la hoja iluminada (desviación 3): cumple la
  FR-008 en radio y en dónde termina, no en la forma de la caída. Viaja con
  A-03.

- Resumen del implementer: `docs/harness/progress/impl_cursor_spotlight.md`.
  Verdicts del reviewer: `review_cursor_spotlight.md` (ronda 1, **rechazo**) y
  `review_cursor_spotlight_round2.md` (ronda 2, **aprobado**, con el código
  verificado sin cambios por cuatro vías: contenido sin comentarios idéntico,
  `git diff --stat` por archivo, md5 de `useCursorSpotlight.ts` intacto y
  estilos computados en el navegador iguales).
- `feature_list.json`: feature id 8 status `reviewing` → `done`.
