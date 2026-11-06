import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref, ref } from 'vue'
import {
  ROTATION_INTERVAL_MS,
  useRotatingText,
} from '@/shared/logic/useRotatingText'

/**
 * Feature 42 · FR-015, research R12, contract § 8. Fake timers drive the
 * 2.6 s cadence; `matchMedia` and `document.hidden` are controllable
 * stand-ins. Each host is unmounted after its case so no interval leaks
 * into the next (findings.md § R43).
 */
const ITEMS = [
  'Estrategia tecnológica',
  'Software, web y nube',
  'Automatización, datos e IA',
  'Diseño de producto y UX',
]

type MediaListener = (event: MediaQueryListEvent) => void

class FakeMediaQuery {
  matches = false
  readonly listeners = new Set<MediaListener>()
  addEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.add(listener)
  }
  removeEventListener(_type: 'change', listener: MediaListener) {
    this.listeners.delete(listener)
  }
  set(matches: boolean) {
    this.matches = matches
    for (const listener of [...this.listeners]) {
      listener({ matches } as MediaQueryListEvent)
    }
  }
}

let media: FakeMediaQuery
let hidden: boolean
const mounted: { unmount(): void }[] = []

function mountHost(items: string[] = ITEMS, paused?: Ref<boolean>) {
  let state: ReturnType<typeof useRotatingText> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        state = useRotatingText(items, { paused })
        return () => h('div')
      },
    })
  )
  mounted.push(wrapper)
  if (!state) throw new Error('composable did not run')
  return { wrapper, state }
}

beforeEach(() => {
  vi.useFakeTimers()
  media = new FakeMediaQuery()
  hidden = false
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media)
  )
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  })
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'hidden')
})

describe('useRotatingText', () => {
  it('should rotate every 2.6 seconds when imported', () => {
    expect(ROTATION_INTERVAL_MS).toBe(2600)
  })

  it('should show the first item when mounted', () => {
    const { state } = mountHost()

    expect(state.index.value).toBe(0)
    expect(state.current.value).toBe(ITEMS[0])
  })

  it('should not advance before the interval has elapsed', () => {
    const { state } = mountHost()

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS - 1)

    expect(state.index.value).toBe(0)
  })

  it('should advance once per interval and wrap after the last item', () => {
    const { state } = mountHost()

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS)
    expect(state.current.value).toBe(ITEMS[1])

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 3)
    expect(state.index.value).toBe(0)
    expect(state.current.value).toBe(ITEMS[0])
  })

  it('should not advance while the tab is hidden', () => {
    const { state } = mountHost()
    hidden = true

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 2)

    expect(state.index.value).toBe(0)
  })

  it('should not advance while paused and resume when released', () => {
    const paused = ref(true)
    const { state } = mountHost(ITEMS, paused)

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 2)
    expect(state.index.value).toBe(0)

    paused.value = false
    vi.advanceTimersByTime(ROTATION_INTERVAL_MS)
    expect(state.index.value).toBe(1)
  })

  it('should stay on the first item when motion is reduced', () => {
    media.matches = true
    const { state } = mountHost()

    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 10)

    expect(state.index.value).toBe(0)
  })

  it('should stop on the current item when motion is reduced while rotating', () => {
    const { state } = mountHost()
    vi.advanceTimersByTime(ROTATION_INTERVAL_MS)

    media.set(true)
    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 3)

    expect(state.index.value).toBe(1)
  })

  it('should start no interval when given fewer than two items', () => {
    const { state } = mountHost(['Estrategia tecnológica'])

    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(ROTATION_INTERVAL_MS * 3)
    expect(state.current.value).toBe('Estrategia tecnológica')
  })

  it('should clear its interval when the host unmounts', () => {
    const { wrapper } = mountHost()
    expect(vi.getTimerCount()).toBe(1)

    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
