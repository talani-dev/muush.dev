import { describe, expect, it } from 'vitest'
import {
  enterSection,
  flushSections,
  isInView,
  leaveSection,
  sectionOf,
  visitSeconds,
} from './sectionVisits'

const VIEWPORT = 800

function entry(isIntersecting: boolean, ratio: number, visibleHeight: number) {
  return {
    isIntersecting,
    intersectionRatio: ratio,
    intersectionRect: { height: visibleHeight } as DOMRectReadOnly,
  }
}

describe('sectionVisits', () => {
  it('should produce one event with rounded seconds when a section is entered and left', () => {
    const open = enterSection({}, 'services', 1_000)

    const { state, completed } = leaveSection(open, 'services', 15_400, 'home')

    expect(state).toEqual({})
    expect(completed).toEqual({
      page_key: 'home',
      section: 'services',
      section_seconds: 14,
    })
  })

  it('should drop a visit shorter than one second', () => {
    const open = enterSection({}, 'hero', 0)

    expect(leaveSection(open, 'hero', 999, 'home').completed).toBeNull()
    expect(visitSeconds(1_000)).toBe(1)
  })

  it('should cap a visit at 600 seconds', () => {
    const open = enterSection({}, 'where_we_are', 0)

    expect(
      leaveSection(open, 'where_we_are', 3_600_000, 'about').completed
        ?.section_seconds
    ).toBe(600)
  })

  it('should keep the first start when a section is entered twice', () => {
    const open = enterSection(enterSection({}, 'hero', 0), 'hero', 5_000)

    expect(open).toEqual({ hero: 0 })
  })

  it('should produce nothing when a section that was never entered is left', () => {
    expect(leaveSection({}, 'hero', 5_000, 'home')).toEqual({
      state: {},
      completed: null,
    })
  })

  it('should close every open visit when flushed', () => {
    const open = enterSection(enterSection({}, 'hero', 0), 'services', 2_000)

    expect(flushSections(open, 10_000, 'home')).toEqual([
      { page_key: 'home', section: 'hero', section_seconds: 10 },
      { page_key: 'home', section: 'services', section_seconds: 8 },
    ])
  })

  it('should exclude the hidden time when the tab hides and shows again', () => {
    /* Hidden at 10 s (flush), shown again at 70 s (re-enter), left at 75 s. */
    const open = enterSection({}, 'assessment', 0)
    const beforeHide = flushSections(open, 10_000, 'home')
    const reopened = enterSection({}, 'assessment', 70_000)

    expect(beforeHide[0]?.section_seconds).toBe(10)
    expect(
      leaveSection(reopened, 'assessment', 75_000, 'home').completed
        ?.section_seconds
    ).toBe(5)
  })

  it('should produce a second event when a section is entered again after leaving', () => {
    const first = leaveSection(
      enterSection({}, 'hero', 0),
      'hero',
      2_000,
      'home'
    )
    const second = leaveSection(
      enterSection(first.state, 'hero', 10_000),
      'hero',
      13_000,
      'home'
    )

    expect([first.completed, second.completed]).toEqual([
      { page_key: 'home', section: 'hero', section_seconds: 2 },
      { page_key: 'home', section: 'hero', section_seconds: 3 },
    ])
  })

  it('should count half the section, or half the viewport for a tall one, as in view', () => {
    expect(isInView(entry(true, 0.5, 200), VIEWPORT)).toBe(true)
    expect(isInView(entry(true, 0.3, 400), VIEWPORT)).toBe(true)
    expect(isInView(entry(true, 0.3, 399), VIEWPORT)).toBe(false)
    expect(isInView(entry(false, 0, 0), VIEWPORT)).toBe(false)
  })

  it('should accept only the section ids of the page', () => {
    expect(sectionOf('home', 'who_we_are')).toBe('who_we_are')
    expect(sectionOf('about', 'who_we_are')).toBeUndefined()
    expect(sectionOf('about', 'work_with_us')).toBe('work_with_us')
    expect(sectionOf('home', null)).toBeUndefined()
  })
})
