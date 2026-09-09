import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useNavScrollReveal } from './useNavScrollReveal'

/**
 * `happy-dom` does no styling or painting, so what is asserted here is the
 * boolean the composable publishes, never a rendered `transform` — that half
 * is `SiteNav.vue`'s `<style scoped>`, a browser measurement.
 *
 * `requestAnimationFrame` is replaced with a queue this file flushes by hand,
 * same technique as `useCursorSpotlight.test.ts`, so "one evaluation per
 * frame" is assertable instead of a timing race.
 */

let frames: FrameRequestCallback[]
let realRequestAnimationFrame: typeof window.requestAnimationFrame

function flushFrames() {
  const pending = frames
  frames = []
  for (const frame of pending) frame(0)
}

/** A real scroll fires a `scroll` event; `window.scrollTo` alone does not
 *  under `happy-dom`, so tests dispatch it explicitly. */
function scrollTo(offset: number) {
  window.scrollTo(0, offset)
  window.dispatchEvent(new Event('scroll'))
  flushFrames()
}

interface MountedReveal {
  isNavVisible: () => boolean
  unmount: () => void
}

const mounted: Array<{ unmount: () => void }> = []

/** Mirrors `useCursorSpotlight.test.ts`: `onMounted` needs a component
 *  instance, so each case mounts a one-line render component. */
function mountReveal(isMobileMenuOpen = ref(false)): MountedReveal {
  let tracked: ReturnType<typeof useNavScrollReveal> | undefined

  const wrapper = mount(
    defineComponent({
      setup() {
        tracked = useNavScrollReveal(isMobileMenuOpen)
        return () => h('div')
      },
    })
  )
  mounted.push(wrapper)

  return {
    isNavVisible: () => tracked?.isNavVisible.value === true,
    unmount: () => wrapper.unmount(),
  }
}

beforeEach(() => {
  frames = []
  realRequestAnimationFrame = window.requestAnimationFrame

  window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    frames.push(callback)) as unknown as typeof window.requestAnimationFrame
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()

  window.requestAnimationFrame = realRequestAnimationFrame
  window.scrollTo(0, 0)
})

describe('useNavScrollReveal', () => {
  it('should start visible when mounted', () => {
    const reveal = mountReveal()

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should stay visible while scrolling down inside the first 80px', () => {
    const reveal = mountReveal()

    scrollTo(40)
    scrollTo(79)

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should stay visible past 80px until 10 continuous downward px accumulate', () => {
    const reveal = mountReveal()

    scrollTo(80) /* baseline: exactly at the zone edge, still visible */
    scrollTo(84) /* +4 */
    scrollTo(88) /* +4, total 8 — under the 10px threshold */

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should hide once 10 continuous downward px accumulate past the 80px zone', () => {
    const reveal = mountReveal()

    scrollTo(80)
    scrollTo(85) /* +5 */
    scrollTo(91) /* +6, total 11 — crosses the threshold */

    expect(reveal.isNavVisible()).toBe(false)
  })

  it('should reveal immediately on any upward movement, past the zone and with no threshold', () => {
    const reveal = mountReveal()

    scrollTo(80)
    scrollTo(85)
    scrollTo(91)
    expect(reveal.isNavVisible()).toBe(false)

    scrollTo(85) /* upward: no threshold at all */

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should not hide from an oscillating bounce that never accumulates 10px downward', () => {
    /* The rubber-band bounce reports itself as small alternating deltas; each
       upward tick resets the accumulator, so it can never cross the
       threshold no matter how long it oscillates. */
    const reveal = mountReveal()

    scrollTo(80)
    scrollTo(85) /* +5 down */
    scrollTo(83) /* -2 up: resets */
    scrollTo(88) /* +5 down */
    scrollTo(84) /* -4 up: resets */
    scrollTo(89) /* +5 down */

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should become visible again once back inside the 80px zone', () => {
    const reveal = mountReveal()

    scrollTo(80)
    scrollTo(85)
    scrollTo(91)
    expect(reveal.isNavVisible()).toBe(false)

    scrollTo(30)

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should never hide while the mobile menu is open, regardless of scroll', () => {
    const isMobileMenuOpen = ref(true)
    const reveal = mountReveal(isMobileMenuOpen)

    scrollTo(85)
    scrollTo(96)

    expect(reveal.isNavVisible()).toBe(true)
  })

  it('should resume normal hiding once the mobile menu closes', () => {
    const isMobileMenuOpen = ref(true)
    const reveal = mountReveal(isMobileMenuOpen)

    scrollTo(85)
    scrollTo(96)
    expect(reveal.isNavVisible()).toBe(true)

    isMobileMenuOpen.value = false

    expect(reveal.isNavVisible()).toBe(false)
  })

  it('should stop listening for scroll once the scope is disposed', () => {
    const reveal = mountReveal()
    reveal.unmount()

    /* No further evaluation should be queued once torn down. */
    scrollTo(200)

    expect(frames).toHaveLength(0)
  })
})
