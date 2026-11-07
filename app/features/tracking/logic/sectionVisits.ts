import {
  IN_VIEW_SHARE,
  MAX_VISIT_SECONDS,
  MIN_VISIT_MS,
} from '@/features/tracking/data/trackingConfig'
import {
  ABOUT_SECTIONS,
  HOME_SECTIONS,
  type PageKey,
  type TrackedSection,
} from '@/shared/data/trackingEvents'

/**
 * Time per section as pure functions (feature 49, tracking plan § 5,
 * data-model § 3). No DOM, no clock: `useSectionTiming.ts` feeds the
 * observer's entries and the time in.
 *
 * A visit opens when its section comes into view and closes when it leaves
 * view, when the page changes, or when the tab hides; each closed visit is
 * one `section_view`, so the visitor's journey reads in order in GA4. Time
 * with the tab hidden is never counted: hiding closes the visit and showing
 * the tab again opens a new one.
 */

/** The open visits: when each in-view section started being seen (ms). */
export type SectionVisitState = Readonly<
  Partial<Record<TrackedSection, number>>
>

export interface SectionViewParams {
  page_key: PageKey
  section: TrackedSection
  section_seconds: number
}

const SECTIONS_BY_PAGE: Record<PageKey, readonly TrackedSection[]> = {
  home: HOME_SECTIONS,
  about: ABOUT_SECTIONS,
}

/** The section id a `data-track-section` value names on `pageKey`. */
export function sectionOf(
  pageKey: PageKey,
  value: string | null
): TrackedSection | undefined {
  return SECTIONS_BY_PAGE[pageKey].find(section => section === value)
}

/**
 * In view: half the section is visible, or, for a section taller than the
 * viewport, the visible part covers half the viewport.
 */
export function isInView(
  entry: Pick<
    IntersectionObserverEntry,
    'isIntersecting' | 'intersectionRatio' | 'intersectionRect'
  >,
  viewportHeight: number
): boolean {
  if (!entry.isIntersecting) return false
  if (entry.intersectionRatio >= IN_VIEW_SHARE) return true
  return entry.intersectionRect.height >= IN_VIEW_SHARE * viewportHeight
}

/** Whole seconds of a visit, capped; `null` under the minimum. */
export function visitSeconds(visibleMs: number): number | null {
  if (visibleMs < MIN_VISIT_MS) return null
  return Math.min(Math.round(visibleMs / 1000), MAX_VISIT_SECONDS)
}

export function enterSection(
  state: SectionVisitState,
  section: TrackedSection,
  now: number
): SectionVisitState {
  if (state[section] !== undefined) return state
  return { ...state, [section]: now }
}

export function leaveSection(
  state: SectionVisitState,
  section: TrackedSection,
  now: number,
  pageKey: PageKey
): { state: SectionVisitState; completed: SectionViewParams | null } {
  const startedAt = state[section]
  if (startedAt === undefined) return { state, completed: null }
  const { [section]: _closed, ...rest } = state
  const seconds = visitSeconds(now - startedAt)
  return {
    state: rest,
    completed:
      seconds === null
        ? null
        : { page_key: pageKey, section, section_seconds: seconds },
  }
}

/** Closes every open visit: the page changed or the tab hid. */
export function flushSections(
  state: SectionVisitState,
  now: number,
  pageKey: PageKey
): SectionViewParams[] {
  return (Object.keys(state) as TrackedSection[]).flatMap(section => {
    const { completed } = leaveSection(state, section, now, pageKey)
    return completed ? [completed] : []
  })
}
