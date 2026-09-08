import { onScopeDispose, type Ref, watch } from 'vue'

/**
 * The mobile "lyrics" effect: which item reads at full strength while the
 * visitor scrolls the timeline.
 *
 * **One `IntersectionObserver`, never a `scroll` handler that reads geometry.**
 * Each callback reads every observed entry's own `intersectionRatio` — a value
 * the browser computes off the main thread's hot path — and never
 * `scrollY`/`getBoundingClientRect()`, which forces a synchronous style
 * recalculation regardless of read/write ordering (`findings.md` § R41). It is
 * a **plain Vue** composable — no Nuxt call — so `ServicesTimeline` still
 * mounts bare in Storybook and in a Vue Test Utils mount
 * (`docs/business/rules.md` § R23).
 *
 * It takes the **container** wrapping the five items, not five separate refs
 * — same discipline `usePurposeCarousel` uses for its own track: the items
 * are read as the container's own children, so no per-item template ref is
 * needed and no array-ref binding is required from the caller's template.
 *
 * It only ever **writes** `data-lyrics="active" | "near" | "far"` on the
 * observed elements. CSS `[data-lyrics]` selectors own the actual opacity and
 * the transition (spec D-3) — this file has no opinion on either.
 *
 * **No-JS and reduced-motion fallback.** With no `[data-lyrics]` attribute
 * present, the CSS default is `opacity: 1` on every item, unconditionally
 * (`ui-map.md` § 10) — this composable only ever *adds* the attribute once
 * mounted, so a visitor with scripting off never sees it at all. Under
 * `prefers-reduced-motion: reduce` the composable still attaches (this is
 * decoration, not the reveal Propósito's FR-012 protects); the CSS is what
 * forces every item back to full strength there (spec FR-017).
 *
 * Ties resolve to the earlier item in DOM order (spec A-04): `>` strict
 * comparison keeps the first maximum found rather than the last.
 *
 * **No item is ever bucketed while none is actually visible.** The observer's
 * first callback fires as soon as it starts watching, often before the
 * visitor has scrolled the timeline into view at all — at that moment every
 * ratio is `0`, a tie across all five, and A-04's earliest-wins rule would
 * otherwise mark item 1 "active" and dim the rest before the section has
 * ever been looked at. Measured in Chrome (`findings.md`, this feature):
 * without this guard, a fresh page load showed items 2–5 already dimmed at
 * `y = 0`. `applyBuckets` is a no-op until at least one ratio is positive.
 */
type LyricsBucket = 'active' | 'near' | 'far'

/** `[0, 0.5, 1]` (⚠️ O-04) — tuned for a stable "most-visible-wins" bucket. */
const THRESHOLDS = [0, 0.5, 1]

function bucketFor(distanceFromActive: number): LyricsBucket {
  if (distanceFromActive === 0) return 'active'
  if (distanceFromActive === 1) return 'near'
  return 'far'
}

/** The items are the container's own children, same as `usePurposeCarousel`. */
function itemsOf(container: HTMLElement): HTMLElement[] {
  return [...container.children].filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  )
}

export function useServicesLyrics(
  container: Readonly<Ref<HTMLElement | null>>
): void {
  const ratioByElement = new Map<HTMLElement, number>()
  let items: HTMLElement[] = []
  let observer: IntersectionObserver | undefined

  function applyBuckets(): void {
    if (items.length === 0) return

    let activeIndex = 0
    let bestRatio = 0
    items.forEach((element, index) => {
      const ratio = ratioByElement.get(element) ?? 0
      /* Strict `>`: a later tie never displaces the earlier item (A-04). */
      if (ratio > bestRatio) {
        bestRatio = ratio
        activeIndex = index
      }
    })

    /* Every ratio is 0 — nothing is visible yet. Leave whatever state is
       already there (absent on the very first callback) rather than picking
       a winner out of a tie that means "nothing", so a page load does not
       dim four items before the visitor has scrolled anywhere near them. */
    if (bestRatio === 0) return

    items.forEach((element, index) => {
      element.setAttribute(
        'data-lyrics',
        bucketFor(Math.abs(index - activeIndex))
      )
    })
  }

  function onIntersect(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      ratioByElement.set(entry.target as HTMLElement, entry.intersectionRatio)
    }
    applyBuckets()
  }

  const supportsObserving = typeof IntersectionObserver !== 'undefined'

  /* A template ref is `null` during setup and again after unmount, so the
     wiring follows the element rather than a single lifecycle moment (same
     pattern `usePurposeCarousel` uses for its own track ref). */
  const stopWatching = watch(
    container,
    element => {
      observer?.disconnect()
      observer = undefined
      ratioByElement.clear()
      items = element ? itemsOf(element) : []
      if (items.length === 0 || !supportsObserving) return

      observer = new IntersectionObserver(onIntersect, {
        threshold: THRESHOLDS,
      })
      for (const item of items) observer.observe(item)
    },
    { immediate: true, flush: 'post' }
  )

  onScopeDispose(() => {
    stopWatching()
    observer?.disconnect()
    observer = undefined
  })
}
