import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'
import NameEmailRow from './NameEmailRow.vue'

const content = CONTACT_FORM_COPY.es.fields

describe('NameEmailRow', () => {
  it('should render Nombre then Correo, side by side once the form is 32rem wide', () => {
    const wrapper = mount(NameEmailRow, {
      props: { name: '', email: '', content, errors: {} },
    })

    expect(wrapper.classes()).toContain('@lg:grid-cols-2')
    expect(
      wrapper.findAll('input').map(input => input.attributes('id'))
    ).toEqual(['name', 'email'])
    expect(wrapper.find('#email').attributes('type')).toBe('email')
    expect(wrapper.find('#name').attributes('placeholder')).toBe(
      'Nombre y apellido'
    )
  })

  it('should emit each field on its own channel and show each error', async () => {
    const wrapper = mount(NameEmailRow, {
      props: {
        name: '',
        email: '',
        content,
        errors: { email: 'Escribe un correo como nombre@empresa.com' },
      },
    })

    await wrapper.find('#name').setValue('Ana')
    await wrapper.find('#email').setValue('ana@muush.dev')

    expect(wrapper.emitted('update:name')?.[0]).toEqual(['Ana'])
    expect(wrapper.emitted('update:email')?.[0]).toEqual(['ana@muush.dev'])
    expect(wrapper.find('#email-error').exists()).toBe(true)
    expect(wrapper.find('#name-error').exists()).toBe(false)
  })
})
