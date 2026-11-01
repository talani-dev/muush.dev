import {
  type ComputedRef,
  computed,
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  type Ref,
  readonly,
  ref,
  toValue,
} from 'vue'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'

/** The hero pill's cadence (handoff `rotatePill`, `muush-1.0.md` § 3). */
export const ROTATION_INTERVAL_MS = 2600

/** A list needs two entries before there is anything to rotate to. */
const MIN_ROTATING_ITEMS = 2

interface RotatingTextOptions {
  /** True while the pointer rests on the pill (Clarifications Q4). */
  paused?: MaybeRefOrGetter<boolean>
}

/**
 * Cycles through a caller-supplied list (feature 42, spec FR-015, research
 * R12). Index 0 on the server, without JavaScript and at mount: the interval
 * starts in `onMounted`, which never runs during prerender.
 *
 * A tick is skipped while the tab is hidden (as the handoff), while `paused`
 * is true (pointer hover, Clarifications Q4, confirmed by Roberto
 * 2026-10-31) and under reduced motion, which is followed live: at load the
 * first item stays, and a change mid-rotation stops on the current item.
 * Fewer than two items start no interval. Cleared on unmount.
 */
export function useRotatingText(
  items: MaybeRefOrGetter<readonly string[]>,
  options: RotatingTextOptions = {}
): { index: Readonly<Ref<number>>; current: ComputedRef<string> } {
  const reducedMotion = useReducedMotion()
  const index = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined

  function advance() {
    const list = toValue(items)
    const isBlocked =
      document.hidden || toValue(options.paused) || reducedMotion.value
    if (isBlocked || list.length < MIN_ROTATING_ITEMS) return
    index.value = (index.value + 1) % list.length
  }

  onMounted(() => {
    if (toValue(items).length < MIN_ROTATING_ITEMS) return
    timer = setInterval(advance, ROTATION_INTERVAL_MS)
  })

  onBeforeUnmount(() => clearInterval(timer))

  const current = computed(() => {
    const list = toValue(items)
    return list[index.value % Math.max(list.length, 1)] ?? ''
  })

  return { index: readonly(index), current }
}
