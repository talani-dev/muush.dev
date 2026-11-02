import { onBeforeUnmount, onMounted, type Ref, readonly, ref, watch } from 'vue'
import {
  isStepLitVertical,
  verticalProgress,
} from '@/features/landing/logic/timelineProgress'
import { useDesktopLayout } from '@/shared/logic/useDesktopLayout'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'

/**
 * The "Cómo trabajamos" mobile rail: lit steps and segment fills (feature
 * 44, spec FR-019, FR-020; research R8). Desktop has no scroll fill
 * (Roberto, clarification 2026-11-02, FR-044): from `lg` nothing is
 * measured and the columns take their state from `useTimelineHover`.
 *
 * Starts FULL: every step lit, every rail segment filled. That is the
 * server render, the no-script page and the reduced-motion state, where no
 * listener is ever added. Otherwise, from mount, it measures once (so
 * arriving by `#como-trabajamos` is right at once) and again on every
 * scroll and resize, passive and coalesced to one read per frame; it
 * follows a reduced-motion change live and removes its listeners on
 * unmount. Crossing back below `lg` re-measures.
 *
 * `list` is the `<ol>`; its children are the steps. Each step but the last
 * holds a `[data-segmento]` rail segment, filled separately (`fills`) so the
 * red never runs past the last dot.
 */
export function useTimelineProgress(
  list: Ref<HTMLElement | null>,
  stepCount: number
): {
  lit: Readonly<Ref<readonly boolean[]>>
  fills: Readonly<Ref<readonly number[]>>
} {
  const isReduced = useReducedMotion()
  const isDesktop = useDesktopLayout()
  const lit = ref<boolean[]>(Array(stepCount).fill(true))
  const fills = ref<number[]>(Array(stepCount).fill(1))
  let frame = 0
  let listening = false

  function fillAll() {
    lit.value = Array(stepCount).fill(true)
    fills.value = Array(stepCount).fill(1)
  }

  function measure() {
    frame = 0
    const element = list.value
    if (!element || isDesktop.value) return
    const viewport = window.innerHeight
    const steps = [...element.children] as HTMLElement[]
    lit.value = steps.map(step =>
      isStepLitVertical(step.getBoundingClientRect().top, viewport)
    )
    fills.value = steps.map(step => {
      const segment = step.querySelector('[data-segmento]')
      if (!segment) return 0
      const box = segment.getBoundingClientRect()
      return verticalProgress(box.top, box.height, viewport)
    })
  }

  function schedule() {
    if (!listening || frame) return
    frame = requestAnimationFrame(measure)
  }

  function start() {
    if (listening) return
    listening = true
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    measure()
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    if (!listening) return
    listening = false
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
  }

  onMounted(() => {
    watch(
      isReduced,
      reduced => {
        if (!reduced) return start()
        stop()
        fillAll()
      },
      { immediate: true }
    )
    watch(isDesktop, schedule)
  })

  onBeforeUnmount(stop)

  return {
    lit: readonly(lit),
    fills: readonly(fills),
  }
}
