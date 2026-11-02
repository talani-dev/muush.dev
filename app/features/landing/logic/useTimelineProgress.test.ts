import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { REDUCED_MOTION_QUERY } from '@/shared/logic/useReducedMotion'
import { useTimelineProgress } from './useTimelineProgress'

/**
 * Feature 44 · FR-019, FR-020, FR-044, research R8. happy-dom does no layout: the
 * list and step boxes are stubbed per case; frames run synchronously.
 */
type State = ReturnType<typeof useTimelineProgress>

let media: ReturnType<typeof installMatchMedia>

function box(element: Element, top: number, height: number) {
  element.getBoundingClientRect = () =>
    ({ top, height, bottom: top + height }) as DOMRect
}

function Host(capture: (state: State) => void) {
  return defineComponent({
    setup() {
      const list = ref<HTMLElement | null>(null)
      capture(useTimelineProgress(list, 5))
      return () =>
        h(
          'ol',
          { ref: list },
          [0, 1, 2, 3, 4].map(i =>
            h(
              'li',
              { key: i },
              i < 4 ? [h('span', { 'data-segmento': '' })] : []
            )
          )
        )
    },
  })
}

function mountHost({ desktop = false, reduced = false } = {}) {
  media = installMatchMedia({
    [DESKTOP_MEDIA_QUERY]: desktop,
    [REDUCED_MOTION_QUERY]: reduced,
  })
  let state: State | undefined
  const wrapper = mount(Host(captured => (state = captured)))
  if (!state) throw new Error('composable did not run')
  return { wrapper, state, list: wrapper.element as HTMLElement }
}

function layOutVertically(list: HTMLElement, listTop: number) {
  box(list, listTop, 560)
  ;[...list.children].forEach((step, i) => {
    box(step, listTop + i * 112, 112)
    const segment = step.querySelector('[data-segmento]')
    if (segment) box(segment, listTop + i * 112 + 6, 112)
  })
}

beforeEach(() => {
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: 1000,
  })
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callback(0)
    return 0
  })
})

afterEach(() => {
  media.restore()
  vi.restoreAllMocks()
})

describe('useTimelineProgress', () => {
  it('should render full and lit when rendered on the server', async () => {
    let state: State | undefined
    media = installMatchMedia()
    await renderToString(createSSRApp(Host(captured => (state = captured))))

    expect(state?.lit.value).toEqual([true, true, true, true, true])
    expect(state?.fills.value).toEqual([1, 1, 1, 1, 1])
  })

  it('should stay full and add no listener when the visitor reduces motion', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const { state } = mountHost({ reduced: true })

    expect(state.lit.value.every(Boolean)).toBe(true)
    expect(add).not.toHaveBeenCalledWith(
      'scroll',
      expect.anything(),
      expect.anything()
    )
  })

  it('should fill the rail down to the pencil line when scrolled below lg', () => {
    const { state, list } = mountHost()

    layOutVertically(list, 500)
    window.dispatchEvent(new Event('scroll'))

    /* Pencil at 650: rows start at 500, 612, 724…; the first segment
       (506 → 618) is full, the second (618 → 730) is 32 / 112 in. */
    expect(state.lit.value).toEqual([true, true, false, false, false])
    expect(state.fills.value[0]).toBe(1)
    expect(state.fills.value[1]).toBeCloseTo(32 / 112, 6)
    expect(state.fills.value[2]).toBe(0)
    expect(state.fills.value[4]).toBe(0)
  })

  it('should not measure the rail from lg, where there is no scroll fill', async () => {
    /* Roberto, clarification 2026-11-02 (FR-044): the desktop columns
       follow the hover preview only; the rail keeps its last state. */
    const { state, list } = mountHost({ desktop: true })
    await nextTick()

    layOutVertically(list, 900)
    window.dispatchEvent(new Event('scroll'))

    expect(state.lit.value).toEqual([true, true, true, true, true])
    expect(state.fills.value).toEqual([1, 1, 1, 1, 1])
  })

  it('should reverse when the visitor scrolls back up', () => {
    const { state, list } = mountHost()
    layOutVertically(list, 0)
    window.dispatchEvent(new Event('scroll'))
    expect(state.lit.value.every(Boolean)).toBe(true)

    layOutVertically(list, 900)
    window.dispatchEvent(new Event('scroll'))

    expect(state.lit.value).toEqual([false, false, false, false, false])
  })

  it('should fill everything and stop listening when reduced motion turns on', async () => {
    const { state, list } = mountHost()
    layOutVertically(list, 900)
    window.dispatchEvent(new Event('scroll'))
    expect(state.lit.value[0]).toBe(false)

    media.query(REDUCED_MOTION_QUERY).set(true)
    await nextTick()

    expect(state.lit.value.every(Boolean)).toBe(true)
    expect(state.fills.value).toEqual([1, 1, 1, 1, 1])
  })

  it('should remove its listeners when the host unmounts', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { wrapper } = mountHost()

    wrapper.unmount()

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
