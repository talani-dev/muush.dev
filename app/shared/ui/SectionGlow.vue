<script setup lang="ts">
import { computed } from 'vue'

/**
 * SectionGlow — the radial background layer of the whole site: a circle
 * filled with a radial gradient that fades from one of three base colours to
 * fully transparent. 21 of them, 11 on Landing and 10 on Nosotros, are the
 * entire background (docs/business/landing/design-extract.md § 10, corrected
 * against the design file — see the note on `Glow origen` below).
 *
 * **There is no variant system here, and adding one would be a bug.** The 21
 * are hand-tuned: three base colours crossed with ten opacities, and the
 * design file's names do not track the colour — `Propósito · red` is
 * wine-300, not red. So the component asks for colour, opacity and size
 * outright, and § 10's table says which combination goes where. A
 * `variant="foco" | "wine" | "cierre"` API would name positions the design
 * does not treat as a system, and could not express the opacity spread
 * anyway.
 *
 * Only the 12 colour+opacity pairs the design actually draws are accepted —
 * that is what the discriminated union below enforces, so a pair with no
 * token is a type error at the call site instead of an invisible glow.
 *
 * Positioning is the caller's: all of them sit at different absolute offsets,
 * and a background layer that placed itself could serve exactly one.
 *
 * **Why 21 and not § 10's 22** (read from the `.pen` on 2026-09-08, which
 * outranks the derived document — docs/business/rules.md §§ R29, R32): the
 * twelfth Landing entry, `Glow origen`, is real, but the design file nests it
 * inside the Propósito desktop frame instead of the page-level background
 * group. It is a piece of that section's composition, not of the background
 * layer, which is why the background count on Landing is 11. Its
 * `red-400` 12% fill and its `'920'` size stay — the Propósito feature is
 * their consumer. Correcting § 10's table is a pending human task.
 */

/** Base colours — only three across the whole background (design-extract.md § 10). */
export type GlowColor = 'red-400' | 'wine-300' | 'wine-400'

export type RedGlowOpacity = 12 | 60 | 65
export type Wine300GlowOpacity = 14 | 17 | 37 | 40
export type Wine400GlowOpacity = 12 | 14 | 20 | 28 | 30

/**
 * Diameters, named `desktop-mobile` after the design's own pair. Two glows
 * share a desktop diameter but not a mobile one, so the pair — not the
 * desktop value — is the identity.
 */
export type GlowSize =
  | '1500-760'
  | '1500-700'
  | '1400-700'
  | '1100-520'
  | '1000-560'
  | '1000-520'
  | '960-560'
  | '900-520'
  | '880-500'
  | '860-520'
  | '860-480'
  | '820-480'
  /**
   * Desktop-only: `Glow origen`, the anchor of the Propósito constellation.
   * Unconsumed today and **not** dead code — it is nested inside the Propósito
   * frame in the design file, so the section's own feature renders it.
   */
  | '920'

type Props =
  | { color: 'red-400'; opacity: RedGlowOpacity; size: GlowSize }
  | { color: 'wine-300'; opacity: Wine300GlowOpacity; size: GlowSize }
  | { color: 'wine-400'; opacity: Wine400GlowOpacity; size: GlowSize }

const props = defineProps<Props>()

/*
 * Complete class strings looked up from closed maps, never assembled by
 * concatenation: Tailwind scans source text, so `from-glow-${color}-${opacity}`
 * would name utilities the stylesheet never emits.
 */
const fillByRedOpacity = {
  65: 'from-glow-red-400-65',
  60: 'from-glow-red-400-60',
  12: 'from-glow-red-400-12',
} satisfies Record<RedGlowOpacity, string>

const fillByWine300Opacity = {
  40: 'from-glow-wine-300-40',
  37: 'from-glow-wine-300-37',
  17: 'from-glow-wine-300-17',
  14: 'from-glow-wine-300-14',
} satisfies Record<Wine300GlowOpacity, string>

const fillByWine400Opacity = {
  30: 'from-glow-wine-400-30',
  28: 'from-glow-wine-400-28',
  20: 'from-glow-wine-400-20',
  14: 'from-glow-wine-400-14',
  12: 'from-glow-wine-400-12',
} satisfies Record<Wine400GlowOpacity, string>

const diameterBySize = {
  '1500-760': 'size-glow-1500-760',
  '1500-700': 'size-glow-1500-700',
  '1400-700': 'size-glow-1400-700',
  '1100-520': 'size-glow-1100-520',
  '1000-560': 'size-glow-1000-560',
  '1000-520': 'size-glow-1000-520',
  '960-560': 'size-glow-960-560',
  '900-520': 'size-glow-900-520',
  '880-500': 'size-glow-880-500',
  '860-520': 'size-glow-860-520',
  '860-480': 'size-glow-860-480',
  '820-480': 'size-glow-820-480',
  '920': 'size-glow-920',
} satisfies Record<GlowSize, string>

/** Narrows on the colour so only that colour's real opacities are reachable. */
function fillFor(glow: Props): string {
  switch (glow.color) {
    case 'red-400':
      return fillByRedOpacity[glow.opacity]
    case 'wine-300':
      return fillByWine300Opacity[glow.opacity]
    case 'wine-400':
      return fillByWine400Opacity[glow.opacity]
  }
}

const fillClass = computed(() => fillFor(props))

/*
 * Notes on the single class string in the template, which is the whole
 * rendering recipe:
 *
 * `closest-side` is the reason the gradient shape is spelled out. A default
 * radial-gradient reaches the *corners* of its box, so on a square it would
 * end the fade 41% outside the circle and leave a visible edge where
 * `rounded-full` cuts it. Ending it at the side makes the gradient and the
 * circle the same size, which is what the design file draws. It is a gradient
 * geometry keyword — not a colour or a spacing literal.
 *
 * The outer stop is `to-transparent`. The design writes `#26262600` (ink-500
 * at zero alpha), but CSS premultiplies by alpha before interpolating a
 * gradient, so the hue of a fully transparent stop is never read and the two
 * paint identically.
 *
 * Decorative and inert: it means nothing to assistive technology, and it is
 * far larger than the content it sits behind, so it must never intercept a
 * pointer.
 */
</script>

<template>
  <span
    aria-hidden="true"
    :class="[
      'pointer-events-none block rounded-full bg-radial-[circle_closest-side] to-transparent',
      fillClass,
      diameterBySize[size],
    ]"
  />
</template>
