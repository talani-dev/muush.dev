<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BACKGROUND_PRESETS,
  type BackgroundPresetName,
} from '@/shared/data/backgroundPresets'
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
 * the section. Note for feature 44: a section that places it covers the
 * cursor spotlight, which paints at `--layer-spotlight` (−1) below normal
 * flow (research R17, accepted by Roberto 2026-10-31).
 *
 * ## The poster is the fallback, and it is always there
 *
 * The `<img>` is in the prerendered HTML and stays in the DOM: it is what a
 * visitor sees without JavaScript, without WebGL, when the shader fails,
 * after a lost GPU context, and before the first frame (FR-021). The canvas
 * above it is transparent until `isReady`, fades in over `--medio`
 * (0 ms under reduced motion), and is removed from view on `isFallback`.
 * No `<ClientOnly>`: the server render and the first client render agree
 * (research R7). Above-the-fold presets load the poster eagerly at high
 * priority, since it may be the LCP image; the others lazily.
 */
interface Props {
  preset: BackgroundPresetName
}

const { preset } = defineProps<Props>()

const config = computed(() => BACKGROUND_PRESETS[preset])
const isHighPriority = computed(() => config.value.priority === 'high')

const canvas = ref<HTMLCanvasElement | null>(null)
const { isReady, isFallback } = useShaderCanvas(canvas, config)
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-negro-950 print:hidden"
  >
    <img
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
