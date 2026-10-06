import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import WhatsappField from './WhatsappField.vue'

/**
 * Shared by both forms since feature 029. `ContactForm.test.ts` and
 * `ApplicationForm.test.ts` each exercise it through the composed form; these
 * assertions cover the component in isolation, per Constitution Article X.
 */
describe('WhatsappField', () => {
  it('should render no field when visible is false', () => {
    const wrapper = mount(WhatsappField, {
      props: { visible: false, modelValue: '', label: 'Número de WhatsApp' },
    })

    expect(wrapper.find('#whatsapp').exists()).toBe(false)
  })

  it('should render the field with the given label when visible is true', () => {
    const wrapper = mount(WhatsappField, {
      props: { visible: true, modelValue: '', label: 'Número de WhatsApp' },
    })

    expect(wrapper.find('#whatsapp').exists()).toBe(true)
    expect(wrapper.text()).toContain('Número de WhatsApp')
    expect(wrapper.find('#whatsapp').attributes('type')).toBe('tel')
  })

  it('should emit update:modelValue when the field changes', async () => {
    const wrapper = mount(WhatsappField, {
      props: { visible: true, modelValue: '', label: 'Número de WhatsApp' },
    })

    await wrapper.find('#whatsapp').setValue('5639060739')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['5639060739'])
  })

  it('should render the error message and readonly state it is given', () => {
    const wrapper = mount(WhatsappField, {
      props: {
        visible: true,
        modelValue: '5639060739',
        label: 'Número de WhatsApp',
        error: 'Deben ser 10 dígitos',
        readonly: true,
      },
    })

    expect(wrapper.text()).toContain('Deben ser 10 dígitos')
    expect(wrapper.find('#whatsapp').attributes('readonly')).toBe('')
  })
})
