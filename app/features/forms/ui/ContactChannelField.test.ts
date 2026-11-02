import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ContactChannelField from './ContactChannelField.vue'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'

const content = CONTACT_FORM_COPY.es.fields

describe('ContactChannelField', () => {
  it('should show only the segmented choice when Correo is chosen', () => {
    const wrapper = mount(ContactChannelField, {
      props: { preference: 'email', country: 'MX', number: '', content },
    })

    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
    expect(wrapper.find('#whatsapp').exists()).toBe(false)
  })

  it('should add the WhatsApp row when WhatsApp is chosen', () => {
    const wrapper = mount(ContactChannelField, {
      props: { preference: 'whatsapp', country: 'MX', number: '55', content },
    })

    expect(wrapper.find('#whatsapp').exists()).toBe(true)
    expect(wrapper.find('#whatsappCountry').exists()).toBe(true)
  })

  it('should re-emit the preference, the country and the number', async () => {
    const wrapper = mount(ContactChannelField, {
      props: { preference: 'whatsapp', country: 'MX', number: '', content },
    })

    await wrapper.find('input[value="email"]').setValue(true)
    await wrapper.find('#whatsappCountry').setValue('CO')
    await wrapper.find('#whatsapp').setValue('5512345678')

    expect(wrapper.emitted('update:preference')?.[0]).toEqual(['email'])
    expect(wrapper.emitted('update:country')?.[0]).toEqual(['CO'])
    expect(wrapper.emitted('update:number')?.[0]).toEqual(['5512345678'])
  })
})
