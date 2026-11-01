# Contracts: v2 primitives, background and composables (feature 42)

> Names updated by the naming reorganization approved by Roberto 2026-11-01:
> no component, token or utility carries a version marker.

These are the public surfaces features 43–46 build on. They are imported by
path from `@/shared/ui/…`, `@/shared/logic/…` and `@/shared/data/…`
(Article XII). No component calls a Nuxt composable or holds copy: every
string arrives as a prop or slot (`rules.md` § R23 corollary, Article VI).

## 1 · `GlassSurface.vue`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `preset` | `'panel' \| 'servicio' \| 'franja'` | — | Optional; fills every style field below. |
| `fill`, `radius`, `blur`, `edge`, `padding` | see data-model § 2 | from `preset` | Each one overrides its preset field. |
| `shadow` | `boolean` | from `preset` | |
| `clip` | `boolean` | from `preset` | `overflow: clip` for card media. |
| `as` | `'div' \| 'section' \| 'article' \| 'form'` | `'div'` | Root tag. |

Slot: `default`. Requires either `preset` or all style fields; with neither it
renders the `panel` preset. Emits nothing.

## 2 · `Pill.vue`

| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | Visible text. Ignored when the default slot is used. |

Slot: `default` (replaces the label; used by `RotatingPill`). The red dot is
`aria-hidden`. Root: `<div>` with `inline-flex`.

## 3 · `RotatingPill.vue`

| Prop | Type | Notes |
|---|---|---|
| `items` | `readonly string[]` | At least one. Shown in order, item 0 first. |

Behaviour: research R12, FR-015. Renders `Pill` with a visually hidden
`<ul>` of all items and an `aria-hidden` animated label. Pauses on
`pointerenter`, resumes on `pointerleave`.

## 4 · `PrimaryButton.vue`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | Visible text and accessible name. |
| `to` | `RouteLocationRaw \| string` | — | Internal route → `<NuxtLink>`. |
| `href` | `string` | — | External URL → `<a>`. `to` wins if both. |
| `type` | `'button' \| 'submit'` | `'button'` | Only when neither `to` nor `href`. |
| `size` | `'hero' \| 'nav' \| 'block'` | `'hero'` | `hero`: mobile metrics below `lg`, desktop from `lg`; the 20 px arrow shows at every width (pen extract § 9). `nav`: 11/20, 15 px, icon 16. `block`: desktop metrics, full width. |
| `icon` | `boolean` | `true` | Shows the right arrow where the size allows it. |
| `disabled` | `boolean` | `false` | Button only. 70 % opacity, `cursor: progress`. |

Emits `click` (native, passed through). Focus ring: research R15.

## 5 · `GlassButton.vue`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | |
| `to` / `href` / `type` | as in § 4 | | |
| `size` | `'hero'` | `'hero'` | Mobile 12/14, 14 px below `lg`; 16/28, 17 px from `lg`. |
| `disabled` | `boolean` | `false` | |

## 6 · `Heading.vue`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `level` | `1 \| 2 \| 3` | `2` | Renders `h1`–`h3`. |
| `size` | `'hero' \| 'seccion' \| 'proceso' \| 'diagnostico'` | `'seccion'` | Type token of research R4. |
| `first` | `string` | — | Line 1, Blanco. |
| `second` | `string` | — | Optional line 2, Gris 400. |

Both lines are `display: block` spans inside one heading element, so the
heading's accessible name is the two lines in order.

## 7 · `ShaderBackground.vue`

| Prop | Type | Notes |
|---|---|---|
| `preset` | `BackgroundPresetName` | research R9. |

Host contract: placed as the first child of a section that is
`position: relative` and `isolate`. The component paints `absolute inset-0`
at `z-0` within that section, `pointer-events-none`, `aria-hidden="true"`,
`print:hidden`. The section's content wrapper is `relative z-10`, so it
paints above the background (the handoff's `z-index: 1` rule, expressed with
a stock Tailwind level).

## 8 · Composables and helpers

```ts
// app/shared/logic/useReducedMotion.ts
export function useReducedMotion(): Readonly<Ref<boolean>>  // false on the server

// app/shared/logic/useRotatingText.ts
export const ROTATION_INTERVAL_MS = 2600
export function useRotatingText(
  items: MaybeRefOrGetter<readonly string[]>,
  options?: { paused?: MaybeRefOrGetter<boolean> }
): { index: Readonly<Ref<number>>; current: ComputedRef<string> }

// app/shared/logic/useShaderCanvas.ts
export function useShaderCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  preset: MaybeRefOrGetter<BackgroundPreset>
): { isReady: Readonly<Ref<boolean>>; isFallback: Readonly<Ref<boolean>> }

// app/shared/logic/shaderRenderer.ts
export interface ShaderRenderer {
  draw(timeSeconds: number, uniforms: Readonly<Record<string, number>>): void
  resize(width: number, height: number): void
  dispose(): void
}
export function createShaderRenderer(
  gl: WebGLRenderingContext, fragmentSource: string
): ShaderRenderer | null

// app/shared/utils/shaderFrame.ts (pure)
export const MOBILE_MAX_WIDTH = 768        // px, viewport
export const MOBILE_PIXEL_RATIO = 1
export const DESKTOP_MAX_PIXEL_RATIO = 1.5
export const STILL_TIME_SECONDS = 12
export const SHADER_DEFAULTS = { u_speed: 1, u_flip: 1, u_grain: 0.07 } as const
export function capPixelRatio(devicePixelRatio: number, viewportWidth: number): number
export function canvasPixelSize(cssWidth: number, cssHeight: number, ratio: number): { width: number; height: number }
export function shouldAnimate(state: { visible: boolean; documentHidden: boolean; reducedMotion: boolean }): boolean
export function withShaderDefaults(uniforms: Readonly<Record<string, number>>): Record<string, number>
```

Numeric constants in TypeScript are named, not CSS tokens: they are runtime
thresholds, not visual values, and Article VIII asks for named constants.
`768` mirrors the handoff rule; it is not a layout breakpoint.
