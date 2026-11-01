import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref } from 'vue'
import { useReducedMotion } from '@/shared/logic/useReducedMotion'

/**
 * Feature 42 · research R13. `matchMedia` is replaced by a controllable
 * stand-in so the preference can be flipped live and its listeners counted;
 * the composable starts in `onMounted`, so each case mounts a one-line host
 * (the pattern of `useCursorSpotlight.test.ts`).
 */
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
let realMatchMedia: typeof window.matchMedia

function mountHost() {
  let reduced: Readonly<Ref<boolean>> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        reduced = useReducedMotion()
        return () => h('div')
      },
    })
  )
  if (!reduced) throw new Error('composable did not run')
  return { wrapper, reduced }
}

beforeEach(() => {
  media = new FakeMediaQuery()
  realMatchMedia = window.matchMedia
  window.matchMedia = vi.fn(() => media as unknown as MediaQueryList)
})

afterEach(() => {
  window.matchMedia = realMatchMedia
})

describe('useReducedMotion', () => {
  it('should be false when the visitor has not asked to reduce motion', () => {
    const { reduced } = mountHost()

    expect(reduced.value).toBe(false)
  })

  it('should be true when the visitor reduces motion before mount', () => {
    media.matches = true

    const { reduced } = mountHost()

    expect(reduced.value).toBe(true)
  })

  it('should follow the preference live when it changes after mount', () => {
    const { reduced } = mountHost()

    media.set(true)
    expect(reduced.value).toBe(true)

    media.set(false)
    expect(reduced.value).toBe(false)
  })

  it('should query the reduced-motion media feature when mounted', () => {
    mountHost()

    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    )
  })

  it('should remove its listener when the host unmounts', () => {
    const { wrapper } = mountHost()
    expect(media.listeners.size).toBe(1)

    wrapper.unmount()

    expect(media.listeners.size).toBe(0)
  })
})
