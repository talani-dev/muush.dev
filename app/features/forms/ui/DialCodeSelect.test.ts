import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import DialCodeSelect from './DialCodeSelect.vue'

const options = buildCountryOptions('es-MX')

describe('DialCodeSelect', () => {
  it('should show the chosen flag and dial code on its face and name the select', () => {
    const wrapper = mount(DialCodeSelect, {
      props: {
        id: 'whatsappCountry',
        modelValue: 'MX',
        options,
        label: 'Lada del país',
      },
    })

    expect(wrapper.find('select').attributes('aria-label')).toBe(
      'Lada del país'
    )
    expect(wrapper.find('[aria-hidden="true"]').text()).toContain('+52')
  })

  it('should emit the picked country', async () => {
    const wrapper = mount(DialCodeSelect, {
      props: { id: 'whatsappCountry', modelValue: 'MX', options, label: 'x' },
    })

    await wrapper.find('select').setValue('CO')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['CO'])
  })

  it('should point at its error and turn its face red when invalid', () => {
    const wrapper = mount(DialCodeSelect, {
      props: {
        id: 'whatsappCountry',
        modelValue: 'MX',
        options,
        label: 'x',
        error: 'Elige la lada de tu país.',
        errorId: 'whatsappCountry-error',
      },
    })

    expect(wrapper.find('select').attributes('aria-describedby')).toBe(
      'whatsappCountry-error'
    )
    expect(wrapper.find('.cara').classes()).toContain('border-red-muush-500')
  })
})
