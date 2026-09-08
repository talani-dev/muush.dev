import {
  computed,
  onMounted,
  onScopeDispose,
  type Ref,
  readonly,
  ref,
} from 'vue'

/**
 * The cursor spotlight's tracking: every listener, the two media conditions
 * that decide whether the effect exists at all, and the coalescing that keeps
 * a 1000 Hz mouse down to one visual update per animation frame.
 *
 * It publishes two coordinates and one opacity as **custom properties on the
 * host** — the layout root, which is also the coordinate origin — and returns
 * nothing but a flag. `CursorSpotlight.vue` imports none of this: a `ui/`
 * component that called a composable would attach window listeners inside
 * every story that rendered it and could not be pinned at a fixed position at
 * all (`docs/business/rules.md` § R23's corollary).
 *
 * **Three separate off-switches**, and all three must leave the page exactly
 * as feature 006 renders it (`ui-map.md` § 10 and § *Movimiento reducido*):
 *
 * 1. a pointer that cannot hover or is coarse — desktop only, by design;
 * 2. `prefers-reduced-motion: reduce`, where the spotlight is listed first;
 * 3. no JavaScript, which is this file not running.
 *
 * Both media conditions are **live**: a mouse plugged in, or the OS preference
 * flipped, takes effect without a reload (spec FR-013).
 *
 * `isActive` is `false` during SSR and stays `false` until the first mouse
 * event arrives. That is what keeps the element out of the prerendered HTML
 * (so the no-JS fallback is mechanical rather than promised), what makes the
 * first client render agree with the server's, and what stops a red blob
 * appearing in the top-left corner before the pointer has ever moved
 * (spec A-07).
 */

/**
 * "Escritorio" is not a property a browser exposes; the pointer's capabilities
 * are, and they are the precedent `rules.md` § R7 set for the LED border
 * (spec A-06). A hybrid laptop passes this query, which is why every event is
 * also checked for `pointerType` below.
 */
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Written on the host and inherited by the layer. `data-model.md` § 4. */
const POSITION_X = '--spotlight-x'
const POSITION_Y = '--spotlight-y'
const OPACITY = '--spotlight-opacity'

const VISIBLE = '1'
const HIDDEN = '0'

export function useCursorSpotlight(host: Ref<HTMLElement | null>): {
  isActive: Readonly<Ref<boolean>>
} {
  /** Both media conditions hold. Recomputed on every `change` event. */
  const isEligible = ref(false)
  /** At least one qualifying mouse event has arrived (spec A-07). */
  const hasPosition = ref(false)
  const isActive = computed(() => isEligible.value && hasPosition.value)

  let lastClientX = 0
  let lastClientY = 0
  /**
   * The scroll offset, cached from the `scroll` event rather than read inside
   * the frame — see `readScrollOffset`. This is the difference between a hot
   * path that touches geometry and one that does arithmetic only.
   */
  let lastScrollX = 0
  let lastScrollY = 0
  /** The requested frame, or none. Its existence **is** the coalescing. */
  let pendingFrame: number | null = null
  /** The host's page offset, measured outside the hot path (`research.md` § R4). */
  let hostOffsetX = 0
  let hostOffsetY = 0
  let finePointerQuery: MediaQueryList | undefined
  let reducedMotionQuery: MediaQueryList | undefined
  let isTracking = false

  /**
   * Once at activation and on resize, never per frame. It should be `(0, 0)` —
   * the layout root is the first child of `<body>` and preflight zeroes the
   * body margin — but "should be" is not "is", and one subtraction per frame
   * buys immunity to a whole class of alignment bug.
   */
  function measureHostOffset() {
    const element = host.value
    if (!element) return

    const box = element.getBoundingClientRect()
    hostOffsetX = box.left + window.scrollX
    hostOffsetY = box.top + window.scrollY
  }

  /**
   * Taken where it is already current — inside the `scroll` handler and at
   * activation — never inside the frame.
   *
   * `research.md` § R2 called for reading the offset first and writing after,
   * on the reasoning that the reverse forces a synchronous layout. **Measured,
   * that is not enough.** A rAF callback runs *before* the frame's style pass,
   * so a `window.scrollX` read there flushes whatever the previous frame's
   * property write invalidated, whichever order the two appear in. A trace of
   * five seconds of continuous movement recorded ~600 extra forced style
   * updates against a control with the effect off — two per frame, one per
   * axis. Caching here removes all of them and leaves the frame doing
   * arithmetic and nothing else.
   */
  function readScrollOffset() {
    lastScrollX = window.scrollX
    lastScrollY = window.scrollY
  }

  /**
   * The only thing that runs per frame, and it touches no geometry at all:
   * two additions, two subtractions, two property writes.
   */
  function publishPosition() {
    pendingFrame = null
    const element = host.value
    if (!element) return

    const pageX = lastClientX + lastScrollX - hostOffsetX
    const pageY = lastClientY + lastScrollY - hostOffsetY

    element.style.setProperty(POSITION_X, `${pageX}px`)
    element.style.setProperty(POSITION_Y, `${pageY}px`)
  }

  function requestPublish() {
    if (pendingFrame !== null) return

    pendingFrame = requestAnimationFrame(publishPosition)
  }

  /**
   * A hybrid laptop passes the media query, so a stray touch must not teleport
   * the light to a fingertip (spec FR-014).
   */
  function handlePointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return

    lastClientX = event.clientX
    lastClientY = event.clientY
    hasPosition.value = true
    requestPublish()
  }

  /** The pointer has not moved, but the page under it has (spec A-05). */
  function handleScroll() {
    readScrollOffset()
    if (!hasPosition.value) return

    requestPublish()
  }

  function handleResize() {
    measureHostOffset()
    if (hasPosition.value) requestPublish()
  }

  function setOpacity(value: string) {
    host.value?.style.setProperty(OPACITY, value)
  }

  /** A light frozen mid-page after the visitor alt-tabs away reads as broken. */
  function handlePointerLeave() {
    setOpacity(HIDDEN)
  }

  function handlePointerEnter() {
    setOpacity(VISIBLE)
  }

  function startTracking() {
    if (isTracking) return
    isTracking = true

    measureHostOffset()
    readScrollOffset()
    /* Passive throughout: none of these may ever block a scroll (FR-020). */
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    const { documentElement } = document
    documentElement.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    })
    documentElement.addEventListener('pointerenter', handlePointerEnter, {
      passive: true,
    })
  }

  /**
   * Runs both on disposal and when a media `change` makes the effect
   * ineligible, so turning reduced motion on mid-session leaves the document
   * holding no listener and the host holding no property this file set.
   */
  function stopTracking() {
    if (!isTracking) return
    isTracking = false

    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)

    const { documentElement } = document
    documentElement.removeEventListener('pointerleave', handlePointerLeave)
    documentElement.removeEventListener('pointerenter', handlePointerEnter)

    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame)
      pendingFrame = null
    }

    const { style } = host.value ?? {}
    style?.removeProperty(POSITION_X)
    style?.removeProperty(POSITION_Y)
    style?.removeProperty(OPACITY)

    hasPosition.value = false
  }

  function reviewEligibility() {
    isEligible.value =
      finePointerQuery?.matches === true &&
      reducedMotionQuery?.matches === false

    if (isEligible.value) startTracking()
    else stopTracking()
  }

  /* No `window` access during setup, so the composable is safe during SSR. */
  onMounted(() => {
    finePointerQuery = window.matchMedia(FINE_POINTER_QUERY)
    reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY)

    finePointerQuery.addEventListener('change', reviewEligibility)
    reducedMotionQuery.addEventListener('change', reviewEligibility)

    reviewEligibility()
  })

  /* The precedent `useMobileMenu.ts` set: disposal releases everything. */
  onScopeDispose(() => {
    finePointerQuery?.removeEventListener('change', reviewEligibility)
    reducedMotionQuery?.removeEventListener('change', reviewEligibility)
    stopTracking()
    isEligible.value = false
  })

  return { isActive: readonly(isActive) }
}
