<script setup lang="ts">
/**
 * LinkArrow — the secondary call to action. Loose text with a trailing
 * arrow, from docs/business/landing/design-extract.md § 7.
 *
 * It must never paint a background or a border in any state: a box turns it
 * back into a button, and the hero is designed to contain exactly one box
 * (ui-map.md § 3, "nunca un fondo").
 *
 * The arrow is rendered by the component, not supplied by the caller, so the
 * hover affordance always has something to move and no caller has to
 * remember it. § 7 leaves hover as "subrayado o desplazamiento de la flecha",
 * an either/or; both are applied, and the arrow shift is the reason the glyph
 * is owned here (spec A-04).
 */
export type LinkArrowSize = 'default' | 'large'

interface Props {
  href: string
  size?: LinkArrowSize
  /** Opens in a new context with the opener relationship severed. */
  external?: boolean
}

const { href, size = 'default', external = false } = defineProps<Props>()

const roleBySize = {
  default: 'text-link',
  large: 'text-link-lg',
} satisfies Record<LinkArrowSize, string>
</script>

<template>
  <!-- biome-ignore lint/a11y/useAnchorContent: the label is slot content -->
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="[
      'group font-instrument text-bone-100 no-underline hover:underline focus-visible:outline-red-400',
      roleBySize[size],
    ]"
  >
    <!--
      No background and no border in any state, including hover and focus —
      that rule is the whole point of this component.

      Only the outline colour is set on focus: ui-map.md § 10 requires a
      visible red-400 indicator and forbids removing it, but documents no
      thickness or offset, so the platform default geometry stands (spec
      A-07 — UNVERIFIED against the design file, flagged for Clau).
    -->
    <slot />
    <span
      aria-hidden="true"
      class="inline-block transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
    >
      →
    </span>
  </a>
</template>
