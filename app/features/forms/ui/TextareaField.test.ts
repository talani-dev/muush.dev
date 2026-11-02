import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextareaField from './TextareaField.vue'

describe('TextareaField', () => {
  it('should render the 96-tall box with its placeholder and emit what is typed', async () => {
    const wrapper = mount(TextareaField, {
      props: {
        id: 'need',
        label: '¿Qué necesitas?',
        modelValue: '',
        placeholder: 'Cuéntanos en un par de líneas qué quieres resolver.',
      },
    })
    const area = wrapper.find('textarea')

    expect(area.classes()).toEqual(
      expect.arrayContaining([
        'h-area-alto',
        'py-area-y',
        'md:py-area-y-escritorio',
      ])
    )
    expect(area.attributes('placeholder')).toContain('par de líneas')

    await area.setValue('Un sitio nuevo')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      'Un sitio nuevo',
    ])
  })

  it('should tie its help line when invalid', () => {
    const area = mount(TextareaField, {
      props: {
        id: 'need',
        label: 'x',
        modelValue: '',
        error: 'Cuéntanos qué necesitas.',
      },
    }).find('textarea')

    expect(area.attributes('aria-describedby')).toBe('need-error')
    expect(area.classes()).toContain('border-red-muush-500')
  })
})
