import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { DESKTOP_MEDIA_QUERY } from '@/shared/data/layout'
import { installMatchMedia } from '@/shared/logic/fakeMediaQuery.testing'
import CarouselIndicator from './CarouselIndicator.vue'
import { SERVICES_COPY } from './landingFixtures.testing'
import ServiceCard from './ServiceCard.vue'
import ServicesCarousel from './ServicesCarousel.vue'

/** Feature 44 · FR-015, FR-016, research R7; pen extract-44 § 3.3. */
let restore: () => void = () => undefined

function render(desktop = false) {
  restore = installMatchMedia({ [DESKTOP_MEDIA_QUERY]: desktop }).restore
  return mount(ServicesCarousel, {
    props: { cards: SERVICES_COPY.es.cards, labelledBy: 'servicios-titulo' },
  })
}

function define(element: Element, values: Record<string, number>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value })
  }
}

beforeEach(() => {
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callback(0)
    return 0
  })
})

afterEach(() => {
  restore()
  vi.restoreAllMocks()
})

describe('ServicesCarousel', () => {
  it('should list the four cards in a snapping scroller below lg when rendered', () => {
    const wrapper = render()
    const list = wrapper.find('ul')

    expect(wrapper.findAllComponents(ServiceCard)).toHaveLength(4)
    expect(list.attributes('aria-labelledby')).toBe('servicios-titulo')
    expect(list.attributes('tabindex')).toBe('0')
    expect(list.classes()).toEqual(
      expect.arrayContaining([
        'snap-x',
        'snap-mandatory',
        'overflow-x-auto',
        'scroll-pl-gutter',
        'gap-tarjetas-gap',
      ])
    )
    for (const item of wrapper.findAll('li')) {
      expect(item.classes()).toEqual(
        expect.arrayContaining(['w-tarjeta-movil', 'snap-start'])
      )
    }
  })

  it('should become a four-column grid with no indicator from lg when rendered', async () => {
    const wrapper = render(true)
    await nextTick()

    expect(wrapper.find('ul').classes()).toEqual(
      expect.arrayContaining(['lg:grid', 'lg:grid-cols-4', 'lg:items-start'])
    )
    expect(wrapper.find('ul').attributes('tabindex')).toBeUndefined()
    expect(wrapper.findComponent(CarouselIndicator).classes()).toContain(
      'lg:hidden'
    )
  })

  it('should move the indicator with the scroll when the carousel is swiped', async () => {
    const wrapper = render()
    const list = wrapper.find('ul').element
    define(list, { clientWidth: 390, scrollWidth: 1258, scrollLeft: 304 })
    ;[...list.children].forEach((card, index) => {
      define(card, { offsetLeft: 24 + index * 304, offsetWidth: 290 })
    })

    list.dispatchEvent(new Event('scroll'))
    await nextTick()

    expect(wrapper.findComponent(CarouselIndicator).props()).toEqual({
      count: 4,
      active: 1,
    })
  })
})
