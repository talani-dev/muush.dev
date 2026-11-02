import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Ref, ref } from 'vue'
import { useCarouselIndicator } from './useCarouselIndicator'

/**
 * Feature 44 · FR-016, research R7. happy-dom does no layout, so the
 * scroller's and cards' geometry is defined on the elements; frames run
 * synchronously.
 */
function geometry(element: HTMLElement, values: Record<string, number>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value })
  }
}

function mountHost() {
  let active: Readonly<Ref<number>> | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        const scroller = ref<HTMLElement | null>(null)
        active = useCarouselIndicator(scroller).activeIndex
        return () =>
          h(
            'ul',
            { ref: scroller },
            [0, 1, 2, 3].map(i => h('li', { key: i }))
          )
      },
    })
  )
  const list = wrapper.element as HTMLElement
  geometry(list, { clientWidth: 390, scrollWidth: 1258, scrollLeft: 0 })
  ;[...list.children].forEach((card, i) => {
    geometry(card as HTMLElement, {
      offsetLeft: 24 + i * 304,
      offsetWidth: 290,
    })
  })
  if (!active) throw new Error('composable did not run')
  return { wrapper, list, active }
}

function scrollTo(list: HTMLElement, left: number) {
  geometry(list, { scrollLeft: left })
  list.dispatchEvent(new Event('scroll'))
}

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callback(0)
    return 0
  })
})

afterEach(() => vi.restoreAllMocks())

describe('useCarouselIndicator', () => {
  it('should measure on mount before any scroll when mounted', () => {
    /* No layout yet at mount in happy-dom: 0 + 0 ≥ 0 − 4 reads as the end. */
    expect(mountHost().active.value).toBe(3)
  })

  it('should mark the first card when the carousel is at the start', () => {
    const { list, active } = mountHost()

    scrollTo(list, 0)

    expect(active.value).toBe(0)
  })

  it('should follow the scroll when the carousel moves', () => {
    const { list, active } = mountHost()

    scrollTo(list, 304)
    expect(active.value).toBe(1)
    scrollTo(list, 868)
    expect(active.value).toBe(3)
    scrollTo(list, 0)
    expect(active.value).toBe(0)
  })

  it('should stop listening when the host unmounts', () => {
    const { wrapper, list, active } = mountHost()
    scrollTo(list, 0)
    const remove = vi.spyOn(list, 'removeEventListener')

    wrapper.unmount()
    scrollTo(list, 304)

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(active.value).toBe(0)
  })
})
