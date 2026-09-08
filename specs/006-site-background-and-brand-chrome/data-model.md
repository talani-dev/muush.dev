# Data Model: Site background and brand chrome

**Feature**: `specs/006-site-background-and-brand-chrome` | **Date**: 2026-09-07

This feature stores nothing and fetches nothing. Its "data" is three sets of
named values — the dot-paper tokens, the two stacking levels, and the brand
font set — plus one contract that future features consume. They are recorded
here because each one is a single source of truth that a later feature will
read, and because two of them encode a design measurement that must not be
re-derived from memory.

---

## 1 · Dotted paper tokens

Declared in `app/assets/css/global.css`, in the `:root` block alongside
`--dark-glass`, `--stroke-led` and `--duration-radar-ping` — **not** inside
`@theme inline`. They are consumed from hand-written CSS in a `<style scoped>`
block, which is exactly the case `rules.md` § R18 governs: a theme name
(`--color-*`) would resolve to nothing in the site build while still looking
correct in the catalogue.

| Token | Value | Design source | Derivation |
|---|---|---|---|
| `--dot-paper-color` | `color-mix(in srgb, var(--ink-100) 12%, transparent)` | `#D9D9D91F` (`design-extract.md` § 10, frame child `yGTC1`) | `#D9D9D9` **is** `ink-100`; `0x1F ÷ 255 = 12.16%` → 12% (spec A-02, precedent `rules.md` §§ R2, R11) |
| `--dot-paper-radius` | `0.078125rem` | dot ⌀ 2.5px | 2.5 ÷ 2 = 1.25px; 1.25 ÷ 16 = 0.078125rem (spec A-03) |
| `--dot-paper-step` | `1.5rem` | grid step 24px | 24 ÷ 16 = 1.5rem |

**Values that deliberately do not become tokens**: the 288px tile and the 90
instances. Both are Pencil's way of drawing a repeat — 12 × 24 = 288, and
5 columns × 18 rows = 90 over the 1440×5060 page. Neither number means
anything to a browser, and putting either in the code would invite someone to
reproduce the tiling (spec FR-001).

The colour composition mirrors the glow tokens already in the file
(`--color-glow-wine-300-40` and friends use the same `color-mix(in srgb, …%,
transparent)` shape), so the ramp stays the only place a brand hex is written.

---

## 2 · Background stacking levels

| Token | Value | What sits there |
|---|---|---|
| `--layer-glow` | `-2` | every section's glow group |
| `--layer-dots` | `-1` | the page-wide dotted paper |

Two named levels rather than two literals, because the *relationship* is the
requirement (FR-005) and a bare `-1`/`-2` in two different files is a magic
number pair waiting to be "tidied" into one (Article VIII).

**Why they must differ.** Both layers are negative, so both paint before all
in-flow content — but between themselves, equal levels resolve by document
order, and the section glows come later in the document than the page-wide
sheet. Equal levels would therefore put the glows **on top of** the dots,
inverting the design. See `research.md` § R1.

**Ordering, top to bottom, once composed:**

```
page content (nav, sections, footer)   ← normal flow
dotted paper                           ← --layer-dots  (-1)
section glow groups                    ← --layer-glow  (-2)
ink-500 base                           ← the layout root's own background
```

That is the child order of frame `SdEJx`, bottom to top, one for one.

---

## 3 · Brand font set

Closed set. A weight outside it is a bug, not an option (spec FR-014).

| Family | Weights | Style | Used by |
|---|---|---|---|
| Poppins | 600 | normal | `Wordmark` only — the logo lockup (`branding.md`: "Poppins es exclusivo del logo/wordmark") |
| Instrument Sans | 400, 500, 600 | normal | everything else |

Subsets: `latin`, `latin-ext` (spec A-11). Format: `woff2` (the module's
default and the only format any supported browser needs).

**Verified against the repository, not assumed**: the 32 type tokens in
`global.css` name weights 400, 500 and 600 only. The sole occurrences of
`font-weight: 700` are inside the two `@font-face` blocks this feature
deletes, so removing weight 700 breaks nothing (spec FR-017).

**What is deleted**: four `@font-face` blocks and the TODO comment above them
(`global.css`, currently lines 529–560), plus the empty `public/fonts/`
directory they point into. Nothing else in the file moves; the type tokens
themselves are untouched (FR-018).

---

## 4 · Section glow contribution (the contract future features consume)

A "glow group" is not a data structure — it is a position in the component
tree. The contract is behavioural and is stated in full in
`contracts/components.md`; the parts that are *data* are:

- **A glow's identity** is the `color` + `opacity` + `size` triple
  `SectionGlow.vue` already accepts. This feature adds nothing to it and
  changes nothing about it (FR-011). The authoritative table of which triple
  goes where is `design-extract.md` § 10.
- **A glow's position is section-relative, never page-absolute** (spec A-13).
  The design records page-absolute offsets inside a 1440×5060 frame; a real
  page's section heights depend on content and locale, so those offsets drift
  the moment any copy changes. Converting a design offset into an offset
  relative to its own section is work each section feature owns, and it is the
  reason the glow group is anchored to the section rather than to the page.
- **Grouping is by section, because the design groups by section**: the names
  in § 10 are `Hero · foco`, `Propósito · wine`, `Servicios · red`,
  `CTA · cierre`. The unit was chosen by the designer, not invented here.

**Landing, 11 glows** and **Nosotros, 10 glows** — the full tables stay in
`design-extract.md` § 10 and are deliberately not copied here. Copying them
would create a second source of truth for hand-tuned values, and this feature
places none of them (spec A-10). **Note D-01**: § 10 lists a twelfth Landing
glow, `Glow origen`, that the design file does not contain. The design file
wins (Roberto, 2026-09-07; `rules.md` § R32), so Landing is eleven and the
site total is 21, not 22 — the document is what gets corrected, by Clau.

---

## 5 · Site icon

One file, `public/favicon.svg`, carrying:

| Property | Value | Source |
|---|---|---|
| `viewBox` | `0 0 100 100` with the geometry wrapped in `translate(3, -8)` | `branding.md` § *Isotipo* — "viewBox avatar/favicon" |
| circle | `cx=21 cy=45 r=6.5`, fill `#CF3147` (`red-400`) in both schemes | `app/assets/logo/README.md` |
| path | `M21 72 a17 17 0 0 1 34 0 a12 12 0 0 1 24 0` | idem |
| `stroke-width` | `12` | idem |
| `stroke-linecap` | `round` | idem |
| stroke, default | `#262626` (`ink-500`) — for light browser chrome | `branding.md` § *Sobre qué fondo va qué trazo* |
| stroke, `prefers-color-scheme: dark` | `#FBF8F6` (`bone-100`) | idem |

Literal hex is correct in this file: a standalone document in `public/` cannot
read a CSS custom property, which is why the three brand SVGs in
`app/assets/logo/` already carry literals too. Provenance is recorded in the
file itself.

`public/favicon.ico` is deleted (spec A-06). No `.ico`, no PNG, no manifest,
no Open Graph image — none was requested and each would need a rasterizer.
