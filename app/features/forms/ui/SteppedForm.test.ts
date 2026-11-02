import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CONTACT_FORM_COPY } from './formsFixtures.testing'
import SteppedForm from './SteppedForm.vue'

const content = CONTACT_FORM_COPY.es
const slots = {
  details: '<input id="name">',
  profile: '<input id="company">',
  channel: '<input id="contactPreference">',
}
const base = {
  chrome: content,
  isStepped: false,
  step: 1 as const,
  accepted: false,
  honeypot: '',
  submitLabel: content.submit,
  busy: false,
}

const order = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll('input')
    .map(input => input.attributes('id') ?? input.attributes('name'))

describe('SteppedForm', () => {
  it('should place the channel after the profile and show no step chrome in the single view', () => {
    const wrapper = mount(SteppedForm, { props: base, slots })

    expect(order(wrapper)).toEqual([
      'name',
      'company',
      'contactPreference',
      'privacy',
      'muush_website',
    ])
    expect(wrapper.find('[role="group"]').exists()).toBe(false)
    expect(wrapper.find('[aria-live]').exists()).toBe(false)
  })

  it('should place the channel in step 1 and name both groups by the progress when stepped', () => {
    const wrapper = mount(SteppedForm, {
      props: { ...base, isStepped: true },
      slots,
    })

    expect(order(wrapper)).toEqual([
      'name',
      'contactPreference',
      'company',
      'privacy',
      'muush_website',
    ])
    const groups = wrapper.findAll('[role="group"]')
    expect(groups).toHaveLength(2)
    expect(groups[0]?.attributes('aria-labelledby')).toBe(
      wrapper.find('[aria-live]').attributes('id')
    )
  })

  it('should continue instead of submitting when step 1 is submitted', async () => {
    const wrapper = mount(SteppedForm, {
      props: { ...base, isStepped: true },
      slots,
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('continue')).toHaveLength(1)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('should emit back from step 2', async () => {
    const wrapper = mount(SteppedForm, {
      props: { ...base, isStepped: true, step: 2 },
      slots,
    })

    const back = wrapper
      .findAll('button[type="button"]')
      .find(button => button.text() === content.back)
    await back?.trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('should disable the submit and the box while busy', () => {
    const wrapper = mount(SteppedForm, {
      props: { ...base, accepted: true, busy: true },
      slots,
    })

    expect(
      wrapper.find('button[type="submit"]').attributes('disabled')
    ).toBeDefined()
    expect(
      wrapper.find('button[type="submit"]').attributes('aria-disabled')
    ).toBeUndefined()
    expect(wrapper.find('#privacy').attributes('disabled')).toBeDefined()
    expect(wrapper.find('form').attributes('aria-busy')).toBe('true')
  })

  it('should render the confirmation instead of the form and keep the Turnstile host', () => {
    const wrapper = mount(SteppedForm, {
      props: { ...base, success: content.success },
      slots,
    })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(
      (wrapper.vm as unknown as { challengeHost: HTMLElement }).challengeHost
    ).toBeInstanceOf(HTMLElement)
  })

  it('should emit engage on the first focus inside the form', async () => {
    const wrapper = mount(SteppedForm, { props: base, slots })

    await wrapper.find('#name').trigger('focusin')

    expect(wrapper.emitted('engage')).toHaveLength(1)
  })
})
