import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldBlock from './FieldBlock.vue'

describe('FieldBlock', () => {
  it('should tie its label to the control id and render the slot', () => {
    const wrapper = mount(FieldBlock, {
      props: { id: 'name', label: 'Nombre' },
      slots: { default: '<input id="name">' },
    })

    expect(wrapper.find('label').attributes('for')).toBe('name')
    expect(wrapper.find('label').text()).toBe('Nombre')
    expect(wrapper.find('input#name').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('should render the help line with the id the control describes itself by when given an error', () => {
    const wrapper = mount(FieldBlock, {
      props: { id: 'name', label: 'Nombre', error: 'Escribe tu nombre.' },
    })

    const help = wrapper.find('#name-error')
    expect(help.text()).toBe('Escribe tu nombre.')
    expect(help.classes()).toContain('text-red-muush-500')
  })

  it('should swap the label to the desktop anatomy from md', () => {
    const label = mount(FieldBlock, {
      props: { id: 'x', label: 'X' },
    }).find('label')

    expect(label.classes()).toEqual(
      expect.arrayContaining([
        'text-etiqueta-campo',
        'md:text-etiqueta-campo-escritorio',
        'text-gris-400',
      ])
    )
  })
})
