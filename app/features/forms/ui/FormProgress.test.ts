import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormProgress from './FormProgress.vue'

describe('FormProgress', () => {
  it('should announce its label politely under the given id', () => {
    const wrapper = mount(FormProgress, {
      props: { id: 'p', label: 'Paso 1 de 2 · Tus datos', step: 1, total: 2 },
    })
    const label = wrapper.find('p')

    expect(label.attributes('id')).toBe('p')
    expect(label.attributes('aria-live')).toBe('polite')
    expect(label.text()).toBe('Paso 1 de 2 · Tus datos')
  })

  it.each([
    [1, ['bg-red-muush-500', 'bg-linea-fuerte']],
    [2, ['bg-red-muush-500', 'bg-red-muush-500']],
  ])(
    'should light the current and earlier segments on step %i',
    (step, fills) => {
      const wrapper = mount(FormProgress, {
        props: { id: 'p', label: 'x', step, total: 2 },
      })
      const segments = wrapper.findAll('[data-segmento]')

      expect(
        segments.map(segment =>
          segment.classes().find(name => name.startsWith('bg-'))
        )
      ).toEqual(fills)
      expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
    }
  )
})
