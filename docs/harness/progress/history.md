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
