import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextField from './TextField.vue'

describe('TextField', () => {
  it('should render a labelled text input when mounted', () => {
    const wrapper = mount(TextField, {
      props: { id: 'name', label: 'Nombre', modelValue: '' },
    })

    expect(wrapper.find('label').text()).toBe('Nombre')
    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(wrapper.find('input').attributes('id')).toBe('name')
  })

  it('should emit update:modelValue when typed into', async () => {
    const wrapper = mount(TextField, {
      props: { id: 'name', label: 'Nombre', modelValue: '' },
    })

    await wrapper.find('input').setValue('Ana')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Ana'])
  })

  it('should show the error message and mark the control invalid when an error is given', () => {
    const wrapper = mount(TextField, {
      props: {
        id: 'email',
        label: 'Correo',
        modelValue: '',
        error: 'Correo inválido',
      },
    })

    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input').classes()).toContain('border-red-400')
    expect(wrapper.text()).toContain('Correo inválido')
  })

  it('should not clear the value when it holds an error', () => {
    const wrapper = mount(TextField, {
      props: {
        id: 'name',
        label: 'Nombre',
        modelValue: 'A',
        error: 'Muy corto',
      },
    })

    expect(wrapper.find('input').element.value).toBe('A')
  })
})
