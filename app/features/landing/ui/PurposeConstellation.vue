<script setup lang="ts">
import type { PurposeNodeContent } from '@/features/landing/data/purposeContent'
import Radar from '@/shared/ui/Radar.vue'
import PurposeCard from './PurposeCard.vue'

/**
 * The desktop composition: three pinging radars, three words, and a card that
 * appears when you point at either of them.
 *
 * At rest the visitor sees **only** the radars and the labels. Every line has
 * zero width and every card zero opacity. The design file draws the *revealed*
 * state, which is the same misreading `ui-map.md` § *Receta del ping* already
 * recorded for the radar's halos: a static mockup cannot draw a hover, so it
 * draws the result (spec FR-006).
 *
 * ## The reveal is a sibling selector, not a composable
 *
 * Each row renders **trigger → line → card** in that DOM order inside a
 * `position: relative` box, so `.trigger:hover ~ .link` and
 * `.trigger:focus-visible ~ .card` reach the other two with no `:has()`, no
 * JavaScript and no state — the same class of mechanism as the LED ring and
 * the radar ping (spec FR-008). A screen reader walks it as label-then-copy,
 * which is the Golden Circle's own order.
 *
 * The trigger is one real `<button>` holding both the radar and the word: the
 * label is absolutely positioned inside it, so it is the button's accessible
 * name **and** part of its hit area. That is why pointing at the word reveals
 * exactly what pointing at the dot does, from one selector rather than two
 * (spec FR-007, FR-009). It carries no `href`, emits no fragment and shows no
 * pointer cursor, because clicking it does nothing (`rules.md` § R50,
 * `findings.md` § R56).
 *
 * Hiding uses `opacity` only — never `display`, `visibility` or
 * `content-visibility` — so all three copy blocks are in the accessibility
 * tree at rest and a keyboard or screen-reader user is never shown a card
 * announced as empty (spec FR-010). A revealed card never intercepts the
 * pointer, which keeps the reveal stable while the pointer travels and costs
 * mouse text selection at desktop width only (spec A-06); the same copy is
 * permanently selectable below `lg` and on any coarse-pointer device.
 *
 * ## Nothing here is a measured pixel
 *
 * The three connector lengths the frame draws — 394 / 244 / 94 — are **one
 * formula** over `--i`, and the three arc diameters are
 * `2 × distance(origin, radar)`. Neither appears as a literal (spec FR-014).
 * Card heights are intrinsic: the frame's 228 / 187 / 146 are 4 / 3 / 2 lines
 * of copy plus padding, so there is no height token and no `min-height`
 * (FR-015). The row's `align-items: center` is the whole of "the radar and the
 * line are centred on their card" (FR-016).
 *
 * `display` is deliberately **not** declared here: the section decides which
 * composition renders (`hidden lg:flex`), and declaring `flex` on this root
 * would fight the `lg:` that switches it on.
 *
 * The three concentric arcs are **not** in this file. They centre on a point
 * 270px above this component's own box and must be clipped to the *section*,
 * so they live in `PurposeSection.vue` where `absolute inset-0` resolves
 * against the box the design measures them from (spec FR-018).
 */
interface Props {
  nodes: PurposeNodeContent[]
}

const { nodes } = defineProps<Props>()
</script>

<template>
  <div class="constellation flex-col">
    <div
      v-for="node in nodes"
      :key="node.id"
      class="node relative flex items-center"
      :style="{ '--i': String(node.index) }"
    >
      <button type="button" class="trigger peer focus-visible:outline-red-400">
        <span class="radar"><Radar size="md" /></span>
        <span class="label font-instrument text-purpose-label text-red-200">
          {{ node.label }}
        </span>
      </button>

      <span aria-hidden="true" class="link" />

      <!--
        The revealed **surface** is the one part of the reveal that cannot live
        in the `<style scoped>` below: the glass colours are `@theme inline`
        tokens, and `var(--color-glass-red-strong)` in hand-written CSS
        resolves to nothing in the site build (`rules.md` § R18). So it is
        expressed as `peer-*` utilities on the card itself, which is also why
        the card has to be the trigger's direct sibling.

        These four utilities **are** the frame's brighter Why card
        (`#CF31472B` / `#CF314778`). That is a hover surface, not Golden Circle
        hierarchy (Roberto, 2026-09-08) — which is why all three cards rest at
        `red-soft` and all three brighten (spec FR-005).
      -->
      <PurposeCard
        :label="node.label"
        :copy="node.copy"
        class="card peer-hover:border-glass-red-strong-line peer-hover:bg-glass-red-strong peer-focus-visible:border-glass-red-strong-line peer-focus-visible:bg-glass-red-strong"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * Every property of the reveal is declared **here and nowhere else**. A scoped
 * selector carries `[data-v-…]` and so outweighs a Tailwind utility, which is
 * how a `motion-reduce:transition-none` class gets silently overridden and a
 * visitor who asked for no animation keeps seeing one (`findings.md` § R53).
 * The duration has to come from a token and Tailwind v4 has no
 * `transition-duration` theme namespace (§ R52), so the whole transition lives
 * in this block.
 */

.constellation {
  gap: var(--purpose-row-gap);
}

/*
 * **The one formula** (`data-model.md` § 2.2), written once and read by both
 * the reveal rule and the coarse-pointer rule.
 *
 * `100%` resolves where the property is *used*, not where the custom property
 * is declared, so it means "the width of this row" — the section's content box
 * — on the absolutely positioned line below. At `--i` 0 / 1 / 2 over a 1280px
 * row it yields 394 / 244 / 94, which is what the frame draws.
 */
.node {
  --purpose-link-revealed: calc(
    100% -
    var(--purpose-card-w) -
    var(--purpose-node-x) -
    var(--i) *
    var(--purpose-node-step) -
    var(--purpose-link-offset)
  );
}

/*
 * `left` places the trigger's left edge and the translate pulls it back half
 * its own width, so what lands on the token is the radar's **centre**:
 * 13.28125% + i × 11.71875% of 1280 = 170 / 320 / 470, against the frame's
 * 250 / 400 / 550 page coordinates less the 80px page margin.
 *
 * `top: 50%` is measured against the row, whose height is the card's, so the
 * radar sits on its own card's centre with nothing measured (FR-016).
 */
.trigger {
  position: absolute;
  top: 50%;
  left: calc(var(--purpose-node-x) + var(--i) * var(--purpose-node-step));
  translate: -50% -50%;
}

/*
 * The radar's two intensities, applied as one opacity lever on a wrapper —
 * `Radar.vue` is a `done` contract with no colour or opacity prop and is not
 * edited (spec FR-013). The rest value is ⚠️ UNVERIFIED and derived; see
 * `--purpose-radar-rest-opacity` in `global.css`.
 */
.radar {
  display: block;
  opacity: var(--purpose-radar-rest-opacity);
  transition: opacity var(--duration-purpose-reveal) ease-out;
}

/*
 * The word, positioned by its **top** rather than by its bottom: the frame
 * puts the label box at y 235 and the radar's footprint at y 249, so the 14px
 * is measured top-to-top and the label's own 21px box overlaps the empty upper
 * band of the 30px footprint. Anchoring it "14px above the footprint" instead
 * would sit it a full line-height too high.
 *
 * `nowrap` so a longer label never wraps; the frame's 220px label box is a
 * centred bound, not a constraint (spec A-04).
 */
.label {
  position: absolute;
  top: calc(-1 * var(--purpose-label-gap));
  left: 50%;
  white-space: nowrap;
  translate: -50% 0;
}

/*
 * The connector. It starts at the radar's right edge plus the frame's 1px gap
 * and, when revealed, ends exactly at the card's left edge — which the formula
 * guarantees rather than asserts, because both are the same percentages.
 *
 * The trailing delay is the **hide** sequence: on the way out the card fades
 * first and the line waits one duration before retracting (spec FR-007). The
 * reveal direction overrides it to `0s` below.
 */
.link {
  position: absolute;
  top: 50%;
  left: calc(
    var(--purpose-node-x) +
    var(--i) *
    var(--purpose-node-step) +
    var(--purpose-link-offset)
  );
  width: 0;
  height: var(--purpose-link-h);
  background: var(--purpose-link-color);
  transition: width var(--duration-purpose-reveal) ease-out
    var(--duration-purpose-reveal);
  translate: 0 -50%;
}

/*
 * The card. 54.6875% of the row is the frame's 700 of 1280, and
 * `margin-inline-start: auto` in the flex row is what puts it flush with the
 * content box's right edge — 660 + 700 = 1440 − 80 in the frame.
 *
 * No height and no `min-height`: the stack is copy-driven, so a longer locale
 * grows its own card and the radar stays centred on it (FR-015).
 */
.node > .card {
  width: var(--purpose-card-w);
  margin-inline-start: auto;
  opacity: 0;
  /* At rest and revealed alike — the card never intercepts the pointer. */
  pointer-events: none;
  transition: opacity var(--duration-purpose-reveal) ease-out;
}

/* ── revealed ─────────────────────────────────────────────────────────── */

.trigger:hover ~ .link,
.trigger:focus-visible ~ .link {
  width: var(--purpose-link-revealed);
  /* The line leads on the way in. */
  transition-delay: 0s;
}

.trigger:hover ~ .card,
.trigger:focus-visible ~ .card {
  opacity: 1;
  /* The card waits for the line to finish drawing. */
  transition-delay: var(--duration-purpose-reveal);
}

/* The radar is *inside* the trigger, so this one is a descendant, not `~`. */
.trigger:hover .radar,
.trigger:focus-visible .radar {
  opacity: 1;
}

/*
 * No pointer at all — a tablet at desktop width, or any touch screen wider
 * than the breakpoint. All three nodes render revealed with no interaction,
 * because a section whose substance exists only under a cursor has no
 * substance there (spec FR-011). Same discipline `rules.md` § R7 applied to
 * the LED ring.
 */
@media (hover: none) {
  .link {
    width: var(--purpose-link-revealed);
  }

  .radar,
  .node > .card {
    opacity: 1;
  }
}

/*
 * Reduced motion drops the transition and **nothing else**: showing the card
 * is information, the slide is decoration (spec FR-012). The radar's own ping
 * is already withdrawn by `Radar.vue` under the same query.
 */
@media (prefers-reduced-motion: reduce) {
  .link,
  .radar,
  .node > .card {
    transition: none;
  }
}
</style>
