import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, shallowRef, useTemplateRef } from 'vue'
import { usePurposeCarousel } from './usePurposeCarousel'

/**
 * Seen red on purpose first (`findings.md` § R39).
 *
 * ⚠️ **Every mount is unmounted in `afterEach`.** `happy-dom` gives one
 * `window` per test file, and a composable that registers global wiring —
 * here an `IntersectionObserver` — keeps running after the test that created
 * it. The symptom does not point at the cause: an observer left alive from an
 * earlier test writes into *its own* `activeIndex`, and a later assertion
 * reads a number nobody in that test produced (`findings.md` § R43).
 */
const mounted: VueWrapper[] = []

afterEach(() => {
  while (mounted.length > 0) mounted.pop()?.unmount()
  vi.unstubAllGlobals()
})

interface ObserverRecord {
  root: Element | null
  observed: Element[]
  disconnected: boolean
  fire: (entries: { target: Element; isIntersecting: boolean }[]) => void
}

const observers: ObserverRecord[] = []

/**
 * A recording stand-in for `IntersectionObserver`. `happy-dom` supplies one
 * but never fires it, so the only way to prove which entry becomes the active
 * card is to hand the callback the entries directly.
 */
function stubIntersectionObserver(): void {
  class RecordingObserver {
    private readonly record: ObserverRecord

    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      this.record = {
        root: (options?.root as Element | null) ?? null,
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

/** A host with three real children, because the cards are the track's own. */
const CARD_COUNT = 3

const Host = defineComponent({
  setup() {
    const track = useTemplateRef<HTMLElement>('track')
    return { carousel: usePurposeCarousel(track, CARD_COUNT), track }
  },
  render() {
    return h(
      'div',
      { ref: 'track' },
      Array.from({ length: CARD_COUNT }, (_unused, index) =>
        h('article', { key: index }, String(index))
      )
    )
  },
})

/**
 * ⚠️ `await`, and the reason is the wiring order rather than tidiness. The
 * composable's watcher is `flush: 'post'`, so the run that sees the real
 * element — a template ref is `null` all through `setup()` — is queued to the
 * post-flush queue and lands on a microtask. Mounting and asserting in the
 * same tick observes the composable *before* it has a track, which reads as
 * "the observer was never created".
 */
async function mountHost() {
  const wrapper = mount(Host)
  mounted.push(wrapper)
  await nextTick()
  return wrapper
}

beforeEach(() => {
  observers.length = 0
})

describe('usePurposeCarousel · the active card', () => {
  it('should start on Why when the carousel mounts', async () => {
    /* `ui-map.md` § 4: *"Entrada: Why al centro activa."* It is index 0 on the
       server too, so the prerendered document agrees with the first client
       render. */
    stubIntersectionObserver()
    const wrapper = await mountHost()

    expect(wrapper.vm.carousel.activeIndex.value).toBe(0)
  })

  it('should follow the centred card when the observer reports one', async () => {
    stubIntersectionObserver()
    const wrapper = await mountHost()
    const cards = wrapper.findAll('article').map(card => card.element)

    observers[0]?.fire([{ target: cards[2] as Element, isIntersecting: true }])

    expect(wrapper.vm.carousel.activeIndex.value).toBe(2)
  })

  it('should ignore an entry that has left the track when the observer fires', async () => {
    /* Only the entering card is news. A leaving one would otherwise reset the
       index to whatever scrolled away. */
    stubIntersectionObserver()
    const wrapper = await mountHost()
    const cards = wrapper.findAll('article').map(card => card.element)

    observers[0]?.fire([{ target: cards[1] as Element, isIntersecting: true }])
    observers[0]?.fire([{ target: cards[1] as Element, isIntersecting: false }])

    expect(wrapper.vm.carousel.activeIndex.value).toBe(1)
  })

  it('should observe every card with the track as the root when mounted', async () => {
    /* One observer on the track, not one per card and not a scroll listener:
       reading geometry on a per-frame path is the cost `findings.md` § R41
       measured. */
    stubIntersectionObserver()
    const wrapper = await mountHost()

    expect(observers).toHaveLength(1)
    expect(observers[0]?.observed).toHaveLength(CARD_COUNT)
    expect(observers[0]?.root).toBe(wrapper.element)
  })
})

describe('usePurposeCarousel · the indicator and the keyboard', () => {
  it('should move the active card when a dot is activated', async () => {
    stubIntersectionObserver()
    const wrapper = await mountHost()

    wrapper.vm.carousel.focusCard(1)

    expect(wrapper.vm.carousel.activeIndex.value).toBe(1)
  })

  it('should wrap forward past the last card when the right arrow is pressed', async () => {
    /* The loop `ui-map.md` § 4 asks for, kept for the indicator and the
       keyboard only — the swipe uses native scroll bounds (spec A-07). */
    stubIntersectionObserver()
    const { carousel } = (await mountHost()).vm

    carousel.focusCard(CARD_COUNT - 1)
    carousel.onIndicatorKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowRight' })
    )

    expect(carousel.activeIndex.value).toBe(0)
  })

  it('should wrap backward past the first card when the left arrow is pressed', async () => {
    stubIntersectionObserver()
    const { carousel } = (await mountHost()).vm

    carousel.onIndicatorKeydown(
      new KeyboardEvent('keydown', { key: 'ArrowLeft' })
    )

    expect(carousel.activeIndex.value).toBe(CARD_COUNT - 1)
  })

  it('should leave every other key alone when the indicator is focused', async () => {
    /* Tab, Enter and Space keep their meaning: the dots are real buttons. */
    stubIntersectionObserver()
    const { carousel } = (await mountHost()).vm
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })

    carousel.onIndicatorKeydown(event)

    expect(carousel.activeIndex.value).toBe(0)
    expect(event.defaultPrevented).toBe(false)
  })

  it('should claim the arrow keys when it handles them', async () => {
    stubIntersectionObserver()
    const { carousel } = (await mountHost()).vm
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      cancelable: true,
    })

    carousel.onIndicatorKeydown(event)

    expect(event.defaultPrevented).toBe(true)
  })
})

describe('usePurposeCarousel · the enhancement is opt-in', () => {
  it('should report itself enhanced once the track is wired', async () => {
    stubIntersectionObserver()
    const wrapper = await mountHost()

    expect(wrapper.vm.carousel.isEnhanced.value).toBe(true)
  })

  it('should no-op when IntersectionObserver is unavailable', async () => {
    /*
     * The server, and any environment without the API. Nothing is observed,
     * so `isEnhanced` stays `false` and the carousel is exactly the native
     * snap track: three cards at full size and full opacity, no dots
     * (`ui-map.md` § 10, spec FR-023).
     */
    vi.stubGlobal('IntersectionObserver', undefined)

    const { carousel } = (await mountHost()).vm

    expect(carousel.isEnhanced.value).toBe(false)
    expect(observers).toHaveLength(0)
    expect(carousel.activeIndex.value).toBe(0)
  })

  it('should disconnect the observer when the carousel unmounts', async () => {
    /* Otherwise it keeps reporting into a dead component — and, in this file,
       into the next test (`findings.md` § R43). */
    stubIntersectionObserver()
    const wrapper = await mountHost()

    expect(observers[0]?.disconnected).toBe(false)

    wrapper.unmount()
    mounted.pop()

    expect(observers[0]?.disconnected).toBe(true)
  })

  it('should report itself unenhanced when the track holds no cards', async () => {
    /* Not a real state on the page — it guards the wiring order, since the
       observer is created from the track's children. */
    stubIntersectionObserver()
    const Empty = defineComponent({
      setup() {
        const track = useTemplateRef<HTMLElement>('track')
        return { carousel: usePurposeCarousel(track, 0) }
      },
      render() {
        return h('div', { ref: 'track' })
      },
    })
    const wrapper = mount(Empty)
    mounted.push(wrapper)
    await nextTick()

    expect(wrapper.vm.carousel.isEnhanced.value).toBe(false)
  })

  it('should stay inert when the track element never arrives', async () => {
    /* A template ref is `null` during setup and again after unmount, so the
       wiring follows the element rather than a single lifecycle moment. */
    stubIntersectionObserver()
    const absent = shallowRef<HTMLElement | null>(null)
    const carousel = usePurposeCarousel(absent, CARD_COUNT)
    await nextTick()

    expect(carousel.isEnhanced.value).toBe(false)
    expect(observers).toHaveLength(0)
  })
})
