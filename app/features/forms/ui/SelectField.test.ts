import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SelectField from './SelectField.vue'

const options = [
  { value: 'company', label: 'Empresa' },
  { value: 'other', label: 'Otro' },
]

describe('SelectField', () => {
  it('should render a native select with a hidden, unpickable placeholder and the chevron', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        placeholder: 'Selecciona una opción',
        options,
      },
    })
    const placeholder = wrapper.find('option[value=""]')

    expect(wrapper.find('select').exists()).toBe(true)
    expect(placeholder.text()).toBe('Selecciona una opción')
    expect(placeholder.attributes('disabled')).toBeDefined()
    expect(placeholder.attributes('hidden')).toBeDefined()
    expect(wrapper.find('[aria-hidden="true"]').html()).toContain('<svg')
    expect(wrapper.find('select').classes()).toContain('md:text-gris-400')
  })

  it('should emit the picked value', async () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: 'x',
        modelValue: '',
        placeholder: 'x',
        options,
      },
    })

    await wrapper.find('select').setValue('other')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['other'])
  })

  it('should render optgroups when given groups', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'areaRole',
        label: 'Área y rol',
        modelValue: 'it:backend',
        placeholder: 'x',
        groups: [
          { label: 'IT', options: [{ value: 'it:backend', label: 'Backend' }] },
        ],
      },
    })

    expect(wrapper.find('optgroup').attributes('label')).toBe('IT')
    expect(wrapper.find('select').classes()).not.toContain('md:text-gris-400')
  })

  it('should be disabled while busy and red when invalid', () => {
    const select = mount(SelectField, {
      props: {
        id: 'identity',
        label: 'x',
        modelValue: '',
        placeholder: 'x',
        options,
        readonly: true,
        error: 'Elige una opción.',
      },
    }).find('select')

    expect(select.attributes('disabled')).toBeDefined()
    expect(select.attributes('aria-describedby')).toBe('identity-error')
    expect(select.classes()).toContain('border-red-muush-500')
  })
})
