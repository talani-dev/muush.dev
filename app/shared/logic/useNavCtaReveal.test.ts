import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { useHeroSentinel, useNavCtaReveal } from './useNavCtaReveal'

/**
 * A controllable `IntersectionObserver`. `happy-dom` ships one, but it never
 * reports an intersection for an element that was never laid out, so nothing
 * about the flag's transitions would be observable. This stub is about the
 * composable's wiring — that it observes, that it reads `isIntersecting`, and
 * that it disconnects — not about the platform's implementation of it.
 */
class StubIntersectionObserver {
  static instances: StubIntersectionObserver[] = []

  observed: Element[] = []
  isDisconnected = false

  constructor(private readonly callback: IntersectionObserverCallback) {
    StubIntersectionObserver.instances.push(this)
  }

  observe(element: Element) {
    this.observed.push(element)
  }

  unobserve() {}

  disconnect() {
    this.isDisconnected = true
    this.observed = []
  }

  report(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    )
  }
}

/** A stand-in for the Hero: a root element and one call to the sentinel. */
const Sentinel = defineComponent({
  setup() {
    const root = shallowRef<HTMLElement | null>(null)
    useHeroSentinel(root)
    return () =>
      h('section', {
        ref: (element: unknown) => {
          root.value = (element as HTMLElement | null) ?? null
        },
      })
  },
})

/*
 * `happy-dom` gives one `window` per test file, and this composable writes
 * module-scoped state and wires a global observer. A component left mounted
 * keeps both alive into the next test, which reads as a failure of the subject
 * rather than of the harness (`findings.md` § R43).
 */
const mounted: VueWrapper[] = []

function mountSentinel() {
  const wrapper = mount(Sentinel)
  mounted.push(wrapper)
  return wrapper
}

function latestObserver() {
  return StubIntersectionObserver.instances.at(-1)
}

beforeEach(() => {
  StubIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)
})

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  vi.unstubAllGlobals()
})

describe('useNavCtaReveal', () => {
  it('should show the call to action when the route does not suppress it', () => {
    /* Every route but the landing. The flag is irrelevant there, which is what
       makes "no Hero" the default rather than a case to handle. */
    expect(useNavCtaReveal(false).value).toBe(true)
  })

  it('should show the call to action when a suppressing route never registers a sentinel', () => {
    /* Degrades by construction: with no Hero the flag keeps its initial value,
       so the only way to stay hidden is for a Hero to actually be on screen. */
    const isShown = useNavCtaReveal(true)

    expect(isShown.value).toBe(false)

    mountSentinel()
    latestObserver()?.report(false)

    expect(isShown.value).toBe(true)
  })

  it('should hide the call to action when a suppressing route has the hero on screen', async () => {
    const isShown = useNavCtaReveal(true)
    mountSentinel()
    await nextTick()

    latestObserver()?.report(true)

    expect(isShown.value).toBe(false)
  })

  it('should show the call to action when the hero leaves the viewport', async () => {
    const isShown = useNavCtaReveal(true)
    mountSentinel()
    await nextTick()

    latestObserver()?.report(false)

    expect(isShown.value).toBe(true)
  })

  it('should hide the call to action again when the hero re-enters the viewport', async () => {
    const isShown = useNavCtaReveal(true)
    mountSentinel()
    await nextTick()

    latestObserver()?.report(false)
    latestObserver()?.report(true)

    expect(isShown.value).toBe(false)
  })

  it('should track a reactive route predicate when it changes', () => {
    const isSuppressed = ref(true)
    const isShown = useNavCtaReveal(isSuppressed)

    expect(isShown.value).toBe(false)

    isSuppressed.value = false

    expect(isShown.value).toBe(true)
  })

  it('should observe the section element when the sentinel is mounted', async () => {
    const wrapper = mountSentinel()
    await nextTick()

    expect(latestObserver()?.observed).toEqual([
      wrapper.find('section').element,
    ])
  })

  it('should disconnect the observer when the sentinel unmounts', async () => {
    mountSentinel()
    await nextTick()
    const observer = latestObserver()

    mounted.pop()?.unmount()

    expect(observer?.isDisconnected).toBe(true)
  })

  it('should restore the flag when the sentinel unmounts', async () => {
    /* A `false` surviving the Hero's unmount is a state leaking into the next
       route — the one thing module-scoped state has to be disciplined about. */
    const isShown = useNavCtaReveal(true)
    mountSentinel()
    await nextTick()
    latestObserver()?.report(false)

    mounted.pop()?.unmount()

    expect(isShown.value).toBe(false)
  })

  it('should register no observer when IntersectionObserver is unavailable', async () => {
    /* The server, and any environment without the API. The composable no-ops
       rather than throwing, and the flag keeps the value the prerendered HTML
       was generated with. */
    vi.stubGlobal('IntersectionObserver', undefined)
    const isShown = useNavCtaReveal(true)

    expect(() => mountSentinel()).not.toThrow()
    await nextTick()

    expect(StubIntersectionObserver.instances).toEqual([])
    expect(isShown.value).toBe(false)
  })
})
