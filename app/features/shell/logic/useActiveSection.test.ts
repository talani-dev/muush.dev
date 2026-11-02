import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, type Ref, ref } from 'vue'
import { useActiveSection } from './useActiveSection'

/**
 * Feature 43 · scroll-spy (spec FR-028, research R8; confirmed by Roberto
 * 2026-11-01). happy-dom computes no layout, so `IntersectionObserver` is
 * replaced by a stub this file drives by hand.
 */
class ObserverStub {
  static instances: ObserverStub[] = []
  readonly observed: Element[] = []
  disconnected = false

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit
  ) {
    ObserverStub.instances.push(this)
  }

  observe(target: Element) {
    this.observed.push(target)
  }

  disconnect() {
    this.disconnected = true
  }

  /** Reports `target` entering (`true`) or leaving this observer's root. */
  emit(target: Element, isIntersecting: boolean) {
    this.callback(
      [{ target, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    )
  }
}

const original = globalThis.IntersectionObserver
const mounted: Array<{ unmount: () => void }> = []
let section: HTMLElement

/** The reading-band observer: the last one created. */
function latest(): ObserverStub {
  const observer = ObserverStub.instances.at(-1)
  if (!observer) throw new Error('No observer was created')
  return observer
}

/** The "not passed yet" observer, created just before the band's. */
function reach(): ObserverStub {
  const observer = ObserverStub.instances.at(-2)
  if (!observer) throw new Error('No reach observer was created')
  return observer
}

function mountSpy(enabled: Ref<boolean>, refreshKey = ref(0)) {
  let spy: ReturnType<typeof useActiveSection> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        spy = useActiveSection(enabled, ['servicios'], refreshKey)
        return () => h('div')
      },
    })
  )
  mounted.push(wrapper)
  return {
    active: () => spy?.activeAnchor.value,
    atTop: () => spy?.atTop.value,
    unmount: () => wrapper.unmount(),
  }
}

beforeEach(() => {
  ObserverStub.instances = []
  globalThis.IntersectionObserver =
    ObserverStub as unknown as typeof IntersectionObserver
  section = document.createElement('section')
  section.id = 'servicios'
  document.body.append(section)
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  globalThis.IntersectionObserver = original
  section.remove()
})

describe('useActiveSection · scroll-spy (spec FR-028, confirmed by Roberto 2026-11-01)', () => {
  it('should report nothing at the top of the page when the section is out of the band', () => {
    const spy = mountSpy(ref(true))

    expect(latest().observed).toEqual([section])
    expect(spy.active()).toBeNull()
  })

  it('should report the section while it is in the reading band', () => {
    const spy = mountSpy(ref(true))

    latest().emit(section, true)

    expect(spy.active()).toBe('servicios')
  })

  it('should report nothing again when the section leaves the band', () => {
    const spy = mountSpy(ref(true))
    latest().emit(section, true)

    latest().emit(section, false)

    expect(spy.active()).toBeNull()
  })

  it('should start the band under the header and end it mid-viewport when observing', () => {
    mountSpy(ref(true))

    expect(latest().options?.rootMargin).toMatch(/^-\d+(\.\d+)?px 0% -50% 0%$/)
  })

  it('should observe nothing when it is not enabled', () => {
    const spy = mountSpy(ref(false))

    expect(ObserverStub.instances).toEqual([])
    expect(spy.active()).toBeNull()
  })

  it('should report nothing when the browser has no IntersectionObserver', () => {
    globalThis.IntersectionObserver =
      undefined as unknown as typeof IntersectionObserver

    expect(mountSpy(ref(true)).active()).toBeNull()
  })

  it('should observe nothing when the section is not on the page', () => {
    section.remove()

    mountSpy(ref(true))

    expect(ObserverStub.instances).toEqual([])
  })

  it('should disconnect and report nothing when it is disabled by a route change', async () => {
    const enabled = ref(true)
    const spy = mountSpy(enabled)
    const first = latest()
    first.emit(section, true)

    enabled.value = false
    await nextTick()

    expect(first.disconnected).toBe(true)
    expect(spy.active()).toBeNull()
  })

  it('should observe the new page sections when the refresh key changes', async () => {
    const refreshKey = ref(0)
    mountSpy(ref(true), refreshKey)
    const first = latest()

    refreshKey.value += 1
    await nextTick()

    expect(first.disconnected).toBe(true)
    expect(latest()).not.toBe(first)
    expect(latest().observed).toEqual([section])
  })

  it('should be at the top before any section is reached (Home link, Roberto 2026-11-01)', () => {
    const spy = mountSpy(ref(true))
    expect(spy.atTop()).toBe(true)

    reach().emit(section, true)

    expect(spy.atTop()).toBe(true)
  })

  it('should open the reach root from the band top far downwards', () => {
    mountSpy(ref(true))

    expect(reach().options?.rootMargin).toMatch(/^-\d+(\.\d+)?px 0% 10000% 0%$/)
    expect(reach().observed).toEqual([section])
  })

  it('should not be at the top while a section is in the band', () => {
    const spy = mountSpy(ref(true))

    latest().emit(section, true)

    expect(spy.atTop()).toBe(false)
  })

  it('should not be at the top once the section has been scrolled past', () => {
    const spy = mountSpy(ref(true))
    latest().emit(section, true)

    latest().emit(section, false)
    reach().emit(section, false)

    expect(spy.active()).toBeNull()
    expect(spy.atTop()).toBe(false)
  })

  it('should be at the top again after a jump from the bottom that never crosses the band', () => {
    const spy = mountSpy(ref(true))
    reach().emit(section, false)
    expect(spy.atTop()).toBe(false)

    reach().emit(section, true)

    expect(spy.atTop()).toBe(true)
  })

  it('should disconnect both observers when disabled', async () => {
    const enabled = ref(true)
    const spy = mountSpy(enabled)
    const [first, second] = [reach(), latest()]
    first.emit(section, false)

    enabled.value = false
    await nextTick()

    expect(first.disconnected && second.disconnected).toBe(true)
    expect(spy.atTop()).toBe(true)
  })

  it('should disconnect when its scope is disposed', () => {
    const spy = mountSpy(ref(true))
    const observer = latest()

    spy.unmount()

    expect(observer.disconnected).toBe(true)
  })
})
