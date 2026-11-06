import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChoiceButton from './ChoiceButton.vue'

describe('ChoiceButton', () => {
  it('should emit choose when clicked', async () => {
    const wrapper = mount(ChoiceButton, { props: { label: 'Aceptar todo' } })

    await wrapper.trigger('click')

    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.text()).toBe('Aceptar todo')
    expect(wrapper.emitted('choose')).toHaveLength(1)
  })

  it('should draw the Carbón 800 pill with the Blanco 20 % stroke', () => {
    expect(mount(ChoiceButton, { props: { label: 'x' } }).classes()).toEqual(
      expect.arrayContaining([
        'bg-carbon-800',
        'rounded-pill',
        'inset-ring-linea-fuerte',
        'py-cookies-boton-y',
        'px-cookies-boton-x',
      ])
    )
  })
})
