import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { buildCountryOptions } from '@/features/forms/logic/countryOptions'
import DialCodeSelect from './DialCodeSelect.vue'

const options = buildCountryOptions('es-MX')

function mountSelect(props: Record<string, unknown> = {}) {
  return mount(DialCodeSelect, {
    props: {
      id: 'whatsappCountry',
      modelValue: 'MX',
      options,
      label: 'Lada del país',
      errorId: 'whatsappCountry-error',
      ...props,
    },
  })
}

describe('DialCodeSelect', () => {
  it('should render one option per country with flag, name and dial code when mounted', () => {
    const wrapper = mountSelect()
    const rendered = wrapper.findAll('option')

    expect(rendered).toHaveLength(options.length)
    const colombia = rendered.find(node => node.attributes('value') === 'CO')
    expect(colombia?.text()).toBe('🇨🇴 Colombia (+57)')
  })

  it('should show the selected flag and dial code on the face when mounted', () => {
    const wrapper = mountSelect({ modelValue: 'CO' })

    expect(wrapper.find('[aria-hidden="true"]').text()).toContain('🇨🇴 +57')
  })

  it('should update the face when modelValue changes', async () => {
    const wrapper = mountSelect()

    await wrapper.setProps({ modelValue: 'ES' })

    expect(wrapper.find('[aria-hidden="true"]').text()).toContain('🇪🇸 +34')
  })

  it('should emit update:modelValue with the country code when changed', async () => {
    const wrapper = mountSelect()

    await wrapper.find('select').setValue('CO')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['CO'])
  })

  it('should expose the label as the accessible name when mounted', () => {
    const wrapper = mountSelect()

    expect(wrapper.find('select').attributes('aria-label')).toBe(
      'Lada del país'
    )
    expect(wrapper.find('select').attributes('id')).toBe('whatsappCountry')
  })

  it('should hide the face from assistive technology when mounted', () => {
    const wrapper = mountSelect()
    const face = wrapper.find('[aria-hidden="true"]')

    expect(face.exists()).toBe(true)
    expect(face.find('select').exists()).toBe(false)
  })

  it('should mark the select invalid and point to its message when an error is given', () => {
    const wrapper = mountSelect({ error: 'Elige la lada de tu país' })
    const select = wrapper.find('select')

    expect(select.attributes('aria-invalid')).toBe('true')
    expect(select.attributes('aria-describedby')).toBe('whatsappCountry-error')
    expect(wrapper.find('[aria-hidden="true"]').classes()).toContain(
      'border-red-400'
    )
  })

  it('should not describe the select when there is no error', () => {
    const select = mountSelect().find('select')

    expect(select.attributes('aria-invalid')).toBe('false')
    expect(select.attributes('aria-describedby')).toBeUndefined()
  })

  it('should disable the select when readonly', () => {
    const wrapper = mountSelect({ readonly: true })

    expect(wrapper.find('select').attributes('disabled')).toBe('')
  })

  it('should place the face right after the select so it can draw the focus ring when mounted', () => {
    const select = mountSelect().find('select').element

    expect(select.classList).toContain('dial-select')
    expect(select.nextElementSibling?.classList).toContain('dial-face')
  })
})
