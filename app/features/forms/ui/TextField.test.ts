import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TextField from './TextField.vue'

const base = { id: 'email', label: 'Correo', modelValue: '' }

describe('TextField', () => {
  it('should render the v2 control with its placeholder and emit what is typed', async () => {
    const wrapper = mount(TextField, {
      props: { ...base, type: 'email', placeholder: 'tu@correo.com' },
    })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('placeholder')).toBe('tu@correo.com')
    expect(input.classes()).toEqual(
      expect.arrayContaining([
        'h-campo-alto',
        'md:h-campo-alto-escritorio',
        'bg-carbon-800',
        'border-transparent',
        'md:border-blanco-10',
      ])
    )

    await input.setValue('ana@muush.dev')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['ana@muush.dev'])
  })

  it('should take the red stroke and describe itself by its help line when invalid', () => {
    const input = mount(TextField, {
      props: { ...base, error: 'Escribe un correo como nombre@empresa.com' },
    }).find('input')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('email-error')
    expect(input.classes()).toContain('border-red-muush-500')
    expect(input.classes()).not.toContain('md:border-blanco-10')
  })

  it('should be read-only while the form is busy', () => {
    const input = mount(TextField, {
      props: { ...base, readonly: true },
    }).find('input')

    expect(input.attributes('readonly')).toBeDefined()
  })
})
