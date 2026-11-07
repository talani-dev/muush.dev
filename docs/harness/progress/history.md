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

---

## 2026-09-07 — Feature 9: hero_section (done)

La primera sección real del sitio. `01 Hero` en las cuatro rutas, más el
**reveal del CTA del nav** que Roberto agregó el mismo día (`ui-map.md` § 2),
que alcanza cuatro archivos de la feature 3 y está declarado en
`spec.md` § *Files this feature modifies*.

- 50 tareas `[x]`. `./init.sh` sale 0: **27 archivos de prueba, 325 pruebas**
  (antes 24 / 276). Cinco compuertas verdes.
- Módulo `landing` nuevo con las tres capas y su barril; `app/pages/index.vue`
  reducido a envoltorio; 14 tokens en `global.css`; 5 claves por locale;
  `app/shared/logic/useNavCtaReveal.ts` como punto de encuentro de las dos
  features, que **no se importan entre sí** (Artículo III).
- `SectionGlow.vue`, `SectionBackdrop.vue`, `DotGrid.vue`, `Pill.vue`,
  `BotonPrimario.vue` y `LinkArrow.vue`: **cero líneas cambiadas**.
  `SectionGlow.test.ts` pasa sin modificarse — prueba de que ningún token cayó
  en el namespace cerrado `glow` (§ R36). Lo de la feature 7 sigue intacto.

### Lo que se midió, que es la razón de ser de esta feature

Método: `Emulation.setDeviceMetricsOverride` contra `.output/public`
(`findings.md` § R44), nunca `--window-size` (§ R34).

- **Los seis centros de glow caen sobre el diseño.** A 1440 dentro de 0.2px
  (1310,289.8 · 130,309.8 · 1430,869.8); a 390 exactos en x y **+2.2px en y**
  los tres. Es la comprobación que habría cazado la derivación que la spec ya
  tuvo que corregir una vez (D-06).
- **Orden de pintado sobre la página**, no en el catálogo: backdrop `-3` →
  puntos `-2` → spotlight `-1` (tras un evento de ratón; `ABSENT` antes) →
  contenido `auto`. La sección no crea contexto de apilamiento ni pinta fondo.
  **Cierra el primer límite declarado por la feature 8.**
- **La página scrollea sin inyectar nada** (1320 a 1440×900, 1143 a 390×844) y
  la hoja de puntos iluminada queda registrada: fase **0,0 mod 24px** en cuatro
  combinaciones de puntero y scroll. **Cierra el segundo.**
- Cero desbordamiento horizontal de 320 a 2560.
- La pila calcula 466.25 contra los 466 del frame a 1440 y 400.63 contra 400 a
  390 — el mapeo de tokens de la § R49 confirmado a menos de 1px.

### Dos defectos visuales abiertos, y **ninguno es de esta feature**

1. **La banda blanca bajo el pliegue.** A 1440 el glow `Hero · cierre` alarga el
   documento 159px por debajo de la raíz del layout (raíz 1161.03,
   `scrollHeight` 1320, borde del glow 1319.8). Ahí abajo no pinta nadie:
   `html` y `body` van transparentes y el `bg-ink-500` vive en el div raíz.
   Píxeles leídos de una captura: `rgb(38,38,38)` arriba de la costura,
   **`rgb(255,255,255)`** abajo. `overflow-x: clip` absorbe el eje horizontal;
   el vertical no está recortado. **La cura está en
   `app/layouts/default.vue`, que es de la feature 6**, fuera del alcance
   declarado de esta — se reportó y no se tocó. Es transitorio: el diseño da
   5060px de página y el glow cae en 1320, así que desaparece con `02 Propósito`.
   (`findings.md` § R54.)
2. **El nav pinneado sin fondo propio — spec D-07, y es peor de lo que reportó
   el implementer.** El nav computa `background-color: rgba(0,0,0,0)` y
   `backdrop-filter: none`; al scrollear, **el titular del Hero pasa por debajo
   del lockup y de los enlaces y los dos se vuelven ilegibles, a cualquier alto
   de escritorio de hoy** — no solo a viewports cortos, que es hasta donde
   llegó la medición del implementer (el bloque opaco del footer alcanza el nav
   a 1440×600 y más corto). **Está correctamente implementado**: `ui-map.md`
   § 2 dice "el mismo fondo", y el fondo de hoy es ninguno, porque el estado
   comprimido que habría traído `#1c1416a6` es justo lo que esa decisión
   descartó. **Decide Roberto.** Cuesta dos utilidades sobre el renglón
   (`bg-glass-dark` y un blur).

### El nav móvil mide 78.19, no los 76 del frame

`--spacing-nav-y` × 2 = 44, más el hijo más alto del renglón: la hamburguesa,
padding 12×2 + dos barras de 1.6 + gap 5 = 32.2 **más su borde de 1px arriba y
abajo** = 34.19. Reproducido a la centésima: 22.0002 + 22.0002 + 34.19 =
**78.19**. La derivación de la § R49 **omite el borde**, y el borde sí está en
el diseño (§ 9.bis). El frame se contradice con su propio dibujo.

**`--spacing-hero-top` se dejó en `150 − 76 = 74` y la discrepancia se reportó
en vez de retocar el token para taparla.** Es la decisión correcta y conviene
decirlo claro: el primer hijo del Hero queda a y152.19 en vez de y150 y los tres
centros de glow móviles quedan 2.2px abajo, y de ahí sale ese +2.2. **La
siguiente sección se va a topar con lo mismo**, así que la corrección tiene que
hacerla una persona sobre el frame, no cada sección sobre su propio token.
(`findings.md` § R55.)

### El reveal del CTA no se puede ejercer todavía a 1440×900

El scroll máximo son 420px contra un borde inferior del Hero en y776: el Hero
nunca sale del viewport, así que el observador nunca cambia y el botón nunca
aparece en la landing. **Demostrado funcionando a 1440×420** (entra con fade al
llegar abajo, sale al volver arriba). `research.md` § R8 ya lo anticipaba y
dejó la perilla (`rootMargin`); se dejó el default. **Se cierra solo cuando
aterrice la siguiente sección.**

Lo que sí quedó medido hoy: oculto en el HTML generado de `/es/` y `/en/`,
visible en `/es/nosotros/` y `/en/about/`, **cero transiciones al cargar en las
cuatro** (ni destello en la landing ni fade en Nosotros, que era el defecto más
probable); `display: none` a 390; bajo `prefers-reduced-motion: reduce` la
`transition-property` computa `none` y el mostrar/ocultar sigue ocurriendo;
`focus()` sobre el botón oculto deja el foco en `BODY`; y **con scripting
desactivado el botón es visible en 4 de 4 documentos** (leído por el dominio
`CSS` del protocolo, no por la página). El nav en sí es idéntico a scroll 0 y a
scroll máximo: alto 102.80, fondo transparente, opacidad 1.

### Cuatro desviaciones del texto de las tareas, las cuatro verificadas por el reviewer **ejecutando**, no leyendo

En los cuatro casos el texto literal habría fallado **en silencio**:

- `--layer-nav` y `--duration-nav-cta-fade` van en `:root`, no en
  `@theme inline`: Tailwind v4 **no tiene namespace de tema para `z-index` ni
  para `transition-duration`** — compilado contra el Tailwind 4.3.3 del propio
  repositorio, `z-nav` y `duration-nav-cta-fade` no emiten una sola utilidad,
  `pt-hero-top` sí. (§ R52.)
- El fundido completo vive en `<style scoped>`, no en utilidades: una regla con
  scope lleva el atributo del componente y **le gana** a
  `motion-reduce:transition-none`, lo que habría dejado animando a quien pidió
  no ver animaciones. Medido `transition-property: none` bajo movimiento
  reducido emulado. (§ R53.)
- El `<noscript>` se pinta con `v-html`: un `<style>` literal dentro de un
  `<template>` **compila en SSR y revienta en el compilador de cliente** —
  `compiler-dom` da error, `compiler-ssr` calla. `pnpm generate` pasaba y
  `pnpm test` no. (§ R51.)
- Los hallazgos se escribieron en `docs/harness/findings.md` §§ **R51–R55** y
  **no** en `docs/business/rules.md`, que es de solo lectura para los agentes
  desde la política del 2026-09-07. **Nada se escribió en `docs/business/`** en
  todo el ciclo.

### La única aserción preexistente que cambió

`tests/static-output.test.ts` → *"should render the same nav markup on the
landing and on About"*. La FR-043 hace que los dos navs difieran a propósito,
así que la FR-041 ("ninguna prueba existente se modifica") y la FR-043 no pueden
cumplirse las dos. Se amplió la lista de exclusiones que la prueba **ya** tenía
(destinos y marcado de página activa) con el par del CTA, y se agregaron tres
aserciones que fijan que esa es la **única** diferencia — la mitad mecánica de
la SC-017.

El reviewer fue más lejos que el implementer y le hizo **mutación** contra el
artefacto real: sigue cazando una clase ajena en un enlace, un atributo extra en
`<nav>` y un `<ul>` que gane el par; oculta exactamente un caso —un elemento del
nav que no sea el CTA y que gane literalmente `invisible opacity-0 `— y hay una
sola coincidencia por documento y es el envoltorio del CTA. **Neto: más fuerte
que antes**, porque antes nada fijaba el estado del CTA. Su recomendación
—anclar el patrón con `(?=site-nav__cta)`— **se aplicó al cerrar**, y con eso el
único hueco desaparece.

### ⚠️ El candado de build de Nuxt golpeó por **tercera vez**

El primer `./init.sh` del reviewer falló por eso, no por la feature.
`tests/global-setup.ts` lanza `pnpm generate` por `execFileSync`, y un
`pnpm dev` muerto tumba la suite entera con un `Serialized Error: { status: 1 }`
que **no nombra nada relevante** — ni el archivo, ni la feature, ni el candado.
Volvió a pasar al aplicar el ancla de este cierre y pasó al reintentar.

**Tres ciclos, tres rojos falsos.** Vale la pena endurecerlo en el arnés: que
`global-setup` detecte el candado o el proceso vivo y falle con un mensaje que
diga qué matar, en vez de propagar un `status: 1` mudo. Cuesta unas líneas y
lleva tres ciclos costando corridas completas.

### Pendientes de **Roberto**

- 🔴 **D-07** — fondo del nav pinneado. Hoy el titular del Hero se cruza con el
  lockup y los enlaces al scrollear, y los dos quedan ilegibles a cualquier alto
  de escritorio. Dos utilidades sobre el renglón.
- 🟡 La banda blanca bajo el pliegue (feature 6, `default.vue`). Transitoria,
  se disuelve con `02 Propósito`.
- 🟡 Alinear —o no— los cinco enlaces del shell a anclas que no existen con la
  línea estricta que tomó el CTA primario del Hero (D-03).

### Pendientes de **Clau**

- ~~🔴 El link real de Google Calendar (`decisions-open.md` #2). Mientras no
  exista, el CTA secundario es texto gris inerte, sin ancla y sin flecha.~~
  ✅ **RESUELTO el 2026-09-07 por Roberto** — `https://cal.com/muush/intro-call`.
  La herramienta resultó ser **Cal.com, no Google Calendar**. Lo cableó la
  feature 11; ver la entrada de cierre al final de este archivo. Se tacha en
  vez de borrarse: era cierto cuando se escribió.
- 🟡 Los 76 del frame móvil contra los 78.19 que dibuja el propio frame (§ R55).
- 🟡 `--duration-nav-cta-fade` (**A-15**) — **UNVERIFIED**, `0.2s`, mismo trato
  que el ping del radar y el fundido del spotlight.
- 🟡 **D-04** y **D-05** — `--text-link` y `--text-display` resuelven a un solo
  valor lo que el diseño dibuja distinto entre frames. Reversible en un token
  cada uno, y hoy gratis.

- Resumen del implementer: `docs/harness/progress/impl_hero_section.md`.
  Verdict del reviewer: `docs/harness/progress/review_hero_section.md`
  (**aprobado**, con las cuatro desviaciones verificadas por ejecución).
- `feature_list.json`: feature id 9 status `reviewing` → `done`.

---

## 2026-09-08 — Feature 11: call_link_and_pointer_cursor (done)

`sdd: false`. Sin `specs/011-*`: el brief fue el array `acceptance` de
`feature_list.json` más `decisions-open.md` § Decisión 2 y `ui-map.md` §§ 3 y 6.
Ciclo `implementer` → `reviewer` → **APROBADA**, con la compuerta de review
respetada como manda `AGENTS.md` § 4 aunque no hubiera fase de spec.

### Lo que shippeó

Cuatro síntomas que Roberto reportó al ver el Hero, de los cuales **tres eran
la misma causa**.

- **El link de la llamada.** `https://cal.com/muush/intro-call`, dado por
  Roberto el 2026-09-07, cierra el bloqueante #2. La URL es un **destino, no
  copy**: vive una sola vez, en `app/shared/data/callBooking.ts`, y **nunca**
  entra a `i18n/locales/*.json` — una URL duplicada por locale son dos valores
  que pueden divergir, y `tests/i18n-parity.test.ts` los llamaría paridad
  perfecta porque ambas claves existen. `app/shared/` es además el único lugar
  que `landing` y `shell` pueden alcanzar sin violar el Artículo III.
  `tests/call-booking.test.ts` afirma **un literal bajo `app/` y cero en los
  locales**, y el reviewer lo verificó **por mutación**: un segundo archivo con
  la URL pone la suite en rojo.
- **Texto gris y flecha ausente no eran bugs de estilo.** `HeroSection.vue`
  renderiza `LinkArrow` cuando existe `callHref` y un `<span>` inerte cuando no;
  sin URL caía a la rama inerte. **No se cambió una sola línea de marcado** ni
  en `HeroSection.vue` ni en `FooterColumn.vue` — sus diffs son de comentarios.
  El `text-bone-100` y la flecha vienen de `LinkArrow.vue`, intacto. Verificado
  sobre el artefacto generado, no sobre un mount.
- **El cursor sí era un defecto aparte.** No había **ni una** declaración
  `cursor` en toda la hoja emitida: Tailwind v4 quitó la regla de preflight de
  v3, así que un `<a href>` se veía bien porque lo hace el agente de usuario y
  un `<button>` nativo se quedaba en `default`. Arreglado **donde se definen los
  elementos** — `BotonPrimario.vue`, `SocialIcon.vue` y los dos `<button>` de
  `SiteNav.vue` / `MobileMenu.vue` — nunca por call site.

`./init.sh` exit 0 · **349 tests en 29 archivos** · cero tokens nuevos.

### El CTA primario del Hero: sin puntero — y la autoridad que se citó de más

**El resultado es correcto y el reviewer lo sostiene: hoy no lleva puntero.** Es
un `<button type="button">` sin `href` y sin handler, así que al hacer clic no
pasa nada, y la premisa del criterio #4 (*"every **interactive** control"*) aún
no se cumple para él. Gana el puntero por construcción el día que aterrice
`contactHash`, y hay test en ambos sentidos.

**Pero la autoridad citada no se sostiene entera, y queda registrado como lo que
es — INFERRED, y sobre-afirmado.** El `implementer` apoyó la decisión en
`ui-map.md` § 6 (los slots de Proyectos). El remedio que § 6 pide es la
afordancia completa —*"sin cursor de link **ni hover**"*— y `.led:hover::before`
en `BotonPrimario.vue` **sigue girando en hover tenga o no destino**. Así que
solo se aplicó la mitad del remedio, y el control sigue leyéndose como
clickeable por su caja.

Lo que gobierna de verdad es el **criterio de aceptación #5** (*"a disabled or
destination-less control must not claim to be clickable"*), que es directo y no
necesita transferencia.

**La inconsistencia queda viva a propósito y no se tocó aquí**: el hover
pertenece a un primitivo congelado de la feature 2, fuera de este array de
aceptación, y R50 exige que el CTA **conserve** su caja y su anillo LED. Es
observación para Roberto, no defecto.

### R56 · La preflight de Tailwind v4 no declara ningún `cursor`

En `docs/harness/findings.md`, no en `rules.md` — es comportamiento de
herramienta, no regla de negocio. La regla operativa: un componente que puede
renderizar como `<button>` declara su cursor **condicionado a que el control
haga algo**; no se pinta `cursor-pointer` sobre un control sin destino.

**Trampa de al lado, y vale más que la regla:** `BotonPrimario.test.ts` hace
grep de su propio código fuente buscando `/@(click|mouseenter|mouseleave)/` para
probar que no lleva script de cliente. Un **comentario** que mencione el binding
*en prosa* pone la suite en rojo. Se reescribió la prosa y **la guarda quedó
intacta** — es deliberadamente sobre-estricta y su valor es ser tonta e
imposible de esquivar; enseñarle a saltar comentarios habría metido parsing en
lo único que no debe ser negociable.

### El hueco de colección que se cerró antes de que costara algo

`vitest.config.ts` **no recogía `app/shared/data/**/*.test.ts`**, que es donde el
Artículo I pone una constante transversal. No era defecto vivo —el test de esta
feature está en `tests/`— pero el siguiente que pusiera una prueba junto a un
archivo de datos compartidos habría tenido un verde que no significa nada: el
fallo § R39 exacto que la propia lista de `include` ya documenta.

Se cerró **con el rojo demostrado, no leyendo el glob**: una sonda en
`app/shared/data/` cuya única aserción era `expect('collected').toBe('this
assertion must fail')` dejó la corrida en **29 archivos, todos verdes**. Con el
glob puesto: **30 archivos, 1 fallo**. Sonda eliminada, suite en verde. Misma
disciplina que la feature 8 tuvo que probar a propósito.

### Decisión de alcance registrada

`SocialIcon` es un `<a href>` que **ya** mostraba puntero por el agente de
usuario. Se le declaró igual: el criterio #4 nombra "the social buttons" de
forma explícita y dice *"whether it renders as `<a>` or `<button>`"*, y así los
controles de vidrio del menú móvil dejan de depender de qué elemento les tocó
ser. El reviewer lo avaló como justificado, no como relleno.

### Lo que sigue abierto

- 🟡 **El hover del LED sobre un control sin destino** (arriba). Primitivo
  congelado de la feature 2. **De Roberto**, no de esta feature.
- 🔴 **Sin pasada visual.** Nada se vio en un navegador; se verificó contra
  `.output/public` y el CSS emitido. Se suma a las pasadas acumuladas de las
  features 2, 4, 5, 3, 6, 8 y 9.
- Los pendientes de las features 7 y 10 no los toca esta feature: la banda
  blanca, el mensaje del build lock, el comentario obsoleto de `SectionGlow` y
  su variante `'920'` muerta.
- 🟡 El fondo transparente del nav sigue **diferido a propósito** por Roberto
  (`ui-map.md` § 2). No es bug y no se reporta de nuevo.
- 🔴 `decisions-open.md` #1 (a dónde llegan los formularios) y #3 (FAQ) siguen
  abiertas. `FAQ` y `Blog · próximamente` siguen como texto inerte, que es
  ahora la única pareja en ese estado.

- Resumen del implementer:
  `docs/harness/progress/impl_call_link_and_pointer_cursor.md`. Verdict del
  reviewer: `docs/harness/progress/review_call_link_and_pointer_cursor.md`.
- `feature_list.json`: feature id 11 status `reviewing` → `done`.

## 2026-09-08 — Feature 10: white_band_and_build_lock (done)

`sdd: false`. Sin `specs/010-*`: el brief fueron las 9 entradas `acceptance` de
`feature_list.json` más `findings.md` § R54. Ciclo `implementer` → `reviewer`,
rechazada en la ronda 1 por dos bloqueos que **eran del leader** (un formato
biome roto en `feature_list.json` y una escritura en `docs/business/`), no del
diff — corregidos, y **APROBADA** en la ronda 2. Compuerta de review respetada.

### Lo que shippeó · la banda blanca, cerrada con DOS piezas

Ninguna sustituye a la otra, y el reviewer lo probó revirtiendo cada una por
separado:

| Pieza | Qué cubre | Revertida sola |
|---|---|---|
| `html { background-color: var(--ink-500) }` | el lienzo, a cualquier altura de página | la región más allá del documento vuelve a `rgb(255,255,255)` |
| `overflow-clip` en los dos ejes de la raíz | que la decoración no alargue el documento | `overflow: visible` devuelve exactamente 159px de scroll muerto |

El lienzo toma el fondo del **elemento raíz** y solo cae al `body` si el del
raíz es transparente. Declararlo en `html` es lo que hace que **una sola**
declaración lo decida en vez de dos; `body` también lo pintaría. Lo que **nunca**
puede decidirlo es la raíz del layout, porque es un `<div>` — y ese era el
defecto.

### Por qué "que lo tapen las secciones" no era la cura

Tres razones, y conviene dejarlas escritas porque fue el primer instinto de
Roberto y el razonamiento es lo que lo zanjó:

1. El **overscroll** descubre el lienzo a cualquier altura de página —
   trackpad de macOS, iOS— hoy y con las 21 secciones construidas.
2. **Hasta el diseño completo desborda**: página de 5060 y `CTA · cierre`
   llega a 5080.
3. Roberto difirió Proyectos, Equipo y Network, así que la página de mañana es
   **más corta** que la del diseño, no más larga.

### `clip` y no `hidden`, y el eje vertical decidido a propósito

`hidden` en un eje coacciona el otro a `auto` y vuelve la raíz un contenedor de
scroll, lo que rompería el nav `sticky`. El eje vertical se recortó por
simetría con FR-007 —una decoración no alarga el documento en **ningún** eje— y
no cuesta nada dibujado: el footer lleva su propio `bg-ink-500` opaco, así que
la cola de `Hero · cierre` ya estaba tapada en todo el solape. El panel `fixed`
del menú móvil sobrevive al recorte: verificado con **muestra de píxel** en
(385,839) —`rgb(38,38,38)` cerrado, `rgb(31,26,27)` abierto—, no solo con
hit-test.

### El candado de build ya dice qué matar

Cuatro corridas perdidas contra un `Serialized Error: { status: 1 }` que no
nombraba nada. `tests/nuxt-build-lock.ts` lee `.nuxt/nuxt.lock` y replica las
tres condiciones de `nuxi`; `tests/global-setup.ts` lo consulta antes de
invocar, otra vez si la build falla igual, y si no imprime lo que la build
imprimió. Reproducido bajo `NUXT_LOCK=1 pnpm dev` **dos veces**: una por el
implementer y otra, independiente, por el reviewer.

### Dos afirmaciones falsas sobre CSS, cazadas y corregidas

Las dos en comentarios/prosa, no en código: una en `tests/static-output.test.ts`
("un fondo solo en `body` dejaría el overscroll blanco" — falso, `body` también
pinta el lienzo) y otra en el propio informe del implementer, que **él mismo
levantó** después de que se le dijera no tocar nada más, en vez de dejarla
correr. **Misma clase de defecto que hizo rechazar la feature 9 en la ronda 1:
el código correcto y la razón registrada falsa.** Levantarla en vez de dejarla
fue la decisión correcta — el siguiente agente razona desde ahí.

### Lo que sigue abierto

- 🟡 **Escalado, no defecto:** si Claude-como-leader puede transcribir las
  decisiones de Roberto a `docs/business/`. El reviewer **declinó
  explícitamente** ratificar la distinción: solo Roberto puede conceder esa
  excepción. Queda en `pending-decisions.md`.
- 🔴 **Sin pasada visual humana.** Se midió con Chrome/CDP sobre
  `.output/public` (dos veces, independientes) y hay capturas, pero nadie lo vio
  en un navegador de verdad. Se suma a las pasadas acumuladas de las features 2,
  4, 5, 3, 6, 8, 9 y 11.
- 🟡 El fondo transparente del nav sigue **diferido a propósito** por Roberto
  (`ui-map.md` § 2) y lo implementa la feature 21. No es bug.
- Los pendientes de la feature 7 no los toca esta feature: el comentario
  obsoleto de `SectionGlow` y su variante `'920'` muerta.

- `docs/harness/findings.md`: §§ **R57** y **R58** nuevas; § **R54** marcada
  como cerrada **con una corrección** — su propia cura propuesta (recortar el
  eje vertical) era necesaria pero **no suficiente**.
- Resumen del implementer:
  `docs/harness/progress/impl_white_band_and_build_lock.md`. Verdict del
  reviewer: `docs/harness/progress/review_white_band_and_build_lock.md`.
- `feature_list.json`: feature id 10 status `reviewing` → `done`.

## 2026-09-08 — Feature 22: primary_button_pill_shape (done)

`sdd: false`. Sin `specs/022-*`: el brief fueron las 8 entradas `acceptance` de
`feature_list.json`. Ciclo `implementer` → `reviewer`, **APROBADA en la primera
ronda**. Compuerta de review respetada. `./init.sh` sale 0 · 30 archivos /
**373 pruebas** · sin commit.

### Lo que shippeó · un cambio de clase, y nada más

`app/shared/ui/BotonPrimario.vue`: `rounded-control` → `rounded-full`. El
relleno `bg-glass-dark` (`#1c1416a6`), el anillo, los paddings, la lógica del
cursor y las media queries quedaron intactos. Sin prop de forma y sin variante:
**el botón tiene una sola forma** y un llamador no puede pedir el rectángulo de
vuelta. `rounded-full` y no un `--radius-pill` propio porque `global.css` ya
había resuelto eso para la cápsula del `Pill`; un segundo nombre para la misma
forma es como dos cápsulas se separan.

Roberto resolvió el 2026-09-08 que la píldora va en **todas** las instancias, así
que el código va por delante de un `.pen` a medio propagar en vez de reproducir
su estado.

### El anillo LED: medido dos veces, por dos agentes, con dos pipelines

Era el riesgo real de la feature —un gradiente cónico sobre r999 no se comporta
como sobre r12— y no se declaró por leer el CSS.

- **Implementer**, Chrome sobre `.output/public` (§ R44): banda de 1.5px continua
  en las tres cajas —hero 236.19×55.19 a 1440, hero móvil 213.55×50 a 390, CTA
  del nav 198.78×42.8—, a 0/45/90/135/180/270 grados de barrido, a DPR 1 y a
  DPR 4, sin hilo y sin muesca donde la tapa encuentra el lado recto.
- **Reviewer**, pipeline independiente: **decodificador PNG propio**, geometría
  por `getBoundingClientRect` y nunca desde una captura (§ R60), **720 muestras
  de contorno por caso**, ancho de banda por integral de cobertura de rojo a lo
  largo de la normal interior. **0 huecos en 720/720 puntos, en todos los casos,
  a DPR 1 y a DPR 4.**

**El control que zanja el asunto**: el mismo pipeline con
`border-radius: 12px` forzado inline da **1.50px** de media contra **1.48px** de
la píldora en las esquinas (mínimos 0.75 contra 0.73). Píldora y r12 son
indistinguibles dentro de 0.02px, así que **los mínimos sub-píxel eran error de
registro del muestreo, no un defecto de las tapas** — aparecen igual en el r12
conocido-bueno. Eso es lo que convierte "se ve bien" en una afirmación
falsable.

La razón de que sobreviva está en § **R59** y no es la suerte:
`mask-clip: content-box` recorta por el **radio menos el padding**, así que para
una píldora el borde interior vale medio alto del content box — otra píldora,
concéntrica. `border-radius: inherit` copia el valor *especificado* y cada caja
lo acota a su propio tamaño.

### El hallazgo de proporción: el cambio es visualmente más chico de lo que suena

Lo único que la forma cambia es dónde se lee el barrido: una caja mucho más
ancha que alta le da a cada tapa apenas ±12° del giro, así que la parada
`bone-100` cae como un arco brillante corto sobre la línea central vertical y
las tapas se leen casi de un solo color.

**No es del radio, es de la proporción**, y el reviewer lo confirmó midiéndolo:
el punto más brillante del contorno sigue la posición cónica esperada dentro de
1.4°, y **píldora contra r12 coinciden dentro de 0.5° en cada uno de los 6
ángulos**. El radio no mueve el arco. Queda escrito antes de que alguien lo
reporte como defecto de esta feature.

### ⚠️ El CTA del nav es inalcanzable hoy — y la palanca faltaba en el informe

**No hay ninguna posición de scroll alcanzable en la que el CTA del nav sea
visible**: el documento mide 1161px, el `scrollY` máximo es 261, `showCta` es
falso en todas y `::before` computa `visibility: hidden`. El implementer **sí**
lo midió, pero solo con `Emulation.setScriptExecutionDisabled` por CDP, que deja
que la regla `<noscript>` de `SiteNav` revele el control — **y su informe no
nombró la palanca**. Un agente que lo siguiera al pie de la letra iba a medir un
nav en blanco y concluir que el anillo se rompió. Añadida al informe en el
cierre.

**No es defecto y se cierra solo**: el caso es inalcanzable porque la landing
todavía no tiene sección después del hero, así que no hay altura para scrollear
más allá de él. Cuando la siguiente sección aterrice, el reveal se ejerce con
scroll normal. Mismo límite que la feature 9 ya registró para 1440×900.

### Excepción registrada al Artículo V

`BotonPrimario.vue` pasó de **176 a 251 líneas crudas** (`wc -l`; las 251
incluyen la nota de excepción misma) contra el límite de 200 — y **74 líneas
no-comentario y no-vacías antes y después**. La feature agregó **una clase** y
ni una línea de código. El reviewer contó 177/214 y 78 líneas de código; la
diferencia es de método sobre las líneas delimitadoras de comentario, y las dos
medidas coinciden en lo que importa.

Es materialmente la misma excepción ya registrada para `CursorSpotlight.vue`,
que estableció el conteo no-comentario como la única métrica estable. **No se
reestructuró nada**: la cláusula de remedio del Artículo V ("extract
sub-components") es lo que identifica la enfermedad como complejidad
**estructural**, y aquí no hay ninguna — un elemento, un pseudo-elemento
enmascarado, dos media queries. Partirlo pondría la máscara, el radio heredado y
el relleno al 65% en dos archivos que tendrían que coincidir.

Va en el encabezado del propio archivo y no en una tabla *Complexity Tracking*
porque la feature es `sdd: false` y no tiene paquete de spec que la sostenga; la
§ *Compliance Review* exige que el registro sea **explícito**, no que viva en un
archivo concreto.

### `--radius-control` lo guarda una prueba, no un comentario

El token quedó **sin ningún consumidor** en `app/` y se conservó a propósito: el
12 sigue siendo el radio de control del diseño y lo pide `FormField`
(`design-extract.md § FormField`, `cornerRadius 12`, 13 usos). Pero un token sin
consumidor defendido solo con prosa es exactamente cómo la variante `'920'` de
`SectionGlow` estuvo a punto de irse por código muerto, así que ahora lo guarda
una aserción.

Sobre el **fuente** de `global.css` y no sobre el artefacto, porque Tailwind v4
lo elimina del build por no tener referencias: el token **no está en
`.output/public`** y el artefacto no puede hablar por él. Leído con
`readFileSync` y no con `?raw`, que el plugin de Tailwind devuelve vacío.
**Visto en rojo antes de confiar en él** (renombrando el token: 1 failed | 17
passed), y token restaurado.

### Lo que sigue abierto

- 🔴 **Sin pasada visual humana.** Se midió con Chrome/CDP sobre
  `.output/public` dos veces e independientes, pero nadie lo vio en un navegador
  de verdad. Se suma a las pasadas acumuladas de las features 2, 4, 5, 3, 6, 8,
  9, 10 y 11 — y esta cambia visiblemente una página **ya en producción**.
- 🟡 **Tres documentos contradicen el radio nuevo y ninguno lo arregla un
  agente** (en `pending-decisions.md`, dueño Clau): el `.pen` a medio propagar
  —componente `OqChv` en r12, hero móvil y los dos Submit heredando 12, solo
  hero de escritorio y los cuatro CTA de nav en r999—, `branding.md`
  § Materiales ("radio 12px controles") y `design-extract.md` § 4
  (`cornerRadius 12`). Ningún agente editó el `.pen` ni `docs/business/`.
- Los Submit de los dos formularios heredan la forma nueva **cuando existan**;
  hoy no hay página que los monte.

- `docs/harness/findings.md`: §§ **R59** y **R60** nuevas. § R59 corregida en el
  cierre: `border-radius: 2147483647px` es verbatim en la hoja generada, pero el
  valor **computado** en vivo se acota a `3.35544e+07px` — quien vuelva a medir
  por `getComputedStyle` no va a encontrar el literal.
- Resumen del implementer:
  `docs/harness/progress/impl_primary_button_pill_shape.md` (con la adenda de
  cierre). Verdict del reviewer:
  `docs/harness/progress/review_primary_button_pill_shape.md`.
- `feature_list.json`: feature id 22 status `reviewing` → `done`.

---

## 2026-09-08 — Feature 7: stale_docs_and_dead_glow_code (done)

Limpieza de comentarios que se volvieron falsos. **Cinco archivos, cero líneas
de código**: el reviewer lo probó mecánicamente en vez de creerlo — quitando
toda forma de comentario de HEAD y del árbol de trabajo, los cuatro archivos
TS/Vue quedan byte-idénticos (80=80, 118=118, 170=170, 27=27) — y **re-derivó**
`entry.DbyTAhZp.css`. Como ese nombre sale del contenido, reproducirlo **es** la
prueba de que un comentario nunca llega a la hoja de estilos. El implementer lo
había establecido por la otra vía: snapshot de `.output/public` antes de editar y
diff después, 35 archivos byte-idénticos salvo el UUID de build y
`prerenderedAt`, que cambian entre dos corridas cualesquiera. Dos rutas
independientes a la misma conclusión.

### El tema real: tres cosas parecen código muerto y no lo son

Esta es la lección de la feature, no una nota al pie.

- La variante `'920'` de `GlowSize` y `--spacing-glow-920` **esperan a
  Propósito**. `Glow origen` es real: mide 920×920 y vive **anidado dentro del
  frame de Propósito desktop** (nodo `ayCiG`), no en el grupo de fondo a nivel de
  página — que es exactamente por qué el conteo de la página dio **11 y no 12**.
- `--radius-control` **espera a `FormField`** y desde la feature 22 lo guarda una
  aserción, no un comentario.

**Esta feature originalmente ordenaba borrar los dos primeros, y la instrucción
era incorrecta.** La corrigió el líder leyendo el `.pen` el 2026-09-08. El
componente ahora lo dice en prosa —`'920'` está documentada como *no consumida
hoy y no código muerto*— para que nadie repita el intento leyendo el árbol.

### Dos criterios retirados antes de implementar

Los dos quedaron registrados en la descripción de la feature, con su razón:

1. «`SectionGlow.test.ts` is updated in the same change» se escribió cuando el
   plan era **borrar** la variante `'920'`; al conservarla, contradecía al
   criterio que dice que el test no se toca.
2. «`rules.md`'s preamble line 9 is disambiguated against R32» pedía editar
   `docs/business/`, de autoría humana y solo lectura para todo agente desde el
   2026-09-07. Pasó a tarea humana en `pending-decisions.md`.

### Un conteo viejo contamina el razonamiento construido encima

La afirmación falsa en `SectionGlow.test.ts` eran **dos líneas, no una**: la
aritmética *"would be right once and wrong 21 times"* estaba **derivada** del 22
falso. Arreglar solo el número habría dejado la oración igual de equivocada.
Vale escribirlo: al corregir un conteo hay que leer la frase completa que lo
rodea, no solo el dígito.

### La simetría del reviewer, que corta en las dos direcciones

El implementer surfaceó —sin decidirlo él— que dos «22» sobrevivían por la
literalidad de un criterio (`SectionGlow.test.ts:237` y `global.css:312`) cuando
el criterio existía para proteger otra cosa: la aserción de alcanzabilidad de
tokens, que es la que se habría puesto roja si alguien borraba `'920'`. El líder
autorizó ambos arreglos aclarando su propio criterio.

**Y el reviewer aplicó la misma vara en la dirección contraria, contra el
líder:** la letra del criterio #1 («no longer says '22'») **tampoco se cumple**,
porque `SectionGlow.vue:27` dice "Why 21 and not § 10's 22". Aprobó por intención
sobre literalidad —esa mención es una afirmación *verdadera* sobre un documento
viejo— y dejó anotado que la consistencia aplica en ambos sentidos. Es la parte
útil del ciclo: un criterio se interpreta por lo que protege, y quien lo escribió
no queda exento de esa lectura.

### Lo que sigue abierto (fuera de esta feature, tareas humanas)

- 🟡 Los conteos de `design-extract.md` § 10 (dice 22 y 12) — en
  `pending-decisions.md`. La mención en `SectionGlow.stories.ts:7` («§ 10 still
  prints 22 and 12») es deliberada y verdadera hasta que se corrija.
- 🟡 La ambigüedad del preámbulo de `rules.md` frente a § R32 — misma lista.
- 🔴 Sin pasada visual humana, como las features 2–11 y 22. Esta no cambia nada
  renderizado, así que no agrega deuda visual nueva.

- Resumen del implementer:
  `docs/harness/progress/impl_stale_docs_and_dead_glow_code.md`. Verdict del
  reviewer: `docs/harness/progress/review_stale_docs_and_dead_glow_code.md`.
- `./init.sh` exit 0 · **30 archivos / 373 pruebas**, sin cambio respecto al
  baseline: la feature no agregó comportamiento.
- `feature_list.json`: feature id 7 status `reviewing` → `done`.

## 2026-09-08 — Feature 13: purpose_section (done)

`02 Propósito`, la segunda sección del sitio y la **más divergente**: constelación
Golden Circle en escritorio, carrusel de tres cartas en móvil. Dos composiciones,
no una reescalada. Ciclo SDD completo con corrida real del `reviewer`.

Cuatro componentes en `app/features/landing/ui/` (`PurposeSection`,
`PurposeConstellation`, `PurposeCarousel`, `PurposeCard`), `data/purposeContent.ts`,
`logic/usePurposeContent.ts` y `logic/usePurposeCarousel.ts`, 45 tokens, 9 claves
por locale y una línea en `app/pages/index.vue`. **El revelado de escritorio es
CSS puro** — `:hover` / `:focus-visible` en el trigger gobernando a sus hermanos
posteriores, cero JavaScript; el móvil agrega **un** `IntersectionObserver`.
`Glow origen` por fin consume la variante `'920'` de `SectionGlow`, la que la
feature 7 estuvo a punto de borrar por código muerto. Cero líneas cambiadas en los
seis primitivos, en `app/features/shell/`, en `app/layouts/` y en toda la config.

### Las relaciones generativas, verificadas contra la página construida

Ninguna se transcribió. Todas se midieron en Chrome sobre `.output/public` por CDP
con `Emulation.setDeviceMetricsOverride` (§ R44), no con `--window-size` (§§ R34,
R60):

- **Los tres largos de línea son un solo `calc()`** sobre `--i`:
  `100% − card − nodeX − i·step − offset`. Medidos: **394 / 244 / 94**, que es
  exactamente lo que dibuja el frame. Escribirlos como literales pone roja una
  prueba.
- **Los tres diámetros de arco son `2 × distancia(origen, radar)`**, con el origen
  medido en exactamente **(−180, 44)** y los radios de línea media en
  **519.51 / 808.52 / 1067.02** contra los 519.5 / 808.5 / 1067.0 dibujados. Hizo
  falta `width: diámetro + grosor`: el diámetro del diseño es la **línea media** del
  trazo y `border-box` mide el borde exterior.
- **Las tarjetas van a ras del borde derecho** de la caja de contenido: medidas en
  580.02 de izquierda y 700.02 de ancho.
- **Las alturas son intrínsecas** — `64 + n×41` — así que no hay token de altura ni
  `min-height`, y el radar queda centrado en su propia carta por construcción.
- **La vecina del carrusel es la carta activa a ×0.88**: activa pintada **58→332**,
  vecina derecha **342→583.12** contra los 342→583 del frame.
- Los seis centros de glow, exactos: (60,704) · (1410,854) · (−180,44) en
  escritorio; (56,630) · (456,870) en móvil, con `Glow origen` ausente.
- Orden de pintado R28/R37 en las dos anchuras: backdrop **−3**, hoja de puntos
  **−2**, spotlight **−1**, arcos y contenido `auto`. La sección no declara ninguna
  de las once propiedades de contexto de apilamiento, ni fondo, ni padding inferior
  u horizontal. Desbordamiento horizontal **0** en 12 anchuras de 320 a 2560.

### 🔴 La tangencia de los arcos — restricción de diseño, no defecto. ABIERTA

Los arcos **dejaron de pasar por sus radares**: deriva ES **13.27 / 29.60 / 29.64px**,
EN **27.70 / 60.20 / 60.88px**.

El `reviewer` lo aisló con el experimento que el `implementer` no corrió: **forzando
`Why` a los 228px del frame y quitando los 2px de la `Pill`, la deriva colapsa a
−0.07 / −0.30 / −0.64px**, toda dentro de 1px. Eso prueba que **los radios y el
origen están bien derivados y lo que se movió fueron los radares**. La causa: la
copy de `Why` envuelve en **3** líneas en ES y **2** en EN donde Pencil dibujó **4**
(`How` 187.5 vs 187 y `What` 147 vs 146 sí coinciden, así que el mapeo tipográfico
es correcto). Por eso EN deriva más: le falta una línea más.

**FR-015 (alturas intrínsecas) y FR-017 (radios fijos del frame) son
estructuralmente incompatibles en cuanto la copy envuelve distinto al mockup** — que
es lo que la propia **spec A-02 ya declaraba**. La tangencia era una propiedad
**derivada de un frame en un idioma**, nunca un requisito enunciado.

**No se reafinó**, y el `reviewer` llamó correcta esa decisión: reafinar hornearía
el envolvimiento de un locale en la geometría y destruiría la derivación de FR-017.
Los arcos son filetes de 1px `aria-hidden` al 12–36%. Opciones, ninguna elegida:
aceptarlos como decoración fija · fijar alturas (rompe FR-015 y toda edición futura
de copy) · calcular los radios de los radares renderizados (cuesta la propiedad de
cero JavaScript) · desacoplar los anillos de las alturas en el diseño.
**Abierto para Roberto y Clau.**

### Los dos valores derivados que siguen `UNVERIFIED`

Ninguno es un valor de diseño y los dos lo dicen en su comentario:

- **O-01 · `--purpose-radar-rest-opacity: 0.73`** — dueño Roberto/Clau. Los tres
  radares del frame son byte-idénticos, así que el archivo guarda **un** estado y no
  puede decir cuál. El 0.73 es la **media de las dos únicas razones reposo:hover que
  el frame sí contiene**, las de la propia tarjeta: relleno 31/43 = 0.721 y trazo
  89/120 = 0.742. El token lleva escrito *"no presentarlo como valor de diseño"*.
- **O-06 · `--duration-purpose-reveal: 0.2s`** — dueño Clau. Ningún frame puede
  dibujar una transición (§ R38). Sembrado en los 0.2s que ya usan el spotlight y el
  CTA del nav para que los tiempos de la página sigan siendo coherentes.

Los otros cuatro valores abiertos de la spec quedaron **cerrados** por lecturas del
`.pen` del líder, y tres corrigieron lo que la spec había supuesto: la `Pill` de
escritorio está en y **90** y no en 0 (de ahí que el padding superior sea **254** y
no 164), los tres arcos **no comparten trazo** (red-400 36% / bone-100 18% /
bone-100 12%) y las etiquetas son **`Why` / `How` / `What` en inglés en los dos
locales**, como el eyebrow del Hero.

### Los tres huecos declarados, ninguno bloqueante

1. **A 390 no hay vecina izquierda en reposo.** El frame dibuja `What` asomando a la
   izquierda; el loop del swipe **no** se construyó a propósito (spec A-07: un loop
   sin costuras exige nodos clonados o teletransporte de scroll, y los dos pelean con
   el carril de snap nativo que **es** el fallback sin JavaScript). Quedan 48px
   vacíos hasta que se desliza. Reversible.
2. **`(hover: none)` conserva el relleno de reposo.** Se revelan los largos de línea
   y la opacidad de las tarjetas, pero no la superficie brillante, porque esa es una
   utilidad `peer-hover:`. Es la lectura de FR-011, que pide líneas y tarjetas.
3. **La `Pill` mide 40px y el frame dibuja 38** — su propio borde de 1px arriba y
   abajo, exactamente la misma clase que la medición del nav de la **§ R55**. Deja
   todo lo de abajo 2px bajo. **Se reportó, no se absorbió**, siguiendo ese
   precedente: es una discrepancia entre el frame y su propio dibujo y la decide una
   persona. `GlassPanel` deja además una medida de 634 donde el frame tiene 636.

### El candado de build rancio golpeó otra vez — quinta ocurrencia

La primera corrida del `reviewer` falló en el paso 6 por un candado de Nuxt
sostenido por un **PID muerto** (95582); no quedaba archivo de candado y una corrida
limpia salió verde. Ambiental, no de código. **El mensaje que dejó la feature 10
hizo su trabajo**: nombró qué matar y el diagnóstico costó una corrida en vez de
tres (§ R58).

### Hallazgos del ciclo

Seis, en `docs/harness/findings.md`. Los dos que más valen: Vue propaga el `scopeId`
del padre a través de **dos** niveles de componentes de raíz única
(`PurposeCard` → `GlassPanel` → `<article>`), así que `.node > .card` en un
`<style scoped>` hace match sin `:deep()`; y **Vue Test Utils resuelve el `element`
de un wrapper de componente al nodo PADRE** cuando la raíz de ese componente es a su
vez un componente, así que `findAllComponents(X).classes()` devuelve en silencio las
clases del renglón y todo `not.toContain` pasa por la razón equivocada. Además: CDP
`Input.dispatchMouseEvent` **sí** mueve `:hover` —el falso negativo era despachar el
puntero **debajo del pliegue**, porque `getBoundingClientRect` es relativo al
viewport—, y `Emulation.setEmulatedMedia` **no tiene** feature `hover`/`pointer`:
`(hover: none)` sale de `setTouchEmulationEnabled` + `mobile: true`.

### Las guardas, verificadas de forma independiente por el reviewer

**§ R36 ✅** — ningún token entró a `--color-glow-*` / `--spacing-glow-*`, y
renombrar uno de Propósito hacia ese namespace **sí** pone roja
`SectionGlow.test.ts`: la guarda está viva, no supuesta. **§ R39 ✅** — los cinco
archivos de prueba nuevos se vieron **rojos a propósito** antes de escribir una
aserción real, y el `reviewer` probó **8 mutaciones** (ancla, clip en la sección,
orden del renglón, anchos literales, `lg:hidden` del label, atenuado por defecto,
clave de `en.json`, namespace de glow) y **las 8 quedaron cazadas**.

### Dos desviaciones de `tasks.md`, las dos avaladas

Los arcos viven en `PurposeSection.vue` y no en `PurposeConstellation.vue` como
decía T024: su origen está 270px **arriba** de la caja de la constelación y FR-018
exige el clip sobre la caja de la **sección**. Y se agregó
`PurposeSection.test.ts`, que no estaba en `tasks.md`, porque el sujeto que nombra
T032 —«la raíz de la sección», el envoltorio de los arcos— vive en ese componente.

- Resumen del implementer: `docs/harness/progress/impl_purpose_section.md`. Verdict
  del reviewer: `docs/harness/progress/review_purpose_section.md`.
- `./init.sh` exit 0 · **35 archivos / 455 pruebas** (baseline 30 / 373), sin
  modificar ninguna prueba preexistente.
- `feature_list.json`: feature id 13 status `reviewing` → `done`.
- De paso: `.specify/feature.json` llegó fallando `biome check` y bloqueaba el gate;
  se corrigió su formato y su ruta a `013-purpose-section`.

## 2026-09-08 — Feature 14 `services_section` — Servicios, the landing's third section

Desktop scatter of five service nodes joined by four connector lines, mobile
vertical timeline against a spine with a scroll-driven "lyrics" dimming effect.
Reviewer **APPROVED**; two load-bearing claims mutation-tested live (a
corrupted connector centre and a removed lyrics guard both correctly killed
their assertions, then reverted).

- **Connector lines are a generative relation, not four literal shapes.**
  `connectorEndpoints(SERVICE_NODE_CENTRES)` is a pure function over the five
  confirmed radar centres; measured in Chrome against `.output/public`, all
  four rendered endpoints match the design to ≤1px — same discipline
  Propósito's arc-tangency check used.
- **A real bug caught only by measuring the built page, not by any test
  written in advance.** `IntersectionObserver`'s first callback ties every
  ratio at 0 before the visitor has scrolled anywhere near the section; without
  a guard the tie-break picked item 1 as "active" and dimmed items 2–5 on page
  load. This is exactly the class of defect a spec cannot anticipate — only
  scripted scrolling against the real artefact surfaced it. Fixed with a
  one-line no-op guard and a unit test that mutation-testing confirmed kills.
- **One data-model deviation, confirmed necessary by the reviewer.**
  `data-model.md` specified the four connectors as CSS custom properties on
  `x1`/`y1`/`x2`/`y2`; Biome's `noUnknownProperty` rule correctly rejects those
  as CSS declarations (independently reproduced by the reviewer with an
  isolated probe). Switched to bound SVG attributes from the same pure
  function — the "generated, never hardcoded" requirement holds either way.
- **Two documents disagreed on the lyrics rest opacity** — `design-extract.md`
  says 0.18, `ui-map.md` and `feature_list.json` both say 0.22. Shipped
  **0.22**, the value two independent sources agree on.
- **Four open values, all marked pending, none blocking**: the five Spanish
  service names (English shipped as the placeholder in both locales), the
  connector stroke colour/width, the lyrics effect's timing/thresholds, and
  the mobile top padding (still blocked on Propósito's own open O-05).

- Implementer's report: `docs/harness/progress/impl_services_section.md`.
  Reviewer's verdict: `docs/harness/progress/review_services_section.md`.
- `./init.sh` exit 0 · **41 files / 519 tests** (baseline 35/455), no
  pre-existing test modified. `git diff --stat` confirmed zero changed lines
  in `SectionGlow`/`SectionBackdrop`/`DotGrid`/`Radar`/`Pill`, `Purpose*`/
  `Hero*`, `features/shell/`, `layouts/`.
- `feature_list.json`: feature id 14 status `reviewing` → `done`.
- Housekeeping: `tasks.md`'s 53 checkboxes were left unticked by the
  implementer despite the work existing and passing review — a cosmetic gap,
  not a rejection ground, but confusing next to a `done` feature. Checked off
  to match what was actually built and verified.

## 2026-09-08 — Feature 16 `contact_section` — `06 CTA final`, the landing's closing section (done)

Built `app/features/forms/` (new module, filling one Article I named but no
feature had built) plus `landing/ContactSection.vue`. Reviewer **APPROVED**,
reproducing every load-bearing claim live over CDP against `pnpm generate`'s
output rather than trusting the implementer's report, including two mutation
tests against `ContactForm.vue` and `contactFields.ts` (reverted, confirmed
byte-identical after).

- **The two CTAs were not symmetric, and filling one line closed a hole that
  predated this feature.** The nav's CTA was already an unconditional anchor;
  the Hero's primary CTA was gated behind `HERO_DESTINATIONS.contactHash`,
  absent until this feature set it to `'#contacto'`. Both verified as real
  anchors on the built artefact, with the Hero's old `<button type="button">`
  confirmed gone.
- **The no-submit guarantee is type-structural, not conventional.**
  `ContactSubmitState` only has `'idle' | 'invalid'`; `'sending'`/`'success'`/
  `'server-error'` exist solely as `ContactForm.vue`'s Storybook-only
  `previewState` prop. Verified: zero network requests on a live valid
  submit, no `fetch`/`XMLHttpRequest` in the compiled chunk. The reviewer
  reproduced this independently rather than trusting the report.
- **A real bug caught during the implementer's own live verification, not by
  a synthetic test written in advance.** The form showed the error state on
  first render, before any submit, because `errorFor()` read the always-live
  `errors` computed unconditionally. Fixed by gating on
  `state.value === 'invalid'`, with a regression test.
- **`app/features/forms/` now exists**, filling a module Constitution
  Article I had named but no feature had built. `ContactSection.vue` stays
  chrome-only and consumes the barrel, which is what lets feature 20 reuse
  the field vocabulary later without `about` reaching into `landing`.
- **Structural finding worth escalating to Roberto**: the glow vertical
  baseline is UNVERIFIED because it depends on a chain through Proyectos
  (feature 15), which is `blocked` indefinitely — the page-absolute-to-
  section-relative conversion assumes Proyectos's height, which this build
  doesn't have. Handled honestly (documented placeholder, owner flagged, not
  a guess presented as measurement), but the underlying pattern —
  page-absolute glow math breaking when an earlier section in the chain
  never ships — could recur for sections 17 and 20. Open question for
  Roberto: does this need a structural fix, or is placeholder-with-owner
  sufficient for every section downstream of a blocked one?
- **Placeholder copy for the section's own heading/body**, since none exists
  in `docs/business/` beyond the approved button labels — owner Roberto/Clau,
  spec § A-01.

- Implementer's report: `docs/harness/progress/impl_contact_section.md`.
  Reviewer's verdict: `docs/harness/progress/review_contact_section.md`.
- `./init.sh` exit 0 · **49 files / 582 tests** (baseline 41/519).
- `feature_list.json`: feature id 16 status `reviewing` → `done`.

## 2026-09-08 — Feature 17 `about_hero_section` — `01 Hero` of Nosotros/About (done)

Built `app/features/about/` (new module) plus a shared base extracted from
the landing Hero. Reviewer **APPROVED**.

- **`HeroStack.vue` extracted as a shared base** (`app/shared/ui/`), with
  `variant: 'landing' | 'about'` selecting each frame's own type role/width
  and a default slot carrying the CTA row. The landing and About Heroes stop
  duplicating the Pill+headline+intro pattern. Verified as a **safe**
  extraction rather than assumed safe because it compiled: `HeroSection.vue`'s
  existing test file was left untouched and still passed, and the generated
  `/es/index.html` markup for the landing Hero came out byte-identical
  (Pill/h1/p/CTA row intact) before and after the refactor.
- **The stale acceptance criterion the implementer caught itself.**
  Criterion #3 originally said the copy had to wait for Clau's approval —
  written before Roberto approved both locales directly in this session,
  after the leader read them aloud from the `.pen`. The implementer flagged
  the contradiction in its own report instead of silently shipping against a
  criterion that said otherwise; the leader corrected the criterion in
  `feature_list.json` before review. Good instinct, worth recording as such
  rather than as a footnote.
- **Mobile glow opacities are 60/37/28 on both viewports**, confirmed in the
  generated CSS. The `.pen`'s mobile frame draws 65/40/30 — Roberto ruled
  that a design-file error tonight, not intent, making this the one place on
  the site where the file itself is wrong and the code does not "correct"
  itself to match it.
- **`--spacing-about-hero-top` is UNVERIFIED**, seeded from the landing
  Hero's own top spacing because no design y-position exists to derive it
  from (no centre gives it away, unlike the six glow anchors). Reviewer
  judged this non-blocking and consistent with the repo's existing
  convention for similarly-undecidable values (owner flagged in the code
  comment).
- **Zero tokens duplicated (R36)**: the three glow colour+size pairs
  (`red-400`/60, `wine-300`/37, `wine-400`/28 at `1400-700`/`1000-520`/
  `860-520`) were reused verbatim from feature 9's own definitions in
  `global.css` — no new colour/size token exists for this feature, only the
  new anchor/width/gap tokens the different frame needs.

- Implementer's report: `docs/harness/progress/impl_about_hero_section.md`.
  Reviewer's verdict: `docs/harness/progress/review_about_hero_section.md`.
- `./init.sh` exit 0 · **52 files / 605 tests** (baseline 49/582).
- `feature_list.json`: feature id 17 status `reviewing` → `done`.

## 2026-09-08 — Feature 20 `work_with_muush_section` — Work with muush, the About page's application form (done)

Built `forms/`'s second field module (`ApplicationForm.vue`, its own
`useApplicationForm`/data/content) plus `about/`'s second section
(`WorkWithMuushSection.vue`), reusing feature 16's field vocabulary through
the barrel exactly as Article I anticipated. **Rejected on round 1, approved
on round 2** — the rejection is the entry worth reading closely.

- **What the round-1 rejection actually demonstrates.** The implementer's
  environment had no browser, so Phase 6's CDP-based checks (T051/T052/
  T054–T058) were left unchecked and substituted with build-artifact grep —
  a real limitation, honestly flagged, not hidden. The reviewer's environment
  *did* have Chrome, drove it headless over raw CDP against `pnpm generate`'s
  own output, and completed exactly those tasks — finding two real defects
  neither grep nor a self-reading could have caught: `ApplicationForm.vue`
  shipped at **249 lines**, over Article V's 200-line limit, with `plan.md`'s
  own Phase -1 gate self-certifying "Under 200 lines each? → Yes" for that
  exact file without the gate ever having been re-run against the file as
  built; and a genuine **30px vertical misalignment** between the desktop
  text column and the form column — `plan.md` D-3 itself records the text
  block at local y130 and the form at local y100, but the shipped grid put
  both at the same computed y (818.7px, measured live). This is what an
  independent review buys that a self-certified gate does not: the gate said
  "Yes" and was simply wrong, and only a second pass that actually ran the
  verification a spec calls for — rather than trusting the checkbox — caught
  it.
- **Both fixes verified by live measurement, not by re-reading source.** The
  line-count fix extracted the WhatsApp field and its mount/unmount
  transition into `ApplicationWhatsappField.vue` (198 + 89 lines); the
  reviewer confirmed this was a real extraction rather than a moved problem
  by measuring both files with `wc -l` and independently re-driving the
  WhatsApp toggle over CDP — select, type, revert, reselect — to confirm the
  behaviour survived unchanged. The alignment fix added a desktop-only
  `--work-form-y-offset` token consumed as a negative `margin-top`; the
  reviewer measured the actual computed `margin-top: -30px` and the delta
  between the two columns' live tops at 1440×900 (`formTop − textTop =
  −30px`, matching Left@y130/form@y100 exactly), confirmed mobile untouched
  at 390×1000 (`margin-top: 0px`, stacked flow), and separately checked the
  negative-margin mechanism itself for a clip/overlap regression rather than
  accepting the one number on faith.
- **Reuse held across both review passes.** No forked form components;
  `SelectField`'s new `groups` prop stayed additive (`options` still
  optional, `ContactForm`'s existing call site unchanged); `ContactForm.vue`/
  `useContactForm.ts`/`contactFields.ts`/`ContactSection.vue` from feature 16
  confirmed byte-unchanged by `git diff --stat` in both rounds.
- **Two values shipped as visibly pending, not silently decided.**
  `CV_REQUIRED = false`, isolated to one named constant, matching
  `decisions-open.md` #7's own recorded recommendation rather than resolving
  it — owner Roberto/Clau. `ROLE_CATALOG`'s six area headers are confirmed
  from `ui-map.md` § 9; the specific roles per area are not documented
  anywhere this project can read, so each area ships one explicit
  `'placeholder'` role id — owner Clau.

- Implementer's reports: `docs/harness/progress/impl_work_with_muush_section.md`.
  Reviewer's verdicts (round 1 rejection, round 2 approval, both intact):
  `docs/harness/progress/review_work_with_muush_section.md`.
- `./init.sh` exit 0 · **58 files / 688 tests** (baseline 52/605).
- `specs/020-work-with-muush-section/tasks.md`: all 65 tasks checked,
  including the five Phase 6 CDP tasks (T051/T052/T056/T058, plus T057 —
  the specific task the rejection was about) the reviewer completed live.
- `feature_list.json`: feature id 20 status `reviewing` → `done`.

## 2026-09-08 — Feature 21 `floating_nav_redesign` — the nav's glass pill, `Servicios` in, `Proyectos` out (done)

`SiteNav.vue`'s desktop row restyled from a full-bleed, backgroundless bar to
a floating dark-glass pill; `LanguageToggle.vue` rewritten from `ES / EN` to
a single 44×44 circle; the nav CTA grew to 221×48 with a leading arrow.
**Rejected on round 1 (three sizing defects), approved on round 2** — same
shape as feature 20's rejection earlier tonight, closed the same way.

- **A spec-package defect found and fixed, not just implemented around.**
  `contracts/components.md` and `plan.md` both claimed `LanguageToggle.vue`'s
  prop contract (`{ locale, href }`) stays unchanged, with `plan.md`'s own
  Implementation Approach showing the component calling `t()` directly to
  resolve FR-018's translated, locale-describing `aria-label`. Both cannot
  hold at once: Article VI forbids hardcoding the string, and
  `docs/business/rules.md` § R23's corollary — restated as a hard constraint
  in this feature's own `plan.md` — forbids a `ui/` component calling
  `useI18n()`, which this would have been the first one to do. The
  implementer added one prop, `switchLabel`, resolved in `default.vue` (which
  already calls `t()` for the nav's other labels) and threaded through
  `SiteNav.vue`/`MobileMenu.vue` — the same shape `MobileMenu.vue`'s own
  `label`/`closeLabel` props already use for the identical reason. The
  reviewer judged this a legitimate, proportionate fix, confirmed the
  `aria-label` live-translated ("Cambiar a inglés" on `/es/`), and confirmed
  the ripple into `MobileMenu.vue`/its test/story was limited to threading
  the prop, nothing else.
- **Round 1: three sizing defects only live measurement caught.** The
  implementer's environment lacked CDP/browser access and flagged this
  explicitly rather than asserting pixel claims from token values alone; the
  reviewer's environment had it (headless Chrome, `--remote-debugging-port` +
  `--remote-allow-origins=*`, serving `.output/public`) and measured: the
  desktop pill at **1280×110** instead of **1280×72** (`--spacing-nav-y`
  was never adjusted for the new pill, only width/inset tokens were added);
  the mobile nav row at **88px** instead of the **~78px** `findings.md` § R55
  baseline (the new 44×44 language-toggle circle overtook the hamburger as
  the row's tallest content, and nothing compensated); and the nav CTA at
  **232.5×48** instead of **221×48** (padding tuned without measuring against
  real text). Same class of gap feature 20's rejection closed a few hours
  earlier tonight — a spec/plan's own gate or token claiming a state that was
  never actually measured against the built artefact.
- **Round 2: all three fixed and measured, including one lesson found mid-fix
  (`findings.md` § R64).** Desktop: added `--spacing-nav-pill-py`, an
  `lg`-only override of `--spacing-nav-y`, sized from the row's tallest
  content (the 48px CTA). First attempt measured **74px**, not 72 — the
  pill's own new 1px `border` adds to auto-height under `border-box`, which a
  padding value derived from content height alone does not account for;
  corrected 12px/side → 11px/side, re-measured at exactly **1280×72**.
  Mobile: `--spacing-nav-y`'s mobile endpoint lowered 22px → 17px/side,
  re-measured at exactly **78px**. CTA: measured the actual rendered content
  width (arrow + Vue-condensed space + label, 176.546875px) and solved
  `--spacing-btn-nav-x` exactly, landing at **220.984375×48** (target 221).
  The reviewer independently re-measured all three on a fresh
  `pnpm generate` and additionally confirmed the EN CTA's different width
  (236.34375px) is genuine label-length variance, not a padding
  inconsistency, by checking both locales share identical padding classes.
- **Both `.pen` divergences documented in code, not silently resolved.**
  `Proyectos` dropped from the desktop nav link row — Roberto's explicit call
  (2026-09-08), because feature 15 is deferred indefinitely and a link to a
  section that doesn't exist reads as a broken site (`ui-map.md` § 6) — with
  the divergence commented on `NAV_ITEMS` in `navigation.ts` so a future
  reader does not "restore" it from the frame. `Servicios` added despite
  `content.md` stating it is excluded — the redesigned `.pen` wins per
  `rules.md` § R32, since it postdates that document — reported as a
  contradiction for a human to reconcile in `content.md`, which no agent
  edits.
- **Everything reused, confirmed by diff rather than by description.**
  `useNavCtaReveal.ts`, `useShellNavigation.ts`, `useMobileMenu.ts`,
  `resolveLocaleDestination.ts`, `footerColumns.ts` and `types.ts` all show
  **zero** lines changed (`git diff --stat`, both rounds); `BotonPrimario.vue`
  gained zero new props, its diff limited to one static `group` class (for
  the nav CTA's leading-arrow hover animation) and its `nav`-variant token
  *values*. Feature 9's scroll-reveal verified live and unaffected: CTA
  `invisible opacity-0` at landing scroll 0, `visible opacity-100` past the
  Hero.

- Implementer's reports: `docs/harness/progress/impl_floating_nav_redesign.md`
  (both rounds). Reviewer's verdict (round 1 rejection, round 2 approval, one
  file, both intact): `docs/harness/progress/review_floating_nav_redesign.md`.
- `./init.sh` exit 0 · **58 files / 706 tests** (baseline 58/688).
- `specs/021-floating-nav-redesign/tasks.md`: all 25 tasks checked, including
  T016/T021/T022's live-CDP measurements, completed across both rounds.
- `feature_list.json`: feature id 21 status `reviewing` → `done`.

## 2026-09-08 — Feature 23 `visual_polish_round_1` — nav, section spacing, Servicios, Contacto, footer (done)

Nine visual-QA items from Roberto's `pnpm dev` review, `sdd: false`. **Three
review rounds, all on item 4 (the Services canvas), the other eight approved
untouched since round 1.**

- **Item 1 — nav CTA arrow order.** `SiteNav.vue`: `.pen` frames `Rm6Wu`/
  `WGhSI` draw `Texto → Flecha`, text first, `gap: 9`. Swapped the markup
  order, added `--spacing-nav-cta-arrow-gap` (9px, `ml-nav-cta-arrow-gap`).
  Mutation-tested: reverting the order fails `SiteNav.test.ts`.
- **Item 2 — nav link centring.** The desktop row was one flex group
  (`justify-between` against the logo), so the links sat centred on the
  leftover space next to the CTA, not on the pill. Restructured into three
  independent zones (`nav-row` grid `1fr auto 1fr` at `lg` only, hand-written
  CSS, no Tailwind arbitrary value) — logo / links / CTA+toggle. CDP-measured
  at 1024/1440/1536, ES+EN: link-row centre vs. nav centre, Δ ≤ 0.008px.
  Mobile flex/`justify-between` byte-identical (only 2 visible children,
  links `hidden` there regardless of DOM position).
- **Items 3/8 — section spacing.** No design value (`.pen` draws sections
  flush); Roberto asked the implementer to calibrate. One new token,
  `--spacing-section-gap` (clamp 32px→80px), applied via `mt-section-gap` on
  every section after the first on both pages and before `<SiteFooter>` in
  `default.vue` — never as a change to any section's own calibrated
  `pt-*-top` (`rules.md` § R49).
- **Item 4 — Services canvas, three rounds.** Round 1: `.canvas` reused
  `--services-closer-w` (1280px) for its own width with `margin-inline:auto`;
  below 1440px `<main>`'s padded content box is narrower than 1280px, forcing
  the margins to 0 and pinning the canvas flush left with invisible
  right-overflow — confirmed by CDP measurement, fixed with a fluid
  `min(...,100%)` width. **Reviewer rejected round 1**: at exactly 1440px —
  one of the four named acceptance widths — node 5's brief text still
  clipped mid-word, found by measuring the node's own bounding box rather
  than just the canvas box (the implementer's round-1 verification hadn't).
  Round 2 (media-query gate, canvas exactly 1280px unconditional at ≥1440)
  proved via measurement that the clipping was independent of the canvas
  width formula entirely — canvas's rendered left edge doesn't move once its
  width ≥ the available box, so no `.canvas`-width value could fix it — and
  flagged the real cause instead of guessing at it. The leader then read the
  actual `.pen` node (`GiLTU`, 1440×1020) directly: the canvas's coordinate
  space is the FULL 1440px frame, not the 1280px `.closer` box (`vUMC8`)
  nested 80px inside it — two different boxes, previously conflated into one
  token. Round 3: new `--services-canvas-w` (1440px) token, `.canvas` full-
  bleeds out of `<main>`'s `px-page` (`width: min(var(--services-canvas-w),
  calc(100% + 2 * var(--spacing-page)))`, `margin-inline: calc(-1 *
  var(--spacing-page))`), SVG `viewBox` updated `1280→1440`. No node/Pill/
  closer offset token touched — all were already authored against the
  frame's own origin. Roberto approved this as a documented one-section
  exception to feature 14's reviewed "no horizontal padding" contract.
  Reviewer re-measured at 1440 (node-5 text right edge 1378px, 62px from the
  real viewport edge, matching the leader's `.pen` reading exactly, full
  sentence intact) and at 1536/1600/1920/1024/mobile for regressions —
  **approved round 3**.
- **Item 5 — Delivery Pill stretched.** `.closer` was `flex-col` (no
  `items-start`), so the Pill inherited `align-items:stretch` and filled the
  full 1280px row. Changed to `flex-row items-start`. CDP-measured: Pill
  118.125px wide (not 1280), same row/y as the copy.
- **Items 6/7 — Contact copy + divider.** The shipped `body` copy was a
  feature-16 placeholder (spec A-01, never resolved — the leader had read
  the wrong `.pen` node, a demo copy inside `DEMO spotlight cursor`, not the
  real landing node `bdyCz`/`nMffw`). Replaced with the real ES/EN copy, and
  added a new `altQuestion` key (the alternate route's lead-in question,
  which the section never rendered at all before). A hairline divider was
  added above the alternate route reusing the footer's own
  `border-hairline-footer`/`pt-footer-bar-gap` recipe — no rectangle exists
  in the `.pen` for this at any viewport/locale; Roberto asked for one
  anyway after seeing a design reference, and the implementer said so rather
  than inventing a new colour or pretending it came from the design.
- **Item 9 — footer removal.** `Proyectos`, `FAQ` and `Blog · próximamente`
  removed entirely from `footerColumns.ts` (not left `kind:'none'`) plus
  their now-dead i18n keys — same treatment `navigation.ts` already gives
  `Proyectos` in the main nav (feature 21). Mutation-tested: restoring
  `Proyectos` fails `footerColumns.test.ts`.
- **Frozen primitives untouched across all three rounds.** `git diff --stat`
  against `SectionGlow.vue`, `DotGrid.vue`, `SectionBackdrop.vue`,
  `Radar.vue`, `Pill.vue`, `BotonPrimario.vue`: zero lines changed, confirmed
  by both implementer and reviewer, every round.
- Implementer's report (all three rounds):
  `docs/harness/progress/impl_visual_polish_round_1.md`. Reviewer's verdict
  (round 1 rejection + round 3 approval, one file):
  `docs/harness/progress/review_visual_polish_round_1.md`.
- `./init.sh` exit 0 · **58 files / 705 tests** (baseline 58/706 — net of
  legitimate test consolidation once the `kind:'none'` state stopped
  existing anywhere in `footerColumns.ts`, not a coverage regression; see the
  reviewer's own count reconciliation).
- `feature_list.json`: feature id 23 status `reviewing` → `done`.

## 2026-09-08 — Feature 24 `visual_polish_round_2` — Propósito, Servicios móvil, menú móvil, contenido de formularios (done)

Segunda ronda de ajustes visuales (`sdd: false`), seis puntos: tres visuales
y tres de contenido real de formularios dado directamente por Roberto.
**Aprobada en la primera pasada de revisión**, un solo hallazgo no
bloqueante (ver abajo).

- **1a — Arcos de Propósito.** Cada `.arc` era ya un círculo completo cuyo
  centro coincide con el origen del diseño; se agregó
  `clip-path: inset(50% 0 0 50%)`, que aísla el cuadrante inferior-derecho —
  exacto por definición geométrica (los diámetros de un círculo lo dividen
  en cuatro arcos de 90° sin importar el radio), y coincide con la porción
  que ya era visible dentro de ~0.2% de margen. Verificado por CDP contra
  `.output/public`: `clipPath: "inset(50% 0px 0px 50%)"`, `borderRadius:
  "50%"`, ancho=alto en los tres arcos (círculos reales, no elipses).
- **1b — Pill "Propósito".** Nuevo token `--purpose-pill-y: -0.5rem` en
  `:root` (no en `@theme inline` — nada lo consume como utilidad) más un
  wrapper `.pill-nudge { position: relative; top: var(--purpose-pill-y) }`.
  `position: relative` en vez de `margin-top` para no arrastrar a
  `PurposeConstellation`/`PurposeCarousel`, que conservan su
  `mt-purpose-eyebrow-gap` intacto. CDP confirmó `top: -8px` computado y
  arcos/nodos sin cambio de posición.
- **2a/2b — Servicios móvil.** Nuevo token
  `--spacing-services-closer-gap-m: 2.5rem` (antes reutilizaba el gap
  interno de 10-12px de `ServiceItem`). El bloque de cierre pasó a
  `flex-col items-start` — MISMO bug que la feature 23 corrigió en
  desktop (stretch por default), pero se conservó `flex-col` en vez de
  copiar `flex-row`: el spec de la feature 14 confirma que el cierre móvil
  es "stacked", a diferencia del desktop. CDP confirmó `marginTop: 40px`,
  Pill a 113.9px de ancho contra un contenedor de 342px (no estirado).
- **3 — Menú móvil.** `Proyectos` retirado de `MENU_ITEMS`
  (`navigation.ts`), mismo tratamiento de comentario de divergencia que
  `NAV_ITEMS`/`FOOTER_COLUMNS` ya tenían. `MobileMenu.test.ts`/`.stories.ts`
  actualizados (3 items, no 4). Clave huérfana `shell.menu.projects`
  retirada de ambos locales.
- **4 — `ROLE_CATALOG`.** Placeholder (`⚠️ UNVERIFIED, owner Clau`)
  reemplazado por el catálogo real de las 6 áreas dado por Roberto,
  verbatim, con `infrastructureCloud` y `performanceMedia` como roles
  únicos combinados (no separados). Ambos locales actualizados.
- **5 — Identidad del contacto.** Las 5 opciones pasaron a las 6 reales
  (`realEstate` nueva, `creator`/`company` con texto renombrado,
  `independent`/`startup`/`other` sin cambio), en el orden exacto dado por
  Roberto. El orden lo fija el objeto literal en
  `useContactFormContent.ts` (`ContactForm.vue` recorre
  `Object.entries()`), no el JSON. CDP confirmó el orden real en el DOM del
  `<select>` renderizado.
- **Regresión no relacionada, encontrada y corregida:** el nuevo rol
  "Blog y storytelling" (punto 4) contiene la palabra "Blog", que chocaba
  con una prueba de regresión de la feature 23 que prohibía "Blog" en
  cualquier parte del documento (por el placeholder de footer ya
  eliminado). Se acotó esa aserción al elemento `<footer>` — el único lugar
  donde el placeholder existía — en vez de a todo el documento.
- **Hallazgo del reviewer, no bloqueante:** `PurposeSection.vue` pasó de
  198 a 248 líneas por el volumen de comentarios de los puntos 1a/1b,
  cruzando el límite de 200 líneas del Artículo V. Documentado como
  excepción registrada en el propio archivo, siguiendo el patrón ya
  establecido en `BotonPrimario.vue` ("Recorded exception to Article V's
  200-line limit"): medido código real (sin comentarios/blancos) contra
  líneas totales — 82 → 87 líneas de código real, muy por debajo de 200; el
  exceso (198→248 en bruto) es enteramente prosa, no complejidad
  estructural nueva.
- Frozen primitives (`SectionGlow`, `DotGrid`, `SectionBackdrop`, `Radar`,
  `Pill`, `BotonPrimario`) sin tocar — confirmado por `git diff --numstat`
  contra los seis archivos, cero líneas.
- Implementer: `docs/harness/progress/impl_visual_polish_round_2.md`.
  Reviewer: `docs/harness/progress/review_visual_polish_round_2.md`.
- `./init.sh` exit 0 · **58 files / 705 tests**.
- `feature_list.json`: feature id 24 status `reviewing` → `done`.

> ⚠️ **Corrección, misma sesión, antes de commitear.** Roberto rechazó este
> cierre. La feature volvió a `in_progress` → `reviewing` para una **ronda
> 2**: 1a (cuadrante del arco) quedó confirmado correcto contra el `.pen`
> real, sin cambios; 1b (nudge del Pill) resultó insuficiente y subió de
> `-0.5rem` a `-1.375rem`; y se abrió un punto nuevo — la tangencia
> arco↔radar, ya documentada en `impl_purpose_section.md` como un gap de
> 13-61px según idioma/nodo (el copy real envuelve distinto de como lo
> dibujó Pencil). Roberto pidió corregirla en runtime: nuevo composable
> `usePurposeArcRadii.ts` (client-only, `getBoundingClientRect()` post-mount,
> `ResizeObserver`, fallback al token fijo antes del primer mount) — la
> sección deja de ser puramente CSS para esta corrección puntual, documentado
> en `PurposeSection.vue`. CDP en ambos locales a 1440px: gap real **<0.01px**
> en los tres nodos (antes 13-61px). La excepción del Artículo V se actualizó
> a 91 líneas de código real (312 en bruto), sigue muy por debajo de 200.
> `./init.sh` exit 0 · **59 files / 711 tests** (+1 archivo/+6 pruebas:
> `usePurposeArcRadii.test.ts`). Ver `docs/harness/progress/current.md` para
> el estado vigente — la feature quedó en `reviewing`, **no `done`**, hasta
> que el reviewer confirme la ronda 2.

> ✅ **Ronda 3 — el reviewer APROBÓ la ronda 2, con un hallazgo real no
> bloqueante para aprobar pero exigido antes de cerrar.** El guard de
> `usePurposeArcRadii.ts` revisaba `getComputedStyle(.arc).display`, pero
> `.arc` tiene `position: absolute`, y CSS "blockifica" el `display` de un
> elemento posicionado a `block` en tiempo de valor computado **sin importar**
> que un ancestro tenga `display: none` — confirmado por CDP a 390px: el
> wrapper `.arcs` (el que sí lleva `hidden lg:block`) reportaba `"none"`,
> pero el `.arc` individual reportaba `"block"`. El guard nunca disparaba en
> mobile; el composable se autocorregía solo al pasar a desktop (sin crash,
> sin NaN), pero contradecía su propio comentario. El test dedicado a este
> escenario mockeaba `getComputedStyle` de una forma que no reproducía la
> blockificación real, dando falsa confianza.
>
> **Fix:** el guard pasó a revisar un **zero-rect check sobre el WRAPPER**
> (`.arcs`, nunca un `.arc` individual) — `getBoundingClientRect()` de una
> caja no renderizada da `0×0`, sin depender de qué valor de `display`
> sobrevive la blockificación. Test reescrito con la misma técnica
> `stubRect` que ya usaba el resto del archivo (rect real en el wrapper, no
> mock de `getComputedStyle`), más un nuevo caso que fija primero una
> medición real y después corrompe el rect del wrapper a `0×0` para probar
> que el guard sí retiene el valor anterior. **CDP a 390px confirmó el
> fix:** wrapper rect `0×0`/`display:none`, `.arc-why` computado sigue en
> `"block"` (confirma el diagnóstico), y `--arc-diameter` en el `.arc` queda
> **sin override inline** — el token fijo del `.pen` (`81.1719%`) intacto.
> Regresión en 1440px reconfirmada: gap real <0.01px en los tres nodos.
> `./init.sh` exit 0 · **59 files / 711 tests** (mismo conteo — un test se
> reescribió, no se agregó).
> - `feature_list.json`: feature id 24 status `reviewing` → `done`.

> 🔁 **Ronda 4 — post-merge, Roberto reabrió el ítem 1 con una captura nueva
> tras el merge a `master`.** Dos síntomas: el arco no llegaba tan lejos como
> debía por el lado izquierdo (se cortaba con un extremo redondeado a medio
> camino) y el Pill "Propósito" seguía muy abajo pese a la segunda
> calibración. Rama `fix/purpose-arc-reach-and-pill`, feature vuelta a
> `in_progress` → `reviewing`.
>
> **Causa real (medida por CDP, no asumida):** `.arcs` — el wrapper que lleva
> `overflow-clip` — estaba recortado a la caja de contenido de la SECCIÓN
> (1280px, adentro del `px-page` de `<main>`), no al frame completo del
> `.pen` (1440px = el border-box de `<main>`). Mismo patrón de bug que ya se
> corrigió en Servicios (`.canvas`, feature 23 item 4), pero aquí no bastaba
> con ensanchar `.arcs` directamente porque sus hijos `.arc-*` se posicionan
> con PORCENTAJES sobre esa misma caja (`--purpose-arc-origin-x`, a
> propósito, para escalar con el ancho) — ensancharla habría movido el
> origen y roto la tangencia arco↔radar ya confirmada en la ronda 3.
>
> **Fix:** `.arcs` se partió en dos elementos anidados. `.arcs-clip`
> (exterior, nuevo) lleva el `overflow-clip`/`absolute inset-0`/`hidden
> lg:block`/`aria-hidden`, ensanchado con la MISMA fórmula ya revisada para
> Servicios (`width: min(var(--spacing-shell-max), calc(100% + 2 *
> var(--spacing-page)))`, `margin-inline: calc(-1 * var(--spacing-page))`,
> reutilizando el token compartido `--spacing-shell-max` en vez del
> namespaced `--services-canvas-w`). `.arcs` (interior, sin cambios de
> tamaño) sigue siendo la caja exacta de 1280px de siempre — mismo ancho,
> mismo offset — y sigue siendo el padre directo de los tres `.arc-why/-how/
> -what` (ninguna medida de diseño cambió de valor). Ningún token de origen
> (`--purpose-arc-origin-x`, `--purpose-origin-y`) se tocó.
>
> **Pill, tercera calibración.** `-1.375rem` (22px, ronda 2) "seguía sin ser
> suficiente" — subido a `-3.75rem` (60px), más del doble, deliberadamente
> grande para no quedarse corto una tercera vez.
>
> **CDP confirmó, antes/después, 1440×1400:** `.arcs-clip` ahora llega de
> `x=0` a `x=1440` (el frame completo); `.arcs` (interior) sigue en
> `x=79.98, ancho=1280`, idéntico; origen y centros de los tres Radar sin
> cambio. El corte visible del arco Why pasó de `(80, 518)` a `(0, 541)` y el
> de How de `(80, 803)` a `(0, 817)` — 80px más a la izquierda y varios px
> más abajo en ambos; el corte de What **no cambió** (`≈447, ≈926`), porque
> ese arco está acotado por la ALTURA de la sección, no por su ancho — el
> frame del `.pen` mide solo 900px de alto y los arcos "se salen del frame"
> a propósito, así que ese comportamiento ya era correcto. A 390px (móvil):
> `.arcs-clip` en `display:none`, rect `0×0`, y `--arc-diameter` sin
> override inline en los tres arcos — el guard de la ronda 3 sigue intacto.
> Tangencia re-confirmada en ambos locales: gap efectivamente 0px en los 6
> casos (3 nodos × 2 locales).
>
> El reviewer **APROBÓ** de forma independiente (ver
> `docs/harness/progress/review_visual_polish_round_2.md` § "Re-review —
> round 4"): reprodujo cada número desde CDP/geometría propia (no reusó los
> del implementer), confirmó la tangencia intacta, el guard mobile intacto,
> los seis primitivos congelados sin tocar, y el diff acotado exactamente al
> ítem 1 (`global.css`, `PurposeSection.vue`, `PurposeSection.test.ts`,
> `feature_list.json`).
> `./init.sh` exit 0 · **59 files / 711 tests** (mismo conteo — sin pruebas
> nuevas, solo las de `.arcs-clip` reescritas).
> - Implementer: `docs/harness/progress/impl_visual_polish_round_3.md`.
>   Reviewer: `docs/harness/progress/review_visual_polish_round_2.md` §
>   "Re-review — round 4".
> - `feature_list.json`: feature id 24 status `reviewing` → `done`.

## 2026-09-08 — Feature 25 `purpose_copy_nav_order_and_submit_width` — copy real de Propósito, orden/padding del nav, ancho del botón Enviar (done)

Tres reportes de Roberto tras revisar el sitio, cada uno verificado contra el
`.pen` antes de escribir la entrada (`sdd: false`). **Aprobada por el
reviewer** de forma independiente vía CDP real (ver
`docs/harness/progress/review_purpose_copy_nav_and_submit_width.md`).

- **1 — Copy de Propósito.** `landing.purpose.{why,how,what}.copy` en
  `i18n/locales/{es,en}.json` traía un placeholder que nunca se reemplazó por
  el copy real de los nodos `.pen` (`ZddCZ`/`OD567`/`qwVGc` ES,
  `l0DUl`/`w9zj30`/`F1Lku` EN). Reemplazado verbatim en ambos locales;
  `usePurposeContent`/`purposeContent.ts` solo referencia claves, así que
  `PurposeConstellation.vue` (desktop) y `PurposeCarousel.vue` (mobile) toman
  el copy nuevo sin tocar componentes. Tests/fixtures que pinneaban el copy
  viejo actualizados (`tests/landing-copy.test.ts`,
  `tests/static-output.test.ts`, `PurposeSection.stories.ts`); la aserción
  "What == hero subhead" se reescribió a su inversa porque esa igualdad era
  coincidencia del placeholder viejo, no una regla documentada. Confirmado en
  el HTML prerenderizado: cada string aparece 2 veces por locale (una por
  composición).
- **2 — Nav, orden y padding.** `SiteNav.vue`: `<LanguageToggle>` movido antes
  del div `.site-nav__cta` (el `.pen`, frames `WGhSI`/`UfsGV`, dibuja Idioma
  antes que CTA en ambos locales). Token nuevo `--spacing-nav-pill-x: 2.5rem`
  (fijo, mismo criterio que `--spacing-nav-pill-y`/`-py`) sustituyendo a
  `px-page` solo a `lg` vía `lg:px-nav-pill-x`, porque `px-page` hacía doble
  trabajo (angostar la fila Y dar padding interno) y el Lockup del `.pen` está
  a 40px del borde de la píldora, no a 80px. CDP confirmó: Idioma antes que
  CTA en ambos locales, Lockup y el extremo del grupo idioma+CTA simétricos a
  ~121px del borde real del viewport a 1440px (antes 160/no simétrico).
- **3 — Botón Enviar.** Dos rondas. Ronda 1: `<form class="flex flex-col
  gap-form-gap">` sin `items-*` estiraba el botón Submit al 100% por
  `align-items: stretch` heredado; fix inicial fue `self-center` sin scope de
  breakpoint, asumiendo `width: fit_content` en las 4 instancias reales.
  **Ronda 2 (corrección del líder tras leer el nodo base `OqChv` + las 4
  instancias directo en el `.pen`):** desktop es `width: 216` EXPLÍCITO
  (fijo — "Enviar"/"Submit" dan el mismo ancho pese a distinto largo de
  texto) y mobile es `width: "fill_container"` EXPLÍCITO (debe seguir
  estirado). El `self-center` sin scope de ronda 1 rompía mobile. Corregido:
  token `--spacing-btn-submit-w: 13.5rem` en `@theme inline`, clases
  `lg:w-btn-submit-w lg:self-center` en la instancia de
  `<BotonPrimario variant="submit">` de ambos forms (`ContactForm.vue`,
  `ApplicationForm.vue`) — nada sin scope. `BotonPrimario.vue` sin tocar.
  CDP confirmó, ambos forms: desktop 1440 → 216px exacto, centrado (187/187);
  móvil 390 → 292px = 100% del form (0/0 de margen, estirado).

El reviewer verificó los tres puntos de forma independiente contra
`.output/public` real vía CDP (`Emulation.setDeviceMetricsOverride`), sin
reusar las cifras del implementer, y confirmó los seis primitivos congelados
(`SectionGlow`, `DotGrid`, `SectionBackdrop`, `Radar`, `Pill`,
`BotonPrimario`) sin diff.

`./init.sh` exit 0 · `pnpm check`/`typecheck`/`test` (713/713)/`generate`/
`storybook:build` todos verdes.
- Implementer: `docs/harness/progress/impl_purpose_copy_nav_and_submit_width.md`.
  Reviewer: `docs/harness/progress/review_purpose_copy_nav_and_submit_width.md`.
- `feature_list.json`: feature id 25 status `reviewing` → `done`.

## 2026-09-09 — Feature 26 `nav_scroll_hide_mobile_logo_and_spotlight_size` — nav se oculta al bajar, logo icon-only en mobile, spotlight más chico (done)

Tres ajustes de interacción/visual pedidos directamente por Roberto (`sdd:
false`). **Aprobada por el reviewer** de forma independiente vía CDP real
(`docs/harness/progress/review_nav_scroll_hide_mobile_logo_and_spotlight_size.md`).

- **1 — Nav oculto al hacer scroll hacia abajo.** Composable nuevo
  `app/features/shell/logic/useNavScrollReveal.ts` (mecánica de
  `useCursorSpotlight.ts`: listener pasivo, rAF-coalesced,
  `onScopeDispose`): visible en los primeros 80px desde el tope en cualquier
  dirección; pasado ese umbral se oculta solo tras 10px continuos de scroll
  hacia abajo (inmune al rebote/bounce móvil); reaparece de inmediato al
  subir, sin umbral; nunca se oculta con el menú móvil abierto (evita el
  problema de containing block de un `transform` activo sobre el panel
  `fixed` de `MobileMenu.vue`); instantáneo bajo `prefers-reduced-motion`.
  `SiteNav.vue` consume el composable vía una clase `site-nav--hidden`
  (`transform: translateY(-100%)`), `position: sticky` intacto. CDP
  (390×844 y 1440×900) confirmó los seis subpuntos 1a–1f contra
  `.output/public` real.
- **2 — Logo mobile, solo isotipo.** `Lockup.vue` gana
  `hideWordmarkBelowLg` (default `false`); `SiteNav.vue` lo pasa,
  `SiteFooter.vue` no — footer sin cambios en ningún ancho. Documentado en
  ambos componentes como divergencia humana explícita del `.pen` (Roberto,
  2026-09-09, misma clase que quitar "Proyectos"), no una corrección.
  Verificado en `pnpm generate`, ambos locales: wordmark oculto en nav móvil,
  visible en nav desktop y en footer (mobile y desktop).
- **3 — Spotlight del cursor, más chico.** Investigado: el campo exterior y
  el núcleo son dos capas de `radial-gradient()` en el mismo elemento, no dos
  elementos redundantes. Por instrucción literal de Roberto ("achicar el más
  grande, dejar el más chico"), solo `--spotlight-outer-size` se redujo a la
  mitad (41.25rem → 20.625rem / 660px → 330px) en `global.css`;
  `--spotlight-core-size` intacto. Documentado como primera pasada de
  calibración, no valor final. **Roberto confirmó visualmente el nuevo
  tamaño por capturas antes/después (1440px, mismo punto de mouse) antes de
  que el reviewer aprobara** — no hace falta otra pasada por ahora.

El reviewer verificó los tres puntos de forma independiente vía CDP real
(`Emulation.setDeviceMetricsOverride` + `Input.dispatchMouseEvent`), sin
reusar las cifras del implementer, y confirmó los seis primitivos congelados
(`SectionGlow`, `DotGrid`, `SectionBackdrop`, `Radar`, `Pill`,
`BotonPrimario`) sin diff.

`./init.sh` exit 0 · `pnpm check`/`typecheck`/`test` (728/728)/`generate`/
`storybook:build` todos verdes.
- Implementer: `docs/harness/progress/impl_nav_scroll_hide_mobile_logo_and_spotlight_size.md`.
  Reviewer: `docs/harness/progress/review_nav_scroll_hide_mobile_logo_and_spotlight_size.md`.
- `feature_list.json`: feature id 26 status `reviewing` → `done`.

## 2026-09-09 — Feature 27: nav_hide_clipping_bug_and_root_redirect_flash

- Bug: the nav (`SiteNav.vue`) stayed visibly clipped mid-hide at `lg` —
  `translateY(-100%)` only moved it by its own 72px height, but the pill sits
  at `top: 24px` (`--spacing-nav-pill-y`, feature 21), so 24px stayed poking
  into the viewport. Root cause confirmed live via CDP (headless Chrome,
  isolated profile, real `Emulation.setDeviceMetricsOverride` + stepped
  `scrollTo`), not by reading the CSS. Fixed with an `lg`-only
  `translateY(calc(-100% - var(--spacing-nav-pill-y)))` override. Feature 26's
  full behaviour (80px zone, 10px hysteresis, immediate upward reveal,
  menu-open override, reduced-motion) re-verified intact.
- `public/index.html`: added an inline `<style>` (still dependency-free) —
  `body { background-color: #262626 }` fixes the white flash before the
  meta-refresh fires; `a { color: #262626 }` makes the `<a href="/es">`
  fallback link match the background instead of contrasting, without
  `display:none`/`visibility:hidden`/removal — still in the DOM, tab order
  and focusable. Verified live via CDP (`Fetch` domain aborting the
  refresh's follow-up request to freeze the root document for measurement).
- Process change recorded in this same feature: the leader no longer
  commits/merges/pushes without Roberto's explicit confirmation each time.
- `./init.sh` exit 0 · `pnpm check`/`typecheck`/`test` (728/728)/`generate`/
  `storybook:build` all green — run independently by both implementer and
  reviewer.
- Implementer: `docs/harness/progress/impl_nav_hide_clipping_bug_and_root_redirect_flash.md`.
  Reviewer: `docs/harness/progress/review_nav_hide_clipping_bug_and_root_redirect_flash.md`.
- `feature_list.json`: feature id 27 status `reviewing` → `done`.

## 2026-09-09 — Feature 28: nav_end_group_order_and_gap (done)

- Branch `fix/nav-end-group-order-and-gap`, `sdd: false`. Two small, explicit
  human requests on top of feature 25's `.pen`-verified nav-end order.
- **Order.** `SiteNav.vue`'s `.nav-row__end`: moved `.site-nav__cta` back
  before `<LanguageToggle>` — CTA left, language toggle right (the
  rightmost of the two), reversing feature 25's order. Documented as a human
  divergence (Roberto, 2026-09-09) that *replaces*, not corrects, feature
  25's `.pen` verification (`WGhSI`/`UfsGV`), which the new comment restates
  as still valid.
- **Gap.** New dedicated token `--spacing-nav-end-gap` in `global.css`
  (`clamp(0.5rem, 0.2679rem + 0.9524vw, 1.125rem)`, same fluid shape as
  `--spacing-nav-gap` scaled to ~60%: 30px→18px desktop, 14px→8px mobile),
  consumed only by `.nav-row__end` (`gap-nav-end-gap`). `.nav-row` and
  `.nav-row__links` keep `--spacing-nav-gap`/`gap-nav-gap` unchanged — no
  `.pen` value fixes the exact reduction, it's an unmeasured "un poquito"
  preference, calibrated by criterion and left recalibratable via this one
  token.
- Reviewer verified independently via CDP (fresh `pnpm generate`, headless
  Chrome, `Emulation.setDeviceMetricsOverride` 1440×900, both `/es` and
  `/en`): CTA left/toggle right confirmed in both locales;
  `.nav-row__end` computed `column-gap` 18px (was 30px, changed);
  `.nav-row`/`.nav-row__links` computed `column-gap` 30px (unchanged, both).
  Six frozen primitives confirmed untouched. `./init.sh` exit 0 (typecheck,
  biome check, 728/728 vitest, `pnpm generate`, `pnpm storybook:build`).
- **Process finding (recorded, non-blocking):** mid-task the implementer ran
  a prohibited `git checkout -- feature_list.json` to undo an unrelated
  full-file Python rewrite, which discarded the file's only uncommitted
  change at the time (the feature 28 entry itself, never committed on this
  branch). The implementer reconstructed the entry from JSON already read
  earlier in the same session and reinserted it as a single clean edit. The
  reviewer independently verified the recovery: `git diff --numstat` showed
  exactly 16 lines inserted / 0 removed, 26 total entries, all expected IDs
  present (1–11, 13–26, 28), no other file affected. No data was actually
  lost in the final state, but running a destructive git command explicitly
  prohibited by policy is a process violation regardless of outcome —
  flagged here so it isn't repeated.
- Implementer: `docs/harness/progress/impl_nav_end_group_order_and_gap.md`.
  Reviewer: `docs/harness/progress/review_nav_end_group_order_and_gap.md`.
- `feature_list.json`: feature id 28 status `reviewing` → `done`.

## 2026-10-05 — Feature 29: form_submission_integration (done)

- `sdd: true`. Spec package `specs/029-form-submission-integration/` (58
  tasks). Contract source of truth: `docs/business/landing/form-api-contract.md`
  (saved by the leader with Roberto's authorization). Human gate: Roberto
  approved OA-1..OA-6 as proposed; test sitekey corrected to the Invisible
  `…BB` key.
- `ContactForm` and `ApplicationForm` now submit for real through
  `app/features/forms/logic/`: payloads built key by key (no honeypot,
  timestamp or `cv` key; `areaRole` always a role id; `locale` read at submit
  time), a fresh Turnstile token per request with exactly one retry on
  `403 challenge_failed`, `validation_failed` mapped to field errors with
  focus on the first, 500/network/timeout to the generic error with values
  kept. Success only on `200` + `ok: true`. CV flow: `/careers/upload` → PUT
  with the server's exact headers → `/careers` with `cvId`; any upload failure
  applies without `cvId` and shows the approved CV note (ES/EN).
- Config: `runtimeConfig.public.{formsApiBaseUrl, turnstileSiteKey}`, read
  only in `logic/useFormSubmission.ts`; `.env.example` declares both.
  The only `fetch(` in `app/` is `forms/logic/formsApiClient.ts`.
- Review: round 1 REJECTED (replacement no-fetch guard tests weaker than the
  016/020 ones), round 2 REJECTED (regex missed `fetch (` and calls split
  across lines), round 3 APPROVED. Guards now `\bfetch\s*\(` at source level
  (single call site across `app/`, none in `forms/ui/`) and artefact level
  (exactly one call in the form chunks); the reviewer confirmed them with
  probes, then restored the files.
- `./init.sh` exit 0: typecheck, Biome, 72 files / 908 tests, `pnpm generate`,
  `pnpm storybook:build`.
- **Go-live prerequisites (owned by Roberto, not done by this feature):**
  - The real Invisible Turnstile sitekey and the Form Submission API base URL
    must reach the production `pnpm generate` env. The deploy workflow was
    not touched; until it is wired, production builds fall back to the
    `nuxt.config.ts` defaults (the Cloudflare test sitekey `…BB` and the
    contract § 1 API URL).
  - The backend routes still return 404 (the infra apply is half done). All
    verification so far is against a mocked `fetch` and a fake Turnstile.
  - The reset+execute fresh-token-per-request behavior is unverified against
    real Cloudflare.
  - The CV note's styling has no design frame (it reuses the body-copy role)
    and is unconfirmed by design.
  - Data-processing consent (OA-6) is out of scope; if it is needed before
    go-live it is a separate feature with its own approved copy.
- Implementer: `docs/harness/progress/impl_form_submission_integration.md`.
  Reviewer: `docs/harness/progress/review_form_submission_integration.md`.
- `feature_list.json`: feature id 29 status `reviewing` → `done`.

## 2026-10-13 — Feature 31: cv_upload_no_silent_loss (done)

- Hotfix requested by Roberto. A chosen CV is never dropped in silence. If
  `/careers/upload` or the S3 PUT fails, `/careers` is not sent. The form
  then enters `cv-upload-error`, which offers "Reintentar subida" / "Enviar
  sin CV" (EN "Retry upload" / "Submit without CV").
  - Every attempt asks for a new grant and new Turnstile tokens.
  - The PUT sends only `content-type`, taken from the grant, and counts as
    done only on status 200.
  - While the CV uploads the button reads "Subiendo CV…".
  - A non-PDF file, or one larger than 5242880 bytes, is refused the moment
    it is selected, with no request.
  - Feature 29's CV success note is removed.
  - A static test checks that the forms code has no `console.` and that
    `app/` imports no analytics or Sentry SDK.
- New UI: `forms/ui/CvUploadError.vue`, and `forms/ui/CvField.vue`. The
  `CvField` wrapper (research R9 fallback) keeps `ApplicationForm.vue` at 199
  lines.
- `./init.sh` exit 0 (73 files / 965 tests, generate, storybook build).
- Gate: Roberto approved the spec on 2026-10-13 (OA-2 copy as given, OA-3
  PUT 60 s, OA-4 a retry continues the submission). Reviewer APPROVED.
- **Still open:**
  - OA-1: `docs/business/landing/form-api-contract.md` needs a human
    rewrite. § 4 ("send the headers exactly as returned"), § 7.5 and the
    last bullet of § 9 still describe the old behaviour.
  - OA-5 / T055: the `CvUploadError` visuals are unverified against the
    `.pen`, and nobody has looked at them in Storybook yet. Stories:
    `Forms/ApplicationForm` → `Uploading`, `CvUploadError`,
    `CvUploadErrorEnglish`; `Forms/CvUploadError`.
  - Infra: the CV bucket's CORS rule must allow origin `https://muush.dev`,
    method `PUT` and header `content-type`. Until then every production CV
    upload ends in the CV error.
- Implementer: `docs/harness/progress/impl_cv_upload_no_silent_loss.md`.
  Reviewer: `docs/harness/progress/review_cv_upload_no_silent_loss.md`.
- `feature_list.json`: feature id 31 status `reviewing` → `done`.

## 2026-10-14 — Feature 32: whatsapp_dial_code_selector (done)

- Both forms show a dial-code selector before the WhatsApp number. It is a
  native `<select>` with a face showing the emoji flag and the dial code.
  The list has 245 countries in a static module (`forms/data/countries.ts`).
  Names come from `Intl.DisplayNames` in the page language and are sorted
  with that language's collation. No new dependency.
- The default country comes from the region of `navigator.languages`, read
  on the first switch to WhatsApp, never at setup. Fallback is Mexico (+52).
  No network request. A country the visitor picked is kept across
  email↔WhatsApp; the number is still discarded.
- New contract (backend agreement 2026-10-14): `whatsappDialCode`
  (`^\+[1-9]\d{0,3}$`) is sent before `whatsapp`, only with WhatsApp.
  `whatsapp` is 6–14 digits without the dial code. A 400 `validation_failed`
  naming `whatsappDialCode` marks the selector (alias to `whatsappCountry`).
  With preference email it is a generic error. A country mark is ignored
  while the preference is email.
- Copy (OA-8): "Lada del país" / "Country code", "Elige la lada de tu país" /
  "Choose your country code", "Deben ser entre 6 y 14 dígitos" / "Must be 6
  to 14 digits".
- `./init.sh` exit 0 (76 files / 1072 tests, generate, storybook build). No
  new origin in `.output/public`. `ApplicationForm.vue` at 199 lines.
- Gate: Roberto approved the baseline proposals on 2026-10-14 (OA-3..OA-9;
  OA-6 C not built). Reviewer APPROVED.
- **Still open:**
  - OA-1: `docs/business/landing/form-api-contract.md` § 3/§ 5 and
    `ui-map.md` § 7 still describe the 10-digit rule. They need a human
    rewrite.
  - OA-2: do not deploy before the backend accepts `whatsappDialCode`.
  - OA-10: the selector's visuals are unverified against the `.pen`.
  - T036 (VoiceOver/keyboard pass) and T044 (manual quickstart in
    `pnpm dev`, Windows flag rendering) are still pending as manual checks.
  - The face's focus-ring colour (`outline: auto` + red-400) still needs a
    visual check in Safari and Firefox.
  - Dial codes were checked from knowledge only, not against the ITU-T
    E.164 list.
- Implementer: `docs/harness/progress/impl_whatsapp_dial_code_selector.md`.
  Reviewer: `docs/harness/progress/review_whatsapp_dial_code_selector.md`.
- `feature_list.json`: feature id 32 status `reviewing` → `done`.

## 2026-10-14 — Feature 32 Amendment A1: default country from `GET /__geo` (done)

- The WhatsApp dial-code selector defaults to Mexico. It switches to the
  country from a same-origin `GET /__geo` when that answer is a valid ISO
  alpha-2 code in the list. The request goes out on the first focus in the
  form or on switching to WhatsApp, at most once, and is aborted after 3 s.
  It sends no credentials and goes to no third party. A late answer never
  overwrites a country the visitor picked. The browser language is no longer
  read. Null, malformed or unknown answers, errors and timeouts all leave
  Mexico in place silently.
- Code: `forms/logic/edgeCountry.ts` (the only new `fetch(` site),
  `forms/logic/useDefaultCountry.ts` (shared rule), and an optional
  `lookupCountry?` port on both submitters. No `.vue`, copy or dependency
  change. Without the edge (dev, preview, Storybook, tests), `/__geo` returns
  404 and the default is Mexico.
- `./init.sh` exit 0 (78 files / 1120 tests). Reviewer APPROVED.
- Deviations accepted at review:
  - `tests/forms-config.test.ts` now allows exactly two `fetch(` sites.
  - The `navigator.languages` artifact check is scoped to the `/__geo`
    chunk, because the `@nuxtjs/i18n` entry chunk ships its own helper.
- **Still open:**
  - OA-1: `docs/business/landing/form-api-contract.md` § 3/§ 5 and
    `ui-map.md` § 7 (10-digit rule and "default México") need a human
    rewrite.
  - OA-2: the backend must accept `whatsappDialCode` before this front is
    deployed.
  - OA-10: the selector's visuals are unverified against the `.pen`.
  - Browser-only checks are still pending:
    - T036: VoiceOver/keyboard.
    - T044: manual quickstart and Windows flags.
    - T066: the browser parts (Network panel, DevTools override of
      `/__geo`, the slow-network "pick first" check).
    - The focus ring in Safari and Firefox.
  - `contracts/edge-geo-endpoint.md` still has to be handed off to
    muush-foundation. Until that ships, every visitor gets Mexico.
  - Dial codes have not been checked against the ITU-T E.164 file.
  - Reviewer notes (non-blocking):
    - `/__geo` is requested once per page view, so client-side navigation
      can request it again. That is looser than a strict reading of FR-A08
      ("once per page load").
    - An optional test pinning `detectBrowserLanguage: false` would be
      useful.
- Implementer: `docs/harness/progress/impl_whatsapp_dial_code_selector.md`
  § Amendment A1. Reviewer:
  `docs/harness/progress/review_whatsapp_dial_code_selector_a1.md`.
- `feature_list.json`: feature id 32 status `reviewing` → `done`.

## 2026-10-15 — Feature 34: services_float_and_custom_cursor (done)

- **Float (desktop):** the five Services nodes float vertically in
  "zero gravity", out of phase, driven by one shared CSS clock (registered
  `@property` angle + `sin()`). Text moves with its radar, the radar ping is
  kept, and the connector ends stay on the radar centres (headless Chrome:
  ≤0.0001 px at 1024/1280/1440/1920 and at a 20 px root). Connectors were
  extracted to `ServicesConnectors.vue`. This also fixes the pre-existing
  OA-3 misalignment at 1024–1439 px. With reduced motion, nothing floats.
- **Float (mobile/tablet trial, D-3):** `ServicesTimeline.vue` rows float
  too, in a fenced block with its own test. Roberto reviewed it locally and
  decided to KEEP it (T024).
- **Brand cursor:** `public/cursor/you.svg` (from Roberto's `01-Mouse.svg`,
  white `<rect>` removed) at 64×64 with hotspot `1 9`. It is used for the
  default and pointer states, falls back to the native cursors, and text
  fields keep the native I-beam. Touch is unaffected.
- **Amendment A2 (spotlight):** the red glow that followed the cursor is
  removed, along with its tokens. The paper dots near the pointer now turn
  `--red-400` (`--dot-paper-lit-color: var(--red-400)`), fading with
  distance over `--spotlight-lit-radius: 7.5rem`. No new colour token.
- **A2 revision 1 (footer):** Roberto reversed footer option A. The footer
  keeps its flat `bg-ink-500`, so the red dots do not show over it. OA-9 is
  moot.
- `./init.sh` exit 0 (83 files / 1169 tests). Reviewer APPROVED in round 3
  after Roberto's acceptance ("me encanta cierra la tarea", relayed by the
  leader).
- Deviations accepted at review:
  - Each connector gets one frame-sized outer `<svg>` that carries the
    shear. A CSS transform on an SVG `<line>` forced a layout every frame
    in Chromium (findings § R67).
  - `brand-cursor.test.ts` accepts the build's `url(../cursor/you.svg)`
    rewrite. An extra test resolves it against the stylesheet
    (findings § R69).
  - An XML-comment `--` defect in the cursor asset was fixed, with a guard
    test (findings § R68).
  - The cursor rule lists `input` whole, and a later rule takes the text
    types back.
  - The `CursorSpotlight` story demo sentence now reads "se vuelven
    rojos", and a `global.css` comment was reworded ("teñirlos").
- **Still open:**
  - The per-browser matrix is UNVERIFIED: Safari/Firefox, Retina/3× DPR,
    high contrast, reduced motion and the cursor URL on nested routes.
    T013, T015, T020, T039 and T046 were closed on Roberto's acceptance,
    with only Chrome evidence behind them.
  - For Roberto to edit in `docs/business/`: `rules.md` § R37
    (`--layer-spotlight` row), `rules.md` § R38 (lit-dot brightness), and
    `landing/ui-map.md` § 10 (spotlight row and the *Spotlight del cursor
    (receta)* paragraph). They still describe the glow.
  - The `.pen` frame `gViAx` "DEMO spotlight cursor" still draws the two
    removed red circles at the old size. Roberto and the leader decide
    whether to update it.
  - Two stale "light" comments in `app/shared/logic/useCursorSpotlight.ts`
    (lines 142 and 170) need a later comment-only sweep.
- Implementer: `docs/harness/progress/impl_services_float_and_custom_cursor.md`.
  Reviewer: `docs/harness/progress/review_services_float_and_custom_cursor.md`.
- `feature_list.json`: feature id 34 status `reviewing` → `done`.

## 2026-10-15 — Feature 35: technical_seo_indexing (done)

*(Entry written late, at the close-out of feature 33: features 35 and 36 were merged without their history entry — C6 gap, recorded rather than backdated.)*

- Per-page translated title/description (`usePageSeo`), Open Graph + `twitter:card summary`, global JSON-LD `Organization` (logo `https://assets.muush.dev/brand/logo/ink500.png`, `sameAs` from `socialProfiles.ts`), `sitemap.xml` with hreflang alternates and `robots.txt`.
- Modules: `@nuxtjs/sitemap` ~8.6.2, `@nuxtjs/robots` ~6.2.4, `nuxt-schema-org` ~6.4.3 — the majors before the ones requiring Nuxt ^4.6 (repo on 4.5.2). English locale `en` → `en-US`.
- Review: round 1 CHANGES_REQUESTED (ReadAction asymmetry between `/es/nosotros` and `/en/about`; no cross-locale JSON-LD test) → round 2 APPROVED. Deviations accepted: `sitemap.excludeAppSources` (duplicate About URLs), `useSchemaOrg` server-only (~35 KB kept off the client).
- Closed `done` on Roberto's explicit authorization. Still open: `og:image` (1200×630) TODO in `siteIdentity.ts`; "technology solution studio"/"talent pool" stay English in both locales (business rule for `docs/business/`).

## 2026-10-15 — Feature 36: not_found_page (done)

*(Entry written late — see the note on feature 35.)*

- `app/error.vue` prerenders `es/404/index.html` and `en/404/index.html`, reusing `Pill`, `BotonPrimario`, the layout and the existing glow, plus new `NotFoundRings`. noindex, no canonical/hreflang/og:url/og:locale; the visitor's URL is kept (`payload.path` removed server-side, guarded by an output test). Nav CTA absent on the error page; nav kept at 72 px. `200.html`/`404.html` no longer written.
- Language: Stage 1 at the edge serves the English 404 for every missing path (G5); a runtime-rendered 404 picks `/es…` → es, anything else → en (G6). Edge contract `specs/036-not-found-page/contracts/edge-not-found.md` is Roberto's to apply in muush-foundation.
- Review: round 1 CHANGES_REQUESTED (G6 doc alignment, payload test, test names) → round 2 APPROVED. Closed `done` on Roberto's explicit authorization.
- Deploy risk: `deploy.yml` runs `s3 sync --delete`, so `200.html`/`404.html` leave the bucket on the next deploy; Stage 1 must be applied right after.

## 2026-10-15 — Feature 33: ip_locale_root_redirect (done)

- This repository's part: the language toggle writes the first-party cookie `muush_locale=<es|en>; Path=/; Max-Age=31536000; SameSite=Lax; Secure` on an explicit click only (never on load; no PII; without JS the toggle is still a plain link). Shared test helper `localePreference.testing.ts` (past `Expires`) fixed a happy-dom flake with `Max-Age=0`.
- Edge part (Roberto applies in muush-foundation): `contracts/edge-root-locale-redirect.md` — `/` only, 302 from `request-router` via `cloudfront-viewer-country`, cookie beats country, `/es` for AR BO CL CO CR CU DO EC ES GT HN MX NI PA PE PR PY SV UY VE GQ (US excluded), anything else → `/en`, `cache-control: private, no-store`, replaces today's reported 301 (step 0: record its headers). Never reads, logs or forwards the IP.
- Gate G1–G8 approved as recommended (Roberto, 2026-10-15). Feature 37 (English default) untouched: `/` still → `/es` via `public/index.html` until 37.
- Review: round 1 CHANGES_REQUESTED (flaky cookie-cleanup test; FR wording) → round 2 APPROVED. Closed `done` on Roberto's explicit authorization. `./init.sh` exit 0, 95 files / 1342 tests.
- Open for Roberto (`docs/business/`, human-only): `ui-map.md` § 1 (no-IP rule revoked for `/`; localStorage memory never built), `ui-map.md`/`decisions-open.md` root → `/es`, `messaging.md` rule 4; where the country list lives as a business rule. Privacy notice: the site has none while forms collect personal data — proposed as a separate feature, not yet registered.

## 2026-10-16 — Feature 30: english_file_names (done)

- Pure rename via `git mv`: `app/pages/nosotros.vue` → `about.vue`, `app/shared/ui/BotonPrimario.*` → `PrimaryButton.*`, `app/assets/logo/isotipo-on-*.svg` → `logomark-on-*.svg`. i18n route key `nosotros` → `about`; public URLs `/es/nosotros` and `/en/about` unchanged. Story title `Shared/UI/PrimaryButton`.
- Built HTML identical to the baseline modulo build hashes (one scoped `<style>` block reordered, no shared selectors). Current docs updated; `docs/business/` edited only for the three PrimaryButton renames (authorized by Roberto). Closed specs, history and earlier feature entries untouched.
- Review: APPROVED round 1. Closed `done` on Roberto's explicit authorization. `./init.sh` exit 0, 1342 tests.
- Open: "isotipo" remains in the `--spacing-isotipo` token, comments and SVG `<title>` text (out of scope — possible separate feature). Findings R74: pre-existing i18n `cached-locale-configs` prerender nondeterminism.
- Implementer: `docs/harness/progress/impl_english_file_names.md`. Reviewer: `docs/harness/progress/review_english_file_names.md`.

## 2026-10-16 — Feature 37: english_default_locale (done)

- i18n `defaultLocale: 'en'`, `rootRedirect: '/en'`; `site.defaultLocale` left derived (effective `en-US`, now asserted). `public/index.html` → `lang="en-US"`, refresh/canonical/x-default/fallback to `/en`.
- x-default per page: both homes → `https://muush.dev/en`, About pair → `/en/about` (D4). Canonical, lang and og:locale unchanged; sitemap still the same 4 URLs (only x-default lines changed); JSON-LD valid, translation links reversed (D5). Page bodies identical to master on all 6 docs.
- Constitution Article VI amended 2.0.0 → 2.0.1 (Roberto ratified 2026-10-16). README i18n section rewritten (was still describing Astro).
- Phase A audit (39 items) approved by Roberto before any change (D1–D9 as recommended). Review: APPROVED round 1. Closed `done` on Roberto's explicit authorization. `./init.sh` exit 0, 1347 tests.
- Open for Roberto (`docs/business/`, human-only): `landing/ui-map.md` lines 22 and 33–36, `landing/decisions-open.md` line 148, `messaging.md` lines 40–42. Not verified from this repo: `nuxt dev` redirect of `/` (INFERRED from i18n source) and whether the edge still serves the old fixed 301.
- Audit: `docs/harness/progress/audit_english_default_locale.md`. Implementer: `impl_english_default_locale.md`. Reviewer: `review_english_default_locale.md`.

## 2026-10-19 — Feature 38: tablet_layout_and_pill_fixes (done)

- Forms (home Contact and About Work with muush): two columns from 64rem with tracks proportional to the 1440 composition; stacked below 1024. No horizontal overflow of any control 1024–1279 in either locale. (A round-1 stack below 80rem was rejected by Roberto after testing on iPad.)
- Services constellation: x positions proportional to width (cqw frame) with a 180px floor for node text; 1440 unchanged.
- Pills: section Pills (Servicios, Delivery) sit on `--spacing-page`, sharing x with Propósito and Contacto; Pill size untouched (measured equal in Chrome).
- Propósito: carousel active-card detection fixed (IntersectionObserver centre strip, `rootMargin 0px -49.5%`, instead of the 75%-visible threshold that froze on Why); carousel scrollbar hidden (scoped `scrollbar-width: none` + `::-webkit-scrollbar`); constellation only on `(width >= 64rem) and (hover: hover) and (pointer: fine)` via one Tailwind `@custom-variant constellation` in `global.css`, carousel everywhere else (touch at any width). CSS only, no JS/UA detection.
- Rounds: four implementer rounds driven by Roberto's iPad tests; reviewer APPROVED rounds 1–4 (round 4: one version per mouse/touch case, 1440 mouse = master 0 px). `./init.sh` exit 0, 96 files / 1375 tests. Closed `done` after Roberto verified on iPad and computer ("esta perfecto … todo perfecto").
- Open follow-ups (both pre-existing on master): long unbroken CV filename overflows `FileField.vue` (more visible 1024–1279 now); ~3px ES select clip at 390. Real Safari/iPad checked by Roberto visually only; Firefox not checked on a real device.
- Audit: `docs/harness/progress/audit_tablet_layout_and_pill_fixes.md`. Implementer: `impl_tablet_layout_and_pill_fixes.md`. Reviewer: `review_tablet_layout_and_pill_fixes.md`.

### Session log (from current.md)

- 2026-10-19 · `./init.sh` exit 0 on master. Feature 38 registered as pending from Roberto's report (iPad Air 13" screenshot + annotated home screenshot). Leader inference (computed, not measured): both form sections go two-column at 64rem with fixed clamp widths that only fit from ~1440px. ⏸ Waiting for Roberto's gate.
- 2026-10-19 · ⏸ Gate passed: Roberto approved starting feature 38 ("si, lo apruebo"). Status → in_progress; branch feat/tablet-layout-and-pill-fixes. implementer phase A (read-only) launched.
- 2026-10-19 · Phase A audit delivered (docs/harness/progress/audit_tablet_layout_and_pill_fixes.md). Pencil app not running → .pen questions Q1–Q4 unanswered; implementer told to keep 1440 values unchanged.
- 2026-10-19 · ⏸ Gate passed (acceptance item 1): Roberto decided D1 80rem stack, D3 centred button, D4 full-width text, D5 Services constellation in scope and made narrower (proportional), D6 Pill size untouched / only x alignment. Added: Propósito shows the mobile carousel below 80rem. Acceptance updated. implementer phase B launched.
- 2026-10-19 · Feature 38 phase B implemented (not committed): forms stack below 80rem with proportional tracks above it; Propósito switches to the carousel below 80rem; the Services constellation scales on x (cqw frame) with a 180px text floor; Servicios and Delivery Pills sit on --spacing-page. ./init.sh exit 0 (1363 tests). 1440 differs from master by at most 0.03px (--spacing-page lays out at 79.98). Report: docs/harness/progress/impl_tablet_layout_and_pill_fixes.md. Ready for reviewer.
- 2026-10-19 · Implementer phase B report received (docs/harness/progress/impl_tablet_layout_and_pill_fixes.md; init.sh exit 0, 1363 tests). Status → reviewing; reviewer launched.
- 2026-10-19 · Reviewer (38): APPROVED round 1 (init.sh exit 0, 1363 tests; 1440 shifts ≤0.031 px, antialiasing only; non-blocking: tablet carousel look, two layout widths, touch ≥1280 gets constellation, 320 Services closer overflow pre-existing on master). Awaiting Roberto OK for done.
- 2026-10-19 · Roberto tested on iPad (screen recording): carousel stuck on Why at tablet width; forms: rejects stacking, wants text + form side by side from 1024 and fitting. Acceptance updated, status → in_progress (reviewing round 1 superseded by human feedback). implementer relaunched.
- 2026-10-19 · Feature 38 round 2 implemented (not committed): carousel active card now detected with a 1%-wide centre strip (IntersectionObserver rootMargin `0px -49.5%`, threshold 0) instead of the 75%-visible threshold that froze on Why once all three cards fit in the track (~760 px up); swipe/dots/arrows verified 320–1279 under touch emulation. Both forms back to two columns from 64rem with the proportional tracks; every control fits 1024–1279 in both locales. ./init.sh exit 0 (1365 tests). Report: docs/harness/progress/impl_tablet_layout_and_pill_fixes.md § Round 2.
- 2026-10-19 · Implementer round 2 done (carousel active-card observer fix; forms two-column from 64rem with proportional tracks; init.sh exit 0, 1365 tests). Open: long unbroken CV file name overflows FileField (pre-existing on master) → asked Roberto. Status → reviewing; reviewer round 2 launched.
- 2026-10-19 · Reviewer (38) round 2: APPROVED (init.sh exit 0, 1365 tests; carousel follows swipe/dots/keys 390–1279 ES/EN; forms two-column ≥1024 no overflow). Non-blocking, pre-existing on master: long unbroken CV filename overflow (wider 1024–1279 now), ~3 px ES select clip at 390. Awaiting Roberto OK for done.
- 2026-10-19 · Roberto (iPad screenshots): carousel shows a horizontal scrollbar while swiping; wants it hidden in every carousel at every size. Acceptance item added, status → in_progress, implementer round 3 launched.
- 2026-10-19 · Feature 38 round 3 implemented (not committed): the only horizontal scroller in app/ (PurposeCarousel .track) hides its scrollbar (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`, scoped); swipe/snap/dots/keys verified 390/1024 ES/EN in headless Chrome, page scrollbar untouched; 3 new tests; ./init.sh exit 0 (1368 tests). Real-device iPad/Firefox check pending. Report: docs/harness/progress/impl_tablet_layout_and_pill_fixes.md § Round 3.
- 2026-10-19 · Implementer round 3 done (PurposeCarousel .track scrollbar hidden; init.sh exit 0, 1368 tests). Status → reviewing; reviewer round 3 launched. Pending Roberto: add touch (hover:none) → carousel at any width?
- 2026-10-19 · Roberto: Propósito by input type — mouse/trackpad desktop → hover constellation, touch → carousel. Leader set the width floor back to 64rem for pointer devices (the 80rem move was only for the iPad). Acceptance item rewritten; implementer round 4 to launch after reviewer round 3 finishes (avoid concurrent builds).
- 2026-10-19 · Reviewer round 3: APPROVED (scrollbar hidden; init.sh exit 0, 1368 tests). Status → in_progress for round 4 (Propósito by input type); implementer launched.
- 2026-10-19 · Feature 38 round 4 implemented (not committed): Propósito switches on one Tailwind `@custom-variant constellation` = `(width >= 64rem) and (hover: hover) and (pointer: fine)` in global.css (section, arcs, origin glow, carousel, card label/weight); 80rem switch and the dead `(hover: none)` reveal block removed. Headless Chrome ES/EN: mouse 390/1023 carousel, 1024/1280/1440 constellation (hover + focus-visible reveal OK); touch 390/768/1024/1180/1366 carousel (swipe + dots OK); exactly one version each time. ./init.sh exit 0 (1375 tests). Report: docs/harness/progress/impl_tablet_layout_and_pill_fixes.md § Round 4.
- 2026-10-19 · Implementer round 4 done (@custom-variant constellation; init.sh exit 0, 1375 tests). Status → reviewing; reviewer round 4 launched.
- 2026-10-19 · Reviewer round 4: APPROVED (init.sh exit 0, 1375 tests; one version per mouse/touch case; 1440 mouse = master 0 px). Real iPad/Safari unverified. Awaiting Roberto iPad test + OK for done.
- 2026-10-19 · Roberto verified on iPad and computer ("esta perfecto … todo perfecto") in answer to the done question. implementer launched to close out (done + history).
- 2026-10-19 · Feature 38 → done (Roberto's OK); ./init.sh exit 0 (1375 tests); history entry written, current.md reset.

## 2026-10-20 — Feature 39: not_found_locale (done)

- Contract (docs only): `specs/036-not-found-page/contracts/edge-not-found.md` § 4–§ 8 rewritten for Stage 2.
  - A Lambda@Edge origin-response on the HTML behaviour picks the 404 document by cookie `muush_locale` > path prefix `es`/`en` > `CloudFront-Viewer-Country` (feature 33 list, referenced not copied) > `en`.
  - The response is a 404 in place, `noindex`, with no `Set-Cookie`, `private, no-store`, and `error_caching_min_ttl = 0`.
  - `muush_locale` is whitelisted in the `viewer_country` origin request policy, and the cache key is unchanged.
  - Stage 1 is kept as the safety net. Verification is L-1…L-19 and E-0, V-1…V-13.
  - Roberto applies it in muush-foundation; it was only read from here.
- Feature 33 cookie contract § 4 amended (Roberto, 2026-10-20). The edge reads `muush_locale` at `/` and on the not-found responses; the edge-not-found § 8 note was updated to match.
- Site: on the 404 the ES/EN toggle switches language in place.
  - It loads the messages, then assigns `locale`, with no `setLocale()` and no navigation.
  - The URL is kept and the cookie is written. Links, nav, footer, `<html lang>` and the title follow the locale.
  - With scripting off, the href is the other home. If the messages fail to load, it falls back to that href.
  - Off the 404 the toggle is unchanged.
- Round 2 (Roberto, 2026-10-20):
  - The open mobile menu closes after an in-place switch made from inside it.
  - `MobileMenu.vue` is back under 200 lines (199).
  - Unit tests added for the fallback (`switchLocaleWithFallback`) and the title getter (`notFoundSeoMeta`).
- Reviewer APPROVED rounds 1 and 2. Headless Chrome at 390 (es/404 at `/fr/abc`, en/404 at `/es/abc`, regression on `/en/about`). `./init.sh` exit 0, 98 files / 1395 tests.
- Open follow-ups for Roberto (both pre-existing, not changed here):
  - Focus return on menu close in `SiteNav.vue` (`watch(isOpen)`). It likely needs `flush: 'post'`, because the nav row is still `inert` when the watcher runs. It dates from 6d50ad8 and is UNVERIFIED in a browser.
  - On pages other than the 404, the open mobile menu stays open after its navigating language toggle is used.
- Still open on the infrastructure side: E-0, whether CloudFront re-applies `custom_error_response` over a function-generated 404, must be tested in muush-foundation before production.
- Implementer: `impl_not_found_locale.md`. Reviewer: `review_not_found_locale.md`.

### Session log (from current.md)

- 2026-10-19 — Feature registered with Roberto's decisions (B, cookie > URL > IP, in-place toggle, contract only).
- 2026-10-20 — Reviewer APPROVED round 1. Roberto approved: status → reviewing; amend the feature 33 cookie contract; close the mobile menu after an in-place switch. No commits until Roberto says so.
- 2026-10-20 — Implementer round 2 done (menu closes after in-place switch; MobileMenu 199 lines; fallback and title tests; cookie contract amended). Reviewer APPROVED round 2.
- 2026-10-20 — Feature 39 → done; history entry written, current.md reset. Not committed (Roberto's instruction).

## 2026-10-20 — Feature 40: html_edge_cache_s_maxage (done)

- Change (sdd: false): the `Upload HTML/payload/other files` step of `.github/workflows/deploy.yml` now uploads with `public,max-age=0,s-maxage=300,must-revalidate`. Browsers still revalidate on every visit, and CloudFront keeps the HTML for 5 min (inside the html cache policy's max_ttl 3600).
  - Step name and comment updated. The `_nuxt/`/`_fonts/` step (`public,max-age=31536000,immutable`) is untouched.
  - `Invalidate CloudFront cache` is commented as the step that must stay last (`/*`), after both uploads and `--delete`.
  - `specs/036-not-found-page/contracts/edge-not-found.md` § 4.5 note and § 5 Stage 1 cell record the header. Stage 2 Lambda 404s stay `private, no-store`.
  - No app/ or tests/ change. typecheck/lint/test/generate and `./init.sh` exit 0.
- Reviewer APPROVED (acceptance #6 left for after the production deploy).
- Leader note: contract edge-not-found § 7 V-8 reworded to the new header.
- Deployed as v1.7.3.
- Post-deploy evidence:
  - Create release run 39538804706 success; deploy steps ran upload → `--delete` → invalidation `/*` in order (CONFIRMED from the run).
  - `aws s3api head-object --key es/index.html` → `CacheControl: "public,max-age=0,s-maxage=300,must-revalidate"` (CONFIRMED, run by Roberto).
  - `curl -sI https://muush.dev/es`: 2 misses, then 6 consecutive `Hit from cloudfront` with `age` 7→14 on POP MIA3-P3; `/en/about` Hit with age (CONFIRMED).
- "Text change visible right after a deploy": NOT RUN. Roberto chose to defer it to the next deploy that changes copy (decision 2026-10-20, option b). Whether the invalidation reached `Completed` status in CloudFront was not checked (UNVERIFIED); only the create-invalidation step's success is confirmed.
- Pre-existing, not a regression: the Stage 2 Lambda's in-memory 404 body can lag up to 300 s after a deploy.
- Implementer: `impl_html_edge_cache_s_maxage.md`. Reviewer: `review_html_edge_cache_s_maxage.md`.

### Session log (from current.md)

- 2026-10-20 · `./init.sh` green. Leader pre-checks (read-only): `Invalidate CloudFront cache` is the last deploy step and invalidates `/*` (CONFIRMED, deploy.yml:158-162); `/` (302) and `/__geo` are answered by `request-router` at viewer-request with `private, no-store` and never reach S3 (CONFIRMED from contracts 033 § 4 and 036 F29); no preview environment or dynamic routes. Feature 40 registered as `pending`.
- 2026-10-20 · Roberto approved → `in_progress`; implementer launched.
- 2026-10-20 · Implementer PASS (deploy.yml HTML header + comments; edge-not-found.md § 4.5/§ 5; all checks exit 0) → `reviewing`; reviewer launched.
- 2026-10-20 · Reviewer APPROVED; acceptance #6 pending production deploy. Leader reworded contract § 7 V-8. Feature stays `reviewing` until post-deploy checks.
- 2026-10-20 · Deployed v1.7.3 (run 39538804706, 2026-10-21 03:33 UTC). Post-deploy header, S3 metadata and CloudFront Hit/age checks CONFIRMED; text-change check NOT run.
- 2026-10-20 · Roberto chose option (b): defer the text-change check to the next copy deploy. Feature 40 → done; history entry written, current.md reset.

## 2026-10-31 — Feature 41: v2_foundation_docs (done)

- Change (sdd: false, docs/config only, done by the leader): foundation for the Muush 1.0 / v2 redesign on branch `docs/v2-foundation` (from `muush-v2`, merges back into `muush-v2`, never master).
  - `muush-v2` integration branch created; handoff package copied to `docs/handoff/muush-1.0/` (reference to translate into Vue + Tailwind, never copied as-is).
  - v2 features 41–48 registered in `feature_list.json`; features 15, 18, 19 marked `superseded` (new status).
  - `.husky/pre-commit` allows commits on `muush-v2`; `biome.json` excludes `docs/handoff`.
  - AGENTS.md: handoff pointer, v2 branch flow, responsive anchors (390/1440 match the `.pen`; sizes/spacing may adapt in between).
  - Constitution 2.0.1 → 2.1.0: Art. VII moves to the `--m1-*` token family, Poppins 500 for headlines, responsive anchor rule; Development Workflow says design values come from the `.pen` via the leader, and v1 design documents are not a fallback. Sync Impact Report lists the templates and the agent guidance files reviewed.
  - `docs/business/muush-1.0.md` (new, authoritative for v2) and a v1 notice on `branding.md`, `landing/design-extract.md`, `landing/ui-map.md`, `landing/content.md`. Text approved by Roberto before writing (approval recorded; ordering UNVERIFIED by the reviewer).
  - `.claude/agents/implementer.md` and `spec_author.md` no longer send agents to the v1 docs for v2 design values.
  - No app/ or tests/ change. `./init.sh` exits 0.
- Reviewer run 1 REJECTED (B1: agent files contradicted the amended workflow; S1–S5, A1, A3). All fixed by the leader.
- Reviewer run 2 APPROVED. New finding N1 (duplicate "5." numbering in `implementer.md`) fixed by the leader.
- Still open for Roberto (advisory A2): `docs/business/rules.md` § R32 still names design-extract.md as the daily measurement reference. Human-owned, not edited; the constitution overrides it.
- Reviewer: `review-41.md`. Proposal: `v2-foundation-proposal.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

### Session log (from current.md)

- 2026-10-31 · Roberto: branch `muush-v2`; one 2.0.0 bump at the end; remove
  the diagnostic "sitio web o redes" field for now (backend unchanged);
  privacy checkbox gates submit and is not sent; Propósito and Proyectos are
  retired; sizes/spacing may adapt outside the 390/1440 anchors; features
  compressed to 41–47.
- 2026-10-31 · Roberto: privacy notice and terms get their own pages inside v2
  (text comes later) → feature 48; custom cursor and spotlight stay; features
  15, 18, 19 marked `superseded` (new status).
- 2026-10-31 · Roberto approved proposal A (constitution 2.0.1 → 2.1.0) and B
  (new `docs/business/muush-1.0.md` + v1 notice on branding.md,
  design-extract.md, ui-map.md, content.md). He approved the draft text,
  which now lives at `docs/business/muush-1.0.md`.
- 2026-10-31 · Roberto: Preguntas at `/es/preguntas` ↔ `/en/faq` and indexed
  ("necesitamos indexar todo"); same for the legal pages.
- 2026-10-31 · Reviewer run 1 REJECTED. Fixed: `implementer.md` and
  `spec_author.md` no longer send agents to the v1 docs for design values;
  Sync Impact Report lists the agent files; constitution clarifies "v1 design
  documents"; AGENTS.md says 41–48; feature 47 branch wording; feature 43
  legal-link criterion points at feature 48; feature 41 description matches
  the approved strategy; proposal C1 resolved.
- Open for Roberto (advisory A2): `docs/business/rules.md` § R32 still says
  design-extract.md is the daily measurement reference. It is human-owned,
  so it was not edited.
- 2026-10-31 · Reviewer run 2 APPROVED; N1 fixed by the leader. Feature 41 → done; history entry written, current.md reset.

## 2026-11-01 — Feature 42: m1_visual_foundation (done)

- Change (sdd: true): the Muush 1.0 / v2 visual foundation on branch `feat/v2-visual-foundation` (from `muush-v2`, merges back into `muush-v2`, never master). Spec package `specs/042-m1-visual-foundation/` (65 tasks, all checked); values from the `.pen` via the leader (`pen-extract-42.md`).
  - Tokens: every handoff `tokens.css` variable in `global.css` plus an `@theme inline` block (colour, font, fluid text with line-height/tracking, radii, spacing, blur, shadow, ease); `.pen` overrides for the hero heading (96 px at 1440) and large paragraph; edge (`borde-*`) and focus utilities; reduced motion zeroes the motion durations. Canvas (`html` and layout root) is Negro 950. No Google Fonts request added; Poppins 500 added to the self-hosted weights.
  - Primitives in `app/shared/ui/`: Pill, PrimaryButton, GlassButton, GlassSurface, Heading, RotatingPill (2.6 s rotation, pauses on hover, honours reduced motion, screen-reader list), ShaderBackground (client-only WebGL with the liston and acanalado shaders, poster fallback, off-screen/hidden-tab pause, single still frame under reduced motion, DPR 1x below 768 px and max 1.5x on desktop, `pointer-events:none`, `aria-hidden`). Logic in `shaderFrame`, `shaderRenderer`, `useShaderCanvas`, `useRotatingText`, `backgroundPresets`; tests and stories for each.
  - Cursor and spotlight (features 8 and 34) kept and recoloured to Red muush 500 #E5352F (`public/cursor/you.svg`, `--dot-paper-lit-color`).
  - Follow-ups: the primary button arrow is visible at every width (pen-extract § 9); forced-colours inset outline on the lit edge (review-42 S1); no draw while the tab is hidden (advisory 1).
- Naming reorganization (approved by Roberto 2026-11-01, constitution 2.1.1): no version marker in any v2 name (M1/m1 dropped from components, tokens, files and stories); v1 components moved to `app/shared/ui/legacy/` via 25 staged `git mv` renames; 8 colliding v1 tokens renamed `legacy-*`; v1 stories moved to the Storybook group `Legacy v1/`; Storybook reordered without duplicate titles. DotGrid and SocialIcon stay in place (DotGrid is the spotlight's substrate). Commit note in `impl_42_naming.md`: commit the staged `legacy/` moves on their own before the v2 files to keep `git log --follow`.
- Reviewer run 1 (`review-42.md`) APPROVED with should-fix S1 (forced-colours boundary); S1 and advisories 1 and 6 fixed by the implementer.
- Security warning on the implementer's last run: leader audit found no out-of-scope or config changes; the trigger is unknown. Roberto approved a fresh implementer for the naming work and a fresh reviewer for all of 42 with a security focus.
- Reviewer run 2 (`review-42b.md`, fresh, security focus) APPROVED. Security review of the full diff found nothing beyond expected in-scope changes. S1 (stale token name in a comment in `public/cursor/you.svg`) fixed by the leader, comment only; `tests/brand-cursor.test.ts` passes. Advisories 1, 2, 3, 5, 7 carried into feature 43.
- `./init.sh` exits 0.
- Reports: `pen-extract-42.md`, `spec_m1_visual_foundation.md`, `impl_m1_visual_foundation.md`, `impl_42_naming.md`, `review-42.md`, `review-42b.md`, `impl_42_closeout.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

### Session log (from current.md)

- 2026-10-31 · Roberto: "Si, dale 42". Branch created from `muush-v2` at a2a99cd.
- 2026-10-31 · Leader extract: the `.pen` hero heading is 96 px at 1440, but the
  handoff `--m1-h-hero` caps at 84 px. The `.pen` wins (R32).
- 2026-10-31 · spec_author: package written at `specs/042-m1-visual-foundation/`
  (spec, plan, research, data-model, contracts, quickstart, tasks; 65 tasks).
  Feature 42 → `spec_ready`. Four clarifications applied provisionally for the
  gate (cursor recolour, mobile heading tracking/size, focus ring, rotating-pill
  hover pause). Summary: `docs/harness/progress/spec_m1_visual_foundation.md`.
- 2026-10-31 · spec_author: package specs/042-m1-visual-foundation → spec_ready.
  Leader re-checked the mobile frames (pen-extract-42 § 8: heading tracking 0
  at 390 and −0.035 em at 1440; section 28 at 390; card radius 24). spec_author
  is folding these in.
- 2026-10-31 · ⏸ Roberto APPROVED spec 042 ("si, lo veo bien"), including the
  provisional answers: cursor recoloured to #E5352F; focus 2 px Blanco
  outline, 3 px offset, :focus-visible only; rotating pill pauses on hover;
  spotlight on plain black and hidden under shaders accepted; red cursor on
  red button accepted; favicon → Red muush 500 in feature 43; Trabaja con
  muush reuses the diagnóstico poster.
- 2026-10-31 · spec_author: package updated to pen extract § 8. Heading
  tracking is fluid (0 at 390 → about −0.035 em at 1440); the section heading
  is 28 at 390, with 30/32/34 as per-use overrides for 44/46; service-card
  radius 24 and a 24 px card title (−0.6 px) added. Clarification Q2 and the
  card-radius question are resolved. Status stays `spec_ready`.
- 2026-10-31 · spec_author folded in pen-extract § 8 (Q2 and card radius resolved). 42 → in_progress; implementer launched.
- 2026-10-31 · implementer: started tasks.md (65 tasks). Clarifications Q1–Q4 treated as CONFIRMED (Roberto 2026-10-31). Favicon excluded (feature 43).
- 2026-10-31 · implementer: Phase 1–2 done. Shaders + 6 posters copied (cmp identical), arrow-right icon, Storybook `negro` swatch (+ Poppins 500 in the catalogue's font link). m1 `:root`, `@theme inline`, edge/focus utilities in global.css; `tests/m1-tokens.test.ts` 111/111. T010: `duration-(--m1-rapido)`, `bg-(image:--m1-btn-fondo)`, `brightness-(--…)`, `scale-(--…)` all emitted in `.output/public/_nuxt/*.css`.
- 2026-10-31 · implementer: US1 done (T013–T018). Canvas `html` + layout root → Negro 950; Poppins [500, 600]; `m1-tokens.stories.ts`. `pnpm test` 101 files / 1520 tests green. Build greps: no Google Fonts, Poppins 500 face emitted, `html{background-color:var(--m1-negro-950)}`, nothing from docs/handoff, no `.output/server`.
- 2026-10-31 · implementer: US2 done (T019–T035). M1GlassSurface, M1Pill, M1PrimaryButton, M1GlassButton, M1Heading + tests + stories. Measured on the BUILT catalogue (`storybook-static`, headless Chrome via CDP, `Emulation.setDeviceMetricsOverride`, fonts loaded): primary hero 252.52×55 @1440, 177.75×44 @390 (no visible arrow; the arrow keeps an invisible 20 px slot, which is what makes 178 come out — INFERRED, flagged); nav 194.3×41 (target 195×40); glass 197.13×52 @1440 (198×53), 144.22×42 @390 (145×41); pill h 36 @390 and @1440; headings hero 34/96, sección 28/56, proceso 28/52, diagnóstico 34/64 px, tracking ≈0 @390 and −3.499/−1.96/−1.819/−2.2395 px @1440. All within SC-002's 1 px. SC-003: no horizontal overflow at 360/768/1024/1280/1920 on 9 stories. Clipped text/overlap not machine-checked (by eye in review).
- 2026-11-01 · implementer: US3 done (T036–T047). shaderFrame (utils, + vitest include for `app/shared/utils/**`), shaderRenderer, useShaderCanvas, backgroundPresets, M1ShaderBackground + tests + stories. Browser checks on the BUILT catalogue (headless Chrome, SwiftShader WebGL, drawArrays counted per canvas): homeHero ready, ~30 draws/s in view; DPR: 1440@2× → canvas 2160 (1.5×), 767@3× → 767 (1×), 390@3× → 390; three stacked sections → only the ones within the 100 px look-ahead draw (top: [30,30,0], bottom: [0,30,30]); hidden tab (second tab activated, visibilityState hidden) → [0,0], shown again → [30,30]; reduced motion (CDP emulated media) → exactly 1 draw, still 1 after +1 s; FAQ: elementFromPoint hits the SECTION (click-through), 0 image nodes and no canvas in the AX tree; `--disable-webgl` → canvas `hidden`, poster loaded, 0 draws. Eager+high on homeHero/faq, lazy on howWeWork. No-JS: Storybook cannot render without JS; covered by the SSR test (`renderToString` contains the poster `<img>`).
- 2026-11-01 · implementer: US4 done (T048–T054). useRotatingText + M1RotatingPill + tests + stories; pill-motion token assertions added to m1-tokens.test.ts. Built catalogue, headless Chrome: label changes every 2599/2600/2601 ms and wraps; pointer resting on the pill holds the label for 6 s and rotation resumes after leaving; reduced motion (emulated) + reload stays on "Estrategia tecnológica" after 6 s; AX tree: 1 list, 4 list items, 0 live regions, the only static texts are the four items (animated label is aria-hidden). VoiceOver itself not run (no interactive session); the AX tree is what it reads.
- 2026-11-01 · implementer: US5 done (T055–T059). `--dot-paper-lit-color: var(--m1-red-muush-500)`; `public/cursor/you.svg` 3× #CF3147 → #E5352F (comment rewritten, no `--`); two tests repinned (not deleted). `git diff` on CursorSpotlight.vue, useCursorSpotlight.ts, DotGrid.vue and the cursor rules: empty. Generated site served locally, headless Chrome at 1440 on /es/, /en/, /es/nosotros/, /en/about/, /es/404/, /en/404/: html + layout root rgb(5,5,5); footer rgb(38,38,38) (Ink 500 band, expected until 43); after a mouse move the spotlight mounts and paints rgb(229,53,47) dots; cursor `you.svg 1 9, auto` / `…, pointer` on links / `text` in fields; reduced motion → no spotlight.
- 2026-11-01 · implementer: Phase 8 done (T060–T065). Literal scan 23/23; every new .vue < 200 lines (largest M1PrimaryButton 122); `createShaderRenderer` split to stay ≈30 lines. `./init.sh` exit 0: typecheck, check, test (113 files / 1697 tests), generate, storybook:build all OK. Live pages match spec "What changes visually": canvas Negro 950, footer Ink 500 band, red shift on cursor and lit dots, nothing else. Clarifications Q1–Q4: all CONFIRMED by Roberto 2026-10-31 (none pending); spec.md wording updated. Deviations and flags: see `docs/harness/progress/impl_m1_visual_foundation.md`. Note: a `nuxt dev` (pid 43034, started 23:06, not the implementer's) was running during the gate; the prerender took 578 s alongside it but passed.
- 2026-11-01 · implementer: implementation complete → docs/harness/progress/impl_m1_visual_foundation.md. Status left at `in_progress` for the leader.
- 2026-11-01 · implementer: follow-up done. M1PrimaryButton arrow now visible at every width (pen extract § 9); hero @390 re-measured 177.75×44 with a visible 20×20 arrow; spec/research/contract/tasks wording corrected; ./init.sh exit 0 (113 files / 1697 tests). Report § 6.
- 2026-11-01 · Implementer PASS (65/65 tasks, 1697 tests); leader corrected the mobile arrow (pen-extract § 9) and the implementer fixed it. 42 → reviewing; reviewer launched.
- 2026-11-01 · Reviewer APPROVED with should-fix S1 (forced-colours boundary, a spec edge case). The leader sends it back to in_progress to fix S1, plus advisories 1 and 6, before close-out.
- 2026-11-01 · implementer: review S1 closed (forced-colours inset outline on m1-borde-luz, verified in headless Chrome, sizes unchanged), advisory 1 (no draw while hidden) and 6 (spec status). ./init.sh exit 0, 1699 tests. Report § 7.
- 2026-11-01 · Security warning on the 42 implementer's last run; leader audit found no out-of-scope or config changes (exact trigger unknown). Roberto approved: (a) naming reorganization — no version marker (drop M1/m1), v1 moved to app/shared/ui/legacy/ + legacy-* tokens + Storybook 'Legacy v1/'; constitution 2.1.1 applied; (b) fresh implementer for it, then a fresh reviewer for all of 42 with a security focus.
- 2026-11-01 · Naming implementer PASS (impl_42_naming.md): v1 moved to app/shared/ui/legacy/ (staged git mv), M1/m1 dropped, 8 collisions → legacy-*, Storybook reordered; DotGrid and SocialIcon left in place (DotGrid is the spotlight's substrate). 42 → reviewing; fresh reviewer launched with a security focus.
- 2026-11-01 · Fresh reviewer APPROVED (review-42b.md); security: nothing found, trigger of the earlier warning unknown. S1 (stale m1 token name in public/cursor/you.svg comment) fixed by the leader (comment only). Advisories 1, 2, 3, 5, 7 carried into feature 43. Close-out launched.

### Reopened · Shared/UI quarantine (2026-11-01)

- Roberto's decisions (Storybook review, 2026-11-01): `Shared/UI` holds only v2 components. The spotlight effect (CursorSpotlight + DotGrid) is retired in v2; the custom "You" cursor stays. Lockup, Wordmark and SocialIcon go to legacy now, and feature 43 builds their v2 versions. Feature 42 reopened → `in_progress`.
- Moves (`impl_42_naming.md` § "Follow-up · Shared/UI quarantine"), all staged `git mv` renames, paths, imports and story titles only:
  - `app/shared/ui/{CursorSpotlight,DotGrid,Lockup,Wordmark,SocialIcon}.{vue,test.ts,stories.ts}` → `app/shared/ui/legacy/`.
  - `app/shared/logic/useCursorSpotlight.{ts,test.ts}` → `app/shared/logic/legacy/` (new folder).
  - Story titles `Shared/UI/X` → `Legacy v1/Shared/UI/X`. `Shared/UI` now holds only GlassButton, GlassSurface, Heading, Pill, PrimaryButton, RotatingPill and ShaderBackground; 44 unique story titles.
  - Import paths updated in `app/layouts/default.vue`, `SiteNav.{vue,test.ts}`, `SiteFooter.{vue,test.ts}`, `MobileMenu.vue`, `NotFoundContent.stories.ts`, `shell/data/types.ts` and `legacy/SectionBackdrop.stories.ts`. Assets (`logomark-on-ink.svg`, `app/assets/social/*.svg`, dot-paper tokens) not moved. The layout still mounts the spotlight; removing it is feature 43's job.
  - `./init.sh` exit 0 (113 files / 1699 tests).
- Reviewer run 3 (`review-42c.md`) APPROVED, no blocking or should-fix findings. Advisories:
  1. Acceptance item 8 of 42 still says the spotlight "sigue funcionando"; when 43 retires it, 43's spec and tests must state that item 8 is superseded. Carried into feature 43 acceptance by the leader.
  2. `app/shared/ui/tokens.stories.ts` (`Foundations/Tokens`) is a story in a component folder; could move to a foundations location later (optional).
  3. Live v1 shell code imports from `legacy/`; expected until 43 builds the v2 Lockup, Wordmark and social icons. Feature 47's grep criterion will catch leftovers.
- Not committed

#### Session log (from current.md)

- 2026-11-01 · Roberto (Storybook review): Shared/UI must hold only v2. Decisions: the spotlight effect
  (CursorSpotlight + DotGrid) is retired in v2; the custom "You" cursor stays. Lockup, Wordmark and
  SocialIcon go to legacy now; feature 43 builds v2 versions. muush-1.0.md § 1 and features 42/43/47 updated.
  42 reopened → in_progress.
- 2026-11-01 · Implementer PASS: 5 components + useCursorSpotlight moved to legacy (paths only). 42 → reviewing; reviewer launched.
- 2026-11-01 · Reviewer APPROVED (review-42c.md, 3 advisories). Advisory 1 carried into feature 43 acceptance; 2 and 3 noted (optional / expected until 43). Close-out launched.

## 2026-11-01 — Feature 43: m1_site_shell (done)

- Change (sdd: true): the Muush 1.0 / v2 site shell on branch `feat/v2-site-shell` (from `muush-v2` at c137096, merges back into `muush-v2`, never master). Spec package `specs/043-site-shell/` (52 tasks, all checked); values from the `.pen` via the leader (`pen-extract-43.md`).
  - Shared brand marks in `app/shared/ui/`: Isotipo (existing logo SVG, stroke 12, Blanco stroke and Red muush 500 dot), Wordmark (600 / 600 / 400, Poppins 400 added), Lockup and SocialIcon (real brand SVGs), plus `app/shared/data/sectionAnchors.ts`. Each with test and story under `Shared/UI/`.
  - Shell in `app/features/shell/`: SiteHeader (one responsive row that swaps at `lg` 1024 px, hides after 80 px of downward scroll and reveals on scroll up, on focus and while the menu is open), NavLinkBar, MenuButton, MobileMenu (full-screen dialog, focus trap, inert background, scroll lock with exact restore, closes on Cerrar/Esc/history/resize/navigation, focus returns to the menu button on dismiss), SiteFooter (4 columns: NAVEGACIÓN, CONTACTO, MUUSH, REDES), FooterColumns, MobileFooter (contact first, as buttons), SocialLinks, ShellItemLink; `useFocusTrap` and `useActiveSection` (scroll-spy) hand-written, no new dependency; `data/contactChannels.ts`. LanguageToggle restyled only (look-only `variant`), behaviour untouched.
  - Layout, CSS and assets: `layouts/default.vue` rewritten; shell tokens, header offset, `scroll-padding-top` and reduced-motion-aware smooth scroll in `global.css`; favicon with the Red muush 500 dot and an adaptive Negro 950 / Blanco stroke; i18n copy in both locales.
  - Retired from the shell: the spotlight (CursorSpotlight + DotGrid) no longer mounts, superseding feature 42's acceptance item 8 (the "You" cursor stays); v1 section glows hidden (`legacy/SectionBackdrop.vue`).
  - Moved with staged `git mv` to `app/features/shell/ui/legacy/` (stories under `Legacy v1/Shell/`): SiteNav, MobileMenu, SiteFooter, FooterColumn, NotFoundContent, NotFoundRings.
  - Review-42b follow-ups closed: shader chunk rejection falls back (1), unused GlassButton `size` prop removed (2), stale `global.css` comments rewritten (3), v2 Lockup/Wordmark/social icon built (5), primitives checked at 360–1920 and under forced colours (7).
  - Browser verification in headless Chrome over CDP (390/1440 anchors, menu sequence, hide/reveal, scroll-spy, forced colours, 360–1920, no-JS, print). Findings R75 and R76 added to `docs/harness/findings.md`.
- Roberto's resolutions at the spec gate (2026-11-01, with the leader's recommendations): scroll-spy active state; nav CTA always shown, including the 404; wordmark 600/600/400 plus Poppins 400 (constitution 2.1.2); favicon dot in Red muush 500 and adaptive stroke in v2 tokens (Negro 950 / Blanco), no v1 hex; Preguntas hidden until feature 46; v1 ids retargeted to `#diagnostico` and `#trabaja-con-muush`; v1 glows hidden now. Isotipo: not the design's thinner stroke, the exact existing SVG (`app/assets/logo`, stroke 12). Earlier: real brand SVGs in the social buttons, links scroll to their section, the logo is the home link.
- Social glyph size: 20 px, a leader decision (pen-extract-43 § 10).
- Reviewer (`review-43.md`) APPROVED; security clean; reviewer's own `./init.sh` exit 0 (131 files / 1883 tests). Should-fix 1–3 (stale "placeholder/UNVERIFIED" wording on the 20 px glyph in `global.css`, `SocialLinks.stories.ts` and `impl_site_shell.md` § 4) and advisories 1–2 (stale `SiteNav` / breakpoint wording in `useMobileMenu.ts`, `#work` in `app/pages/about.vue`) fixed in the close-out, comments and doc text only. Advisories 3 (`SocialNetwork` type import from `data/` into `shared/ui`) and 6 (`useNavCtaReveal`, `useHeroSentinel` and the `--layer-glow/dots/spotlight` tokens left for later deletion) carried into feature 47. Advisories 4 (single-viewport part stories), 5 (`useShellNavigation` length), 7 (this entry) and 8 (active dot and menu divider vanish under forced colours; `aria-current` remains) noted.
- `./init.sh` exits 0.
- Reports: `pen-extract-43.md`, `spec_site_shell.md`, `impl_site_shell.md` (feature 43 section), `review-43.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

### Session log (from current.md)

- 2026-11-01 · 42 merged into muush-v2 (c137096). Branch feat/v2-site-shell created.
- 2026-11-01 · Roberto: real brand SVGs in the social buttons; links scroll to
  their section; the logo is the home link (no Home item). Scroll-spy active
  state is provisional until the spec gate.
- 2026-11-01 · spec_author: package `specs/043-site-shell/` written, feature 43 →
  `spec_ready`, `./init.sh` exit 0. Summary and provisional items:
  `docs/harness/progress/spec_site_shell.md`. ⏸ Awaiting Roberto.
- 2026-11-01 · spec_author: specs/043-site-shell → spec_ready (52 tasks).
- 2026-11-01 · ⏸ Roberto APPROVED spec 043 with the leader's recommendations: scroll-spy; nav CTA always shown; wordmark 600/600/400 + Poppins 400 (constitution 2.1.2 applied); favicon dot and adaptive stroke in v2 tokens; Preguntas hidden until 46; v1 ids retargeted; v1 glows hidden now. Isotipo: ignore the design's thinner stroke and use the same existing SVG. 43 → in_progress.
- 2026-11-01 · implementer: started feature 43 on `feat/v2-site-shell`. Baseline `pnpm test`: 113 files / 1699 tests green.
- 2026-11-01 · implementer: T001–T002 shell tokens, header offset, scroll-padding and smooth scroll in global.css (renamed two keys that collided with v1: `isotipo-ancho`, `menu-filas`).
- 2026-11-01 · implementer: T003 v1 shell UI moved to `app/features/shell/ui/legacy/`; T004–T022 shared anchors, brand marks, Poppins 400, shell data/logic (resolver `current`, close reason, `reveal()`, focus trap, scroll-spy), mobileMenu preset, i18n — unit tests green.
- 2026-11-01 · implementer: T023–T046 v2 header, menu, footer, layout, retirements, favicon (v2 dot + stroke), follow-ups 1–3, 5; build tests updated with supersession notes. Spec/plan/research/tasks wording moved from "provisional" to "confirmed by Roberto 2026-11-01" (Q2 logo SVG as is, Q4 favicon stroke). `pnpm test` 125 files green, typecheck and check green.
- 2026-11-01 · implementer: browser verification in headless Chrome over CDP (390/1440 anchors, menu focus trap, scroll lock, hide/reveal, scroll-spy, forced colours, 360–1920, no-JS, print; 1250 Storybook renders). `./init.sh` exit 0 (131 files / 1883 tests). Report: `docs/harness/progress/impl_site_shell.md` (feature 3's report kept below it). Open gap for the leader: the social-glyph size inside the 48/44 buttons (placeholder 20 px).
- 2026-11-01 · Implementer PASS (52/52 tasks, 131 files / 1883 tests). Social glyph 20 px accepted by the leader (pen-extract-43 § 10). 43 → reviewing; reviewer launched.
- 2026-11-01 · Reviewer APPROVED (review-43.md); security clean. Should-fix 1–3 and advisories 1–2 are stale comments only; they are fixed in the close-out. Advisories 3 and 6 were carried into feature 47.

### Reopened · Home link + shader defaults (2026-11-01)

- Roberto's request (Storybook review, 2026-11-01): (A) a Home link in the header besides the logo (the leader had misread his earlier question as "no Home item"); (B) the hero listón did not draw and the acanalado lacked its ribs, ES and EN, with the poster flashing for an instant. The handoff README/engine were corrected the same day (missing uniforms take the shader `@default`); the updated `README.md` and `muush-gradient.js` were copied into `docs/handoff/muush-1.0/`. 43 reopened → in_progress.
- Root cause (B, CONFIRMED): `useShaderCanvas` sent only the engine base plus the preset, and WebGL leaves an unset uniform at 0. The presets omit `u_y0`/`u_y1`/`u_amp`/`u_th`/`u_twist`/`u_fadeT` (homeHero, aboutHero), `u_ribs`/`u_refract` (howWeWork, faq, notFound) and the mobileMenu geometry/`u_twist`; `u_th = 0` gave the listón zero thickness and `u_ribs = 0` removed the ribs.
- Fix (B): `readShaderDefaults(source)` in `app/shared/utils/shaderUniformDefaults.ts`, a port of the handoff's `MuushGradient.defaults()`; `withShaderDefaults` merges shader `@default` → engine base → preset (the handoff constructor's order); `useShaderCanvas.start()` reads the defaults once from the loaded source. Tests pin homeHero `u_th` 0.1 and howWeWork `u_ribs` 46, and that explicit preset values win. Browser-verified in headless Chrome + SwiftShader: hero listón draws (ES/EN, aboutHero), acanalado shows ~46 ribs per width (howWeWork, faq, notFound); a zero-uniform control reproduces the bug. mobileMenu draws; its design match is UNVERIFIED (no poster).
- Home link choices (A, the leader's, Roberto may change them): label "Inicio" / "Home"; first item in the link bar, the mobile menu, the footer's NAVEGACIÓN column and the mobile links line; points to the top of the home page in the current locale; scroll-spy lights it at the top of home only (`atTop`, needing a second observer), never on other pages or the 404; clicking it on its own page scrolls to the top (`logic/scrollToTopIfCurrent.ts`). The logo stays the home link with its own accessible name.
- Reviewer (`review-43b.md`) APPROVED; security clean; no blocking findings. Should-fix 1 (duplicate requirement IDs in the amendment) was resolved by the leader, who renumbered the amendment's FR-050…054 to FR-052…056 (docs only). Advisories 1–7 noted (among them: a never-failing test and no explicit mobileMenu assertion; Home's scroll-dependent `aria-current="page"` and its lit range, for Roberto or the leader to confirm; spec 042 still shows the one-argument `withShaderDefaults`).
- `./init.sh` exits 0 (133 files / 1921 tests).
- Reports: `impl_site_shell.md` § "Reopened 2026-11-01", `review-43b.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

#### Session log (from current.md)

- 2026-11-01 · Roberto (Storybook review): wants a Home link in the header (the leader had misread his
  earlier question as "no Home item"); the hero listón does not draw and the acanalado lacks its ribs,
  ES and EN, with the poster flashing for an instant. The handoff README/engine were corrected the same
  day: missing uniforms must take the shader @default (ours leave them at 0). The updated README.md
  and muush-gradient.js were copied into docs/handoff/muush-1.0/. 43 reopened → in_progress.
- Leader choices for the Home link (Roberto may change them): label "Inicio" / "Home"; first item in
  the link bar, the mobile menu and the footer's NAVEGACIÓN column and mobile links line; it points to
  the top of the home page in the current locale; scroll-spy lights it at the top of home only.
- 2026-11-01 · implementer: (B) root cause confirmed — presets omit u_y0/u_y1/u_th/u_amp/u_twist (listón)
  and u_ribs/u_refract (acanalado); WebGL left them at 0. Added `readShaderDefaults`
  (app/shared/utils/shaderUniformDefaults.ts), merge shader @default → engine base → preset.
- 2026-11-01 · implementer: (A) Home item (`kind: 'top'`) first in bar, menu, Navegación, mobile line;
  lit at the top of home only (scroll-spy `atTop`); click on its own page scrolls to the top.
- 2026-11-01 · implementer: browser (headless Chrome 156 + SwiftShader) — hero listón and acanalado ribs
  (~46/width) draw in Storybook, ES and EN; a zero-uniform control reproduces the black hero / rib-less
  band. Home link lit at the top of home only; never on 404; toggle/cookie/404 in-place unchanged.
  `atTop` needed a second observer (an instant jump to the top never crosses the band).
- 2026-11-01 · implementer: spec package amended (FR-050…FR-054, T053–T058); `./init.sh` exit 0
  (133 files / 1921 tests). Report: docs/harness/progress/impl_site_shell.md § "Reopened 2026-11-01".
  Next: leader → reviewer.
- 2026-11-01 · Implementer PASS: the shader @default fix is CONFIRMED in a browser (hero listón draws, acanalado shows ~46 ribs), and the Home link was added. 133 files / 1921 tests. 43 → reviewing.
- 2026-11-01 · Reviewer APPROVED (review-43b.md); security clean. The leader renumbered the duplicate amendment IDs FR-050…054 to FR-052…056 (docs only). Close-out launched.

### Reopened 2 · Static grain + isotipo-only header logo (2026-11-01)

- Roberto's requests (2026-11-01): (1) the shader grain flickered ("como ISO alto"): both shaders seeded the grain hash in `finish()` with `fract(u_time*7.0)`, so the noise changed every frame. His decision: keep the grain (`u_grain` 0.07) but make it static, as a documented divergence from the handoff. (2) Added to the same reopen: the header logo is the isotipo alone, with no "muush.dev" wordmark, on desktop and mobile; the footers keep the full lockup; the logo link keeps an accessible name. 43 reopened → in_progress.
- Changes: in `app/assets/shaders/liston.glsl` and `acanalado.glsl` the grain hash in `finish()` is `hash(gl_FragCoord.xy)`, with a `//` comment recording the divergence; every other line still matches the handoff shaders. `backgroundPresets.test.ts` pins that the grain hash does not reference `u_time`. The "byte-identical" claims were qualified in `backgroundPresets.ts` and spec 042 (`research.md` R8 amendment, `plan.md`, `tasks.md` T001). `SiteHeader.vue` renders `<Lockup form="isotipo" />` at every width, its accessible name reusing `shell.nav.home`; `SiteHeader.test.ts`, the story doc and `tests/static-output.test.ts` were updated. Spec 043 adds FR-057/FR-058 (static grain) and FR-059 (isotipo-only header logo), tasks T059–T061.
- Reviewer (`review-43c.md`) APPROVED; security clean; no blocking or should-fix findings. Nits 1–3 (stale doc comments in `SiteHeader.vue:24` and `Lockup.vue:8`, and the missing reopen-2 amendment note in `specs/043-site-shell/plan.md`) were fixed in the close-out, comments and docs only. Nit 4: the accessible name reuses "Inicio de muush" / "muush home" rather than the acceptance example "muush.dev — Inicio"; Roberto may want to confirm the wording. Nit 5 (the logo link also gets `aria-current="page"` on `/es` and `/en`, already present before this reopen) was carried into feature 44.
- `./init.sh` exits 0.
- Reports: `impl_site_shell.md` § "Reopened 2", `review-43c.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

#### Session log (from current.md)

- 2026-11-01 · Roberto: the shader grain flickers ("como ISO alto"). Cause: in finish(), both
  shaders seed the grain hash with fract(u_time*7.0), so it changes every frame. Roberto chose to
  keep the grain at 0.07 but make it static. This is a documented divergence from the handoff.
  43 reopened → in_progress.
- 2026-11-01 · implementer: grain hash in finish() of liston.glsl / acanalado.glsl is now
  hash(gl_FragCoord.xy) (+ divergence comment); test in backgroundPresets.test.ts; spec 043
  FR-057/FR-058; spec 042 R8/plan/T001 and backgroundPresets.ts comment no longer say byte-identical.
- 2026-11-01 · Roberto: the header logo is the isotipo only, with no 'muush.dev' wordmark (desktop and mobile); the footer keeps the full lockup. Added to this reopen.
- 2026-11-01 · Roberto added to reopen 2: header logo is the isotipo alone (desktop + mobile), footer
  keeps the lockup. implementer: SiteHeader.vue renders Lockup form="isotipo" only; SiteHeader test,
  story doc, static-output test; spec 043 FR-059. Name reuses shell.nav.home.
- 2026-11-01 · implementer: browser checks done (grain static, texture kept, listón + ribs drawn; header isotipo at 390/1440 ES/EN); ./init.sh exit 0; report in impl_site_shell.md "Reopened 2".
- 2026-11-01 · Implementer PASS: static grain (one line per shader) and isotipo-only header logo. 43 → reviewing.
- 2026-11-01 · Reviewer APPROVED (review-43c.md); security clean. Nits 1–3 (stale comments and plan note) are fixed in the close-out. Nit 4: the accessible name reuses 'Inicio de muush' / 'muush home'. Nit 5 (duplicate aria-current on the logo) was carried into 44.

### Reopened 3 · Softer grain (2026-11-01)

- Roberto's request (2026-11-01): the static grain at 7% read as a dirty texture on the black; make it softer. The leader checked the built Storybook: the listón matches the design at 1440×1000 (Roberto's screenshot only showed the top half of the frame). Decision: `u_grain` 0.03, still static. 43 reopened → in_progress.
- Change: the engine base value `SHADER_DEFAULTS.u_grain` in `app/shared/utils/shaderFrame.ts` went from 0.07 to 0.03; the grain stays static (hash independent of `u_time`). The `.glsl` files are untouched (their `@default` stays 0.07; the engine base value wins). Engine-value tests were updated; spec 043 adds the FR-060 amendment and tasks T062–T063. Measured in WebGL: grain σ ≈ 2.5 (was ≈ 4.6–4.9); the listón and the 46 ribs still draw.
- Reviewer (`review-43d.md`) APPROVED; security clean; no blocking or should-fix findings. Two cosmetic nits: the FR-060 amendment sits before FR-059 in `specs/043-site-shell/spec.md`, and the inline "(0.03 since …)" notes in `spec.md`/`plan.md` run past the wrap width.
- `./init.sh` exits 0.
- Reports: `impl_site_shell.md` § "Reopened 3", `review-43d.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

#### Session log (from current.md)

- 2026-11-01 · Roberto: the static grain at 7% reads as a dirty texture on the black; make it softer.
  The leader checked the built Storybook: the listón matches the design at 1440×1000. Roberto's
  screenshot only showed the top half of the frame. Decision: u_grain 0.03. 43 reopened → in_progress.
- 2026-11-01 · Implementer: `SHADER_DEFAULTS.u_grain` 0.07 → 0.03 (`.glsl` untouched); engine-value
  tests updated; spec 043 FR-060 amendment. WebGL: grain σ ≈ 2.5 (was ≈ 4.6–4.9), listón and
  46 ribs draw. `./init.sh` exit 0. Report: `docs/harness/progress/impl_site_shell.md` "Reopened 3".
- 2026-11-01 · Implementer PASS: u_grain 0.03. Grain σ 4.6 → ~2.5, and the listón and ribs still render. 43 → reviewing.
- 2026-11-01 · Reviewer APPROVED (review-43d.md); security clean. Close-out launched.

### Reopened 4 · Language switch keeps position (2026-11-01)

- Roberto's request (2026-11-01): switching language jumped back to the section in the URL hash (e.g. `#servicios`) even after the visitor had scrolled down to the form. Only the language should change: same visible section, same relative offset within it (not absolute pixels, since heights differ between locales), and the resulting URL is the other locale's route without the stale hash. No regression in the cookie, the in-place 404 or the route map (33/37/39). 43 reopened → in_progress.
- Root cause (CONFIRMED): `@nuxtjs/i18n` `switchLocalePath` copies the current route's hash into the path it returns, so after an in-page jump the toggle's client `href` became `/en#servicios` (the prerendered one is `/en`) and Nuxt's `scrollBehavior` scrolled there. The old click-time fragment code never ran in the real app, because the router link calls `preventDefault` first (INFERRED from `vue-router` / Nuxt 4.5 sources, consistent with the browser runs).
- Fix: `resolveLocaleDestination` drops any fragment on the switched path. The new `localeSwitchScroll.ts` captures the anchored section at the reading line plus the progress through it (page ratio as fallback), and the new `useLocaleSwitchScroll.ts` holds that position for the navigation to the held destination, sets `scrollToTop = false`, and restores it instantly after `page:loading:end`. `LanguageToggle.vue` holds the position on a plain primary click instead of carrying the hash; the cookie write and the 404 in-place branch are untouched. New tests in `localeSwitchScroll.test.ts` and `useLocaleSwitchScroll.test.ts`; `LanguageToggle.test.ts` fragment tests updated. Spec 043 amendment FR-061, tasks T064–T066. Verified in headless Chrome at 390/1440, with and without reduced motion, from the open mobile menu, EN → ES, and on the 404; the no-JS `href` and `hreflang` alternates are unchanged.
- Reviewer (`review-43e.md`) APPROVED; the language switch was re-checked in a browser. Advisories:
  - A1: doc point 2 in `resolveLocaleDestination.ts` still said the fragment was read at click time and composed there. Fixed in this close-out (comment only): it now says the fragment is dropped and `useLocaleSwitchScroll` keeps the position.
  - A2: US2 scenario 2 and FR-029 in `specs/043-site-shell/spec.md` carried no inline supersession marker. The leader marked both as superseded by FR-061.
  - A3: `useLocaleSwitchScroll.ts` does not await Nuxt's page-transition promise; harmless while no page transition is configured. Carried to feature 47.
- `./init.sh` exits 0.
- Reports: `impl_site_shell.md` § "Reopened 4", `review-43e.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

#### Session log (from current.md)

- 2026-11-01 · Roberto: switching language jumps back to the URL hash's section (e.g. #servicios) even
  after scrolling down to the form; he wants only the language to change. The leader proposed
  keeping the same section and relative offset, with no stale hash (the default unless Roberto asks
  for pixel position). 43 reopened → in_progress.
- 2026-11-01 · implementer: root cause CONFIRMED — `@nuxtjs/i18n` `switchLocalePath` copies the
  route hash into its result, so the toggle's client `href` became `/en#servicios` and Nuxt
  scrolled there (the old click-time fragment code never ran: the router link prevents default
  first). Fix: fragment dropped in `resolveLocaleDestination`; position held on click and
  restored after `page:loading:end` (`localeSwitchScroll.ts`, `useLocaleSwitchScroll.ts`), spec
  FR-061. Verified in headless Chrome (390/1440, reduced motion, menu, 404). `./init.sh` exit 0.
  Report: `docs/harness/progress/impl_site_shell.md` § Reopened 4. Ready for the reviewer.
- 2026-11-01 · Implementer PASS. Root cause: switchLocalePath copies route.hash. Fix: drop the fragment and restore the section plus relative offset after navigation. Browser checks pass. 43 → reviewing.
- 2026-11-01 · Reviewer APPROVED (review-43e.md), and the language switch was re-checked in a browser. Leader marked US2 scenario 2 and FR-029 as superseded by FR-061 (A2). A3 carried to 47; A1 is fixed in the close-out.

## 2026-11-01 — Feature 44: m1_home_page (done)

- Change (sdd: true): the Muush 1.0 / v2 home on branch `feat/v2-home` (from `muush-v2` at 6b606f3, merges back into `muush-v2`, never master). Spec package `specs/044-home-page/` (72 tasks, all checked, including T067–T072 from the amendments); values from the `.pen` via the leader (`pen-extract-44.md` §§ 1–11, `assets-44/`).
  - Assets: `app/assets/map/world-dots.svg` (byte-identical copy of the leader's export, 1 693 dots, 5 730 B gzipped, inlined with `?raw`) plus a README; nine lucide glyphs normalized into `app/assets/icons/` (licence comment, `class`, `width`, `height` removed; `<title>` added; `currentColor`; stroke 1.5 on the four service glyphs, lucide's 2 on the five commitment glyphs).
  - Shared (`app/shared/`): `data/layout.ts` (`DESKTOP_MEDIA_QUERY`, moved from `useMobileMenu`), `mapPins.ts`, `mapRegions.ts`; `logic/useDesktopLayout.ts`, `useMapRegion.ts`; `utils/mapGeometry.ts`, `mapCityList.ts` (`mapCityGroups()`, extracted after review-44); UI `WorldMap`, `MapPin`, `MapRegionTabs`, `MapLegend`. Each with tests and stories.
  - Landing (`app/features/landing/`): data and content composables for Hero, Qué es muush, Servicios and Cómo trabajamos; `carouselIndicator` / `useCarouselIndicator`, `timelineProgress` / `useTimelineProgress`; UI `HeroSection`, `WhoWeAreSection`, `ServicesSection`, `ServiceCard`, `ServicesCarousel`, `CarouselIndicator`, `AlsoAvailable`, `HowWeWorkSection`, `ProcessTimeline`, `ProcessStep`, `CommitmentChip`. `app/pages/index.vue` composes the v2 sections and the v1 contact section; the barrel's only `legacy/` export is `ContactSection`.
  - Moved with `git mv` into `landing/{ui,data,logic}/legacy/`: the v1 Hero, Purpose\*, Services\*, ServiceItem and ContactSection (with tests and stories, titles under `Legacy v1/`), and the v1 Purpose and Services data and logic. Deleted: the v1 seams `useHeroContent`, `usePurposeContent`, `useServicesContent`, the legacy `heroContent.ts` and its test, and the v1 `landing.hero`, `landing.purpose` and `landing.services` locale keys. Propósito and Proyectos no longer render on the home.
  - Edited: `app/layouts/default.vue` (`<main>` frame is opt-out via `definePageMeta({ fullBleed: true })`, used only by the home; the v1 contact section carries the frame itself); `global.css` (home tokens, `borde-tile`, `borde-suave`, `borde-rojo`, `pulso` utility and `@keyframes pulso`; the feature-42 Pill ring tokens and `--rojo-20` removed); `:aria-current="undefined"` on the four logo links (closes review-43c nit 5); `.storybook/preview.ts` adds a "Móvil chico (360)" viewport. Tests: `landing-copy` rewritten, a v2 home block in `static-output` (order, one `h1`, hrefs, no retired ids, map inline, lit timeline with no script, fragment-target check, logo `aria-current`), `design-tokens` and `token-literals` extended, `forms-copy`, `tablet-layout-tokens` and `not-found-output` adjusted; `seo-output.test.ts` untouched and passing.
  - Browser verification in headless Chrome over CDP (390/1440 anchors, 360–1920 with no overflow, map tabs by keyboard, carousel indicator, timeline fill and reverse, reduced motion, radar ping, feature-43 language switch).
- Roberto's decisions (2026-11-01):
  - Spec gate: approved with the provisional answers. Hero buttons in one centred row that wraps when it does not fit; accessible map with a hidden city list and a tablist named "Región del mapa" / "Map region" (EN: Dublin, Amsterdam, Los Angeles); the Cómo trabajamos line is a background gradient plus a growing red fill; pins 28 × 28 at any zoom. Earlier: the mobile step-01 description follows the design (short on mobile, full on desktop).
  - Icons: the leader downloaded nine SVGs from lucide-static@0.469.0 (ISC) from unpkg with his approval and checked them (no scripts or links). The raw files failed Biome and were moved out of the repo to `/tmp/f44-lucide-raw/lucide/`; the icon README records them as staged and not retained.
  - Radar ping: the halos around the red dots in the `.pen` are the v1 radar ping, not static rings (the leader had misread them). Pill dots (including the RotatingPill) and the team and partner pins show the solid dot plus a ghost (scale 1 → 3, opacity 0.6 → 0, 2.4 s ease-out, infinite; red, Acero 200 for the partner); Estonia has no ping; no ping under reduced motion (pen-extract-44 § 9, FR-034…FR-038). Lit timeline step dots ping too, on desktop and the mobile rail (§ 11, FR-039).
  - Line heights (pen-extract-44 § 10): card title line box 34 px, step title 1.41, step number 1.23; desktop commitment chip padding 8 / 10 / 8 / 8, gap 6, blur 16; mobile "Estonia · pronto" chip 13 / 400 Blanco with a 6 px Acero 400 dot. Measured: cards 405.5 / 383 (drawn 407 / 384), Cómo trabajamos 729.4 (drawn 730).
  - 404: keep the "Propósito" shortcut removed (it linked to `/es#proposito`, which no longer exists; FR-026). The shortcut, its i18n key and the `legacyHash` destination member are gone; the 404 shows Servicios and Nosotros.
- Reviewer (`review-44.md`) REJECTED in the first round. Blocking: `MobileMenu.vue` at 203 lines (> 200). Should fix: missing viewport/locale stories for `ProcessTimeline`, `ServicesCarousel`, `ProcessStep` and `ServiceCard`. The implementer fixed both (`MobileMenu.vue` 199, `legacy/ContactSection.vue` 197; stories completed, with documented exceptions for `CarouselIndicator`, `MapRegionTabs` and `MapPin`) and advisories 3 (icon README path), 4 (`<main>` class binding) and 6 (`mapCityGroups()` helper).
- Reviewer (`review-44.md` § "Re-review 2") APPROVED; security clean; no regressions; reviewer's own `./init.sh` exit 0 (164 files / 2 214 tests). Advisories left open:
  - 4: the home still renders `<main class="">` (Vue SSR emits an empty `class` for an object binding that resolves to nothing); harmless, and the report's "no empty class" claim is inaccurate.
  - 5: the decorative `aria-hidden` `' · '` literal in `AlsoAvailable.vue`, accepted.
  - 7: icon `<title>` shows as a native tooltip; a README-contract question predating this feature.
  - 8: the map runs edge to edge at 1024, allowed between the anchors; for Roberto to see on the build.
  - Three legacy files remain over 200 lines (`PurposeCarousel` 215, `PurposeConstellation` 272, `PurposeSection` 376), unchanged since `HEAD`; feature 47 deletes them.
  - Not verified by the reviewer: the language-switch position restore, a no-WebGL pass and a JS-disabled browser pass. The glass button primitive measures 197 × 52 / 144 × 42 against feature 42's 198 × 53 / 145 × 41 (not changed here).
- `./init.sh` exits 0.
- Reports: `pen-extract-44.md`, `assets-44/`, `spec_home_page.md`, `impl_home_page.md`, `review-44.md`.
- Not committed (Roberto's instruction: no commits without explicit request).

### Session log (from current.md)

- 2026-11-01 · 43 merged into muush-v2 (6b606f3). Branch feat/v2-home created.
- 2026-11-01 · The leader generated `assets-44/world-dots.svg` (1693 dots, 1408×470) and `map-pins.json` (9 pins) from the .pen.
- 2026-11-01 · Roberto: the mobile step-01 description follows the design (short on mobile, full on desktop).
- 2026-11-01 · spec_author: `specs/044-home-page/` written (spec, plan, research, data-model, contracts, quickstart, tasks T001–T066); feature 44 → `spec_ready`. Four provisional clarifications and the missing values are in `docs/harness/progress/spec_home_page.md`.
- 2026-11-01 · spec_author: specs/044-home-page → spec_ready (66 tasks). The leader filled the missing values (pen-extract-44 § 8).
- 2026-11-01 · ⏸ Roberto APPROVED spec 044 with the provisional answers, and approved downloading 9 lucide icons. The leader downloaded lucide-static@0.469.0 (ISC) from unpkg into assets-44/lucide/ and checked them: no scripts or links. 44 → in_progress.
- 2026-11-01 · implementer: T001 map asset copied (cmp identical, 5 730 B gz); T002 nine lucide glyphs normalized into app/assets/icons (service four at stroke 1.5).
- 2026-11-01 · implementer: T003 home tokens added to global.css (:root colours/gradients, @theme utilities, --progreso-paso zeroed under reduced motion).
- 2026-11-01 · implementer: Phase 2 done — v1 home quarantined in landing/{ui,data,logic}/legacy (git mv), DESKTOP_MEDIA_QUERY → shared/data/layout.ts, useDesktopLayout; full suite green (137 files / 2042 tests).
- 2026-11-01 · implementer: Phases 3–4 done — HeroSection; WorldMap (+MapPin, MapRegionTabs, MapLegend, mapPins/mapRegions/mapGeometry, useMapRegion) and WhoWeAreSection, with tests and stories.
- 2026-11-01 · implementer: Phase 5 done — Servicios (ServiceCard, ServicesCarousel + useCarouselIndicator/activeCardIndex, CarouselIndicator, AlsoAvailable, ServicesSection).
- 2026-11-01 · implementer: Phase 6 done — Cómo trabajamos (timelineProgress, useTimelineProgress, CommitmentChip, ProcessStep, ProcessTimeline, HowWeWorkSection).
- 2026-11-01 · Roberto: the halos around the Pill dots and map pins are the v1 radar ping, not static rings. The leader had misread them. Scope extended (pen-extract-44 § 9) and sent to the running implementer.
- 2026-11-01 · implementer: Phases 7–8 done (page, barrel, v1 seams deleted, copy/static-output/forms tests, logo aria-current ×4). FR-026 found the v1 404 linking /es#proposito: Propósito shortcut removed (+ legacyHash member, key). Layout <main> frame made opt-out (fullBleed page meta) so v2 sections are full bleed; v1 contact carries the frame itself.
- 2026-11-01 · implementer: amendment 'Radar ping on markers' (Roberto) — pulso utility/keyframes/--pulso; Pill dot and map pins rebuilt (no static rings; Estonia no ping; none under reduced motion); verified in headless Chrome.
- 2026-11-01 · implementer: ./init.sh exit 0 (163 files / 2203 tests). Report → docs/harness/progress/impl_home_page.md. Raw lucide downloads moved out of the repo to /tmp/f44-lucide-raw/lucide (they failed biome).
- 2026-11-01 · Roberto: keep the 404 Propósito shortcut removed. Lit timeline step dots get the radar ping too (pen-extract-44 § 11).
- 2026-11-01 · implementer: § 10 applied (card title 34 px, step 1.41 / 1.23, chip 8/10/8/8 gap 6 blur 16, Estonia chip 13/400 + 6 px Acero 400 dot) and re-measured (cards 405.5/383, Cómo trabajamos 729.4, carousel end 630.5). § 11: lit step dots ping (desktop + rail), --rojo-20 removed; 404 shortcut removal approved by Roberto.
- 2026-11-01 · Implementer PASS. The radar ping is on the pills, pins and lit steps. The line heights from § 10 bring the cards to 405.5/383 and Cómo trabajamos to 729.4. 44 → reviewing.
- 2026-11-01 · Reviewer REJECTED (review-44.md). Blocking: MobileMenu.vue is 203 lines (> 200). Should fix: missing viewport/locale stories for ProcessTimeline, ServicesCarousel, ProcessStep and ServiceCard. 44 → in_progress.
- 2026-11-01 · implementer: review-44 fixes — MobileMenu 199 lines (comment only), legacy ContactSection 197; stories completed (ProcessTimeline, ServicesCarousel, ProcessStep, ServiceCard + documented exceptions); advisories 3, 4, 6 fixed; init.sh exit 0 (164 / 2214).
- 2026-11-01 · The implementer fixed the review-44 items (MobileMenu ≤ 200 lines, stories). 44 → reviewing; review round 2 launched.
- 2026-11-01 · Reviewer APPROVED (review-44 re-review 2); security clean. Close-out launched.

### Reopened · Roberto review (2026-11-02)

- Requests (Roberto, reviewing in `pnpm dev`; recorded in `feature_list.json` id 44 as REABIERTA / ACLARACIÓN / Y / Y 2 / CANCELADO):
  - Header centring: the desktop link bar must sit at the page centre from 1024 to 1920 with no overlaps.
  - Chip ping: the Creativo and Marketing dots in "También" get the radar ping in their own Acero 200.
  - Timeline hover (desktop): hovering or keyboard-focusing a step grows it slightly; the line is red up to that step's dot and the unlit-track colour after it; steps up to it lit, later ones unlit; no scale under reduced motion.
  - Desktop unlit by default (ACLARACIÓN): with no hover, all five steps are unlit and the whole line is grey; the desktop scroll fill is removed; the mobile rail keeps its scroll fill.
  - Grey ping (Y): unlit dots also ping, in their grey; lit dots ping red.
  - White numbers: step numbers 01–05 in Blanco on desktop and mobile.
  - Double-trail fix: the grey dots showed two trails (static halo plus a ghost starting inside the border); must be a single trail.
  - Transparent mobile header (Y 2): requested (no fill or blur below `lg`), then cancelled by Roberto; the mobile header keeps the `.pen` fill and blur.
- Changes (`impl_home_page.md` § "Reopened 2026-11-02"; spec amendment FR-040…FR-048, tasks T073–T080):
  - Header: from `lg` the nav is a `1fr auto 1fr` grid (`grid-cols-cabecera`); measured centre delta 0 px at 1024/1280/1440/1920, no overlap; mobile bar unchanged (`SiteHeader.vue`, feature 43's file, edited as tasked).
  - Chips: `AlsoAvailable.vue` dots carry `pulso` in Acero 200.
  - Timeline: new `useTimelineHover` composable (pointer and `:focus-visible`, pointer wins, nothing below `lg`) and pure helpers `dotProgress` / `litUpTo`; previewed column scales to 1.04 (`--paso-escala`, `motion-safe:`). `ProcessStep` splits `columnLit` (desktop) from `lit` (rail). `useTimelineProgress` is rail-only; `horizontalProgress`, `isStepLitHorizontal`, `HORIZONTAL_TRAVEL_RATIO` and `--proceso-linea` removed. Desktop at rest (including SSR, no-JS and reduced motion) is unlit with a `linea-fuerte` grey line.
  - Numbers: desktop number `text-blanco`; mobile already Blanco, now pinned by a test.
  - Grey ping: `pulso` ghost uses `--pulso-fantasma`; new `pulso-tenue` sets it to `--texto-tenue` (Blanco 40 %).
  - Double trail (FR-048): the static `bg-blanco-6` halo on the dot wrapper removed; the ghost starts at the host's outer edge via `--pulso-borde` (`--trazo-anillo` on `pulso-tenue`). Verified with paused mid-animation frames in headless Chrome: one band at every time.
  - Advisories 2, 3, 5 and 7 of the reopen review fixed (design docs marked superseded, test titles, one comment, test count); no behaviour change.
  - Y 2: the transparent-header edits were reverted; `SiteHeader.*` is back to the approved state. The tap/click focus ring was not reproduced in headless Chrome (only keyboard focus shows it); no fix. `--blanco-6` and its theme alias removed, with negative assertions in `tests/design-tokens.test.ts`.
- Reviews (`review-44.md`):
  - "Reopen 2026-11-02 review": APPROVED, 7 advisories (the leader aligned acceptance item 3; 2, 3, 5 and 7 fixed; 6 read as intended); security clean.
  - "Double-trail fix review": APPROVED; leftover `--blanco-6` token (since removed); the 0.5 px ghost overhang at DPR 1 is sub-pixel; security clean.
  - "Final check": APPROVED, no open findings; security clean; `./init.sh` exit 0 (165 files / 2 239 tests).
  - Advisories left open: advisory 4, the desktop still attaches passive scroll/resize listeners in `useTimelineProgress` that return without measuring (deliberately accepted). Not verified: physical devices for pointer, keyboard and focus ring; visual parity with `Tng1t` at rest (FR-044 departs from the `.pen` on purpose).
- `./init.sh` exits 0.
- Not committed (Roberto's instruction: no commits without explicit request).

#### Session log (from current.md)

- 2026-11-02 · Roberto (pnpm dev review): the header link bar is off-center; the Creativo/Marketing chip
  dots need the radar ping in their own colour; the timeline needs a hover on the whole step (grows
  slightly; the line is red up to the hovered dot and the off colour after it); step numbers should be
  white. 44 reopened → in_progress.
- 2026-11-02 · Roberto: on desktop with no hover, every step is unlit and the whole line is grey. This removes the desktop scroll fill; the mobile rail keeps its scroll fill. Sent to the implementer.
- 2026-11-02 · Roberto: the unlit grey dots also get the radar ping, in their grey colour.
- 2026-11-02 · implementer: header bar centred with a `1fr auto 1fr` grid (measured delta 0 px at
  1024/1280/1440/1920); chip dots ping in Acero 200; desktop timeline preview on hover / keyboard
  focus (scale 1.04, red to the dot, grey after); numbers Blanco. Spec amendment FR-040…FR-047.
- 2026-11-02 · implementer: Roberto's clarification applied — no desktop scroll fill, desktop rests
  unlit with a grey line (SSR, no-JS and reduced motion too); mobile rail keeps its scroll fill.
  Unlit dots ping in Blanco 40 % (`pulso-tenue`). `--proceso-linea` removed. `./init.sh` exit 0
  (2238 tests). Report: `docs/harness/progress/impl_home_page.md` § "Reopened 2026-11-02".
- 2026-11-02 · Implementer PASS: header centred; chip ping; timeline hover with scale 1.04; desktop at rest is unlit with a grey line; grey ping on unlit dots; white numbers. 44 → reviewing.
- 2026-11-02 · Roberto: the grey dots show two trails. Leader diagnosis: (a) the desktop unlit dot keeps the static 28px halo (bg-blanco-6 on the data-punto-paso wrapper) next to the ping; (b) the pulso ::before uses inset:0, so on the bordered unlit dot the ghost starts inside the border, and the ring plus the ghost read as two. It must be a single trail, as on the other dots.
- 2026-11-02 · implementer: one trail on the grey dots (FR-048) — static Blanco 6 % halo removed,
  ghost starts at the dot's outer edge (`--pulso-borde`); frames verified in headless Chrome;
  `./init.sh` exit 0 (2239 tests).
- 2026-11-02 · Reviewer APPROVED the reopen (review-44 § Reopen 2026-11-02), with 7 advisories. The leader aligned acceptance item 3. The double-trail fix landed after that review and still needs its own check.
- 2026-11-02 · implementer: review-44 reopen advisories 2, 3, 5 and 7 fixed (docs, test titles, one
  comment; no behaviour change). `./init.sh` exit 0 (165 files / 2239 tests).
- 2026-11-02 · Roberto: the mobile header bar must be fully transparent (no fill, no blur; the 1px border stays). It diverges from the .pen. Queued until the double-trail review finishes.
- 2026-11-02 · Reviewer APPROVED the double-trail fix (leftover: the unused --blanco-6 token). 44 → in_progress for the transparent mobile header and the --blanco-6 cleanup.
- 2026-11-02 · Roberto reversed the transparent mobile header: it keeps the .pen fill and blur. The implementer was told to revert any edits; the focus-ring check and the --blanco-6 cleanup stay.
- 2026-11-02 · implementer: Y 2 — transparent header cancelled by Roberto (edits reverted, header
  byte-identical); focus ring on tap/click not reproduced in headless Chrome (only keyboard focus
  shows it), no fix; `--blanco-6` removed. `./init.sh` exit 0 (165 files / 2239 tests).
- 2026-11-02 · Implementer PASS: the mobile header is unchanged (keeps the fill and blur); the focus ring after a tap is not reproduced; --blanco-6 removed. 44 → reviewing.
- 2026-11-02 · Reviewer APPROVED (review-44 § Final check); security clean. Close-out launched.
- 2026-11-02 · Reviewer APPROVED feature 45 `m1_forms` (review-45 § Re-review 1): the "Enviar sin CV" consent bypass is fixed and tested; payloads, flows, Turnstile, spam guard, server-error map and dial-code logic have zero diff; `./init.sh` exit 0 (2584 tests). Close-out launched (leader reverted a reviewer-set `done` to `reviewing`; close-out is the implementer's).
- 2026-11-02 · implementer close-out: feature 45 `m1_forms` → `done` (approved in review-45 § Re-review 1). Shipped: the v2 diagnóstico and application forms on one `SteppedForm` shell (two steps below 768 px, consent gate on every send path, the v2 states, CV PDF ≤ 5 MiB), the home's "Diagnóstico y contacto" section at `#diagnostico`, and the v2 application form inside the v1 Nosotros section. The v1 form UI is quarantined in `forms/ui/legacy/`. Payload builders and flows are unchanged. Tasks T001–T051 `[x]`. `./init.sh` exit 0. Not committed; it waits for Roberto's request. Report: `impl_forms.md`; review: `review-45.md`.
- 2026-11-02 · implementer close-out: feature 45 `m1_forms` Reopen 1 → `done` (approved in review-45 § Re-review 3). Reopen 1 (Roberto 2026-11-02), FR-036…FR-040:
  - desktop header: hides after 2.5 s idle, held while hovered or focused; after an idle hide only an upward scroll or the top zone shows it again;
  - "Cómo trabajamos" fill runs: 150 ms delay, 700 ms per line, columns light in turn;
  - shader keeps animating through height changes (resize repaint fix, confirmed in the browser);
  - assessment call row: white question, underlined link.
  T052–T058 `[x]`; `./init.sh` exit 0. Not committed; it waits for Roberto's request.
- 2026-11-02 · implementer close-out: feature 45 `m1_forms` Reopen 2 → `done` (approved in review-45 § Re-review 4). Reopen 2 (Roberto 2026-11-02, FR-041): one shared `pill-aire` utility, +6 px below lg and +8 px from lg, on the five v2 section pills. T059–T060 `[x]`; `./init.sh` exit 0. Not committed; it waits for Roberto's request.
- 2026-11-02 · implementer close-out: feature 46 `m1_secondary_pages` → `done` (approved in review-46 § Re-review 1). Changes:
  - Nosotros is v2: hero, Cómo se arma with pinging card dots, Dónde estamos on the shared map, and Trabaja con muush with the feature 45 form.
  - New indexed Preguntas page (`/es/preguntas` ↔ `/en/faq`), a plain WebPage, linked from the footers and the sitemap only.
  - The 404 uses the v2 `StatusSection`; every feature 36/39 behaviour is unchanged.
  - Compact (mobile) shader uniforms below 1024 on all seven section presets.
  - The v1 page frame and the footer gap are retired; the v1 About and 404 code and tokens are deleted.
  - Fix round 1: card-title end extension capped at a 10 px edge floor; the schema-org script attributes are read from the module config.
  T001–T042 `[x]`; `./init.sh` exit 0. Not committed; it waits for Roberto's request (commit/merge into `muush-v2`).
- 2026-11-05 · implementer close-out: feature 48 `m1_legal_pages` → `done` (approved in review-48 § Re-review, fix round). Changes:
  - Aviso de privacidad (`/es/privacidad` ↔ `/en/privacy`) and Términos y condiciones (`/es/terminos` ↔ `/en/terms`), indexed, with the `.pen` text as the final legal text; sticky index on desktop, collapsible on mobile; data table as cards on mobile.
  - Global cookie banner and preferences dialog (client-only); the choice is stored in localStorage and "Cambiar mis preferencias" reopens it. No tracking script loads (feature 49).
  - Footer legal links and the forms' consent link (new tab, with a screen-reader notice) point to the pages; `useFocusTrap` lifted to `shared/`; `PrimaryButton` gains a `compact` size.
  - Fix round: `role="list"` on the ARCO list, `CookieConsent` component test, safety-net `close` listener, redundant ARIA removed, legal fixtures moved to `data/`.
  `./init.sh` exit 0 (3023 tests). Feature commits merged into `muush-v2` by Roberto (b2a6ba4); the fix round is uncommitted on `muush-v2`, waiting for Roberto's request.
- 2026-11-07 · implementer close-out: feature 50 `mobile_fixes_map_process_footer` → `done` (approved in review-50, re-review included; Roberto checked it on his iPhone and desktop). Branch `fix/v2-mobile-fixes` off master. Changes:
  - Mobile map: no `scale` transform left; the canvas is laid out at its zoomed size (left/top/width, animated), so the SVG dots paint at final resolution. Root cause INFERRED (iOS layer rasterization; not reproducible in desktop WebKit); Roberto confirmed the dots are sharp on iPhone. Desktop pixel-identical.
  - "Cómo trabajamos" mobile: each step's text scales/fades with its distance from the rail's active point (tokens `--paso-enfasis-*`: 0.92/0.45 one step away, floor 0.9/0.35; reduced motion = opacity only). Open for Roberto/Clau: the 0.35 floor is below WCAG 4.5:1 for dimmed text (reviewer estimate ~2:1); Roberto accepted the values as they are.
  - Mobile footer: nav and legal links get ≥44×44 tap areas (`--toque`); `rounded-control` dropped on the links line (radius clips hit-testing).
  - Brand cursor redrawn from Roberto's `02-Mouse.svg` (white background rect removed, 64×64, hotspot `1 9` kept).
  `./init.sh` exit 0 (3056 tests). For the `.pen` (R32, Clau): the timeline emphasis, the footer spacing (ES links wrap 3/3/1, ~85 px taller at 390, square focus corners on mobile) and the new cursor.
- 2026-11-06/07 · leader: feature 49 scope extended (Meta advanced matching ON with Roberto's approval; 12-month consent expiry; agent drafts the missing legal and Analítica copy for Roberto's gate; no new .pen design — Analítica reuses the existing row; robots.txt explicitly allows AI bots incl. training; llms.txt). GA4 admin finished by Roberto (tracking-plan-49 § 9); Search Console needs no code (domain property, sitemap resubmitted with 10 URLs, indexing requested for the 6 new pages). Feature 51 `faq_content` added as blocked until Roberto delivers the questions and the .pen design. OG image still missing: Clau to deliver 1200×630.
- 2026-11-07 · implementer close-out: feature 49 `consented_tracking` → `done` (approved twice in review-49: first review and fix round 1). Branch `feat/v2-consented-tracking`. Changes:
  - Meta Pixel and GA4 load only after the visitor grants Publicidad / Analítica, stop on revoke (`ga-disable-<id>`, `fbq('consent','revoke')`, `_ga`/`_ga_*`/`_fbp` expired); new Analítica row in the preferences dialog with the existing row pattern; consent expires 12 months after the choice; `_ga` cookie 14 months; IDs in public runtime config.
  - Fix round 1: GA `set`/`consent default` before `js` (no automatic `page_view` with `npa=0`); Meta page views as `trackSingle`; new `form_response` event (FR-027). See findings.md § R80.
  - Meta advanced matching ON: email and phone, hashed by the pixel, only with Publicidad granted; privacy notice and banner copy per the approved drafts (copy-drafts §§ A–B).
  - robots.txt allows the AI search and training bots in named groups; new `llms.txt` (copy-drafts § C).
  - Optional "Tu sitio web o redes (opcional)" field on the assessment form, sent as `website` (trimmed, omitted when empty, max 300); R43 met (API live, Roberto 2026-11-07).
  GA4 CONFIRMED in Realtime by Roberto and a leader walk on 2026-11-07. `./init.sh` exit 0 (3262 tests). Open: A1 date at merge; Meta re-test and real assessment send after deploy (review F2); GA4 key events and custom dimensions; `.pen` copy update by the leader; Roberto's `docs/business` lines; Search Console re-indexing.
