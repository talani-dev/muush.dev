<script setup lang="ts">
import { computed } from 'vue'

/**
 * The glass surface the whole site is built out of: 13 instances across the
 * two pages share this one recipe at six different opacities.
 *
 * Supplies fill, a hairline border, backdrop blur, radius and padding — and
 * nothing else. Width, layout, typography and colour of the content belong to
 * the caller. Values: docs/business/landing/design-extract.md § 1.
 *
 * `branding.md` forbids glass on glass ("nunca vidrio sobre vidrio"). A leaf
 * component cannot see its own ancestry, so that rule is enforced at review,
 * not here.
 */
export type GlassVariant =
  | 'red-strong'
  | 'red-soft'
  | 'bone-strong'
  | 'bone'
  | 'bone-faint'
  | 'dark'

export type GlassPadding = 'default' | 'tight' | 'none'
export type GlassElement = 'div' | 'article' | 'section' | 'aside'

interface Props {
  /** Required: there is no sensible fallback among six distinct surfaces. */
  variant: GlassVariant
  padding?: GlassPadding
  as?: GlassElement
}

const { variant, padding = 'default', as = 'div' } = defineProps<Props>()

/*
 * Complete class strings looked up from a closed map, never assembled by
 * concatenation: Tailwind scans source text, so `bg-glass-${variant}` would
 * name a utility the stylesheet never emits.
 */
const surfaceByVariant = {
  'red-strong':
    'bg-glass-red-strong border border-glass-red-strong-line backdrop-blur-glass-red rounded-panel',
  'red-soft':
    'bg-glass-red-soft border border-glass-red-soft-line backdrop-blur-glass-red rounded-panel',
  'bone-strong':
    'bg-glass-bone-strong border border-glass-line backdrop-blur-glass rounded-panel-sm',
  bone: 'bg-glass-bone border border-glass-line backdrop-blur-glass rounded-panel-sm',
  'bone-faint':
    'bg-glass-bone-faint border border-glass-line-faint backdrop-blur-glass rounded-panel-sm',
  dark: 'bg-glass-dark border border-glass-dark-line backdrop-blur-glass-dark rounded-panel-sm',
} satisfies Record<GlassVariant, string>

/* Padding is orthogonal to the variant: the `bone` variant is used both as a
 * project card (its own padding) and as a photo frame (the tight one). */
const defaultPaddingByVariant = {
  'red-strong': 'p-glass-red',
  'red-soft': 'p-glass-red',
  'bone-strong': 'p-glass-bone',
  bone: 'p-glass-bone',
  'bone-faint': 'p-glass-red',
  dark: 'p-glass-dark',
} satisfies Record<GlassVariant, string>

const paddingClass = computed(() => {
  if (padding === 'none') return ''
  if (padding === 'tight') return 'p-glass-tight'
  return defaultPaddingByVariant[variant]
})
</script>

<template>
  <component :is="as" :class="[surfaceByVariant[variant], paddingClass]">
    <slot />
  </component>
</template>
