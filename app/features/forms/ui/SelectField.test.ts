import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SelectField from './SelectField.vue'

const options = [
  { value: 'company', label: 'Empresa' },
  { value: 'other', label: 'Otro' },
]

describe('SelectField', () => {
  it('should render the placeholder and every option when mounted', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        options,
        placeholder: '¿Cómo te identificas?',
      },
    })

    const optionEls = wrapper.findAll('option')
    expect(optionEls).toHaveLength(3)
    expect(optionEls[0]?.attributes('disabled')).toBe('')
  })

  it('should emit update:modelValue when a real option is chosen', async () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        options,
        placeholder: '¿Cómo te identificas?',
      },
    })

    await wrapper.find('select').setValue('other')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['other'])
  })

  it('should mark the control invalid when an error is given', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        options,
        placeholder: '¿Cómo te identificas?',
        error: 'Elige una opción',
      },
    })

    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Elige una opción')
  })
})
