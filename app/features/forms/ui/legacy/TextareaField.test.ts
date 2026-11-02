import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextareaField from './TextareaField.vue'

describe('TextareaField', () => {
  it('should render a labelled textarea when mounted', () => {
    const wrapper = mount(TextareaField, {
      props: { id: 'need', label: '¿Qué necesitas?', modelValue: '' },
    })

    expect(wrapper.find('label').text()).toBe('¿Qué necesitas?')
    expect(wrapper.find('textarea').attributes('id')).toBe('need')
  })

  it('should emit update:modelValue when typed into', async () => {
    const wrapper = mount(TextareaField, {
      props: { id: 'need', label: '¿Qué necesitas?', modelValue: '' },
    })

    await wrapper.find('textarea').setValue('Un rediseño completo.')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      'Un rediseño completo.',
    ])
  })

  it('should show the error message when an error is given', () => {
    const wrapper = mount(TextareaField, {
      props: {
        id: 'need',
        label: '¿Qué necesitas?',
        modelValue: 'corto',
        error: 'Cuéntanos un poco más',
      },
    })

    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('textarea').element.value).toBe('corto')
    expect(wrapper.text()).toContain('Cuéntanos un poco más')
  })
})
