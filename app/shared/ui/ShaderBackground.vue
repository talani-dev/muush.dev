<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BACKGROUND_PRESETS,
  type BackgroundPreset,
  type BackgroundPresetName,
} from '@/shared/data/backgroundPresets'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'
import { useShaderCanvas } from '@/shared/logic/useShaderCanvas'

/**
 * ShaderBackground — a living section background of Muush 1.0 (feature 42,
 * spec FR-018…FR-026, contract § 7): the listón or the vidrio acanalado,
 * chosen by a named preset, over the section's still poster.
 *
 * ## Host contract
 *
 * Place it as the FIRST child of a section that is `relative isolate`, and
 * give the section's content wrapper `relative z-10`. This element fills the
 * section (`absolute inset-0 z-0`), takes no pointer, is hidden from
 * assistive technology and is not printed. `isolate` keeps its `z-0` inside
 * the section.
 *
 * ## The poster is the fallback, and it is always there
 *
 * The `<img>` is in the prerendered HTML and stays in the DOM: it is what a
 * visitor sees without JavaScript, without WebGL, when the shader fails,
 * after a lost GPU context, and before the first frame (FR-021). The canvas
 * above it is transparent until `isReady`, fades in over `--medio`
 * (0 ms under reduced motion), and is removed from view on `isFallback`.
 * A preset without a poster (the mobile menu's, feature 43) renders no
 * `<img>`: its fallback is the host's own background showing through.
 * No `<ClientOnly>`: the server render and the first client render agree
 * (research R7). Above-the-fold presets load the poster eagerly at high
 * priority, since it may be the LCP image; the others lazily.
 *
 * ## Compact uniforms (feature 46, spec FR-046, research R5)
 *
 * Below 1024 px a preset's `compactUniforms`, when it has them, replace its
 * `uniforms`: the `.pen` mobile frames draw their own values (Roberto
 * 2026-11-02). One canvas, one shader: only the uniform set changes, and
 * the canvas redraws once when the layout crosses 1024, paused or not.
 * Before mount the compact set is selected, but nothing is drawn until
 * after mount, when the layout is known.
 */
interface Props {
  preset: BackgroundPresetName
}

const { preset } = defineProps<Props>()

/* First, so its own `onMounted` has read the layout before the canvas starts. */
const isDesktop = useDesktopLayout()

const config = computed(() => BACKGROUND_PRESETS[preset])
const isHighPriority = computed(() => config.value.priority === 'high')

/** The preset the canvas draws: the compact set below 1024 when present. */
const drawn = computed<BackgroundPreset>(() => {
  const { compactUniforms, ...rest } = config.value
  if (isDesktop.value || !compactUniforms) return rest
  return { ...rest, uniforms: compactUniforms }
})

const canvas = ref<HTMLCanvasElement | null>(null)
const { isReady, isFallback } = useShaderCanvas(canvas, drawn)
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-negro-950 print:hidden"
  >
    <img
      v-if="config.poster"
      :src="config.poster"
      alt=""
      decoding="async"
      :loading="isHighPriority ? 'eager' : 'lazy'"
      :fetchpriority="isHighPriority ? 'high' : undefined"
      class="absolute inset-0 size-full object-cover"
    >
    <canvas
      ref="canvas"
      :class="[
        'absolute inset-0 size-full transition-opacity duration-(--medio) ease-muush',
        isReady ? 'opacity-100' : 'opacity-0',
        isFallback ? 'hidden' : 'block',
      ]"
    />
  </div>
</template>
