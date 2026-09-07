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
