import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LegalIndex from './LegalIndex.vue'

const sections = [
  { id: 'a', nav: 'Primera' },
  { id: 'b', nav: 'Segunda' },
]

describe('LegalIndex', () => {
  it('should link every section by its anchor under a labelled nav', () => {
    const wrapper = mount(LegalIndex, {
      props: { label: 'En esta página', sections, activeId: 'a' },
    })

    expect(wrapper.find('nav').attributes('aria-label')).toBe('En esta página')
    expect(wrapper.findAll('a').map(link => link.attributes('href'))).toEqual([
      '#a',
      '#b',
    ])
  })

  it('should mark only the active entry with the dot and Blanco', () => {
    const wrapper = mount(LegalIndex, {
      props: { label: 'En esta página', sections, activeId: 'b' },
    })
    const [first, second] = wrapper.findAll('a')

    expect(second?.attributes('aria-current')).toBe('location')
    expect(second?.classes()).toContain('text-blanco')
    expect(second?.find('.bg-red-muush-500').exists()).toBe(true)
    expect(first?.attributes('aria-current')).toBeUndefined()
    expect(first?.classes()).toContain('text-gris-400')
  })
})
