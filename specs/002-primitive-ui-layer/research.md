# Phase 0 Research: Primitive UI layer

**Feature**: `specs/002-primitive-ui-layer` | **Date**: 2026-09-06
**Stack**: Nuxt 4.5.2 · Vue 3.5.42 · Tailwind 4.3.3 · Storybook 10.6.0 ·
Vitest 4.1.11 · Biome 2.5.12 · TypeScript 6.0.3 · Vite 8.2.2 (transitive)

**Evidence legend**

- **CONFIRMED** — verified by reading a file in this repo or in
  `node_modules`, or by executing the tool and reading its output. The command
  or file is named.
- **DERIVED** — computed from a CONFIRMED value, with the arithmetic shown.
- **DECIDED** — a judgement call, with the alternatives and the reason.
- **UNVERIFIED** — stated, but not checkable from this repository.

The pre-migration cycle's `research.md` (git `1bd5570`) is the source of the
alpha conversions, clamp slopes, radar concentricity and stroke-scaling
arithmetic. That arithmetic is design maths and survived the migration
unchanged; it is cited rather than repeated. Everything Astro-specific in it
(R1's Tailwind wiring, R5's SVG import, R9's `interface Props`, R10's CSS
placement) is re-derived here for Nuxt/Vue.

---

## R1 · Every utility this layer needs already exists — verified by compiling

**CONFIRMED by execution.** The 66 candidate class names the eight components
will use were fed through the installed Tailwind compiler
(`tailwindcss@4.3.3`, `dist/lib.mjs` `compile()`) against the real
`app/assets/css/global.css`. **Zero were missing.**

Spot-checked output, showing the tokens resolve as intended:

```css
.bg-glass-red-strong { background-color: var(--red-400);
  @supports (color: color-mix(in lab, red, red)) {
    background-color: color-mix(in srgb, var(--red-400) 17%, transparent); } }
.p-glass-red      { padding: clamp(1.375rem, 1.1429rem + 0.9524vw, 2rem); }
.rounded-panel    { border-radius: clamp(1.125rem, 1.0321rem + 0.381vw, 1.375rem); }
.backdrop-blur-glass-red { --tw-backdrop-blur: blur(clamp(1.25rem, …, 1.375rem)); … }
.size-radar-sm    { width: 1.25rem; height: 1.25rem; }
.w-isotipo        { width: clamp(2.5rem, 2.2214rem + 1.1429vw, 3.25rem); }
.text-pill        { font-size: clamp(0.75rem, …, 0.8125rem);
                    line-height: var(--tw-leading, 1.2);
                    letter-spacing: var(--tw-tracking, 0.054em);
                    font-weight: var(--tw-font-weight, 500); }
.outline-red-400  { outline-color: var(--red-400); }
```

**Decision**: this feature adds **no token**. It writes utility classes only.
Three consequences:

1. `text-<role>` emits size, line-height, tracking and weight from one class —
   so a component states its typographic intent once and never touches the
   other three properties (FR-008, FR-009).
2. Tailwind ships its own `@supports` fallback for `color-mix`: a browser
   without it gets the **opaque** base colour instead of the translucent one.
   That is Tailwind's behaviour, not something this feature chooses, and it
   degrades to a legible solid panel rather than to nothing. Noted so a
   reviewer seeing it does not read it as a defect.
3. `line-height`/`letter-spacing`/`font-weight` are emitted as
   `var(--tw-leading, …)` etc., so an ancestor `leading-*` would win over a
   role's own rhythm. No component in this layer sets those on an ancestor.

**Alternative rejected**: adding a `@layer components` block with hand-written
CSS per primitive. It would re-declare what the theme already resolves and put
the same four properties in two places (Article VIII, DRY).

## R2 · Inlining the SVG assets under Nuxt + Vite

The problem: Nuxt has no equivalent of Astro's `import Icon from './x.svg'`
component import, which is what the pre-migration `Lockup.astro` and
`SocialIcon.astro` used (old R5). `currentColor` in the three social glyphs
only resolves if the markup is **inline in the document**; referenced through
`<img src>` it can never take `bone-100` (`rules.md` § R8, and the entire
reason `decisions-open.md` § Íconos de redes asked for the normalization).

**Decision**: import the asset with Vite's `?raw` suffix and render it with
`v-html` inside a sized, `aria-hidden` wrapper element.

```ts
import isotipo from '@/assets/logo/isotipo-on-ink.svg?raw'
```

**CONFIRMED**, four ways:

1. `vite@8.2.2/client.d.ts` line 249 declares `module '*?raw' { const src:
   string; export default src }`, so the import is typed `string` with no
   ambient declaration of our own.
2. `.nuxt/types/builder-env.d.ts` contains `import "vite/client"`, so that
   declaration is in scope for `app/**` — `.nuxt/tsconfig.app.json` includes
   `../app/**/*`.
3. `.nuxt/tsconfig.app.json` maps `@/assets/*` → `../app/assets/*`, so the
   alias resolves for type checking as well as for bundling (Article XII).
4. `pnpm typecheck` passes green on the current tree, establishing the
   baseline this must not break.

Storybook: `.storybook/main.ts` re-declares `'@/assets'` in
`viteFinal`'s `resolve.alias`. Vite object aliases are prefix replacements, so
`@/assets/logo/isotipo-on-ink.svg?raw` resolves and the `?raw` query survives —
`?raw` is core Vite, not a Nuxt addition, so the standalone Storybook Vite
build handles it identically.

**Sizing the injected markup**: content inserted by `v-html` is *not* rewritten
by Vue's scoped-style transform, so a plain `svg { … }` rule in a scoped block
would never match. `:deep(svg)` is required. **CONFIRMED by executing**
`compileStyle()` from the installed `@vue/compiler-sfc@3.5.42`:

```
:deep(svg) { width: 100%; height: auto; }
  →  [data-v-abc123] svg { width: 100%; height: auto; }
```

A descendant selector with no scope attribute demanded on the `svg` itself —
exactly what injected markup needs.

**Why `v-html` here is not the hazard it usually is**: the string is a
build-time constant, read from a file this repository owns and reviews. It is
never user input, never fetched, never derived from a URL or a prop. There is
no code path by which a caller can put content into it. The genuine cost is
different and worth stating plainly: the markup skips template compilation, so
a malformed asset fails at runtime instead of at build. That is mitigated by
the assets being fixed, tiny and already reviewed (`app/assets/logo/README.md`,
`app/assets/social/README.md`), and by the component test asserting the
rendered `<svg>` is present.

**Alternatives considered and rejected**:

| Option | Why not |
|---|---|
| `<img src>` from a URL import | Kills `currentColor` — the exact failure `rules.md` § R8 exists to prevent. Also an extra request per glyph. |
| Add `vite-svg-loader` (or similar) | A new build-time dependency with code-execution reach, needing its own supply-chain review, to solve a four-file problem. Article VIII: no infrastructure ahead of an actual need. It would also have to be added to `.storybook/main.ts` separately, giving two places to keep in sync. Revisit only if a real icon *system* appears. |
| Hand-author the geometry inside `Lockup.vue` / `SocialIcon.vue` | Duplicates the isotipo geometry `branding.md` defines once and throws away the normalization work recorded in the asset READMEs. Article VIII, DRY. |
| Move the assets to `public/` and fetch them | Same `currentColor` failure, plus a runtime fetch on a static site. Explicitly forbidden by `rules.md` § R8. |

## R3 · Where the LED ring CSS lives

**Decision**: the document-level at-rules stay in `global.css` where feature 1
already put them; the ring itself lives in `BotonPrimario.vue`'s scoped
`<style>`.

**CONFIRMED** present in `app/assets/css/global.css`:

```css
@property --led-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes led-spin { to { --led-angle: 360deg; } }
--stroke-led: 0.09375rem;   /* 1.5px */
```

`@property` and `@keyframes` are document-scoped: declaring them once in the
global sheet means they exist whether the button renders zero times or twice.
Duplicating them into a scoped block would re-declare a global at-rule per
component instance and buy nothing.

The ring is a masked `::before`:

```css
.led::before {
  content: ''; position: absolute; inset: 0;
  border-radius: inherit;
  padding: var(--stroke-led);
  background: conic-gradient(from var(--led-angle),
    var(--color-red-400) 0%, var(--color-bone-100) 50%, var(--color-red-400) 100%);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
```

**CONFIRMED by executing** `compileStyle()` with `scoped: true` that Vue's
transform handles every selector shape this needs:

```
.led::before                          → .led[data-v-abc123]::before
@media (hover: hover) .led:hover::before
                                      → .led[data-v-abc123]:hover::before
@media (prefers-reduced-motion: reduce) .led::before
                                      → .led[data-v-abc123]::before
```

The scope attribute lands on the element and the pseudo-element and media
queries survive intact — so the ring can be scoped and does not need to leak
into `global.css`.

Why `mask-composite: exclude` rather than the simpler two-layer
`background-clip: padding-box, border-box` trick: the button's fill is
**translucent** (`glass-dark`, 65%). With the clip trick the conic layer shows
through the middle of the button. Masking to the border band paints only the
1.5px ring.

Three stops, red-400 → bone-100 → red-400. **Wine appears nowhere**
(FR-028). The design file's third stop `#cf3247` is a one-digit typo of
`red-400` `#CF3147`; the token is used
(`design-extract.md` § 4 and § 11).

**Fallbacks**, all CSS, no script (FR-030 – FR-032):

- `@media (prefers-reduced-motion: reduce)` → flat `var(--color-red-400)`, no
  animation.
- `@media (hover: hover)` gates the animation, so a touch device gets the
  static ring — assumption A-02, the still-open `decisions-open.md` #8,
  reversible by deleting that one media query.
- Without `@property` support the angle is unregistered and cannot interpolate,
  so the ring paints at 0deg and does not rotate. This is `ui-map.md` § 10's
  documented "borde estático en Red 400" outcome, reached without a code path.

**UNVERIFIED**: whether a `-webkit-mask-composite: xor` companion is still
needed for the browsers this site targets. The repository declares no
browserslist and no browser support matrix, so there is nothing here to check
it against. Recommendation: emit the prefixed pair alongside the standard one —
it costs one line and cannot regress a browser that supports the standard
property.

## R4 · Radar's three concentric rings

**Decision**: three **nested** elements, each centring the next with
`grid place-items-center`.

```
outer  size-radar-sm       bg-radar-halo-outer  rounded-full  grid place-items-center
└ mid  size-radar-sm-halo  bg-radar-halo-mid    rounded-full  grid place-items-center
  └ core size-radar-sm-core bg-red-400          rounded-full
```

**Alternative rejected — one grid container with three siblings**: siblings in
a `grid place-items-center` land in three separate rows. Forcing them into one
cell needs `[grid-area:1/1]` on each, an arbitrary bracketed value that the
FR-007/FR-008 grep gate would flag and a reviewer would have to litigate.

**Alternative rejected — absolutely positioned children**: needs
`absolute inset-0 m-auto` plus a positioned parent, i.e. more classes and a
stacking context, to achieve what nesting gives for free.

Nesting is correct because the rings genuinely are nested: **DERIVED** in the
pre-migration research and unchanged — the design file's offsets are exactly
half the diameter differences, so the three circles are concentric, not
offset. `sm`: (20−14)/2 = 3, matching the recorded (3,3); (20−7)/2 = 6.5,
matching (6.5,6.5). `md`: (30−20)/2 = 5 ✓ and (30−12)/2 = 9 ✓.

Colours are one recipe for all three sizes — `design-extract.md` § 2 states it
as a standing rule ("Siempre 3 elipses… `dot` (núcleo, siempre `$red-400`)"),
so `sm-alt` having no colour row is not a gap.

## R5 · Prop typing and defaults in Vue 3.5

**Decision**: type-only `defineProps<Props>()` with **destructured defaults**.
No `withDefaults`.

**CONFIRMED by executing** `compileScript()` from `@vue/compiler-sfc@3.5.42`
on a representative SFC:

```ts
const { variant, padding = 'default', as = 'div' } = defineProps<{ … }>()
```

compiles to

```js
props: {
  variant: { type: String, required: true },
  padding: { type: String, required: false, default: 'default' },
  as:      { type: String, required: false, default: 'div' }
}
```

Reactive props destructure is on by default at this version, and the defaults
become real runtime defaults. `withDefaults` is the pre-3.5 workaround and is
now redundant — Article VIII.

The same compile run **CONFIRMED** that a `export type` declared inside
`<script setup>` is hoisted out of `setup()` into module scope, so each
component can export its own variant union next to the component that owns it:

```ts
export type GlassVariant = 'red-strong' | 'red-soft' | … 
```

**INFERRED, with a named fallback**: a consumer writing
`import type { GlassVariant } from '@/shared/ui/GlassPanel.vue'` relies on
Volar re-exporting SFC module types. That is standard Volar behaviour but is
not verified here, because no consumer exists until feature 3. **The first
task to write a component MUST verify it with `pnpm typecheck`.** If it fails,
the fallback is a colocated `app/shared/ui/types.ts` holding the seven unions —
one extra file, no interface change. A shared barrel is *not* pre-created:
Article VIII forbids the abstraction before the need is demonstrated.

**Variant → class maps** are `const … satisfies Record<Variant, string>` with
**complete** class-name strings. This is not a style preference: Tailwind's
scanner reads source text, so `` `bg-glass-${variant}` `` produces a class the
stylesheet never emits and a panel with no background. `satisfies` (rather than
an annotation) keeps the literal key set narrow so a missing variant is a type
error.

## R6 · `class` is not a prop in Vue

`component-contracts.md` carried `class?: string` from the Astro contracts, and
its own header already flags this as the one thing to change. In Vue, `class`
arrives through fallthrough attributes and Vue **merges** it with the class the
component's root element declares. Declaring it as a prop would shadow that and
force manual merging.

**Decision**: no component declares `class`. Every component has a **single
root element** so the default `inheritAttrs: true` does the right thing, and no
component sets `inheritAttrs: false`.

Checked per component, since the two link-bearing ones are the plausible
exceptions:

| Component | Root | Fallthrough lands on |
|---|---|---|
| GlassPanel | `<component :is="as">` | the panel — correct, callers pass width/grid placement |
| Radar | outer ring `<span>` | the ring |
| Wordmark | `<span>` | the wordmark |
| Lockup | `<span>` | the lockup |
| Pill | `<span>` | the capsule |
| BotonPrimario | `<a>` or `<button>` | the control — correct, callers pass width |
| LinkArrow | `<a>` | the link |
| SocialIcon | `<a>` | the 48×48 square |

BotonPrimario switching between `<a>` and `<button>` is still one root
(`<component :is>`), so nothing special is needed.

## R7 · Storybook authoring

**CONFIRMED** from `.storybook/main.ts`: stories glob is
`../app/**/*.stories.@(ts|tsx)`, the framework is `@storybook/vue3-vite`, the
Tailwind plugin and all six aliases are re-declared for the standalone Vite
run, and `staticDirs` points at `public`.

**CONFIRMED** from `.storybook/preview.ts`: `global.css` is already imported,
backgrounds `ink` (default) / `bone` / `red` exist, and viewport presets
`mobile` (390×844) and `desktop` (1440×900) exist. Stories **consume** these —
no story redefines a background or a viewport.

**Decisions**:

- One `.stories.ts` colocated beside each `.vue`, typed
  `Meta<typeof Component>` / `StoryObj<typeof meta>`.
- Sidebar titles `Shared/UI/<Component>`.
- Each file exports one story per variant **plus** an `AllVariants` story that
  renders them together with their variant name as a caption. FR-049 exists
  because two glass variants that differ by 5% opacity are indistinguishable
  when viewed on separate pages and obvious side by side.
- The token story is **not** a ninth primitive. It goes at
  `app/shared/ui/tokens.stories.ts` — lowercase filename, because Article VIII
  reserves PascalCase for components, so the name itself says "this is not a
  component" — with the title `Foundations/Design tokens`, which sorts it into
  its own sidebar group above the primitives.
- `app/shared/ui/GlassPanel.stories.ts` currently holds the placeholder titled
  `Shared/Tokens smoke test`. It is **overwritten**, not extended (FR-048); its
  token-rendering job moves to `tokens.stories.ts`.

## R8 · Test configuration

**CONFIRMED** current state: `vitest.config.ts` uses `defineVitestConfig` from
`@nuxt/test-utils/config` with `environment: 'node'` and
`include: ['tests/**/*.test.ts']`. The only suite is
`tests/i18n-parity.test.ts`, which imports two JSON files and uses no DOM.

Three findings from reading
`node_modules/.pnpm/@nuxt+test-utils@4.2.0…/dist/config.mjs`:

1. **`projects` is forbidden here.** `defineVitestConfig` throws
   `"The `projects` option is not supported with `defineVitestConfig`"` if the
   config declares `workspace` or `projects` (line 200). So the per-directory
   environment split has to be done another way.
2. **`environmentMatchGlobs` no longer exists** in Vitest 4 — grepping the
   installed `vitest/dist` finds no occurrence. That escape hatch is gone.
3. **Nuxt's own Vite config is merged in.** `resolveConfig()` defu-merges the
   user config with `getVitestConfigFromNuxt()`, which returns the resolved
   Nuxt **client** Vite config including its `resolve.alias` and its plugins.

Finding 3 is the useful one: the `@/assets` alias, the Vue SFC plugin and
`?raw` handling are all available to the test run **without** redeclaring them.
Article XII's "mirror the aliases" duty covers `.storybook/main.ts` only;
`vitest.config.ts` inherits them.

**Decision**: switch `environment` to `'happy-dom'` (installed, 20.14.0) and
extend `include` to cover `app/shared/ui/**/*.test.ts` alongside the existing
`tests/**/*.test.ts`.

Setting happy-dom globally rather than per-directory is safe: the i18n parity
suite reads JSON and asserts on arrays. A DOM being present does not change its
result — Vitest adds DOM globals, it does not remove Node ones. The cost is a
slightly slower environment setup for two tests. Given finding 1 and finding 2,
the alternatives are a per-file `// @vitest-environment` docblock on every new
test (eight repetitions of a thing that should be configured once, Article
VIII) or restructuring into `defineVitestProject`, which is a larger change to
solve a problem that does not exist yet.

**This is the only file this feature touches outside `app/shared/ui/`.**
Recorded in the plan's Complexity Tracking.

## R9 · Biome will not fight the component names — verified, not assumed

Four of the eight components are single-word: `Radar`, `Wordmark`, `Lockup`,
`Pill`. Biome ships `lint/style/useVueMultiWordComponentNames`, and this
repository's `biome.json` disables it for `app/pages/**` and `app/layouts/**` —
which reads as evidence that it fires by default and that
`app/shared/ui/Radar.vue` would break `pnpm check --error-on-warnings`.

**It does not.** **CONFIRMED by executing** `biome lint` twice against a
mirror of the project config on a fixture `app/shared/ui/Radar.vue`:

- With the repository's actual config (`"preset": "recommended"`): **no
  diagnostic**. The rule is not part of `recommended`.
- With the rule force-enabled: it fires on both `Radar.vue` and
  `app/pages/index.vue`, proving the fixture and the rule both work and that
  the first result is a real negative, not a broken test.

**Decision**: keep the names exactly as `component-contracts.md` and
`feature_list.json` acceptance criterion 1 specify. **No `biome.json` change is
needed**, and none should be made — the existing `pages`/`layouts` override is
pre-existing defensive configuration, not a signal.

Two Biome behaviours to expect while writing the components, neither an issue:
`html.experimentalFullSupportEnabled` means Biome formats Vue templates at
`lineWidth: 80`, so long utility lists get wrapped; and
`noUnusedVariables`/`noUnusedImports` are already off for `**/*.vue`.

## R10 · What is deliberately not researched

- **Font binaries.** `public/fonts/` is empty and `global.css` declares 400/700
  against files that do not exist, while the design uses 500/600 (spec A-11).
  Everything here renders in a fallback face until that is fixed. Out of scope,
  and it blocks nothing — no measurement in this layer depends on the face.
- **`decisions-open.md` #8.** Carried forward, not decided (spec A-02).
- **The four blocking open decisions** (form endpoint, calendar link, FAQ, CV
  storage). None reaches this layer.

## Open items carried into implementation

| # | Item | Handling |
|---|---|---|
| 1 | SFC type re-export for consumers (R5) | Verify with `pnpm typecheck` on the first component. Fallback named: colocated `types.ts`. |
| 2 | `-webkit-mask-composite` need (R3) | Emit the prefixed pair; no browser matrix exists to verify against. |
| 3 | LED on touch (spec A-02) | Unchanged from the pre-migration default. One media query to reverse. |
| 4 | Focus-indicator geometry (spec A-07) | Platform default outline recoloured to red-400. No design source exists. |
