# Data model: Services float and custom cursor (feature 34)

No content, no locale keys, no runtime data. The "model" is a set of tokens,
one pure helper and one asset.

## 1 · Float tokens (`app/assets/css/global.css`, `:root`)

Read by hand-written CSS only, so they live in `:root`, not `@theme inline`
(`rules.md` § R18). None is named `--color-glow-*` / `--spacing-glow-*`
(§ R36).

| Token | Value | Status | Meaning |
|---|---|---|---|
| `--services-float-amplitude` | `7` (unitless) | Implementation choice inside D-4 (6–8) | Peak offset, in design pixels |
| `--duration-services-float` | `6s` | Implementation choice inside D-4 (5–7 s) | One full cycle |
| `--services-float-phase-step` | `137.5deg` | Implementation choice (golden angle, research R2) | Phase of node *i* = `i × step` |
| `--services-frame-px` | `0.0625rem` | DERIVED (1440-frame pixel at 16 px/rem) | Converts a design-pixel number to a length for HTML nodes |

Reduced motion (`@media (prefers-reduced-motion: reduce)`): amplitude `0`
(and the canvases' `animation: none`).

## 2 · The clock (`global.css`, document level, declared once)

```css
@property --services-float-phase {
  syntax: "<angle>";
  inherits: true;      /* every node and line under the canvas reads it */
  initial-value: 0deg;
}
@keyframes services-float {
  from { --services-float-phase: 0deg; }
  to   { --services-float-phase: 360deg; }
}
```

Each composition's canvas runs
`animation: services-float var(--duration-services-float) linear infinite`.
Only one canvas is displayed at a time (`hidden lg:block` / `lg:hidden`).

## 3 · Per-element values

| Where | Custom property | Source |
|---|---|---|
| Desktop `.node` | `--i` (inline, `"0"`..`"4"`) | `node.index`, as the timeline already does |
| Desktop `.node` | offset `dy = A · sin(phase + i · step)` | CSS, scoped |
| Desktop `<line>` | `--x1`, `--x2` (inline numbers) | `connectorEndpoints(SERVICE_NODE_CENTRES)` |
| Desktop `<line>` | `--i-a`, `--i-b` (inline, `i`, `i + 1`) | connector index |
| Desktop `<line>` | `dyA`, `dyB`, `s`, `b` → `translate(0, b) skewY(atan(s))` | CSS, scoped (research R1) |
| Mobile `.item` | `--i` (inline, already exists) | unchanged |
| Mobile `.item` | offset `dy`, same formula | CSS, scoped, D-3 block |
| Mobile `.spine` | none | static (research R4) |

### 3.1 Pure helper (`app/features/landing/data/servicesContent.ts`)

```ts
/** Inline custom properties for connector `index`: its resting x ends and
 *  the indices of the two nodes it joins. Built only from
 *  `connectorEndpoints` output, never from literals. */
export function connectorFloatVars(
  connector: ConnectorEndpoints,
  index: number
): Record<'--x1' | '--x2' | '--i-a' | '--i-b', string>
```

`data/` stays import-free (Article II). `connectorEndpoints` and
`SERVICE_NODE_CENTRES` are unchanged, so feature 14's tests keep passing.

## 4 · Cursor tokens (`global.css`, `:root`)

| Token | Value |
|---|---|
| `--cursor-brand` | `url("/cursor/you.svg") 1 9, auto` |
| `--cursor-brand-pointer` | `url("/cursor/you.svg") 1 9, pointer` |

Hotspot `1 9` in the 64×64 render space, per amendment A1 (2026-10-14; was `1 5` at 32×32 under OA-4). One place to change it.

## 5 · Asset (`public/cursor/you.svg`)

| Kept | Removed / changed |
|---|---|
| root `<svg … viewBox="0 0 32 32" fill="none" xmlns=…>` | `<rect width="32" height="32" fill="white"/>` removed; root `width`/`height` `32` → `64` (amendment A1, 2026-10-14: renders at 64×64, scales as a vector) |
| arrow `<path … fill="#CF3147" stroke="#CF3147"/>` | |
| pill `<rect x="8.19095" y="11.6306" width="23.534" height="14.7555" rx="7.37774" fill="#CF3147"/>` | |
| "You" glyphs `<path … fill="white"/>` (OA-7) | |

Optional: one XML comment after the root tag stating the source
(`01-Mouse.svg`, delivered by Roberto 2026-10-14), that the white background
was removed and the root resized to 64, and that `#CF3147` is `--red-400` but cannot be a token inside a
cursor image.

## 6 · Spotlight tokens after amendment A2 (`global.css`, `:root`, 2026-10-14)

| Token | Before A2 | After A2 | Status |
|---|---|---|---|
| `--spotlight-red-400-42` | `color-mix(in srgb, var(--red-400) 42%, transparent)` | **deleted** | A2-1 (glow) |
| `--spotlight-red-400-17` | `… 17% …` | **deleted** | A2-1 |
| `--spotlight-red-400-37` | `… 37% …` | **deleted** | A2-1 |
| `--spotlight-stop-mid` | `42%` | **deleted** | A2-1 |
| `--spotlight-core-size` | `11.25rem` | **deleted** | A2-1 |
| `--spotlight-outer-size` | `20.625rem` | **deleted**, replaced by the next row | A2-3 |
| `--spotlight-lit-radius` | n/a | `7.5rem` (120 px at a 16 px root) | new; A2-3, value A2-S2 |
| `--dot-paper-lit-color` | `var(--dot-paper-color)` (painted over the base: 22.6% derived) | `var(--red-400)` | A2-2, opacity A2-S1 |
| `--duration-spotlight-fade` | `0.2s` | unchanged | A2-5 |
| `--layer-spotlight` | `-1` | unchanged | A2-5 |

No other token is added. `--red-400` (`#cf3147`) is the existing ramp value;
the `--red-*` set stays `100…500`. None of these is in the closed
`--color-glow-*` / `--spacing-glow-*` namespace (§ R36).

Component-local (not a token): `--spotlight-size: calc(2 *
var(--spotlight-lit-radius))`, declared on `.cursor-spotlight` and read by
the beam (size, margins, fallback position). `--spotlight-beam-x/-y`
(existing, registration) unchanged.

Rendered lit-dot colour at distance *d* from the hotspot (DERIVED):
red-400 at alpha `max(0, 1 − d / 120px)` over the normal dot
(`--dot-paper-color` over ink-500). At *d* = 0 the pixel is `#CF3147`; at
*d* ≥ 120 px it is the normal dot.

## 7 · Footer surface after amendment A2 and A2 revision 1

A2 revision 1 (Roberto, 2026-10-15) reverses the footer column of A2: the
footer keeps its flat, opaque `bg-ink-500`. The "After A2" column is kept as
history and is superseded.

| Element | Before A2 | After A2 (superseded) | After A2 revision 1 (current) |
|---|---|---|---|
| `SiteFooter.vue` `<footer>` | `class="bg-ink-500"` | no class; no background of its own | `class="bg-ink-500"`, as before A2, now pinned by a test |
| Area behind the footer | hidden by the footer's fill | layout root ink-500 + `DotGrid` dots + spotlight lit dots (+ any last-section glow that reaches it, OA-9) | hidden by the footer's fill, as before A2: no dots, no red lit dots, no glow (OA-9 moot) |
| `ContactForm` / `ApplicationForm` root | `bg-glass-dark-contact` + `backdrop-blur-glass-dark` | unchanged | unchanged |

Surfaces in normal flow that cover layers −3…−1 after revision 1: the
footer (opaque ink-500) and the two form cards (dark glass). Everything
else shows the paper and the red lit dots. The § 6 tokens are unaffected by
the revision.
