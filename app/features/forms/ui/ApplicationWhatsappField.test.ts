import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ApplicationWhatsappField from './ApplicationWhatsappField.vue'

/**
 * Extracted from `ApplicationForm.vue` (round 2 review fix, Article V's
 * 200-line limit). `ApplicationForm.test.ts`'s own "WhatsApp field" describe
 * block already exercises this through the composed form; these assertions
 * cover the component in isolation, per Constitution Article X.
 */
describe('ApplicationWhatsappField', () => {
  it('should render no field when visible is false', () => {
    const wrapper = mount(ApplicationWhatsappField, {
      props: { visible: false, modelValue: '', label: 'Número de WhatsApp' },
    })

    expect(wrapper.find('#whatsapp').exists()).toBe(false)
  })

  it('should render the field with the given label when visible is true', () => {
    const wrapper = mount(ApplicationWhatsappField, {
      props: { visible: true, modelValue: '', label: 'Número de WhatsApp' },
    })

    expect(wrapper.find('#whatsapp').exists()).toBe(true)
    expect(wrapper.text()).toContain('Número de WhatsApp')
    expect(wrapper.find('#whatsapp').attributes('type')).toBe('tel')
  })

  it('should emit update:modelValue when the field changes', async () => {
    const wrapper = mount(ApplicationWhatsappField, {
      props: { visible: true, modelValue: '', label: 'Número de WhatsApp' },
    })

    await wrapper.find('#whatsapp').setValue('5639060739')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['5639060739'])
  })

  it('should render the error message and readonly state it is given', () => {
    const wrapper = mount(ApplicationWhatsappField, {
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
