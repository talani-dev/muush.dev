import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsentCheckbox from './ConsentCheckbox.vue'

const label =
  'Acepto el aviso de privacidad y que muush me contacte sobre mi diagnóstico.'

describe('ConsentCheckbox', () => {
  it('should render an unticked native checkbox tied to its label', () => {
    const wrapper = mount(ConsentCheckbox, {
      props: { id: 'privacy', label, modelValue: false },
    })
    const box = wrapper.find('input')

    expect(box.attributes('type')).toBe('checkbox')
    expect((box.element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.find('label').attributes('for')).toBe('privacy')
    expect(wrapper.find('label').text()).toBe(label)
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('should draw the .pen box: 18, radius 5, Blanco 40 % on mobile and 25 % from md', () => {
    const box = mount(ConsentCheckbox, {
      props: { id: 'privacy', label, modelValue: false },
    }).find('input')

    expect(box.classes()).toEqual(
      expect.arrayContaining([
        'size-check',
        'rounded-check',
        'border-texto-tenue',
        'md:border-blanco-25',
        'checked:bg-red-muush-500',
      ])
    )
  })

  it('should emit the new state when toggled', async () => {
    const wrapper = mount(ConsentCheckbox, {
      props: { id: 'privacy', label, modelValue: false },
    })

    await wrapper.find('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
})
