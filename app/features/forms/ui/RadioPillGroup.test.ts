import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RadioPillGroup from './RadioPillGroup.vue'

const options = [
  { value: 'email', label: 'Correo' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

describe('RadioPillGroup', () => {
  it('should render one radio input per option when mounted', () => {
    const wrapper = mount(RadioPillGroup, {
      props: {
        id: 'contactPreference',
        label: '¿Cómo prefieres que te contactemos?',
        modelValue: 'email',
        options,
      },
    })

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    const first = radios[0]
    const second = radios[1]
    expect(first && (first.element as HTMLInputElement).checked).toBe(true)
    expect(second && (second.element as HTMLInputElement).checked).toBe(false)
  })

  it('should emit update:modelValue when a different pill is chosen', async () => {
    const wrapper = mount(RadioPillGroup, {
      props: {
        id: 'contactPreference',
        label: '¿Cómo prefieres que te contactemos?',
        modelValue: 'email',
        options,
      },
    })

    await wrapper.findAll('input[type="radio"]')[1]?.setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['whatsapp'])
  })
})
