import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, useTemplateRef } from 'vue'
import { useServicesLyrics } from './useServicesLyrics'

/**
 * Seen red on purpose first (`findings.md` § R39).
 *
 * ⚠️ **Every mount is unmounted in `afterEach`.** `happy-dom` gives one
 * `window` per test file, and a composable that registers global wiring —
 * here an `IntersectionObserver` — keeps running after the test that created
 * it (`findings.md` § R43).
 */
const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  vi.unstubAllGlobals()
})

interface ObserverRecord {
  observed: Element[]
  disconnected: boolean
  fire: (entries: { target: Element; intersectionRatio: number }[]) => void
}

const observers: ObserverRecord[] = []

/**
 * A recording stand-in for `IntersectionObserver`. `happy-dom` supplies one
 * but never fires it, so the only way to prove which item becomes active is
 * to hand the callback the entries directly.
 */
function stubIntersectionObserver(): void {
  class RecordingObserver {
    private readonly record: ObserverRecord

    constructor(callback: IntersectionObserverCallback) {
      this.record = {
        observed: [],
        disconnected: false,
        fire: entries =>
          callback(
            entries as unknown as IntersectionObserverEntry[],
            this as unknown as IntersectionObserver
          ),
      }
      observers.push(this.record)
    }

    observe(element: Element): void {
      this.record.observed.push(element)
    }

    disconnect(): void {
      this.record.disconnected = true
    }

    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  vi.stubGlobal('IntersectionObserver', RecordingObserver)
}

/** The items are the container's own children — same as `usePurposeCarousel`. */
const ITEM_COUNT = 5

const Host = defineComponent({
  setup() {
    const container = useTemplateRef<HTMLElement>('container')
    useServicesLyrics(container)
    return {}
  },
  render() {
    return h(
      'div',
      { ref: 'container' },
      /* `class="item"` rather than a `div > div` selector in the tests below:
         `querySelectorAll` matches the ancestor half of a combinator against
         the *real* DOM, so `div > div` also matches this very container
         against Vue Test Utils' own mounting div — a sixth, unintended
         match at index 0. */
      Array.from({ length: ITEM_COUNT }, (_unused, index) =>
        h('div', { key: index, class: 'item' }, String(index))
      )
    )
  },
})

/* The watcher is `flush: 'post'`, so mounting and asserting in the same tick
   observes the composable before the template ref has landed. */
async function mountHost() {
  const wrapper = mount(Host)
  mounted.push(wrapper)
  await nextTick()
  return wrapper
}

beforeEach(() => {
  observers.length = 0
})

describe('useServicesLyrics · bucketing', () => {
  it('should observe every item with the three-threshold set when mounted', async () => {
    stubIntersectionObserver()
    await mountHost()

    expect(observers).toHaveLength(1)
    expect(observers[0]?.observed).toHaveLength(ITEM_COUNT)
  })

  it('should mark the highest-ratio item active and its neighbours near', async () => {
    stubIntersectionObserver()
    const wrapper = await mountHost()
    const items = wrapper.findAll('.item').map(item => item.element)

    observers[0]?.fire(
      items.map((target, index) => ({
        target: target as Element,
        intersectionRatio: index === 2 ? 1 : 0,
      }))
    )

    expect(items.map(item => item.getAttribute('data-lyrics'))).toEqual([
      'far',
      'near',
      'active',
      'near',
      'far',
    ])
  })

  it('should re-bucket around a new centred item when it fires again', async () => {
    stubIntersectionObserver()
    const wrapper = await mountHost()
    const items = wrapper.findAll('.item').map(item => item.element)

    observers[0]?.fire(
      items.map((target, index) => ({
        target: target as Element,
        intersectionRatio: index === 0 ? 1 : 0,
      }))
    )
    observers[0]?.fire(
      items.map((target, index) => ({
        target: target as Element,
        intersectionRatio: index === 4 ? 1 : 0,
      }))
    )

    expect(items.map(item => item.getAttribute('data-lyrics'))).toEqual([
      'far',
      'far',
      'far',
      'near',
      'active',
    ])
  })

  it('should keep the earlier item active on a tie', async () => {
    /* A-04: ties resolve to the earlier item in DOM order. */
    stubIntersectionObserver()
    const wrapper = await mountHost()
    const items = wrapper.findAll('.item').map(item => item.element)

    observers[0]?.fire(
      items.map((target, index) => ({
        target: target as Element,
        intersectionRatio: index === 1 || index === 3 ? 1 : 0,
      }))
    )

    expect(items[1]?.getAttribute('data-lyrics')).toBe('active')
  })

  it('should bucket nothing while every ratio is zero', async () => {
    /* A real first-callback shape: the observer starts watching before the
       visitor has scrolled anywhere near the timeline, so every entry is 0 —
       a tie across all five that means "nothing is visible", not "item 1
       wins". Measured in Chrome: without this guard, a fresh page load
       dimmed items 2–5 at scroll position 0. */
    stubIntersectionObserver()
    const wrapper = await mountHost()
    const items = wrapper.findAll('.item').map(item => item.element)

    observers[0]?.fire(
      items.map(target => ({ target: target as Element, intersectionRatio: 0 }))
    )

    for (const item of items) {
      expect(item.getAttribute('data-lyrics')).toBeNull()
    }
  })

  it('should disconnect the observer when the host unmounts', async () => {
    stubIntersectionObserver()
    const wrapper = await mountHost()

    expect(observers[0]?.disconnected).toBe(false)

    wrapper.unmount()
    mounted.pop()

    expect(observers[0]?.disconnected).toBe(true)
  })

  it('should no-op with no error when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    await expect(mountHost()).resolves.toBeDefined()
    expect(observers).toHaveLength(0)
  })

  it('should report no observer when the container holds no items', async () => {
    stubIntersectionObserver()
    const Empty = defineComponent({
      setup() {
        const container = useTemplateRef<HTMLElement>('container')
        useServicesLyrics(container)
        return {}
      },
      render() {
        return h('div', { ref: 'container' })
      },
    })
    const wrapper = mount(Empty)
    mounted.push(wrapper)
    await nextTick()

    expect(observers).toHaveLength(0)
  })
})
