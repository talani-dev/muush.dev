<script setup lang="ts">
import { computed } from 'vue'
import {
  GLASS_PRESETS,
  type GlassBlur,
  type GlassEdge,
  type GlassFill,
  type GlassPadding,
  type GlassPresetName,
  type GlassRadius,
  glassClasses,
} from '@/shared/data/glassPresets'

/**
 * GlassSurface — the Muush 1.0 "vidrio" (feature 42, spec FR-010,
 * contract § 1): a dark translucent fill, the 1 px top-lit edge, an optional
 * backdrop blur and long shadow. One primitive for the whole family, because
 * the `.pen` draws three surfaces that differ only in those parameters
 * (pen extract § 3).
 *
 * `preset` fills every field; each other prop overrides just its own field.
 * With no props it is the form panel. It renders the caller's content and
 * carries no copy (FR-016).
 *
 * `relative` is not a style choice: the edge is a positioned `::before`
 * (`borde-luz` in global.css), so the host must be positioned.
 */
interface Props {
  preset?: GlassPresetName
  fill?: GlassFill
  radius?: GlassRadius
  blur?: GlassBlur
  edge?: GlassEdge
  shadow?: boolean
  padding?: GlassPadding
  clip?: boolean
  as?: 'div' | 'section' | 'article' | 'form'
}

/*
 * `undefined` defaults on the two booleans on purpose: Vue casts an absent
 * boolean prop to `false`, which would silently override the preset's value.
 */
const {
  preset = 'panel',
  fill,
  radius,
  blur,
  edge,
  shadow = undefined,
  padding,
  clip = undefined,
  as = 'div',
} = defineProps<Props>()

const surfaceClasses = computed(() => {
  const base = GLASS_PRESETS[preset]
  return glassClasses({
    fill: fill ?? base.fill,
    radius: radius ?? base.radius,
    blur: blur ?? base.blur,
    edge: edge ?? base.edge,
    shadow: shadow ?? base.shadow,
    padding: padding ?? base.padding,
    clip: clip ?? base.clip,
  })
})
</script>

<template>
  <component :is="as" :class="['relative', surfaceClasses]">
    <slot />
  </component>
</template>
