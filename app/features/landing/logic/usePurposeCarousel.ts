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
 * The centred card is the one crossing a thin strip at the middle of the
 * track. The observer's root is narrowed to that strip with a negative
 * `rootMargin` (1% of the track wide), and any overlap at all — threshold `0`
 * — means the card is under it. The platform already knows, and reading
 * geometry per frame is the cost `findings.md` § R41 measured.
 *
 * ⚠️ Not a visible-fraction threshold. The first version said "centred once
 * three quarters of the card is inside the track", which only holds while the
 * track is narrow enough that at most one card can be 75% visible — true at
 * 390, false from about 760 up, where all three cards are inside the track at
 * once. The observer only fires on a crossing, so the active card then froze
 * on `Why` (or jumped to the wrong one at the ends) while the track itself
 * scrolled and snapped fine — Roberto's iPad report of 2026-10-19 (feature
 * 38). A strip at the centre is width-independent: one card crosses it at
 * rest at every width the carousel shows.
 */
const CENTRE_STRIP_MARGIN = '0px -49.5%'
/** The cards are the track's own children, so no per-card template ref. */
function cardsOf(track: HTMLElement): HTMLElement[] {
  return [...track.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  )
}

/**
 * Two cards can be under the strip together: their layout boxes overlap by a
 * few px by design (the negative gap in `PurposeCarousel.vue`), and a fast
 * fling can deliver both crossings in one batch. The entry's own rects are
 * already computed, so picking the nearer one reads no layout.
 */
function nearestToCentre(
  entries: IntersectionObserverEntry[]
): IntersectionObserverEntry | undefined {
  let best: IntersectionObserverEntry | undefined
  let bestDistance = Number.POSITIVE_INFINITY
  for (const entry of entries) {
    const root = entry.rootBounds
    const box = entry.boundingClientRect
    const distance =
      root && box
        ? Math.abs(box.left + box.width / 2 - (root.left + root.width / 2))
        : 0
    if (distance < bestDistance) {
      best = entry
      bestDistance = distance
    }
  }
  return best
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
    const entering = entries.filter(entry => entry.isIntersecting)
    const centred =
      entering.length > 1 ? nearestToCentre(entering) : entering[0]
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
        rootMargin: CENTRE_STRIP_MARGIN,
        threshold: 0,
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
