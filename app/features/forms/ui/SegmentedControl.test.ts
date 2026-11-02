import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SegmentedControl from './SegmentedControl.vue'

const props = {
  id: 'contactPreference',
  label: '¿Cómo prefieres que te contactemos?',
  modelValue: 'email',
  options: [
    { value: 'email', label: 'Correo' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ],
}

describe('SegmentedControl', () => {
  it('should be a radio group named by its visible label with one checked native radio', () => {
    const wrapper = mount(SegmentedControl, { props, attachTo: document.body })
    const group = wrapper.find('[role="radiogroup"]')

    expect(
      document.getElementById(group.attributes('aria-labelledby') ?? '')
        ?.textContent
    ).toBe(props.label)
    const radios = wrapper.findAll('input[type="radio"]')
    expect(
      radios.map(radio => (radio.element as HTMLInputElement).checked)
    ).toEqual([true, false])
    expect(
      radios.every(radio => radio.attributes('name') === 'contactPreference')
    ).toBe(true)
    wrapper.unmount()
  })

  it('should draw the red dot on the selected option only, from md', () => {
    const wrapper = mount(SegmentedControl, { props })
    const dots = wrapper.findAll('[data-punto]')

    expect(dots).toHaveLength(1)
    expect(dots[0]?.classes()).toEqual(
      expect.arrayContaining(['hidden', 'md:block'])
    )
    expect(wrapper.findAll('label')[0]?.classes()).toContain('md:bg-carbon-700')
  })

  it('should emit the chosen value when a radio changes', async () => {
    const wrapper = mount(SegmentedControl, { props })

    await wrapper.findAll('input[type="radio"]')[1]?.setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['whatsapp'])
  })

  it('should disable the radios while busy', () => {
    const wrapper = mount(SegmentedControl, {
      props: { ...props, readonly: true },
    })

    expect(wrapper.findAll('input[disabled]')).toHaveLength(2)
  })
})
