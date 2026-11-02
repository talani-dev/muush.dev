import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormPanel from './FormPanel.vue'

describe('FormPanel', () => {
  it('should be the mobile glass below md and the panel preset from md', () => {
    const wrapper = mount(FormPanel, { slots: { default: '<p>form</p>' } })

    expect(wrapper.text()).toBe('form')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'bg-vidrio-fondo',
        'backdrop-blur-vidrio',
        'rounded-tarjeta',
        'p-panel-movil',
        'borde-linea',
        'md:rounded-panel',
        'md:p-panel',
        'md:borde-panel',
        'md:shadow-vidrio',
        'max-w-panel-form',
      ])
    )
  })
})
