import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CarouselIndicator from './CarouselIndicator.vue'

/** Feature 44 · FR-016; pen extract-44 § 3.3. */
describe('CarouselIndicator', () => {
  it('should draw one hidden mark per card when rendered', () => {
    const wrapper = mount(CarouselIndicator, { props: { count: 4, active: 0 } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('span')).toHaveLength(4)
  })

  it('should stretch the active mark into a red pill when a card is active', () => {
    const marks = mount(CarouselIndicator, {
      props: { count: 4, active: 2 },
    }).findAll('span')

    expect(marks[2]?.classes()).toEqual(
      expect.arrayContaining(['w-indicador-activo', 'bg-red-muush-500'])
    )
    expect(marks[2]?.attributes('data-activo')).toBe('true')
    for (const index of [0, 1, 3]) {
      expect(marks[index]?.classes()).toEqual(
        expect.arrayContaining(['w-indicador-punto', 'bg-blanco-25'])
      )
    }
  })
})
