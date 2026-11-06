import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import WhatsappField from './WhatsappField.vue'

const content = {
  whatsapp: { label: 'Número de WhatsApp' },
  whatsappCountry: {
    label: 'Lada del país',
    options: buildCountryOptions('es-MX'),
  },
}

describe('WhatsappField', () => {
  it('should render nothing when not visible', () => {
    const wrapper = mount(WhatsappField, {
      props: { visible: false, modelValue: '', country: 'MX', content },
    })

    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('should put the dial code and the labelled number on one row when visible', () => {
    const wrapper = mount(WhatsappField, {
      props: { visible: true, modelValue: '55', country: 'MX', content },
    })

    expect(wrapper.find('label[for="whatsapp"]').text()).toBe(
      'Número de WhatsApp'
    )
    const row = wrapper.find('#whatsapp').element.parentElement
    expect(row?.querySelector('#whatsappCountry')).not.toBeNull()
    expect(wrapper.find('#whatsapp').attributes('type')).toBe('tel')
  })

  it('should show the country error before the number error', () => {
    const wrapper = mount(WhatsappField, {
      props: {
        visible: true,
        modelValue: '',
        country: 'MX',
        content,
        errors: {
          country: 'Elige la lada de tu país.',
          number: 'Escribe tu número.',
        },
      },
    })
    const help = wrapper.findAll('p').map(line => line.attributes('id'))

    expect(help).toEqual(['whatsappCountry-error', 'whatsapp-error'])
    expect(wrapper.find('#whatsapp').attributes('aria-describedby')).toBe(
      'whatsapp-error'
    )
  })

  it('should time its transition with --medio and drop it under reduced motion', () => {
    /* `--medio` is zeroed under reduced motion in global.css too. */
    const source = readFileSync(
      join(
        process.cwd(),
        'app',
        'features',
        'forms',
        'ui',
        'WhatsappField.vue'
      ),
      'utf8'
    )

    expect(source).toMatch(/max-height var\(--medio\)/)
    expect(source).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.whatsapp-enter-active,\s*\.whatsapp-leave-active\s*\{\s*transition: none;/
    )
  })
})
