import {
  onBeforeUnmount,
  onMounted,
  type Ref,
  readonly,
  ref,
  shallowRef,
  watch,
} from 'vue'
import {
  type EmphasisTokens,
  emphasisAlongRail,
  isStepLitVertical,
  NEUTRAL_EMPHASIS,
  type StepEmphasis,
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
 * Starts FULL: every step lit, every rail segment filled, every step's
 * text whole (`emphasis` neutral). That is the server render and the
 * no-script page. From mount it measures once (so arriving by
 * `#como-trabajamos` is right at once) and again on every scroll and
 * resize, passive and coalesced to one read per frame; it removes its
 * listeners on unmount. Crossing back below `lg` re-measures.
 *
 * Feature 50 (Roberto 2026-11-06): it also gives each step's text its
 * scroll emphasis (`emphasisAlongRail`, tokens `--paso-enfasis-*` read from
 * `:root` once listening starts). Because that emphasis keeps its opacity
 * under reduced motion, the listener now runs then too; the rail itself
 * still stays full under reduced motion, as before, and the emphasis drops
 * its scale. A reduced-motion change is followed live. If the tokens cannot
 * be read (no stylesheet), the text stays whole.
 *
 * `list` is the `<ol>`; its children are the steps. Each step but the last
 * holds a `[data-segmento]` rail segment, filled separately (`fills`) so the
 * red never runs past the last dot.
 */

/** Reads the `--paso-enfasis-*` tokens off `:root`, where `global.css` declares them; null if any is missing. */
function readEmphasisTokens(): EmphasisTokens | null {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string) => Number.parseFloat(style.getPropertyValue(name))
  const tokens: EmphasisTokens = {
    neighbourScale: read('--paso-enfasis-escala-vecino'),
    neighbourOpacity: read('--paso-enfasis-opacidad-vecino'),
    minScale: read('--paso-enfasis-escala-min'),
    minOpacity: read('--paso-enfasis-opacidad-min'),
  }
  return Object.values(tokens).some(Number.isNaN) ? null : tokens
}

export function useTimelineProgress(
  list: Ref<HTMLElement | null>,
  stepCount: number
): {
  lit: Readonly<Ref<readonly boolean[]>>
  fills: Readonly<Ref<readonly number[]>>
  emphasis: Readonly<Ref<readonly StepEmphasis[]>>
} {
  const isReduced = useReducedMotion()
  const isDesktop = useDesktopLayout()
  const lit = ref<boolean[]>(Array(stepCount).fill(true))
  const fills = ref<number[]>(Array(stepCount).fill(1))
  const neutral = () => Array(stepCount).fill(NEUTRAL_EMPHASIS)
  /* Shallow: the array is always replaced whole, and its entries stay raw,
     so `NEUTRAL_EMPHASIS` can be recognised by identity. */
  const emphasis = shallowRef<StepEmphasis[]>(neutral())
  let tokens: EmphasisTokens | null = null
  let frame = 0
  let listening = false

  function fillAll() {
    lit.value = Array(stepCount).fill(true)
    fills.value = Array(stepCount).fill(1)
  }

  /** Back to whole, without a new array (and a re-render) if already there. */
  function resetEmphasis() {
    if (emphasis.value.every(step => step === NEUTRAL_EMPHASIS)) return
    emphasis.value = neutral()
  }

  function measureEmphasis(tops: number[], viewport: number) {
    if (!tokens) return resetEmphasis()
    emphasis.value = emphasisAlongRail(tops, viewport, tokens, isReduced.value)
  }

  function measure() {
    frame = 0
    const element = list.value
    if (!element) return
    if (isDesktop.value) return resetEmphasis()
    const viewport = window.innerHeight
    const steps = [...element.children] as HTMLElement[]
    const tops = steps.map(step => step.getBoundingClientRect().top)
    measureEmphasis(tops, viewport)
    if (isReduced.value) return
    lit.value = tops.map(top => isStepLitVertical(top, viewport))
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
    tokens = readEmphasisTokens()
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
    watch(isReduced, reduced => {
      if (reduced) fillAll()
      measure()
    })
    if (isReduced.value) fillAll()
    start()
    watch(isDesktop, schedule)
  })

  onBeforeUnmount(stop)

  return {
    lit: readonly(lit),
    fills: readonly(fills),
    emphasis: readonly(emphasis),
  }
}
