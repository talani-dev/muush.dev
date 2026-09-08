# Data model — Propósito

**Feature**: `specs/013-purpose-section` | **Date**: 2026-09-08

Three tables: the content, the geometry that generates the constellation, and the
tokens. Every number below is either CONFIRMED from frame `ayCiG` / `D2AvaO` or
DERIVED with the arithmetic shown.

## 1 · Content

### 1.1 Keys

```ts
export const PURPOSE_KEYS = {
  eyebrow: 'landing.purpose.eyebrow',
  carouselLabel: 'landing.purpose.carouselLabel',
} as const

export const PURPOSE_NODES = [
  { id: 'why',  index: 0, labelKey: 'landing.purpose.why.label',  copyKey: 'landing.purpose.why.copy'  },
  { id: 'how',  index: 1, labelKey: 'landing.purpose.how.label',  copyKey: 'landing.purpose.how.copy'  },
  { id: 'what', index: 2, labelKey: 'landing.purpose.what.label', copyKey: 'landing.purpose.what.copy' },
] as const
```

`index` is the whole of what distinguishes the three nodes: it generates every
horizontal offset, the connector length and nothing else (§ 2.2).

### 1.2 Values

| Key | ES | EN |
|---|---|---|
| `eyebrow` | `Propósito` | `Purpose` |
| `why.label` | `Por qué` ⚠️ O-03 | `Why` ⚠️ O-03 |
| `how.label` | `Cómo` ⚠️ O-03 | `How` ⚠️ O-03 |
| `what.label` | `Qué` ⚠️ O-03 | `What` ⚠️ O-03 |
| `why.copy` | `Construimos con el estándar de las aplicaciones que admiramos. Tu negocio merece estar a la misma altura.` | `We build to the standard of the apps we admire. Your business deserves to be held to it.` |
| `how.copy` | `Con precisión: lo que tu negocio necesita, sin relleno. Un technology solution studio que responde como un solo equipo.` | `With precision: what your business needs, nothing padded. A technology solution studio that answers as one team.` |
| `what.copy` | `Diseñamos y construimos soluciones digitales alrededor de tu negocio.` | `We design and build digital solutions around your business.` |
| `carouselLabel` | `Propósito` | `Purpose` |

`eyebrow` comes from `design-extract.md` § 3's Pill list; the three copy blocks are
verbatim from `content.md` § *Propósito · Golden Circle ✅ aprobado*.

> `what.copy` is the **same sentence** as `landing.hero.subhead`. Both are approved
> copy in `content.md`. Shipped as written; reported, not deduplicated — they are
> two roles and one string, and collapsing them would couple two sections.

## 2 · Desktop geometry

Frame `ayCiG` places children in **page** coordinates. The section's box starts at
the page margin horizontally (80) and at page y **776** vertically — the Hero's
content ends there and the frame's own top is 164 lower (`rules.md` § R49).

So: `sectionX = frameX − 80`, `sectionY = frameY + 164`, over a content box of
1280 (1440 − 80 − 80, capped by `--spacing-shell-max`).

### 2.1 What the frame draws, and what generates it

| | Why | How | What | The relation |
|---|---|---|---|---|
| Card top (frame y) | 150 | 422 | 653 | one column, **gap 44** (422−378, 653−609) |
| Card height | 228 | 187 | 146 | **intrinsic**: 64 padding + n×41 for n = 4/3/2 lines |
| Card left (frame x) | 660 | 660 | 660 | one column at `sectionX` **580** = 1280 − 700 → **flush right** |
| Radar centre (frame) | 250,264 | 400,516 | 550,726 | x steps **150**; y = **that card's centre** (264 / 515.5 / 726) |
| Label centre x | 250 | 400 | 550 | **centred on its radar** (label box 140–360, 290–510, 440–660) |
| Label → radar gap | 14 | 14 | 14 | one value (235→249, 487→501, 697→711) |
| Line | 394 @266,264 | 244 @416,515.5 | 94 @566,726 | starts at radar right edge **+1**, ends at the card's left edge |
| Arc diameter | 1039 | 1617 | 2134 | `2 × distance((−100,−120), radarCentre)` |

**The arc derivation, in full.** All three arc bounding boxes centre on
(−100.5, −119.5) / (−100.5, −120.5) / (−100, −120) frame-relative — the same point
as `Glow origen` (−560 + 460, −580 + 460). Distances from (−100, −120):

| Node | dx | dy | √(dx²+dy²) | drawn radius |
|---|---|---|---|---|
| Why | 350 | 384 | **519.6** | 519.5 |
| How | 500 | 636 | **809.0** | 808.5 |
| What | 650 | 846 | **1066.9** | 1067.0 |

The three arcs pass through the three radars. That is the Golden Circle: one
origin, three rings, one node per ring.

### 2.2 The one formula

With `--i` set to 0 / 1 / 2 on each node, and percentages of the section's content
width:

```
radar centre x = var(--purpose-node-x) + var(--i) * var(--purpose-node-step)
                 13.28125%             + i * 11.71875%          → 170 / 320 / 470
line left      = radar centre x + var(--purpose-link-offset)     → 186 / 336 / 486
line width     = 100% − var(--purpose-card-w)
                      − var(--purpose-node-x) − var(--i) * var(--purpose-node-step)
                      − var(--purpose-link-offset)               → 394 / 244 / 94
```

Check: `100% − 54.6875% − 13.28125% = 32.03125%` of 1280 = 410, less the 16px
offset = **394**. At i=1, `20.3125%` → 260 − 16 = **244**. At i=2, `8.59375%` →
110 − 16 = **94**. `--purpose-link-offset` is 16px = radar/2 (15) + the 1px gap.

Vertical needs no formula: each row is `align-items: center`, so the radar, the
label cluster and the line land on their card's centre by construction (FR-016).

## 3 · Mobile geometry

Frame `D2AvaO` 390×534. `rules.md` § R12 already refused to replicate a mobile
frame's absolute y coordinates ("un teléfono real casi nunca mide 844px de alto"),
so mobile is a flow stack: Pill → gap → snap track → gap → indicator.

| | Value | Source |
|---|---|---|
| Active card | 274 wide (17.125rem), height intrinsic (frame draws 316) | CONFIRMED |
| Neighbour | the **same** card at `scale(0.88)` and `opacity: 0.45` | DERIVED: 241/274 = 0.8796, 278/316 = 0.8797 |
| Copy | `--text-lead` (22 → 30), weight **600** below `lg` | CONFIRMED · `rules.md` § R4's named exception |
| Card label | 13px/500 ls 0.9, `red-200`, **inside** the card | CONFIRMED · D6 |
| Peek | produced by the scale, ≈41.5px each side | DERIVED; `ui-map.md` § 4's "48px" is met within 6.5px |
| Track gap | 0 | the scale supplies the visual gap |
| Indicator | dots 8px active `red-400` / 6px inactive `ink-300`, gap 8 ⚠️ O-05 | sizes CONFIRMED |
| Indicator gap | 24 ⚠️ O-05 | seeded |
| Eyebrow gap | 40 ⚠️ O-05 | seeded |

The neighbour's drawn 18px copy is `22 × 0.88 = 19.4` rounded down by the
designer — a static drawing of the scaled state, the same thing the radar's halos
were (`ui-map.md` § *Receta del ping*).

## 4 · Tokens

**Two homes, and the split is the rule, not a preference.** A token read by
hand-written CSS goes in the `:root` block; a token consumed as a Tailwind utility
goes in `@theme inline`. A theme token named in hand-written CSS resolves to
nothing, silently (`rules.md` § R18, `findings.md` §§ R46, R52).

None of the names below matches `--color-glow-*` or `--spacing-glow-*`
(`rules.md` § R36).

### 4.1 `:root` — read by `<style scoped>`

| Token | Value | Derivation |
|---|---|---|
| `--purpose-node-x` | `13.28125%` | 170 / 1280 |
| `--purpose-node-step` | `11.71875%` | 150 / 1280 |
| `--purpose-card-w` | `54.6875%` | 700 / 1280 |
| `--purpose-link-offset` | `1rem` | radar/2 (15) + 1 |
| `--purpose-link-h` | `0.0625rem` | 1px |
| `--purpose-link-color` | `color-mix(in srgb, var(--bone-100) 24%, transparent)` | `#FBF8F63D`, 0x3D/255 = 24% |
| `--purpose-label-gap` | `0.875rem` | 14 |
| `--purpose-row-gap` | `2.75rem` | 44 |
| `--purpose-arc-origin-x` | `-14.0625%` | (−100 − 80) / 1280 |
| `--purpose-arc-origin-y` | `2.75rem` | −120 + 164 = 44 |
| `--purpose-arc-why` | `81.171875%` | 1039 / 1280 |
| `--purpose-arc-how` | `126.328125%` | 1617 / 1280 |
| `--purpose-arc-what` | `166.71875%` | 2134 / 1280 |
| `--purpose-arc-color` | same as `--purpose-link-color` | ⚠️ **O-02** |
| `--purpose-arc-w` | `0.0625rem` | ⚠️ **O-02** |
| `--purpose-radar-rest-opacity` | `0.73` | ⚠️ **O-01** — mean of 31/43 and 89/120 |
| `--purpose-card-scale` | `0.88` | 241/274, 278/316 |
| `--purpose-card-dim` | `0.45` | CONFIRMED |
| `--duration-purpose-reveal` | `0.2s` | ⚠️ **O-06** — the site's existing fade |

### 4.2 `@theme inline` — consumed as utilities

| Token | Value | 390 → 1440 |
|---|---|---|
| `--spacing-purpose-top` | `clamp(5.625rem, 3.9071rem + 7.0476vw, 10.25rem)` | 90 → 164 (the Hero's leftover, § R49) |
| `--spacing-purpose-eyebrow-gap` | `clamp(2.5rem, 0.875rem + 6.6667vw, 6.875rem)` | 40 ⚠️ O-05 → 110 (= 314 − 164 − 40, ⚠️ O-04) |
| `--spacing-purpose-card-m` | `17.125rem` | 274, mobile only |
| `--spacing-purpose-indicator-gap` | `1.5rem` | 24 ⚠️ O-05 |
| `--spacing-purpose-dot` | `0.5rem` | 8 |
| `--spacing-purpose-dot-sm` | `0.375rem` | 6 |
| `--spacing-purpose-dot-gap` | `0.5rem` | 8 ⚠️ O-05 |
| `--spacing-purpose-glow-a-x` | `clamp(3.5rem, 3.4071rem + 0.381vw, 3.75rem)` | 56 → 60 |
| `--spacing-purpose-glow-a-y` | `clamp(39.375rem, 37.6571rem + 7.0476vw, 44rem)` | 630 → 704 |
| `--spacing-purpose-glow-b-x` | `clamp(28.5rem, 6.3536rem + 90.8571vw, 88.125rem)` | 456 → 1410 |
| `--spacing-purpose-glow-b-y` | `clamp(53.375rem, 54.7464rem - 1.5238vw, 54.375rem)` | 870 → **854** (decreasing) |
| `--spacing-purpose-origen-x` | `-11.25rem` | −180, desktop only |
| `--spacing-purpose-origen-y` | `2.75rem` | 44, desktop only |
| `--text-purpose-label` | `1.0625rem` / lh 1.24 / ls `-0.0118em` / 600 | 17px, desktop only |
| `--text-purpose-card-label` | `0.8125rem` / lh 1.4 / ls `0.0692em` / 500 | 13px, mobile only |

The two label roles cannot be one clamp: the letter-spacing **changes sign**
(−0.2/17 = −0.0118em against 0.9/13 = +0.0692em) and each exists in exactly one
frame — the same reason `--text-menu-item` is a fixed token.

### 4.3 The six glow anchors, worked

| Glow | Page centre D / M | Section-relative D / M |
|---|---|---|
| `Propósito · wine` — wine-400 20% `1000-560` | 140,1480 / 80,1180 | **60,704** / **56,630** |
| `Propósito · red` — wine-300 17% `820-480` | 1490,1630 / 480,1420 | **1410,854** / **456,870** |
| `Glow origen` — red-400 12% `920` | frame −560,−580 (corner) | **−180,44** (desktop only) |

`x − 80 / x − 24` horizontally; `y − 776 / y − 550` vertically (the section's page-y
top). `Glow origen` is given as a corner, so its centre is `+460` on both axes.

Each is anchored **by its centre** with `-translate-x-1/2 -translate-y-1/2` on the
glow itself — permitted by `SectionBackdrop.vue`'s contract, and required because
each diameter is itself a `clamp()`.

⚠️ Both endpoints of every anchor are measured. Nothing is derived from the other
viewport: `rules.md` § R48 records that inference failing by up to 35px.

## 5 · Component surface

```ts
// ui/PurposeCard.vue — one card, two label placements, no mode prop (D6)
interface Props { label: string; copy: string }

// ui/PurposeConstellation.vue — desktop only
interface Props { nodes: PurposeNodeContent[] }   // label + copy + index

// ui/PurposeCarousel.vue — mobile only
interface Props { nodes: PurposeNodeContent[]; label: string }

// ui/PurposeSection.vue — the section: backdrop, eyebrow, both compositions
interface Props { eyebrow: string; carouselLabel: string; nodes: PurposeNodeContent[] }
```

`logic/usePurposeContent.ts` is the module's only new seam with the Nuxt runtime
(`useI18n`). `logic/usePurposeCarousel.ts` is a plain Vue composable — no Nuxt
call — so every `ui/` component still renders in Storybook and in a bare mount
(`rules.md` § R23).
