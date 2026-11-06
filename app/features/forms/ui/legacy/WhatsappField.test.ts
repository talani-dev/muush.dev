import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import WhatsappField from './WhatsappField.vue'

/**
 * Shared by both forms since feature 029. `ContactForm.test.ts` and
 * `ApplicationForm.test.ts` each exercise it through the composed form; these
 * assertions cover the component in isolation, per Constitution Article X.
 */
const content = {
  whatsapp: { label: 'Número de WhatsApp' },
  whatsappCountry: {
    label: 'Lada del país',
    options: buildCountryOptions('es-MX'),
  },
}

function mountField(props: Record<string, unknown> = {}) {
  return mount(WhatsappField, {
    props: {
      visible: true,
      modelValue: '',
      country: 'MX',
      content,
      ...props,
    },
  })
}

describe('WhatsappField', () => {
  it('should render neither the selector nor the number when visible is false', () => {
    const wrapper = mountField({ visible: false })

    expect(wrapper.find('#whatsapp').exists()).toBe(false)
    expect(wrapper.find('#whatsappCountry').exists()).toBe(false)
  })

  it('should render the field with the given label when visible is true', () => {
    const wrapper = mountField()

    expect(wrapper.find('#whatsapp').exists()).toBe(true)
    expect(wrapper.text()).toContain('Número de WhatsApp')
    expect(wrapper.find('#whatsapp').attributes('type')).toBe('tel')
  })

  it('should place the selector before the number input when visible', () => {
    const wrapper = mountField()
    const controls = wrapper.findAll('select, input').map(node => node.element)

    expect(controls.map(node => node.id)).toEqual([
      'whatsappCountry',
      'whatsapp',
    ])
  })

  it('should keep the natural tab order when visible', () => {
    const wrapper = mountField()

    for (const id of ['#whatsappCountry', '#whatsapp']) {
      expect(wrapper.find(id).attributes('tabindex')).toBeUndefined()
    }
  })

  it('should emit update:modelValue when the number changes', async () => {
    const wrapper = mountField()

    await wrapper.find('#whatsapp').setValue('5639060739')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['5639060739'])
  })

  it('should emit update:country when another country is picked', async () => {
    const wrapper = mountField()

    await wrapper.find('#whatsappCountry').setValue('CO')

    expect(wrapper.emitted('update:country')?.[0]).toEqual(['CO'])
  })

  it('should render the country error before the number error when both are given', () => {
    const wrapper = mountField({
      errors: {
        number: 'Deben ser entre 6 y 14 dígitos',
        country: 'Elige la lada de tu país',
      },
    })
    const html = wrapper.html()

    expect(wrapper.find('#whatsappCountry-error').text()).toBe(
      'Elige la lada de tu país'
    )
    expect(wrapper.find('#whatsapp-error').text()).toBe(
      'Deben ser entre 6 y 14 dígitos'
    )
    expect(html.indexOf('whatsappCountry-error')).toBeLessThan(
      html.indexOf('id="whatsapp-error"')
    )
  })

  it('should render no country error when none is given', () => {
    const wrapper = mountField({ errors: { number: 'Escribe tu número' } })

    expect(wrapper.find('#whatsappCountry-error').exists()).toBe(false)
  })

  it('should make both controls read-only when readonly is true', () => {
    const wrapper = mountField({ modelValue: '5639060739', readonly: true })

    expect(wrapper.find('#whatsapp').attributes('readonly')).toBe('')
    expect(wrapper.find('#whatsappCountry').attributes('disabled')).toBe('')
  })
})
