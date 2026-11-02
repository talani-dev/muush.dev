import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormNotice from './FormNotice.vue'

describe('FormNotice', () => {
  it('should be an alert with the red fill, the flat red edge and a decorative dot', () => {
    const wrapper = mount(FormNotice, {
      slots: { default: 'El envío se interrumpió.' },
    })
    const root = wrapper.find('[role="alert"]')

    expect(root.text()).toBe('El envío se interrumpió.')
    expect(root.classes()).toEqual(
      expect.arrayContaining([
        'bg-rojo-12',
        'borde-luz',
        'borde-aviso',
        'rounded-aviso',
      ])
    )
    const dot = wrapper.find('[aria-hidden="true"] span')
    expect(dot.classes()).toEqual(
      expect.arrayContaining(['size-aviso-punto', 'bg-red-muush-500'])
    )
  })

  it('should swap padding, gap and text to the desktop values from md', () => {
    const root = mount(FormNotice).find('[role="alert"]')

    expect(root.classes()).toEqual(
      expect.arrayContaining([
        'px-aviso-x',
        'md:px-aviso-x-escritorio',
        'text-aviso',
        'md:text-aviso-escritorio',
      ])
    )
  })
})
