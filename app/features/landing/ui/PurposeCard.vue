<script setup lang="ts">
import GlassPanel from '@/shared/ui/GlassPanel.vue'

/**
 * One Golden Circle block on a red glass surface: a label and a copy block.
 *
 * **One component, two label placements, and no mode prop.** It always receives
 * `label` **and** `copy`; the label is painted inside the card below `lg` and
 * hidden above it, where the constellation paints the word outside next to the
 * radar. That is `decisions-open.md` § D6 verbatim — *"un solo dato, dos
 * posiciones — no requiere prop de modo"* — and it costs exactly one utility.
 *
 * The `lg:hidden` is what keeps the label out of the accessibility tree twice
 * on desktop: the constellation's trigger already carries it as its accessible
 * name, so a second copy inside the card would be announced twice (spec
 * FR-004, SC-002).
 *
 * **All three cards share one surface.** The design file draws the Why card
 * brighter (`#CF31472B` fill / `#CF314778` stroke — the `red-strong` variant)
 * and How and What at `red-soft`, which reads as Golden Circle hierarchy and is
 * not: the frame draws the **revealed** state, and the brighter values are the
 * hover surface (Roberto, 2026-09-08). So the resting variant is `red-soft`
 * for all three, and `PurposeConstellation` promotes it on hover and focus
 * (spec FR-005).
 *
 * ## The two deviations from `--text-lead`, both recorded rather than silent
 *
 * 1. **The weight goes 500 → 600 below `lg`.** `design-extract.md` § 9 draws
 *    the Lead role as 30/500 on desktop and 22/**600** on mobile, and
 *    `rules.md` § R4 named it the single documented exception to the fluid
 *    scale and left it to whoever built this component. It is the reason the
 *    `lg:` here is legitimate under Article VII: a breakpoint changing a
 *    *weight*, never a size — the size still comes from `text-lead`'s
 *    `clamp()`.
 * 2. **The mobile letter-spacing stays at the token's −0.02em** against the
 *    frame's −0.03em. At 22px that is 0.22px, and the criterion is the one
 *    `rules.md` §§ R2 and R11 already applied twice: implement the system
 *    value, record the discrepancy, do not fork the token.
 *
 * The copy colour is **not documented anywhere** — neither `design-extract.md`
 * § 9's Lead row nor § 10's PurposeCard entry gives one. `bone-100` is used
 * because `branding.md` § *Sobre qué fondo va qué trazo* pairs ink surfaces
 * with bone text, and it is reported rather than presented as measured.
 */
interface Props {
  /** Painted inside the card below `lg`; the constellation owns it above. */
  label: string
  copy: string
}

const { label, copy } = defineProps<Props>()
</script>

<template>
  <!--
    `class` falls through to `GlassPanel`'s root and from there to the rendered
    `<article>`, so the caller can hang layout and the revealed surface on the
    same element. That pass-through is why the card can be the direct sibling
    of the constellation's trigger, which is what `peer-hover:` needs.
  -->
  <GlassPanel
    variant="red-soft"
    as="article"
    class="flex flex-col gap-purpose-card-gap"
  >
    <span
      class="font-instrument text-purpose-card-label text-red-200 lg:hidden"
    >
      {{ label }}
    </span>
    <p
      class="font-instrument text-lead font-semibold text-bone-100 lg:font-medium"
    >
      {{ copy }}
    </p>
  </GlassPanel>
</template>
