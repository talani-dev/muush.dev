import { onScopeDispose, type ShallowRef, shallowRef, watch } from 'vue'

/**
 * The little that the mobile carousel needs beyond CSS.
 *
 * **The track does the work.** `scroll-snap-type: x mandatory`,
 * `scroll-snap-align: center` and a symmetric inline padding are the whole of
 * swiping, snapping and centring — and they are also the no-JS fallback
 * verbatim (`ui-map.md` § 10). Nothing is arranged for that fallback; it is
 * what remains when this file does not run.
 *
 * So this composable adds only what CSS cannot: **which card is centred**, the
 * indicator's `scrollTo`, and wrap-around arrow keys. It is a **plain Vue**
 * composable — no Nuxt call — which is what keeps every `ui/` component of
 * this section mountable in Storybook and in a bare Vue Test Utils mount
 * (`docs/business/rules.md` § R23).
 *
 * `isEnhanced` is the switch for everything that must not exist without
 * scripting: the neighbour's scale and dim, and the indicator itself. It is
 * `false` on the server and stays `false` until the observer is wired, so the
 * prerendered document carries three cards at full size and full opacity and
 * no inert dots — `ui-map.md` § 10's *"nunca atenuadas por default"*, and
 * `findings.md` § R56's rule against painting a control that does nothing
 * (spec FR-023).
 *
 * **The loop is wrap-around for the indicator and the keyboard only** (spec
 * A-07). A seamless *swipe* loop needs cloned nodes or scroll teleporting, and
 * both fight the plain snap track that the no-JS path depends on.
 */
export interface PurposeCarousel {
  /** Index of the centred card. `0` (`Why`) on entry (`ui-map.md` § 4). */
  activeIndex: Readonly<ShallowRef<number>>
  /** Whether the active-card tracking is live. Drives scale, dim and dots. */
  isEnhanced: Readonly<ShallowRef<boolean>>
  /** Centres a card. Scrolling smoothness is the track's CSS, not this call. */
  focusCard: (index: number) => void
  /** Left/right arrows, wrapping in both directions. */
  onIndicatorKeydown: (event: KeyboardEvent) => void
}

/**
 * A card counts as centred once three quarters of it is inside the track. One
 * threshold rather than a scroll-position calculation: the platform already
 * knows, and reading geometry per frame is the cost `findings.md` § R41
 * measured.
 */
const CENTRED_RATIO = 0.75

/** The cards are the track's own children, so no per-card template ref. */
function cardsOf(track: HTMLElement): HTMLElement[] {
  return [...track.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  )
}

export function usePurposeCarousel(
  track: Readonly<ShallowRef<HTMLElement | null>>,
  count: number
): PurposeCarousel {
  const activeIndex = shallowRef(0)
  const isEnhanced = shallowRef(false)
  /* Not reactive: nothing renders from it, and it is rebuilt with the track. */
  let cards: HTMLElement[] = []
  let observer: IntersectionObserver | undefined

  const supportsTracking = typeof IntersectionObserver !== 'undefined'

  function onIntersect(entries: IntersectionObserverEntry[]): void {
    const centred = entries.find(entry => entry.isIntersecting)
    if (!centred) return

    const index = cards.indexOf(centred.target as HTMLElement)
    if (index !== -1) activeIndex.value = index
  }

  function focusCard(index: number): void {
    activeIndex.value = index

    const card = cards[index]
    const element = track.value
    if (!card || !element) return

    /* No `behavior` on purpose: the track declares `scroll-behavior: smooth`
       and drops it under `prefers-reduced-motion`, so the preference is
       honoured declaratively instead of being re-derived here. */
    element.scrollTo({
      left: card.offsetLeft + card.offsetWidth / 2 - element.clientWidth / 2,
    })
  }

  function onIndicatorKeydown(event: KeyboardEvent): void {
    const step =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return

    focusCard((activeIndex.value + step + count) % count)
    event.preventDefault()
  }

  /* A template ref is `null` during setup and again after unmount, so the
     wiring follows the element rather than a single lifecycle moment. */
  const stopWatching = watch(
    track,
    element => {
      observer?.disconnect()
      observer = undefined
      cards = element ? cardsOf(element) : []
      isEnhanced.value = supportsTracking && cards.length > 0
      if (!element || !supportsTracking) return

      observer = new IntersectionObserver(onIntersect, {
        root: element,
        threshold: CENTRED_RATIO,
      })
      for (const card of cards) observer.observe(card)
    },
    { immediate: true, flush: 'post' }
  )

  onScopeDispose(() => {
    stopWatching()
    observer?.disconnect()
    observer = undefined
  })

  return { activeIndex, isEnhanced, focusCard, onIndicatorKeydown }
}
