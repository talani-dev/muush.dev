import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TrackingEvent } from '@/shared/data/trackingEvents'
import { type SectionTimingOptions, useSectionTiming } from './useSectionTiming'

const VIEWPORT = 800

function setup(routeName = 'index___es') {
  document.body.innerHTML = `
    <section data-track-section="hero"></section>
    <section data-track-section="services"></section>
    <section data-track-section="not_a_section"></section>
    <div data-track-form="assessment"></div>`
  let clock = 0
  let visibility: DocumentVisibilityState = 'visible'
  let callback: IntersectionObserverCallback = () => undefined
  const observed: Element[] = []
  const disconnect = vi.fn()
  const events: TrackingEvent[] = []
  const viewEvents = new EventTarget()
  const view = viewEvents as unknown as SectionTimingOptions['view']
  Object.assign(view, { innerHeight: VIEWPORT })
  const rootEvents = new EventTarget()
  const root = rootEvents as unknown as SectionTimingOptions['root']
  Object.defineProperty(root, 'visibilityState', { get: () => visibility })
  Object.assign(root, {
    querySelectorAll: (selectors: string) =>
      document.querySelectorAll(selectors),
  })

  const timing = useSectionTiming({
    root,
    view,
    createObserver: cb => {
      callback = cb
      return { observe: element => observed.push(element), disconnect }
    },
    currentRouteName: () => routeName,
    emit: event => events.push(event),
    now: () => clock,
    defer: task => task(),
  })

  function report(selector: string, visibleShare: number) {
    const target = document.querySelector(selector)
    if (!target) throw new Error(selector)
    callback(
      [
        {
          target,
          isIntersecting: visibleShare > 0,
          intersectionRatio: visibleShare,
          intersectionRect: { height: visibleShare * 300 },
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    )
  }

  return {
    timing,
    events,
    observed,
    disconnect,
    report,
    tick: (ms: number) => {
      clock += ms
    },
    hide: () => {
      visibility = 'hidden'
      rootEvents.dispatchEvent(new Event('visibilitychange'))
    },
    show: () => {
      visibility = 'visible'
      rootEvents.dispatchEvent(new Event('visibilitychange'))
    },
    pageHide: () => viewEvents.dispatchEvent(new Event('pagehide')),
  }
}

describe('useSectionTiming', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should observe every timed section and the form when started', () => {
    const { timing, observed } = setup()

    timing.start()

    expect(observed).toHaveLength(4)
  })

  it('should send one section view when a section is left', () => {
    const { timing, events, report, tick } = setup()
    timing.start()

    report('[data-track-section="services"]', 0.6)
    tick(14_000)
    report('[data-track-section="services"]', 0.1)

    expect(events).toEqual([
      {
        name: 'section_view',
        params: { page_key: 'home', section: 'services', section_seconds: 14 },
      },
    ])
  })

  it('should ignore a section id that is not in the page list', () => {
    const { timing, events, report, tick } = setup()
    timing.start()

    report('[data-track-section="not_a_section"]', 1)
    tick(5_000)
    report('[data-track-section="not_a_section"]', 0)

    expect(events).toEqual([])
  })

  it('should send the form view once per page view', () => {
    const { timing, events, report } = setup()
    timing.start()

    report('[data-track-form]', 0.1)
    report('[data-track-form]', 0)
    report('[data-track-form]', 0.2)

    expect(events).toEqual([
      { name: 'form_view', params: { form: 'assessment' } },
    ])
  })

  it('should flush with the beacon when the tab hides, and resume when it shows', () => {
    const { timing, events, report, tick, hide, show } = setup()
    timing.start()
    report('[data-track-section="hero"]', 1)
    tick(3_000)

    hide()
    tick(60_000)
    show()
    tick(2_000)
    report('[data-track-section="hero"]', 0)

    expect(events).toEqual([
      {
        name: 'section_view',
        params: { page_key: 'home', section: 'hero', section_seconds: 3 },
        beacon: true,
      },
      {
        name: 'section_view',
        params: { page_key: 'home', section: 'hero', section_seconds: 2 },
      },
    ])
  })

  it('should flush with the beacon when the page hides', () => {
    const { timing, events, report, tick, pageHide } = setup()
    timing.start()
    report('[data-track-section="hero"]', 1)
    tick(4_000)

    pageHide()

    expect(events).toEqual([
      {
        name: 'section_view',
        params: { page_key: 'home', section: 'hero', section_seconds: 4 },
        beacon: true,
      },
    ])
  })

  it('should close open visits and observe again when the page changes', () => {
    const { timing, events, report, tick, disconnect, observed } = setup()
    timing.start()
    report('[data-track-section="hero"]', 1)
    tick(2_000)

    timing.pageChanged()

    expect(events).toHaveLength(1)
    expect(disconnect).toHaveBeenCalledOnce()
    expect(observed).toHaveLength(8)
  })

  it('should time nothing but still report the form on a page without sections', () => {
    const { timing, events, report, tick } = setup('privacy___es')
    timing.start()

    report('[data-track-section="hero"]', 1)
    tick(5_000)
    report('[data-track-section="hero"]', 0)
    report('[data-track-form]', 1)

    expect(events).toEqual([
      { name: 'form_view', params: { form: 'assessment' } },
    ])
  })

  it('should flush and stop listening when stopped', () => {
    const { timing, events, report, tick, hide } = setup()
    timing.start()
    report('[data-track-section="hero"]', 1)
    tick(2_000)

    timing.stop()
    hide()

    expect(events).toHaveLength(1)
    expect(events[0]).not.toHaveProperty('beacon')
  })
})
