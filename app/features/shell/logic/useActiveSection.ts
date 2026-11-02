import {
  type MaybeRefOrGetter,
  onMounted,
  onScopeDispose,
  type Ref,
  readonly,
  ref,
  toValue,
  watch,
} from 'vue'
import type { SectionAnchor } from '@/shared/data/sectionAnchors'

/**
 * The scroll-spy behind the link bar's active state (feature 43, spec
 * FR-028, research R8; confirmed by Roberto 2026-11-01).
 *
 * While `enabled` (the home page), it watches the sections whose ids are in
 * `anchors` and reports the first one, in that order, that occupies the
 * reading band: from the header's lower edge down to the middle of the
 * viewport. Nothing is reported at the top of the home page, on another
 * page, without the API, or on the server, which is what makes the
 * prerendered markup and the first client render agree (no hydration
 * flash). A section that does not exist yet (`como-trabajamos` before
 * feature 44) is simply not observed.
 *
 * `refreshKey` changes when a new page has rendered, so the sections of the
 * page navigated to are observed rather than those of the page left.
 *
 * `atTop` (Home link added by Roberto 2026-11-01) is true while no spied
 * section is in the band **and** none has been scrolled past (its bottom
 * above the band's top): the visitor is above the first section, at the top
 * of the page. Further down, between or after the spied sections, it is
 * false, so the Home item does not light up again at the bottom of the
 * page. It is true on the server and before the first report, the same
 * state the prerendered markup shows.
 *
 * "Scrolled past" has its own observer, whose root runs from the band's top
 * to far below the viewport: a section leaves it only by going above the
 * band. The reading band alone cannot tell, because a jump from the bottom
 * of the page to the top (Home, the Home key) never crosses the band, and
 * an observer reports only crossings (measured in Chrome 156, 2026-11-01).
 */

/** The band ends halfway down the viewport. */
const READING_BAND_BOTTOM = '-50%'

/**
 * The band starts under the floating header. `html`'s `scroll-padding-top`
 * is the header offset token, and its computed value is already in px.
 */
function readingBand(): string {
  const headerOffset = Number.parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop
  )
  const top = Number.isFinite(headerOffset) ? headerOffset : 0
  return `-${top}px 0% ${READING_BAND_BOTTOM} 0%`
}

/**
 * How far below the viewport the "not passed yet" root reaches, in
 * viewport heights (percent of the root): a hundred screens, further than
 * any page is long, so a section is out of it only above the band. A
 * runtime threshold, not a visual value.
 */
const REACH_BELOW = '10000%'

/** The band's top, as in `readingBand`, open downwards. */
function reachRoot(): string {
  const [top] = readingBand().split(' ')
  return `${top} 0% ${REACH_BELOW} 0%`
}

export function useActiveSection(
  enabled: MaybeRefOrGetter<boolean>,
  anchors: readonly SectionAnchor[],
  refreshKey?: MaybeRefOrGetter<unknown>
): {
  activeAnchor: Readonly<Ref<SectionAnchor | null>>
  atTop: Readonly<Ref<boolean>>
} {
  const activeAnchor = ref<SectionAnchor | null>(null)
  const atTop = ref(true)
  const inView = new Set<string>()
  const passed = new Set<string>()
  let observer: IntersectionObserver | null = null
  let reach: IntersectionObserver | null = null
  let isMounted = false

  function disconnect() {
    observer?.disconnect()
    reach?.disconnect()
    observer = null
    reach = null
    inView.clear()
    passed.clear()
    activeAnchor.value = null
    atTop.value = true
  }

  /** Adds a section to `set` when `entry` says it belongs there. */
  function track(
    set: Set<string>,
    entries: IntersectionObserverEntry[],
    belongs: (entry: IntersectionObserverEntry) => boolean
  ) {
    for (const entry of entries) {
      if (belongs(entry)) set.add(entry.target.id)
      else set.delete(entry.target.id)
    }
    activeAnchor.value = anchors.find(id => inView.has(id)) ?? null
    atTop.value = inView.size === 0 && passed.size === 0
  }

  function connect() {
    disconnect()
    if (!toValue(enabled) || typeof IntersectionObserver === 'undefined') {
      return
    }
    const sections = anchors
      .map(id => document.getElementById(id))
      .filter(section => section !== null)
    if (sections.length === 0) return

    /* `passed` holds what is out of the reach root: above the band. */
    reach = new IntersectionObserver(
      entries => track(passed, entries, entry => !entry.isIntersecting),
      {
        rootMargin: reachRoot(),
      }
    )
    observer = new IntersectionObserver(
      entries => track(inView, entries, entry => entry.isIntersecting),
      {
        rootMargin: readingBand(),
      }
    )
    for (const section of sections) {
      reach.observe(section)
      observer.observe(section)
    }
  }

  onMounted(() => {
    isMounted = true
    connect()
  })

  watch(
    [() => toValue(enabled), () => toValue(refreshKey)],
    () => {
      if (isMounted) connect()
    },
    { flush: 'post' }
  )

  onScopeDispose(disconnect)

  return { activeAnchor: readonly(activeAnchor), atTop: readonly(atTop) }
}
