import { SECTION_OBSERVER_THRESHOLDS } from '@/features/tracking/data/trackingConfig'
import {
  FORM_IDS,
  type FormId,
  type PageKey,
  type TrackedSection,
  type TrackingEvent,
} from '@/shared/data/trackingEvents'
import { pageKeyOf } from './pageViews'
import {
  enterSection,
  flushSections,
  isInView,
  leaveSection,
  type SectionViewParams,
  type SectionVisitState,
  sectionOf,
} from './sectionVisits'

/**
 * Wires the browser to the section-visit reducer (feature 49, research R8,
 * spec FR-023) and reports `form_view` once per page view.
 *
 * Runs only while "Analítica" is granted (`section_view` and `form_view` go
 * to Google Analytics alone). One `IntersectionObserver` per page watches
 * every `[data-track-section]` (Home and Nosotros) and `[data-track-form]`.
 * Leaving a section, changing page, or hiding the tab closes its visit; on
 * hide the closing events go out with the beacon transport so they survive
 * unload. A killed mobile tab may still lose its last visit (known limit).
 */
type ObserverFactory = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit
) => Pick<IntersectionObserver, 'observe' | 'disconnect'>

export interface SectionTimingOptions {
  root: Pick<
    Document,
    | 'querySelectorAll'
    | 'visibilityState'
    | 'addEventListener'
    | 'removeEventListener'
  >
  view: Pick<Window, 'innerHeight' | 'addEventListener' | 'removeEventListener'>
  createObserver: ObserverFactory
  currentRouteName: () => string | undefined
  emit: (event: TrackingEvent) => void
  now: () => number
  /** Runs a task once the new page has rendered. */
  defer: (task: () => void) => void
}

export interface SectionTiming {
  start(): void
  stop(): void
  pageChanged(): void
}

const OBSERVED = '[data-track-section], [data-track-form]'

export function useSectionTiming(options: SectionTimingOptions): SectionTiming {
  const { root, view, emit, now } = options
  let active = false
  let pageKey: PageKey | undefined
  let observer: ReturnType<ObserverFactory> | undefined
  let visits: SectionVisitState = {}
  const inView = new Set<TrackedSection>()
  const formsSeen = new Set<FormId>()

  function report(completed: SectionViewParams[], beacon: boolean) {
    for (const params of completed) {
      emit({ name: 'section_view', params, ...(beacon && { beacon }) })
    }
  }

  function closeVisits(beacon: boolean) {
    if (pageKey) report(flushSections(visits, now(), pageKey), beacon)
    visits = {}
  }

  function onForm(element: Element, entry: IntersectionObserverEntry) {
    const form = FORM_IDS.find(
      id => id === element.getAttribute('data-track-form')
    )
    if (!form || !entry.isIntersecting || formsSeen.has(form)) return
    formsSeen.add(form)
    emit({ name: 'form_view', params: { form } })
  }

  function onSection(
    section: TrackedSection,
    entry: IntersectionObserverEntry
  ) {
    if (!pageKey) return
    const visible =
      isInView(entry, view.innerHeight) && root.visibilityState === 'visible'
    if (visible) {
      inView.add(section)
      visits = enterSection(visits, section, now())
      return
    }
    inView.delete(section)
    const left = leaveSection(visits, section, now(), pageKey)
    visits = left.state
    if (left.completed) report([left.completed], false)
  }

  function onEntries(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      const element = entry.target
      if (element.hasAttribute('data-track-form')) onForm(element, entry)
      const section = pageKey
        ? sectionOf(pageKey, element.getAttribute('data-track-section'))
        : undefined
      if (section) onSection(section, entry)
    }
  }

  function observePage() {
    if (!active) return
    pageKey = pageKeyOf(options.currentRouteName())
    observer = options.createObserver(onEntries, {
      threshold: SECTION_OBSERVER_THRESHOLDS,
    })
    for (const element of root.querySelectorAll(OBSERVED)) {
      observer.observe(element)
    }
  }

  function leavePage() {
    closeVisits(false)
    observer?.disconnect()
    observer = undefined
    inView.clear()
    formsSeen.clear()
  }

  function onVisibilityChange() {
    if (root.visibilityState === 'hidden') {
      closeVisits(true)
      return
    }
    for (const section of inView) visits = enterSection(visits, section, now())
  }

  function onPageHide() {
    closeVisits(true)
  }

  return {
    start() {
      if (active) return
      active = true
      root.addEventListener('visibilitychange', onVisibilityChange)
      view.addEventListener('pagehide', onPageHide)
      options.defer(observePage)
    },
    stop() {
      if (!active) return
      leavePage()
      active = false
      root.removeEventListener('visibilitychange', onVisibilityChange)
      view.removeEventListener('pagehide', onPageHide)
    },
    pageChanged() {
      if (!active) return
      leavePage()
      options.defer(observePage)
    },
  }
}
