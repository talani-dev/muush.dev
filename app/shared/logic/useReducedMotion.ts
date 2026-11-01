import { onBeforeUnmount, onMounted, type Ref, readonly, ref } from 'vue'

/** The OS / browser preference, as the handoff reads it. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Whether the visitor asked to reduce motion (feature 42, research R13).
 *
 * `false` on the server and until mount, so the prerendered markup and the
 * first client render agree; the media query is read in `onMounted`, which
 * never runs during prerender (Article IV). Followed LIVE afterwards: the
 * handoff reads the preference once, this site follows a change while the
 * page is open (spec Assumptions). The listener is removed on unmount.
 *
 * Call it before registering any `onMounted` of your own that reads it:
 * hooks run in registration order, so the value is current by then.
 *
 * `useCursorSpotlight` keeps its own query; features 8 and 34 are not
 * refactored here.
 */
export function useReducedMotion(): Readonly<Ref<boolean>> {
  const isReduced = ref(false)
  let query: MediaQueryList | undefined

  function followPreference(event: MediaQueryListEvent) {
    isReduced.value = event.matches
  }

  onMounted(() => {
    query = window.matchMedia(REDUCED_MOTION_QUERY)
    isReduced.value = query.matches
    query.addEventListener('change', followPreference)
  })

  onBeforeUnmount(() => {
    query?.removeEventListener('change', followPreference)
  })

  return readonly(isReduced)
}
