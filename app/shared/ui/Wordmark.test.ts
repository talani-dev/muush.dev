import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Wordmark from '@/shared/ui/Wordmark.vue'

/** Feature 43 · FR-036, contract § 1, pen extract-43 § 1. */
describe('Wordmark', () => {
  it('should read muush.dev when rendered', () => {
    expect(mount(Wordmark).text()).toBe('muush.dev')
  })

  it('should set Poppins at the wordmark size on one baseline when rendered', () => {
    const root = mount(Wordmark)

    expect(root.classes()).toEqual(
      expect.arrayContaining(['font-titulo', 'text-marca', 'items-baseline'])
    )
  })

  it('should give each run the designed weight and colour when rendered', () => {
    const [muush, dot, dev] = mount(Wordmark).findAll('span > span')

    expect(muush?.classes()).toEqual(['font-semibold', 'text-blanco'])
    expect(dot?.classes()).toEqual(['font-semibold', 'text-red-muush-500'])
    expect(dev?.classes()).toEqual(['font-normal', 'text-gris-400'])
  })

  it('should stay out of the accessibility tree when rendered', () => {
    expect(mount(Wordmark).attributes('aria-hidden')).toBe('true')
  })
})
