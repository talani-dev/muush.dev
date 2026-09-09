import {
  type ComputedRef,
  computed,
  type MaybeRefOrGetter,
  onMounted,
  onScopeDispose,
  ref,
  toValue,
} from 'vue'

/**
 * Whether the nav should be showing, given the page's scroll behaviour.
 *
 * Behaviour given verbatim by Roberto (2026-09-09, feature 26) — there is no
 * frame for this, it is an interaction and not something a static mockup can
 * draw:
 *
 * 1. Within the first `REVEAL_ZONE_PX` of the top, the nav is always visible,
 *    in either scroll direction.
 * 2. Past that zone, the nav hides only after `HIDE_ACCUMULATION_PX` of
 *    *continuous* downward movement — so the rubber-band bounce at the top or
 *    bottom of a mobile page, which reports itself as brief, tiny scroll
 *    deltas, cannot flicker the nav in and out.
 * 3. The nav reappears immediately — no threshold at all — the instant the
 *    direction turns upward, at any scroll position past the reveal zone.
 * 4. The mobile menu overrides all of the above: while it is open the nav is
 *    always visible, no matter the scroll position or direction.
 *
 * `REVEAL_ZONE_PX` and `HIDE_ACCUMULATION_PX` are plain pixel constants, not
 * design tokens: they compare directly against `window.scrollY`, which the
 * platform always reports in CSS pixels regardless of root font size, and
 * there is no `.pen` frame to derive a `rem` value from — `useCursorSpotlight`
 * sets the same precedent, publishing raw pixel coordinates from
 * `clientX`/`clientY` rather than converting them to `rem`.
 *
 * Point 4 is not arbitrary: `MobileMenu.vue`'s panel is `position: fixed`, and
 * this composable's caller (`SiteNav.vue`) applies the hidden state as a
 * `transform` on the `<nav>` itself. A `transform` on an ancestor creates a
 * new containing block for a `position: fixed` descendant, which would
 * mis-contain the panel the moment both were active together. Forcing the nav
 * visible whenever the menu is open means the two states can never overlap,
 * so that containment bug can never occur — this is the guard, not a
 * workaround for it happening elsewhere.
 *
 * The instant-vs-transition behaviour for `prefers-reduced-motion` is CSS,
 * not logic: this composable only ever reports a boolean, and the caller's
 * `<style scoped>` decides whether changing it animates.
 *
 * Mechanically closest to `useCursorSpotlight.ts`: a passive scroll listener,
 * rAF-coalesced, cleaned up in `onScopeDispose`. `useNavCtaReveal`/
 * `useHeroSentinel` is not the precedent here — it is presence/absence of the
 * Hero via `IntersectionObserver`, with no direction and no thresholds.
 */

/** Nav stays visible unconditionally inside this many px of the top. */
const REVEAL_ZONE_PX = 80

/** Continuous downward px, past the reveal zone, before the nav hides. */
const HIDE_ACCUMULATION_PX = 10

export function useNavScrollReveal(
  isMobileMenuOpen: MaybeRefOrGetter<boolean>
): { isNavVisible: ComputedRef<boolean> } {
  const isHiddenByScroll = ref(false)

  let lastScrollY = 0
  /** Resets to 0 on any upward movement, or inside the reveal zone. */
  let continuousDownwardPx = 0
  let pendingFrame: number | null = null

  function evaluateScroll() {
    pendingFrame = null

    const currentScrollY = window.scrollY
    const delta = currentScrollY - lastScrollY
    lastScrollY = currentScrollY

    if (currentScrollY <= REVEAL_ZONE_PX) {
      continuousDownwardPx = 0
      isHiddenByScroll.value = false
      return
    }

    if (delta < 0) {
      /* Upward: reveal immediately, no threshold, at any scroll position. */
      continuousDownwardPx = 0
      isHiddenByScroll.value = false
      return
    }

    if (delta > 0) {
      continuousDownwardPx += delta
      if (continuousDownwardPx >= HIDE_ACCUMULATION_PX) {
        isHiddenByScroll.value = true
      }
    }
  }

  function requestScrollEvaluation() {
    if (pendingFrame !== null) return
    pendingFrame = requestAnimationFrame(evaluateScroll)
  }

  /* No `window` access during setup, so this composable is safe during SSR
     (same guard `useCursorSpotlight.ts` uses). */
  onMounted(() => {
    lastScrollY = window.scrollY
    window.addEventListener('scroll', requestScrollEvaluation, {
      passive: true,
    })
  })

  onScopeDispose(() => {
    window.removeEventListener('scroll', requestScrollEvaluation)
    if (pendingFrame !== null) {
      cancelAnimationFrame(pendingFrame)
      pendingFrame = null
    }
  })

  const isNavVisible = computed(
    () => toValue(isMobileMenuOpen) || !isHiddenByScroll.value
  )

  return { isNavVisible }
}
