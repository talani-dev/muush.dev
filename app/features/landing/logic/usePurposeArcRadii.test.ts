import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, useTemplateRef } from 'vue'
import { usePurposeArcRadii } from './usePurposeArcRadii'

/**
 * Seen red on purpose first (`findings.md` § R39).
 *
 * `happy-dom` never computes real layout, so every element's
 * `getBoundingClientRect()` returns zeros unless overridden per test — this
 * file stubs it directly on each element rather than relying on the DOM to
 * lay anything out, the same technique `findings.md` documents for CDP
 * measurements applied one level down, in a unit test instead of a browser.
 */
interface Rect {
  left: number
  top: number
  width: number
  height: number
}

function stubRect(element: Element, rect: Rect): void {
  ;(element as HTMLElement).getBoundingClientRect = () =>
    ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => rect,
    }) as DOMRect
}

interface ObserverRecord {
  target: Element | undefined
  disconnected: boolean
  fire: () => void
}

const observers: ObserverRecord[] = []

/** A recording stand-in for `ResizeObserver` — `happy-dom` supplies one but
 *  never fires it, same discipline `useServicesLyrics.test.ts` uses for
 *  `IntersectionObserver`. */
function stubResizeObserver(): void {
  class RecordingResizeObserver {
    private readonly record: ObserverRecord

    constructor(private readonly callback: ResizeObserverCallback) {
      this.record = {
        target: undefined,
        disconnected: false,
        fire: () =>
          this.callback(
            [] as unknown as ResizeObserverEntry[],
            this as unknown as ResizeObserver
          ),
      }
      observers.push(this.record)
    }

    observe(target: Element): void {
      this.record.target = target
    }

    unobserve(): void {}

    disconnect(): void {
      this.record.disconnected = true
    }
  }

  vi.stubGlobal('ResizeObserver', RecordingResizeObserver)
}

const mounted: VueWrapper[] = []

beforeEach(() => {
  observers.length = 0
})

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  vi.unstubAllGlobals()
})

/** The section root, the `.arcs` wrapper with its three arcs, and three
 *  `.radar` spans — the minimum shape `usePurposeArcRadii` reads via
 *  selector, matching `PurposeSection.vue`'s real structure. */
const Host = defineComponent({
  setup() {
    const sectionRoot = useTemplateRef<HTMLElement>('sectionRoot')
    usePurposeArcRadii(sectionRoot)
    return {}
  },
  render() {
    return h('section', { ref: 'sectionRoot' }, [
      h('div', { class: 'arcs' }, [
        h('span', { class: 'arc arc-why' }),
        h('span', { class: 'arc arc-how' }),
        h('span', { class: 'arc arc-what' }),
      ]),
      h('span', { class: 'radar', 'data-node': 'why' }),
      h('span', { class: 'radar', 'data-node': 'how' }),
      h('span', { class: 'radar', 'data-node': 'what' }),
    ])
  },
})

async function mountHost() {
  const wrapper = mount(Host)
  mounted.push(wrapper)
  await nextTick()
  return wrapper
}

describe('usePurposeArcRadii · measurement', () => {
  it('should set each arc diameter to twice the real origin-to-radar distance', async () => {
    stubResizeObserver()
    const wrapper = await mountHost()

    const arcWhy = wrapper.find('.arc-why').element
    const arcHow = wrapper.find('.arc-how').element
    const arcWhat = wrapper.find('.arc-what').element
    const radars = wrapper.findAll('.radar').map(radar => radar.element)

    /* The wrapper must report a non-zero rect for the guard to proceed —
       a `display:none` box (mobile) reports all zeros, which is exactly
       what the "hidden" test below exercises. */
    stubRect(wrapper.find('.arcs').element, {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    })
    /* Every arc's own box centres on the shared origin — stub all three
       identically, as `usePurposeArcRadii` assumes. A 100×100 box at
       (0, 0) centres at (50, 50). */
    for (const arc of [arcWhy, arcHow, arcWhat]) {
      stubRect(arc, { left: 0, top: 0, width: 100, height: 100 })
    }
    /* A 3-4-5 triangle: radar centre 30px right and 40px down from the
       origin (50, 50) → centre (80, 90), distance 50, diameter 100. */
    stubRect(radars[0] as Element, { left: 70, top: 80, width: 20, height: 20 })
    /* Distance 100 → diameter 200. */
    stubRect(radars[1] as Element, {
      left: 140,
      top: 40,
      width: 20,
      height: 20,
    })
    /* Distance 0 (radar sits exactly on the origin) → diameter 0. */
    stubRect(radars[2] as Element, { left: 40, top: 40, width: 20, height: 20 })

    observers[0]?.fire()
    await nextTick()

    expect(
      (arcWhy as HTMLElement).style.getPropertyValue('--arc-diameter')
    ).toBe('100px')
    expect(
      (arcHow as HTMLElement).style.getPropertyValue('--arc-diameter')
    ).toBe('200px')
    expect(
      (arcWhat as HTMLElement).style.getPropertyValue('--arc-diameter')
    ).toBe('0px')
  })

  it('should observe the section root and recalculate on resize', async () => {
    stubResizeObserver()
    const wrapper = await mountHost()

    expect(observers).toHaveLength(1)
    expect(observers[0]?.target).toBe(wrapper.element)
  })

  it('should never overwrite the diameter while the arcs wrapper is hidden (mobile, below `lg`)', async () => {
    /*
     * Regression test for feature 24 round 3 (review finding): the guard
     * used to check an individual `.arc`'s own computed `display`, but
     * `position: absolute` blockifies that to `"block"` regardless of the
     * ancestor's `hidden` state — the guard never fired in production.
     * Reproduced here with `stubRect` on the WRAPPER (a real, zero-size
     * rect — exactly what a `display: none` box reports), never by mocking
     * `getComputedStyle`, so this test cannot pass for the wrong reason.
     */
    stubResizeObserver()
    const wrapper = await mountHost()

    const arcsWrapper = wrapper.find('.arcs').element
    const arcWhy = wrapper.find('.arc-why').element as HTMLElement
    const radars = wrapper.findAll('.radar').map(radar => radar.element)
    for (const arc of ['.arc-why', '.arc-how', '.arc-what']) {
      stubRect(wrapper.find(arc).element, {
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      })
    }
    stubRect(radars[0] as Element, { left: 70, top: 80, width: 20, height: 20 })

    /* A real measurement first, while the wrapper reports a real size,
       establishes a baseline. */
    stubRect(arcsWrapper, { left: 0, top: 0, width: 1280, height: 900 })
    observers[0]?.fire()
    await nextTick()
    expect(arcWhy.style.getPropertyValue('--arc-diameter')).toBe('100px')

    /* Now the wrapper itself reports the zero rect a `display: none` box
       always has (mobile, below `lg`), plus a different, bogus radar rect —
       if the guard did not hold, this would corrupt the diameter to 0. */
    stubRect(arcsWrapper, { left: 0, top: 0, width: 0, height: 0 })
    stubRect(radars[0] as Element, { left: 0, top: 0, width: 0, height: 0 })

    observers[0]?.fire()
    await nextTick()

    expect(arcWhy.style.getPropertyValue('--arc-diameter')).toBe('100px')
  })

  it('should disconnect the observer when the host unmounts', async () => {
    stubResizeObserver()
    const wrapper = await mountHost()

    expect(observers[0]?.disconnected).toBe(false)

    wrapper.unmount()
    mounted.pop()

    expect(observers[0]?.disconnected).toBe(true)
  })

  it('should no-op with no error when ResizeObserver is unavailable', async () => {
    vi.stubGlobal('ResizeObserver', undefined)

    await expect(mountHost()).resolves.toBeDefined()
    expect(observers).toHaveLength(0)
  })

  it('should not throw when the section is missing an expected arc or radar', async () => {
    stubResizeObserver()
    const Incomplete = defineComponent({
      setup() {
        const sectionRoot = useTemplateRef<HTMLElement>('sectionRoot')
        usePurposeArcRadii(sectionRoot)
        return {}
      },
      render() {
        return h('section', { ref: 'sectionRoot' }, [
          h('span', { class: 'arc arc-why' }),
        ])
      },
    })

    await expect(
      (async () => {
        const wrapper = mount(Incomplete)
        mounted.push(wrapper)
        await nextTick()
      })()
    ).resolves.toBeUndefined()
  })
})
