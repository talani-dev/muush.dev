<script setup lang="ts">
import { ref } from 'vue'
import { useRotatingText } from '@/shared/logic/useRotatingText'
import Pill from '@/shared/ui/Pill.vue'

/**
 * RotatingPill — the hero pill whose label cycles through the services
 * (feature 42, spec FR-015, contract § 3; handoff `rotatePill`).
 *
 * Every 2.6 s the label fades out rising 6 px over 220 ms (ease-in), and the
 * next one rises in from 6 px below over 260 ms (ease-out). Timing and
 * gating live in `useRotatingText`: it holds while the tab is hidden, while
 * the pointer rests on the pill (Clarifications Q4, confirmed by Roberto
 * 2026-10-31) and under reduced motion, where the first item stays.
 *
 * ## What a screen reader gets
 *
 * A visually hidden list of every item, read once, and NO live region: an
 * announcement every 2.6 s would talk over the page (SC-008). The animated
 * label is `aria-hidden`, so it is never read twice. Without JavaScript the
 * first item is what renders.
 *
 * The items come from the caller (FR-016); feature 44 adds them to the
 * locale files.
 */
interface Props {
  items: readonly string[]
}

const { items } = defineProps<Props>()

const isHovered = ref(false)
const { index, current } = useRotatingText(() => items, { paused: isHovered })
</script>

<template>
  <Pill @pointerenter="isHovered = true" @pointerleave="isHovered = false">
    <ul class="sr-only">
      <li v-for="item in items" :key="item">{{ item }}</li>
    </ul>
    <span class="relative block overflow-hidden">
      <Transition name="rotativo" mode="out-in">
        <span :key="index" data-rotativo aria-hidden="true" class="block">{{
          current
        }}</span>
      </Transition>
    </span>
  </Pill>
</template>

<style scoped>
/*
 * The slide reads the `:root` tokens `--pill-salida`, `--pill-entrada`
 * and `--pill-desliz` (global.css). Durations need a hand-written rule:
 * Tailwind v4 has no theme namespace for them (findings.md § R52). Reduced
 * motion needs no rule here, because the rotation itself never runs then.
 */
.rotativo-leave-active {
  transition:
    opacity var(--pill-salida) ease-in,
    transform var(--pill-salida) ease-in;
}

.rotativo-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--pill-desliz) * -1));
}

.rotativo-enter-active {
  transition:
    opacity var(--pill-entrada) ease-out,
    transform var(--pill-entrada) ease-out;
}

.rotativo-enter-from {
  opacity: 0;
  transform: translateY(var(--pill-desliz));
}
</style>
