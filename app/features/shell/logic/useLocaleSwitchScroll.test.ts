import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type {
  NavigationFailure,
  RouteLocationNormalized,
  Router,
} from 'vue-router'
import {
  holdLocaleSwitchPosition,
  type ScrollGeometry,
  takeHeldLocaleSwitchPosition,
} from './localeSwitchScroll'
import { installLocaleSwitchScroll } from './useLocaleSwitchScroll'

/**
 * Feature 43 · FR-061. A fake router and hook bus stand in for vue-router
 * and Nuxt: what is under test is the hand-off (hold → claim → restore),
 * not the libraries.
 */
type Guard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => void
type AfterHook = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  failure?: NavigationFailure
) => void

function route(fullPath: string): RouteLocationNormalized {
  const path = fullPath.split('#')[0] ?? fullPath
  return { fullPath, path, meta: {} } as RouteLocationNormalized
}

/* The new page: servicios at the top, measured before the restore. */
const NEW_PAGE: ScrollGeometry = {
  scrollTop: 0,
  scrollRange: 4000,
  readingLine: 0,
  anchors: [{ id: 'servicios', top: 1000, height: 800 }],
}

function setup() {
  const before: Guard[] = []
  const after: AfterHook[] = []
  const pageEnd: (() => void)[] = []
  const currentRoute = ref(route('/es'))
  const scrollTo = vi.fn()

  const router = {
    beforeEach: (guard: Guard) => {
      before.push(guard)
      return () => before.splice(before.indexOf(guard), 1)
    },
    afterEach: (hook: AfterHook) => {
      after.push(hook)
      return () => after.splice(after.indexOf(hook), 1)
    },
    currentRoute,
  } as unknown as Pick<Router, 'beforeEach' | 'afterEach' | 'currentRoute'>

  const stop = installLocaleSwitchScroll({
    router,
    hooks: { hookOnce: (_name, fn) => pageEnd.push(fn) },
    scrollTo,
    measure: () => NEW_PAGE,
    nextFrame: callback => callback(),
  })

  /** Runs a navigation through the guards; returns the destination. */
  function navigate(fullPath: string, failure?: NavigationFailure) {
    const from = currentRoute.value
    const to = route(fullPath)
    for (const guard of [...before]) guard(to, from)
    if (!failure) currentRoute.value = to
    for (const hook of [...after]) hook(to, from, failure)
    return to
  }

  function renderPage() {
    for (const fn of pageEnd.splice(0)) fn()
  }

  return { navigate, renderPage, scrollTo, stop, before, after }
}

/** Holds a position a quarter into `servicios`, wherever the page is. */
function holdInServices(destination: string) {
  document.body.innerHTML = '<main><section id="servicios"></section></main>'
  const section = document.querySelector('section') as HTMLElement
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
    top: -200,
    height: 800,
  } as DOMRect)
  holdLocaleSwitchPosition(destination)
}

describe('installLocaleSwitchScroll', () => {
  afterEach(() => {
    takeHeldLocaleSwitchPosition()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('should stop Nuxt scrolling to the top for the held navigation only', () => {
    const { navigate } = setup()
    holdInServices('/en')

    expect(navigate('/en').meta.scrollToTop).toBe(false)
    expect(navigate('/en/about').meta.scrollToTop).toBeUndefined()
  })

  it('should restore the same section and progress once the new page has rendered', () => {
    const { navigate, renderPage, scrollTo } = setup()
    holdInServices('/en')

    navigate('/en')
    expect(scrollTo).not.toHaveBeenCalled()
    renderPage()

    /* A quarter into servicios (top 1000, height 800) on the new page. */
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith(1200)
  })

  it('should leave a navigation alone when nothing was held', () => {
    const { navigate, renderPage, scrollTo } = setup()

    expect(navigate('/en').meta.scrollToTop).toBeUndefined()
    renderPage()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('should drop a hold that another navigation reaches first', () => {
    const { navigate, renderPage, scrollTo } = setup()
    holdInServices('/en')

    expect(navigate('/es/nosotros').meta.scrollToTop).toBeUndefined()
    expect(navigate('/en').meta.scrollToTop).toBeUndefined()
    renderPage()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('should not restore after a failed navigation', () => {
    const { navigate, renderPage, scrollTo } = setup()
    holdInServices('/en')

    navigate('/en', {} as NavigationFailure)
    renderPage()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('should not restore when another navigation finished before the page rendered', () => {
    const { navigate, renderPage, scrollTo } = setup()
    holdInServices('/en')

    navigate('/en')
    navigate('/en/about')
    renderPage()
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('should remove both guards when stopped', () => {
    const { stop, before, after } = setup()

    stop()

    expect(before).toHaveLength(0)
    expect(after).toHaveLength(0)
  })
})
