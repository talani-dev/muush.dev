# Data model: Muush 1.0 visual foundation (feature 42)

This feature has no runtime data. Its "entities" are design tokens and the
static presets that primitives read. All live in source, all are typed.

> **Naming reorganization approved by Roberto 2026-11-01.** Token and
> component names below are the final, unprefixed ones. The handoff writes
> each token with an `m1-` prefix; the site drops it, and names the two font
> stacks `--fuente-titulo` and `--fuente-texto` (research R1).

## 1 · Tokens (`app/assets/css/global.css`, `:root` "Muush 1.0")

Values at 16 px per rem. **H** = handoff `tokens.css` name and value (FR-001).
**P** = `.pen` override or addition from the pen extract. **N** = new token
this feature needs, derived from H or P.

### 1.1 Colour

| Token | Value | Src | Theme alias |
|---|---|---|---|
| `--negro-950` | `#050505` | H | `--color-negro-950` |
| `--negro-900` | `#0B0B0B` | H | `--color-negro-900` |
| `--carbon-800` | `#1A1A1A` | H | `--color-carbon-800` |
| `--carbon-700` | `#2C2C2C` | H | `--color-carbon-700` |
| `--gris-400` | `#8C8C8A` | H | `--color-gris-400` |
| `--blanco` | `#F4F4F2` | H | `--color-blanco` |
| `--red-muush-500` | `#E5352F` | H | `--color-red-muush-500` |
| `--crimson-600` | `#8E2A1E` | H | `--color-crimson-600` |
| `--oxblood-800` | `#4A1715` | H | `--color-oxblood-800` |
| `--coral-300` | `#C9604A` | H | `--color-coral-300` |
| `--arena-300` | `#B38B7B` | H | `--color-arena-300` |
| `--acero-200` | `#A6B6B2` | H | `--color-acero-200` |
| `--acero-400` | `#4A676B` | H | `--color-acero-400` |
| `--acero-800` | `#1F3236` | H | `--color-acero-800` |
| `--texto` | `var(--blanco)` | H | `--color-texto` |
| `--texto-suave` | `rgba(244, 244, 242, 0.70)` | H | `--color-texto-suave` |
| `--texto-tenue` | `rgba(244, 244, 242, 0.40)` | H | `--color-texto-tenue` |
| `--linea` | `rgba(244, 244, 242, 0.12)` | H | `--color-linea` |
| `--linea-fuerte` | `rgba(244, 244, 242, 0.20)` | H | `--color-linea-fuerte` |
| `--vidrio-fondo` | `rgba(11, 11, 11, 0.70)` | H | `--color-vidrio-fondo` |
| `--nav-fondo` | `rgba(11, 11, 11, 0.45)` | H | `--color-nav-fondo` |
| `--btn-borde` | `rgba(255, 255, 255, 0.20)` | H | `--color-btn-borde` |
| `--btn2-fondo` | `rgba(26, 26, 26, 0.55)` | H | `--color-btn2-fondo` |
| `--pill-fondo` | Carbón 800 at 60 % | P (`#1A1A1A99`) | `--color-pill-fondo` |
| `--franja-fondo` | Carbón 800 at 40 % | P (`#1A1A1A66`) | `--color-franja-fondo` |
| `--punto-halo` | Red muush 500 at 30 % | P (`#E5352F4D`) | `--color-punto-halo` |
| `--punto-halo2` | Red muush 500 at 12 % | P (`#E5352F1F`) | `--color-punto-halo2` |

### 1.2 Gradients and effects (`:root` only)

| Token | Value | Src |
|---|---|---|
| `--btn-fondo` | `linear-gradient(180deg, #EC4A44 0%, #E5352F 55%, #C42A25 100%)` | H |
| `--btn-sombra` | `0 10px 32px rgba(229, 53, 47, 0.33)` | H (also `--shadow-boton`) |
| `--vidrio-blur` | `blur(30px)` | H |
| `--vidrio-borde` | `linear-gradient(180deg, rgba(244,244,242,.25), rgba(244,244,242,.04))` | H |
| `--vidrio-sombra` | `0 30px 80px rgba(0, 0, 0, 0.67)` | H (also `--shadow-vidrio`) |
| `--borde-tarjeta` | Blanco 18 % → 4 %, 180deg | P (`#F4F4F22E` → `#F4F4F20A`) |
| `--borde-boton` | Blanco 25 % → 6 %, 180deg | P (`#F4F4F240` → `#F4F4F20F`) |
| `--borde-plano` | Blanco 10 % flat | P (`#F4F4F21A`) |
| `--borde-ancho` | `0.0625rem` (1 px) | P |
| `--foco-ancho` / `--foco-separacion` | `0.125rem` / `0.1875rem` (2 / 3 px) | N (Clarifications Q3) |

Blur theme: `--blur-pill: 1rem` (16), `--blur-boton: 1.25rem` (20),
`--blur-vidrio: 1.875rem` (30).

### 1.3 Type

| Token | Value | Src |
|---|---|---|
| `--fuente-titulo` | `"Poppins", system-ui, sans-serif` | H |
| `--fuente-texto` | `"Instrument Sans", system-ui, sans-serif` | H |
| `--h-hero` | `clamp(2.125rem, 0.6857rem + 5.9048vw, 6rem)` | **P** (H cap was 84) |
| `--h-seccion` | `clamp(1.75rem, 1.1rem + 2.6667vw, 3.5rem)` | H range, 390/1440 anchors |
| `--h-proceso` | `clamp(1.75rem, 1.1929rem + 2.2857vw, 3.25rem)` | P |
| `--h-diagnostico` | `clamp(2.125rem, 1.4286rem + 2.8571vw, 4rem)` | P |
| `--h-tarjeta` | `clamp(19px, 1vw + 14px, 26px)` in rem | H |
| `--p-grande` | `clamp(1.0625rem, 0.9929rem + 0.2857vw, 1.25rem)` | **P** (H min was 16) |
| `--p` / `--p-chico` / `--etiqueta` | 15 / 13 / 12 px in rem | H |
| `--interlineado-titulo` / `--interlineado-texto` | 1.15 / 1.5 | H |
| `--lh-hero`, `--lh-seccion`, `--lh-proceso`, `--lh-diagnostico` | research R4 clamps | P |
| `--tracking-hero` / `-seccion` / `-proceso` / `-diagnostico` | fluid 0 at 390 → −3.5 / −1.96 / −1.82 / −2.24 px at 1440 (research R4 clamps) | P § 8 |
| `--h-servicio` / `--tracking-servicio` | 1.5rem (24) / −0.0375rem (−0.6), both anchors | P § 8 |

Theme `--text-*` entries (each with `--line-height`, and where set
`--letter-spacing` and `--font-weight`):

| Utility | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| `text-hero` | `--h-hero` | `--lh-hero` | `--tracking-hero` | 500 |
| `text-seccion` | `--h-seccion` | `--lh-seccion` | `--tracking-seccion` | 500 |
| `text-proceso` | `--h-proceso` | `--lh-proceso` | `--tracking-proceso` | 500 |
| `text-diagnostico` | `--h-diagnostico` | `--lh-diagnostico` | `--tracking-diagnostico` | 500 |
| `text-tarjeta` | `--h-tarjeta` | 1.2 | — | 500 |
| `text-servicio` | `--h-servicio` | 1.2 | `--tracking-servicio` | 500 |
| `text-subtitulo` | `--p-grande` | 1.5 | — | — |
| `text-cuerpo` | 1.0625rem (17) | 1.55 | — | — |
| `text-p` / `-p-chico` / `-etiqueta` | H | 1.5 | — | — |
| `text-pill` | 0.8125rem (13) | — | 0.0375rem (0.6 px) | 500 |
| `text-boton-hero` | 1.1875rem (19) | — | — | 600 |
| `text-boton-nav` | 0.9375rem (15) | — | — | 600 |
| `text-boton-movil` | 0.875rem (14) | — | — | — |
| `text-boton-vidrio` | 1.0625rem (17) | — | — | 500 |

### 1.4 Shape, space, motion

| Token | Value | Src | Theme |
|---|---|---|---|
| `--radio-control` / `-campo` | 12 px | H | `--radius-control`, `-campo` |
| `--radio-tarjeta` | 22 px | H | `--radius-tarjeta` |
| `--radio-tile` | 28 px | H | `--radius-tile` |
| `--radio-pill` | 999 px | H | `--radius-pill` |
| `--radio-panel` / `-servicio` / `-franja` | 28 / 24 (confirmed, pen extract § 8) / 20 px | P | `--radius-panel`, `-servicio`, `-franja` |
| `--control` | 36 px | H | `--spacing-control` |
| `--gutter` / `--gutter-desktop` | 24 / 80 px | H | `--spacing-gutter`, `-gutter-desktop` |
| `--seccion-y` / `-desktop` | 72 / 120 px | H | `--spacing-seccion-y`, `-seccion-y-desktop` |
| `--max` | 1280 px | H | `--container-contenido` |
| button metrics | hero 16/30, nav 11/20, móvil 12/14, vidrio x 28, gap 10, icons 20/16 | P | `--spacing-boton-*` |
| pill metrics | 8 / 18 / 10, gap 10, dot 20 / 14 / 7 | P | `--spacing-pill-*` |
| surface padding | panel 36; franja 22 / 28 | P | `--spacing-panel`, `-franja-y`, `-franja-x` |
| `--ease` | `cubic-bezier(.2, .7, .2, 1)` | H | `--ease-muush` |
| `--rapido` / `-medio` / `-lento` | 180 / 320 / 700 ms; 0 ms reduced | H | `:root` only |
| `--pill-salida` / `-entrada` | 220 / 260 ms | N (handoff `rotatePill`) | `:root` only |
| `--pill-desliz` | 0.375rem (6 px) | N | `:root` only |

## 2 · Glass presets (`app/shared/data/glassPresets.ts`)

```ts
type GlassFill = 'panel' | 'servicio' | 'franja'   // negro-900 70% | negro-900 | carbon-800 40%
type GlassRadius = 'panel' | 'servicio' | 'franja' // 28 | 24 | 20
type GlassBlur = 'none' | 'boton' | 'vidrio'       // 0 | 20 | 30
type GlassEdge = 'panel' | 'tarjeta' | 'plano'     // 25→4 | 18→4 | flat 10
type GlassPadding = 'none' | 'panel' | 'franja'    // 0 | 36 | 22/28

interface GlassStyle {
  fill: GlassFill; radius: GlassRadius; blur: GlassBlur
  edge: GlassEdge; shadow: boolean; padding: GlassPadding; clip: boolean
}

GLASS_PRESETS: Record<'panel' | 'servicio' | 'franja', GlassStyle>
//  panel:    fill panel,    radius panel,    blur vidrio, edge panel,   shadow true,  padding panel,  clip false
//  servicio: fill servicio, radius servicio, blur none,   edge tarjeta, shadow false, padding none,   clip true
//  franja:   fill franja,   radius franja,   blur boton,  edge plano,   shadow false, padding franja, clip false
```

A class lookup (`GLASS_CLASSES`) maps each value to complete, static Tailwind
class strings so the scanner sees them (no string concatenation of class
names).

## 3 · Background presets (`app/shared/data/backgroundPresets.ts`)

```ts
type ShaderName = 'liston' | 'acanalado'
type BackgroundPresetName =
  'homeHero' | 'howWeWork' | 'assessment' | 'aboutHero' | 'workWithUs' | 'faq' | 'notFound'

interface BackgroundPreset {
  shader: ShaderName
  uniforms: Readonly<Record<`u_${string}`, number>>  // overrides only; u_flip 1 included
  poster: string                                      // imported asset URL
  priority: 'high' | 'lazy'
}

SHADER_SOURCES: Record<ShaderName, () => Promise<string>> // dynamic ?raw imports
```

Values: research R9. Validation (unit-tested): every preset names an
existing shader and poster; every uniform name is declared by its shader
source; every preset has `u_flip: 1`.

## 4 · Runtime state (composables)

### `useShaderCanvas` state machine

```
idle (SSR / before mount)
  └─ mount → loading (poster visible, canvas transparent)
        ├─ no context / compile or link failure → fallback (poster only, terminal)
        └─ first frame drawn → ready
ready
  ├─ visible ∧ ¬hidden ∧ ¬reduced → animating (rAF loop)
  ├─ otherwise → paused (one frame drawn if visible; no loop)
  └─ webglcontextlost → fallback
any → unmount → disposed (observers disconnected, rAF cancelled, context lost)
```

Exposed: `isReady: Readonly<Ref<boolean>>`, `isFallback: Readonly<Ref<boolean>>`.

### `useRotatingText`

State: `index` (0 at SSR and mount). Transitions: tick every
`ROTATION_INTERVAL_MS = 2600` → `index = (index + 1) % items.length`, skipped
when `items.length < 2`, `document.hidden`, `paused`, or reduced motion.
