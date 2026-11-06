import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { APPLICATION_FORM_COPY } from './formsFixtures.testing'
import SendNotice from './SendNotice.vue'

const { error, cvUploadError } = APPLICATION_FORM_COPY.es

describe('SendNotice', () => {
  it('should say the send failed with its support link when kind is server-error', () => {
    const wrapper = mount(SendNotice, {
      props: { kind: 'server-error', error },
    })

    expect(wrapper.text()).toContain(error.before)
    expect(wrapper.find('a').attributes('href')).toBe(
      'mailto:support@muush.dev'
    )
    expect(wrapper.find('a').text()).toBe('support@muush.dev')
  })

  it('should offer Enviar sin CV when kind is cv-upload-error', async () => {
    const wrapper = mount(SendNotice, {
      props: { kind: 'cv-upload-error', error, cvUploadError },
    })

    expect(wrapper.text()).toContain(cvUploadError.message)
    const action = wrapper.find('button')
    expect(action.attributes('type')).toBe('button')
    await action.trigger('click')
    expect(wrapper.emitted('submit-without-cv')).toHaveLength(1)
  })
})
