import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { HONEYPOT_FIELD_NAME } from '@/features/forms/data/submissionContract'
import HoneypotField from './HoneypotField.vue'

describe('HoneypotField', () => {
  it('should render a text input with the honeypot name, out of the Tab order and autofill', () => {
    const input = mount(HoneypotField, { props: { modelValue: '' } }).find(
      'input'
    )

    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('name')).toBe(HONEYPOT_FIELD_NAME)
    expect(input.attributes('tabindex')).toBe('-1')
    expect(input.attributes('autocomplete')).toBe('off')
  })

  it('should be hidden from sight and from the accessibility tree', () => {
    const wrapper = mount(HoneypotField, { props: { modelValue: '' } })
    const root = wrapper.find('div')

    expect(root.attributes('aria-hidden')).toBe('true')
    expect(root.classes()).toContain('sr-only')
    expect(wrapper.find('label').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('should emit what a bot types into it', async () => {
    const wrapper = mount(HoneypotField, { props: { modelValue: '' } })

    await wrapper.find('input').setValue('https://spam.example')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      'https://spam.example',
    ])
  })
})
