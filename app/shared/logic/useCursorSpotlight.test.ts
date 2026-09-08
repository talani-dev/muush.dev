import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useCursorSpotlight } from '@/shared/logic/useCursorSpotlight'

/**
 * The composable is the whole of this feature's off-switches, and `happy-dom`
 * neither styles nor paints — so what is asserted here is exactly what a DOM
 * without a renderer can answer: which listeners exist, which custom
 * properties were written, and how many times.
 *
 * Two globals are replaced (`research.md` § R6):
 *
 * - **`matchMedia`**, with a controllable per-query factory, so the two media
 *   conditions can be set independently and a `change` event dispatched to
 *   prove the live update of FR-013.
 * - **`requestAnimationFrame`**, with a queue this file flushes by hand. That
 *   is what makes "one write per frame" assertable at all; against the real
 *   rAF the assertion would be a timing race.
 *
 * **Deviation from `research.md` § R6, stated rather than hidden:** the
 * composable starts in `onMounted`, which is the SSR-safe placement its
 * contract requires, and `onMounted` needs a component instance — an
 * `effectScope()` alone never runs it. So each case mounts a one-line render
 * component whose only job is to call the composable, and `unmount()` provides
 * the scope disposal `scope.stop()` would have. The host is still a plain
 * detached `<div>`, and no component of this feature is involved.
 *
 * What this file **cannot** test is that any of it looks right: no paint order,
 * no gradient, no dot registration. Those are browser measurements
 * (`quickstart.md` §§ 4-5), never asserted from a test that cannot see pixels
 * (`docs/business/rules.md` § R27).
 */

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const POINTER_EVENTS = ['pointermove', 'scroll', 'resize'] as const
const DOCUMENT_EVENTS = ['pointerleave', 'pointerenter'] as const

type MediaListener = (event: MediaQueryListEvent) => void

/** One controllable `MediaQueryList` stand-in per query string. */
class FakeMediaQuery {
  matches = false
  private readonly listeners = new Set<MediaListener>()

  addEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.add(listener)
  }

  removeEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.delete(listener)
  }

  /** Flips the condition and notifies, the way a real preference change does. */
  set(matches: boolean) {
    this.matches = matches
    const event = { matches } as MediaQueryListEvent
    for (const listener of [...this.listeners]) listener(event)
  }

  get listenerCount() {
    return this.listeners.size
  }
}

let finePointer: FakeMediaQuery
let reducedMotion: FakeMediaQuery
let frames: FrameRequestCallback[]
let realMatchMedia: typeof window.matchMedia
let realRequestAnimationFrame: typeof window.requestAnimationFrame
let realCancelAnimationFrame: typeof window.cancelAnimationFrame

/** Runs every frame the composable asked for, exactly once. */
function flushFrames() {
  const pending = frames
  frames = []
  for (const frame of pending) frame(0)
}

function dispatchPointerMove(pointerType: string, clientX = 0, clientY = 0) {
  const event = new Event('pointermove')
  Object.assign(event, { pointerType, clientX, clientY })
  window.dispatchEvent(event)
}

interface MountedSpotlight {
  host: HTMLElement
  isActive: () => boolean
  unmount: () => void
}

/**
 * Every instance mounted by the current test, torn down in `afterEach`.
 *
 * This is not tidiness. The composable attaches to `window` and to
 * `document.documentElement`, both of which outlive a test, so an instance
 * left mounted keeps requesting animation frames during the *next* test — the
 * first draft of this file counted five frames where one was expected, one per
 * leaked instance. Constitution Article X: no test may depend on another
 * test's state.
 */
const mounted: Array<{ unmount: () => void }> = []

/**
 * Mounts a component whose only content is the composable call, against a
 * detached host. Nothing of `app/shared/ui/` is imported.
 */
function mountSpotlight(): MountedSpotlight {
  const host = document.createElement('div')
  const hostRef = ref<HTMLElement | null>(host)
  let tracked: ReturnType<typeof useCursorSpotlight> | undefined

  const wrapper = mount(
    defineComponent({
      setup() {
        tracked = useCursorSpotlight(hostRef)
        return () => h('div')
      },
    })
  )
  mounted.push(wrapper)

  return {
    host,
    isActive: () => tracked?.isActive.value === true,
    unmount: () => wrapper.unmount(),
  }
}

beforeEach(() => {
  finePointer = new FakeMediaQuery()
  reducedMotion = new FakeMediaQuery()
  frames = []

  realMatchMedia = window.matchMedia
  realRequestAnimationFrame = window.requestAnimationFrame
  realCancelAnimationFrame = window.cancelAnimationFrame

  /* Throwing on an unexpected query is the assertion that the composable asks
     for exactly the two conditions `ui-map.md` § 10 and § *Movimiento
     reducido* name, and no third one. */
  window.matchMedia = ((query: string) => {
    if (query === FINE_POINTER_QUERY) return finePointer
    if (query === REDUCED_MOTION_QUERY) return reducedMotion
    throw new Error(`unexpected media query: ${query}`)
  }) as unknown as typeof window.matchMedia

  window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
    frames.push(callback)) as unknown as typeof window.requestAnimationFrame

  window.cancelAnimationFrame = (() => {
    frames = []
  }) as unknown as typeof window.cancelAnimationFrame
})

afterEach(() => {
  /* Unmounting twice is safe; the disposal test unmounts its own instance. */
  for (const wrapper of mounted.splice(0)) wrapper.unmount()

  window.matchMedia = realMatchMedia
  window.requestAnimationFrame = realRequestAnimationFrame
  window.cancelAnimationFrame = realCancelAnimationFrame
  vi.restoreAllMocks()
})

/** Every listener this feature could have attached, counted by name. */
function countAttachedListeners() {
  const onWindow = vi.spyOn(window, 'addEventListener')
  const onDocument = vi.spyOn(document.documentElement, 'addEventListener')

  return () =>
    onWindow.mock.calls.filter(([type]) =>
      (POINTER_EVENTS as readonly string[]).includes(type)
    ).length +
    onDocument.mock.calls.filter(([type]) =>
      (DOCUMENT_EVENTS as readonly string[]).includes(type)
    ).length
}

describe('useCursorSpotlight · eligibility', () => {
  it('should stay inactive when the pointer is coarse', () => {
    /* `ui-map.md` § 10 scopes the effect to "Escritorio"; the measurable form
       of that is the pointer's own capabilities (spec A-06, FR-010). */
    finePointer.matches = false
    reducedMotion.matches = false

    const spotlight = mountSpotlight()

    expect(spotlight.isActive()).toBe(false)
  })

  it('should stay inactive when motion is reduced even with a fine pointer', () => {
    /* § *Movimiento reducido* lists the spotlight first (FR-011). */
    finePointer.matches = true
    reducedMotion.matches = true

    const spotlight = mountSpotlight()
    dispatchPointerMove('mouse', 100, 200)

    expect(spotlight.isActive()).toBe(false)
  })

  it('should attach no listener when the pointer is coarse', () => {
    finePointer.matches = false
    reducedMotion.matches = false
    const attached = countAttachedListeners()

    mountSpotlight()

    expect(attached()).toBe(0)
  })

  it('should attach no listener when motion is reduced', () => {
    finePointer.matches = true
    reducedMotion.matches = true
    const attached = countAttachedListeners()

    mountSpotlight()

    expect(attached()).toBe(0)
  })

  it('should stay inactive when eligible but no mouse has moved yet', () => {
    /* Spec A-07: the element must not exist before the first event, or every
       load paints a red blob in the top-left corner. */
    finePointer.matches = true
    reducedMotion.matches = false

    const spotlight = mountSpotlight()

    expect(spotlight.isActive()).toBe(false)
  })

  it('should become active when a mouse moves on an eligible device', () => {
    finePointer.matches = true
    reducedMotion.matches = false

    const spotlight = mountSpotlight()
    dispatchPointerMove('mouse', 100, 200)
    flushFrames()

    expect(spotlight.isActive()).toBe(true)
    expect(spotlight.host.style.getPropertyValue('--spotlight-x')).toBe('100px')
    expect(spotlight.host.style.getPropertyValue('--spotlight-y')).toBe('200px')
  })
})

describe('useCursorSpotlight · live preference changes', () => {
  it('should start tracking when a mouse is plugged in without a reload', () => {
    /* FR-013. The listener is on the query, so the effect appears mid-session
       rather than at the next navigation. */
    finePointer.matches = false
    reducedMotion.matches = false
    const spotlight = mountSpotlight()

    finePointer.set(true)
    dispatchPointerMove('mouse', 40, 60)
    flushFrames()

    expect(spotlight.isActive()).toBe(true)
  })

  it('should stop and clear its properties when reduced motion is turned on', () => {
    finePointer.matches = true
    reducedMotion.matches = false
    const spotlight = mountSpotlight()
    dispatchPointerMove('mouse', 40, 60)
    flushFrames()

    reducedMotion.set(true)

    expect(spotlight.isActive()).toBe(false)
    expect(spotlight.host.style.getPropertyValue('--spotlight-x')).toBe('')
    expect(spotlight.host.style.getPropertyValue('--spotlight-y')).toBe('')
  })

  it('should ignore a further pointer event once it has become ineligible', () => {
    finePointer.matches = true
    reducedMotion.matches = false
    const spotlight = mountSpotlight()

    reducedMotion.set(true)
    dispatchPointerMove('mouse', 999, 999)
    flushFrames()

    expect(spotlight.isActive()).toBe(false)
    expect(spotlight.host.style.getPropertyValue('--spotlight-x')).toBe('')
  })
})

describe('useCursorSpotlight · what it publishes', () => {
  beforeEach(() => {
    finePointer.matches = true
    reducedMotion.matches = false
  })

  it('should ignore a pointer event that did not come from a mouse', () => {
    /* A hybrid laptop passes the media query, so a touch must not teleport the
       light to a fingertip (FR-014). */
    const spotlight = mountSpotlight()

    dispatchPointerMove('touch', 500, 500)
    flushFrames()

    expect(spotlight.isActive()).toBe(false)
    expect(spotlight.host.style.getPropertyValue('--spotlight-x')).toBe('')
  })

  it('should write exactly once when many pointer events arrive before a frame', () => {
    /* The coalescing, and the reason a 1000 Hz mouse costs the same as a 60 Hz
       one (FR-020, SC-005). Two writes per update — x and y — so twenty events
       may produce two calls, never forty. */
    const spotlight = mountSpotlight()
    const written = vi.spyOn(spotlight.host.style, 'setProperty')

    for (let step = 0; step < 20; step += 1) {
      dispatchPointerMove('mouse', step, step)
    }

    expect(frames).toHaveLength(1)

    flushFrames()

    expect(written).toHaveBeenCalledTimes(2)
    expect(spotlight.host.style.getPropertyValue('--spotlight-x')).toBe('19px')
  })

  it('should republish its position when the page scrolls under a still pointer', () => {
    /* Page coordinates, not viewport coordinates (spec A-05): with the mouse
       held still, scrolling moves the light with the page so it stays under
       the cursor and the lit dots stay registered. */
    const spotlight = mountSpotlight()
    dispatchPointerMove('mouse', 10, 10)
    flushFrames()

    window.scrollY = 300
    window.dispatchEvent(new Event('scroll'))

    expect(frames).toHaveLength(1)

    flushFrames()

    expect(spotlight.host.style.getPropertyValue('--spotlight-y')).toBe('310px')
    window.scrollY = 0
  })

  it('should request no frame when the page scrolls before any mouse event', () => {
    mountSpotlight()

    window.dispatchEvent(new Event('scroll'))

    expect(frames).toHaveLength(0)
  })

  it('should hide and restore the layer when the pointer leaves and re-enters', () => {
    /* A light frozen mid-page after the visitor alt-tabs away reads as broken
       (spec A-07). The element stays mounted so re-entry is a fade. */
    const spotlight = mountSpotlight()
    dispatchPointerMove('mouse', 10, 10)
    flushFrames()

    document.documentElement.dispatchEvent(new Event('pointerleave'))
    expect(spotlight.host.style.getPropertyValue('--spotlight-opacity')).toBe(
      '0'
    )

    document.documentElement.dispatchEvent(new Event('pointerenter'))
    expect(spotlight.host.style.getPropertyValue('--spotlight-opacity')).toBe(
      '1'
    )
    expect(spotlight.isActive()).toBe(true)
  })
})

describe('useCursorSpotlight · disposal', () => {
  it('should leave no listener and no property behind when the scope stops', () => {
    finePointer.matches = true
    reducedMotion.matches = false

    const spotlight = mountSpotlight()
    dispatchPointerMove('mouse', 10, 10)
    flushFrames()
    document.documentElement.dispatchEvent(new Event('pointerleave'))

    spotlight.unmount()

    for (const property of [
      '--spotlight-x',
      '--spotlight-y',
      '--spotlight-opacity',
    ]) {
      expect(spotlight.host.style.getPropertyValue(property), property).toBe('')
    }
    expect(finePointer.listenerCount).toBe(0)
    expect(reducedMotion.listenerCount).toBe(0)

    /* Nothing the composable attached may survive: a further event must have
       nowhere to land. */
    dispatchPointerMove('mouse', 700, 700)
    flushFrames()

    expect(spotlight.host.style.getPropertyValue('--spotlight-x')).toBe('')
  })
})
