import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SelectField from './SelectField.vue'

const options = [
  { value: 'company', label: 'Empresa' },
  { value: 'other', label: 'Otro' },
]

describe('SelectField', () => {
  it('should render the placeholder and every option when mounted', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        options,
        placeholder: '¿Cómo te identificas?',
      },
    })

    const optionEls = wrapper.findAll('option')
    expect(optionEls).toHaveLength(3)
    expect(optionEls[0]?.attributes('disabled')).toBe('')
  })

  it('should emit update:modelValue when a real option is chosen', async () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        options,
        placeholder: '¿Cómo te identificas?',
      },
    })

    await wrapper.find('select').setValue('other')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['other'])
  })

  it('should mark the control invalid when an error is given', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'identity',
        label: '¿Cómo te identificas?',
        modelValue: '',
        options,
        placeholder: '¿Cómo te identificas?',
        error: 'Elige una opción',
      },
    })

    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Elige una opción')
  })
})

/**
 * `groups` (plan.md D-4, data-model.md § 7) — additive to the flat `options`
 * shape above, which stays untouched: the test block above passes no
 * `groups` prop and still passes unmodified.
 */
describe('SelectField · groups', () => {
  const groups = [
    {
      label: 'IT',
      options: [{ value: 'it-placeholder', label: 'Rol por confirmar' }],
    },
    {
      label: 'Product',
      options: [{ value: 'product-placeholder', label: 'Rol por confirmar' }],
    },
  ]

  it('should render one optgroup per group with its nested options when groups is given', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'areaRole',
        label: 'Área y rol',
        modelValue: '',
        groups,
        placeholder: 'Área y rol',
      },
    })

    const optgroups = wrapper.findAll('optgroup')
    expect(optgroups).toHaveLength(2)
    expect(optgroups[0]?.attributes('label')).toBe('IT')
    expect(optgroups[0]?.findAll('option')).toHaveLength(1)
    expect(optgroups[1]?.attributes('label')).toBe('Product')
  })

  it('should render no flat option and no optgroup mixed together when groups is given', () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'areaRole',
        label: 'Área y rol',
        modelValue: '',
        groups,
        placeholder: 'Área y rol',
      },
    })

    /* Only the placeholder option plus the two groups' own options. */
    expect(wrapper.findAll('select > option')).toHaveLength(1)
  })

  it('should emit update:modelValue when a grouped option is chosen', async () => {
    const wrapper = mount(SelectField, {
      props: {
        id: 'areaRole',
        label: 'Área y rol',
        modelValue: '',
        groups,
        placeholder: 'Área y rol',
      },
    })

    await wrapper.find('select').setValue('product-placeholder')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      'product-placeholder',
    ])
  })
})
