# Data Model: Cursor spotlight

**Feature**: `specs/008-cursor-spotlight` | **Date**: 2026-09-07

This feature stores nothing and shapes no content. Its "data" is three sets:
the design values that become tokens, the runtime values that become custom
properties, and the amended layer stack.

---

## 1 · New tokens — `app/assets/css/global.css`, `:root`

All nine go in `:root`, **not** in `@theme inline`: they are read from
hand-written CSS in a `<style scoped>` block, and a `@theme` name would
resolve to nothing in the site's emitted stylesheet (`rules.md` § R18).

**None of them may begin `--color-glow-` or `--spacing-glow-`** — that
namespace belongs to `SectionGlow` and is enforced by its test
(`research.md` § R5).

| Token | Value | Where it comes from |
|---|---|---|
| `--spotlight-red-400-42` | `color-mix(in srgb, var(--red-400) 42%, transparent)` | Frame `gViAx`, outer field centre `#CF31476B`. **DERIVED**: `0x6B` = 107 ÷ 255 = 41.96% → 42%. Cross-confirmed by `ui-map.md:270` ("Red 400 al 42%") |
| `--spotlight-red-400-17` | `color-mix(in srgb, var(--red-400) 17%, transparent)` | Frame `gViAx`, outer field mid stop `#CF31472B`. **DERIVED**: `0x2B` = 43 ÷ 255 = 16.86% → 17%. **Frame only** — the document does not record a mid stop (spec D-01) |
| `--spotlight-red-400-37` | `color-mix(in srgb, var(--red-400) 37%, transparent)` | Frame `gViAx`, core centre `#CF31475E`. **DERIVED**: `0x5E` = 94 ÷ 255 = 36.86% → 37%. Cross-confirmed by `ui-map.md:270` ("núcleo interior … al 37%") |
| `--spotlight-stop-mid` | `42%` | Frame `gViAx`: the outer field's second stop sits at position `0.42`. ⚠️ **Unrelated to the 42% above** — a coincidence of digits, and the reason the two are separate tokens with separate comments |
| `--spotlight-outer-size` | `41.25rem` | Frame `gViAx`: 660×660. **DERIVED**: 660 ÷ 16 = 41.25. Cross-confirmed by `ui-map.md:270` ("radio ~330px"), since 660 ÷ 2 = 330 |
| `--spotlight-core-size` | `11.25rem` | Frame `gViAx`: 180×180. **DERIVED**: 180 ÷ 16 = 11.25. Cross-confirmed ("núcleo interior ~90px"), since 180 ÷ 2 = 90 |
| `--dot-paper-lit-color` | `var(--dot-paper-color)` | **UNVERIFIED — spec A-03.** No source states how bright a lit dot is; a static mockup cannot draw it. Reusing the base colour paints the recipe twice inside the radius, which **DERIVES** `1 − (1 − 0.12)² = 22.6%`. The token exists so a value from Clau costs one line. **Owner: Clau** |
| `--duration-spotlight-fade` | `0.2s` | **UNVERIFIED — spec A-08.** The design specifies no timing, exactly as it specified none for the radar ping, whose 2.4s `ui-map.md` records as an implementation choice pending sign-off. Same treatment. **Owner: Clau** |
| `--layer-spotlight` | `-1` | The new top negative level — see § 3 |

Why `rem` and not `px` for the two sizes: the rest of `global.css` is in
`rem`, feature 6 made the same choice for the dot grid (its A-03), and the lit
sheet must track the dot grid exactly. A visitor who enlarges text gets a
proportionally larger spotlight rather than a fine texture inside a fixed
circle (spec A-10).

## 2 · Amended tokens

| Token | Was | Becomes | Why |
|---|---|---|---|
| `--layer-glow` | `-2` | `-3` | Room for a third level above the dots |
| `--layer-dots` | `-1` | `-2` | Same |

Both keep their **names**, which is why `DotGrid.vue` and
`SectionBackdrop.vue` — which name the token and never the number — do not
change (spec FR-018, SC-007). The comment block above them in `global.css`
grows the third row, and the two `.stories.ts` doc comments that print the old
numbers are corrected in the same change (FR-017).

## 3 · The amended layer stack (`rules.md` § R28)

| Level | What | Where it is written |
|---|---|---|
| root background | `ink-500` base | the layout |
| `--layer-glow` (**−3**) | section glow groups | inside each section |
| `--layer-dots` (**−2**) | dotted paper, page-wide | the layout, once |
| `--layer-spotlight` (**−1**) | cursor spotlight: the light and the lit dots | the layout, once, after mount |
| normal flow | nav, content, footer | everywhere |

**The relation is the contract, not the numbers.** Glows below dots below
content, all inside the layout root's single stacking context, all above the
root's own `ink-500` background. Everything § R28 says about what a section
must not do is unchanged and unaffected: the spotlight is a sibling of the dot
sheet, never an ancestor of a section.

## 4 · Runtime custom properties

Written by `useCursorSpotlight` onto the **layout root**, inherited by the
component. They are values, not tokens: no design source states them, because
they are wherever the pointer is.

| Property | Type | Written when | Read by |
|---|---|---|---|
| `--spotlight-x` | `<length>` in `px`, host-relative | once per animation frame, from `pointermove` or `scroll` | the beam's `translate3d`, and the lit sheet's counter-translate |
| `--spotlight-y` | `<length>` in `px`, host-relative | same | same |
| `--spotlight-opacity` | `0` or `1` | on pointer leave / re-entry only | the spotlight root's `opacity`, with `--duration-spotlight-fade` |

Each has a CSS fallback (`var(--spotlight-x, 50%)`,
`var(--spotlight-opacity, 1)`) so the component renders a complete, sensible
effect with nothing writing to it at all — which is exactly the state the
catalogue's pinned story runs in (spec FR-022).

## 5 · Tracked state

The whole of it, held in the composable's closure. Nothing is persisted,
nothing is shared across documents, nothing survives a reload.

| Name | Type | Meaning |
|---|---|---|
| `isEligible` | `boolean` | Both media conditions hold: a fine, hovering pointer, and motion not reduced. Recomputed on every `change` event (spec FR-013) |
| `hasPosition` | `boolean` | At least one qualifying mouse event has arrived. Until then the effect must not render (spec A-07) |
| `isActive` | `computed<boolean>` | `isEligible && hasPosition` — the flag the layout's `v-if` reads |
| `lastClientX/Y` | `number` | The most recent viewport coordinates, kept so a scroll can recompute page coordinates with no pointer event |
| `pendingFrame` | `number \| null` | The requested animation frame, or none. Its existence **is** the coalescing: an event with a frame already pending only updates `lastClient*` |
| `hostOffsetX/Y` | `number` | The layout root's page offset, measured once at activation and on resize, subtracted so the published values are host-relative (`research.md` § R4) |

### State transitions

```text
                 media ineligible
   ┌──────────────────────────────────────────┐
   │                                          │
[ off ] ──eligible──▶ [ armed ] ──first mouse event──▶ [ active ]
                          ▲                                │
                          └──────── pointer leaves ────────┘
                                  (element stays mounted,
                                   --spotlight-opacity: 0)
```

- **off → armed**: on mount, or when a `change` event makes both media
  conditions hold. Listeners attach here.
- **armed → active**: the first `pointermove` whose `pointerType` is
  `'mouse'`. `isActive` flips, the element mounts, the first coordinates are
  published in the same frame.
- **active → armed (visually)**: `pointerleave` on the document element sets
  `--spotlight-opacity: 0`. The element stays mounted so re-entry is a fade
  rather than a remount.
- **anything → off**: a `change` event that breaks either media condition, or
  scope disposal. Every listener is removed, any pending frame cancelled, and
  the three properties cleared from the host.
