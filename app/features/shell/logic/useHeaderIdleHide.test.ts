import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import { HEADER_IDLE_HIDE_MS, useHeaderIdleHide } from './useHeaderIdleHide'

/** Feature 45, reopen 1 · FR-036, FR-037 (Roberto 2026-11-02). */
let frames: FrameRequestCallback[] = []
let media: ReturnType<typeof installMatchMedia> | undefined
const mounted: { unmount(): void }[] = []

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  frames = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    frames.push(callback)
  )
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
})

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  media?.restore()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  window.scrollTo(0, 0)
})

function scrollTo(offset: number) {
  window.scrollTo(0, offset)
  window.dispatchEvent(new Event('scroll'))
  const pending = frames
  frames = []
  for (const frame of pending) frame(0)
}

async function mountIdle({ desktop = true, at = 400 } = {}) {
  window.scrollTo(0, at)
  media = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: desktop })
  let idle: ReturnType<typeof useHeaderIdleHide> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        idle = useHeaderIdleHide()
        return () => h('header', [h('a', { href: '#' })])
      },
    }),
    { attachTo: document.body }
  )
  mounted.push(wrapper)
  await nextTick()
  if (!idle) throw new Error('composable did not run')
  return { idle, wrapper, query: media.query(DESKTOP_MEDIA_QUERY) }
}

describe('useHeaderIdleHide', () => {
  it('should hide after 2.5 s with no scrolling on desktop', async () => {
    const { idle } = await mountIdle()

    expect(HEADER_IDLE_HIDE_MS).toBe(2500)
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS - 1)
    expect(idle.isIdleHidden.value).toBe(false)
    vi.advanceTimersByTime(1)
    expect(idle.isIdleHidden.value).toBe(true)
  })

  it('should stay hidden when a slow downward scroll starts after an idle hide', async () => {
    /* review-45 re-review 2: 2 px steps, under the 10 px the scroll-down
       hide needs, used to bring the header half back in. */
    const { idle } = await mountIdle()
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS)

    for (const step of [402, 404, 406, 408]) {
      scrollTo(step)
      expect(idle.isIdleHidden.value).toBe(true)
    }
  })

  it('should show again when the top zone is reached by scrolling down from nothing', async () => {
    const { idle } = await mountIdle()
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS)

    scrollTo(60)

    expect(idle.isIdleHidden.value).toBe(false)
  })

  it('should show again on an upward scroll and restart the wait on every scroll', async () => {
    const { idle } = await mountIdle()
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS)

    scrollTo(380)
    expect(idle.isIdleHidden.value).toBe(false)
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS - 100)
    scrollTo(390)
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS - 100)
    expect(idle.isIdleHidden.value).toBe(false)
    vi.advanceTimersByTime(100)
    expect(idle.isIdleHidden.value).toBe(true)
  })

  it('should never hide at the very top of the page', async () => {
    const { idle } = await mountIdle({ at: 40 })

    vi.advanceTimersByTime(10 * HEADER_IDLE_HIDE_MS)

    expect(idle.isIdleHidden.value).toBe(false)
  })

  it('should never hide below lg', async () => {
    const { idle } = await mountIdle({ desktop: false })

    vi.advanceTimersByTime(10 * HEADER_IDLE_HIDE_MS)

    expect(idle.isIdleHidden.value).toBe(false)
    expect(idle.isHeld.value).toBe(false)
  })

  it('should hold while the pointer is over the header and wait again after it leaves', async () => {
    const { idle } = await mountIdle()

    idle.pointerEnter()
    vi.advanceTimersByTime(10 * HEADER_IDLE_HIDE_MS)
    expect(idle.isIdleHidden.value).toBe(false)
    expect(idle.isHeld.value).toBe(true)

    idle.pointerLeave()
    expect(idle.isHeld.value).toBe(false)
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS)
    expect(idle.isIdleHidden.value).toBe(true)
  })

  it('should hold while keyboard focus is inside the header, also across its own controls', async () => {
    const { idle, wrapper } = await mountIdle()
    const header = wrapper.element as HTMLElement
    const link = header.querySelector('a') as HTMLElement

    idle.focusIn()
    idle.focusOut({
      currentTarget: header,
      relatedTarget: link,
    } as unknown as FocusEvent)
    vi.advanceTimersByTime(10 * HEADER_IDLE_HIDE_MS)
    expect(idle.isHeld.value).toBe(true)
    expect(idle.isIdleHidden.value).toBe(false)

    idle.focusOut({
      currentTarget: header,
      relatedTarget: document.body,
    } as unknown as FocusEvent)
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS)
    expect(idle.isIdleHidden.value).toBe(true)
  })

  it('should drop the idle state when the window narrows below lg', async () => {
    const { idle, query } = await mountIdle()
    vi.advanceTimersByTime(HEADER_IDLE_HIDE_MS)

    query.set(false)
    await nextTick()

    expect(idle.isIdleHidden.value).toBe(false)
  })

  it('should stop listening and waiting once unmounted', async () => {
    const { idle, wrapper } = await mountIdle()
    const remove = vi.spyOn(window, 'removeEventListener')

    wrapper.unmount()
    vi.advanceTimersByTime(10 * HEADER_IDLE_HIDE_MS)

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(idle.isIdleHidden.value).toBe(false)
  })
})
