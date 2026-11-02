import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { useTimelineHover } from './useTimelineHover'

/**
 * Feature 44 · FR-042…FR-045 (Roberto review 2026-11-02). happy-dom does no
 * layout: the list width and the step / dot offsets are stubbed, as a
 * 1280-wide list of five 240-wide columns with a 20 gap and a 28 dot.
 */
type State = ReturnType<typeof useTimelineHover>

let media: ReturnType<typeof installMatchMedia>

function offset(element: Element, name: string, value: number) {
  Object.defineProperty(element, name, { configurable: true, value })
}

function Host(capture: (state: State) => void) {
  return defineComponent({
    setup() {
      const list = ref<HTMLElement | null>(null)
      capture(useTimelineHover(list, 5))
      return () =>
        h(
          'ol',
          { ref: list },
          [0, 1, 2, 3, 4].map(i =>
            h('li', { key: i, tabindex: 0 }, [
              h('span', { 'data-punto-paso': '' }),
            ])
          )
        )
    },
  })
}

async function mountHost({ desktop = true } = {}) {
  media = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: desktop })
  let state: State | undefined
  const wrapper = mount(
    Host(captured => (state = captured)),
    {
      attachTo: document.body,
    }
  )
  if (!state) throw new Error('composable did not run')
  const list = wrapper.element as HTMLElement
  offset(list, 'clientWidth', 1280)
  ;[...list.children].forEach((step, i) => {
    offset(step, 'offsetLeft', i * 260)
    const dot = step.querySelector('[data-punto-paso]')
    if (!dot) throw new Error('dot missing')
    offset(dot, 'offsetLeft', 0)
    offset(dot, 'offsetWidth', 28)
  })
  await nextTick()
  return { wrapper, state, steps: [...list.children] as HTMLElement[] }
}

function blurEvent(target: Element, relatedTarget: Element | null) {
  const event = new FocusEvent('focusout', { relatedTarget })
  Object.defineProperty(event, 'currentTarget', { value: target })
  return event
}

afterEach(() => {
  media.restore()
  document.body.innerHTML = ''
})

describe('useTimelineHover', () => {
  it('should have no active step and leave the timeline at rest when nothing is pointed', async () => {
    const { state } = await mountHost()

    expect(state.active.value).toBeNull()
    expect(state.progress.value).toBeNull()
    expect(state.lit.value).toBeNull()
  })

  it('should split the line at the pointed dot and light up to it when a step is hovered', async () => {
    const { state } = await mountHost()

    state.pointIn(0)
    expect(state.progress.value).toBeCloseTo(14 / 1280, 6)
    expect(state.lit.value).toEqual([true, false, false, false, false])

    state.pointIn(2)
    expect(state.progress.value).toBeCloseTo(534 / 1280, 6)
    expect(state.lit.value).toEqual([true, true, true, false, false])

    state.pointIn(4)
    expect(state.progress.value).toBeCloseTo(1054 / 1280, 6)
    expect(state.lit.value).toEqual([true, true, true, true, true])
  })

  it('should return to rest when the pointer leaves the step', async () => {
    const { state } = await mountHost()

    state.pointIn(2)
    state.pointOut(2)

    expect(state.active.value).toBeNull()
    expect(state.lit.value).toBeNull()
  })

  it('should ignore a late leave from a step the pointer already left', async () => {
    const { state } = await mountHost()

    state.pointIn(1)
    state.pointIn(3)
    state.pointOut(1)

    expect(state.active.value).toBe(3)
  })

  it('should preview the step that has keyboard focus and drop it on blur', async () => {
    const { state, steps } = await mountHost()
    const step = steps[2] as HTMLElement

    step.focus()
    state.focusIn(2, focusEventOn(step))
    expect(state.active.value).toBe(2)
    expect(state.lit.value).toEqual([true, true, true, false, false])

    state.focusOut(2, blurEvent(step, null))
    expect(state.active.value).toBeNull()
  })

  it('should not preview a focus that is not visible', async () => {
    const { state, steps } = await mountHost()

    /* Not focused, so not `:focus-visible`: what a click's focus is to the
       browser's heuristic. */
    state.focusIn(1, focusEventOn(steps[1]))

    expect(state.active.value).toBeNull()
  })

  it('should let the pointer win over focus while both are present', async () => {
    const { state, steps } = await mountHost()

    steps[1]?.focus()
    state.focusIn(1, focusEventOn(steps[1]))
    state.pointIn(3)

    expect(state.active.value).toBe(3)
    state.pointOut(3)
    expect(state.active.value).toBe(1)
  })

  it('should never preview below lg', async () => {
    const { state } = await mountHost({ desktop: false })

    state.pointIn(2)

    expect(state.active.value).toBeNull()
    expect(state.focusable.value).toBe(false)
  })

  it('should make the steps tab stops from lg only', async () => {
    const { state } = await mountHost()

    expect(state.focusable.value).toBe(true)
    media.query(DESKTOP_MEDIA_QUERY).set(false)
    expect(state.focusable.value).toBe(false)
  })
})

function focusEventOn(target: Element | undefined): FocusEvent {
  const event = new FocusEvent('focusin')
  Object.defineProperty(event, 'target', { value: target ?? null })
  return event
}
