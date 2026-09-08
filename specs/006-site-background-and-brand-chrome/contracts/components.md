# Component Contracts: Site background and brand chrome

**Feature**: `specs/006-site-background-and-brand-chrome` | **Date**: 2026-09-07

Two new components, plus two contracts that are not components at all — what
a **host** (the layout) must provide, and what a **section** must and must not
do. The second pair is the load-bearing part: it is how a future feature adds
its glows without editing anything shared, and how it can silently break the
layer order if it ignores the rules.

Conventions, as in `specs/002-primitive-ui-layer/contracts/components.md`:
`<script setup lang="ts">`, TypeScript strict, no `any`, every visible string
from the caller. Both components here are purely decorative and have no
strings at all.

---

## DotGrid

`app/shared/ui/DotGrid.vue`

```ts
// No props. No emits. No slots.
```

The page-wide dotted paper: **one element with one repeating background**,
never a grid of nodes (FR-001). It positions itself to fill its host and
places itself on `--layer-dots`.

Renders, in effect:

```
<div aria-hidden="true"                     ← decorative: never announced
     class="pointer-events-none absolute inset-0"   ← never intercepts a pointer
     style="z-index: var(--layer-dots)
            background-image: radial-gradient(
              var(--dot-paper-color) var(--dot-paper-radius),
              transparent var(--dot-paper-radius))
            background-size: var(--dot-paper-step) var(--dot-paper-step)" />
```

(The declarations live in a `<style scoped>` block, not an inline `style`
attribute; the shape above is the contract, not the syntax.)

**Requires of its host**: a positioned ancestor that establishes a stacking
context and spans the full document height — see *Host contract* below. A
`DotGrid` inside a viewport-height ancestor covers the viewport and leaves the
rest of the page bare; that is the one way to misuse it, and the story shows
the correct arrangement.

**Deliberately not props**: colour, dot size, step, opacity, `z-index`, or an
`as` element. There is exactly one dotted paper in the design, at exactly one
density; a variant prop would be inventing a system the design does not have
(Article VIII, same reasoning `SectionGlow` records for its own API).

---

## SectionBackdrop

`app/shared/ui/SectionBackdrop.vue`

```ts
// No props. No emits.
// Slot: default — the section's SectionGlow instances, positioned by the section.
```

The container a section puts its glows in. It fills its section, places itself
on `--layer-glow` (below the dots, above the ink base), and is inert.

Renders, in effect:

```
<div aria-hidden="true"
     class="pointer-events-none absolute inset-0"
     style="z-index: var(--layer-glow)">
  <slot />        ← <SectionGlow …> instances, positioned by the caller
</div>
```

**Why it exists rather than the section writing three classes itself**: it is
the single place the layer contract is written down, so a section author reads
one doc comment instead of rediscovering the paint-order rules. It is ~15
lines and has no props — it is not an abstraction over anything, it is a named
position in the stack.

**Positioning of the glows inside it is the caller's**, exactly as
`SectionGlow.vue` already documents: every glow sits at a different offset, so
a component that positioned them could serve exactly one. A transform on an
individual `SectionGlow` is fine (it creates a stacking context only for its
own — empty — subtree). A transform on the `SectionBackdrop` or on the section
is **not** — see *Section contract*.

**Deliberately not props**: `glows: GlowPlacement[]`. Passing the glows as
data would put their positions in a `data/` file and their rendering here,
splitting one decision across two layers for no gain — and the positions are
Tailwind utilities, not values. The slot keeps a glow's colour, size and
position readable in one place.

---

## Host contract (what the layout provides)

`app/layouts/default.vue` must give the page a root element that:

1. **Establishes exactly one stacking context** for the page (`isolation:
   isolate`). Without it, negative levels escape to the document root and
   paint behind the layout's own background — i.e. invisibly.
2. **Is positioned** (`position: relative`), so `DotGrid` and every
   `SectionBackdrop` resolve `inset-0` against a real box.
3. **Spans the whole document**, not the viewport, so the dot sheet reaches
   the footer on a 5000px page.
4. **Paints the ink-500 base as its own background** — the bottom layer of
   frame `SdEJx`. Because it is the stacking context's own background, it is
   painted before every negative level, which is precisely the design order.
5. **Clips horizontal overflow with `overflow-x: clip`** (not `hidden`), so
   the off-canvas glows never produce a horizontal scrollbar and never turn
   the page into a scroll container (`research.md` § R3).
6. **Renders `<DotGrid />` once.** Not per page, not per section.

It must **not** wrap the page content in an element carrying `z-index`,
`transform`, `filter`, `opacity < 1`, `isolation` or `contain: paint` — any of
those would become a second stacking context between the sections and the
root, trapping every section's glows above the dot sheet.

The existing `<div :inert="isOpen">` wrapper is safe: `inert` creates no
stacking context.

---

## Section contract (what a future section must do)

A section that contributes glows:

- **MUST** be the positioning reference for its own glows —
  `position: relative` on the section element.
- **MUST** render `<SectionBackdrop>` with its `SectionGlow` instances inside,
  positioned with utility classes relative to the section box.
- **MUST** translate the design's page-absolute offsets into section-relative
  ones (spec A-13). A page-absolute offset copied straight from the design
  file drifts the first time any copy changes length.
- **MUST NOT** create a stacking context on the section or on any wrapper
  between it and the layout root: no `transform`, `translate`, `scale`,
  `rotate`, `filter`, `backdrop-filter`, `opacity` below 1, `isolation`,
  `will-change`, `contain: paint`, `position: fixed`, or `position: sticky`
  with a `z-index`. Any of these traps the section's glows above the dot
  sheet. **The failure is silent** — nothing errors, the page just stops
  matching the design.
- **MUST NOT** paint an opaque background on the section. A section background
  is painted after the negative levels and would hide the section's own
  glows. The design has no opaque section except the footer (spec A-12), which
  contributes no glows.
- **MAY** contribute no glows at all. The base and the dots are the layout's,
  not the section's.

**Escape hatch**, so the constraint never becomes a blocker: a section that
genuinely needs a transform moves its glows to the page level instead. That is
a change to that one section, not to this layer.

This contract is duplicated in the doc comment of `SectionBackdrop.vue` and in
`docs/business/rules.md`, because those are the two places a future
implementer and a future spec author actually read.

---

## Unchanged contracts

- **`SectionGlow.vue`** — consumed exactly as feature 5 shipped it: the
  discriminated union of `color` / `opacity` / `size`, self-sizing, self-
  colouring, positioned by the caller, already `aria-hidden` and
  `pointer-events-none`. Zero lines change (FR-011, SC-006).
- **The nine existing primitives and the shell components** — untouched. This
  feature adds layers beneath them and swaps the typeface they render in; it
  changes none of their markup.
