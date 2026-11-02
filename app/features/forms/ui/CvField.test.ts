import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CvField from './CvField.vue'

const props = {
  id: 'cv',
  label: 'CV',
  placeholder: 'Adjunta tu CV en PDF · máximo 5 MB',
  modelValue: null,
}

function file(size: number, type = 'application/pdf'): File {
  const chosen = new File(['%PDF'], 'ana.pdf', { type })
  Object.defineProperty(chosen, 'size', { value: size })
  return chosen
}

async function choose(wrapper: VueWrapper, chosen: File | null): Promise<void> {
  const input = wrapper.find('input')
  Object.defineProperty(input.element, 'files', {
    value: chosen ? [chosen] : [],
    configurable: true,
  })
  await input.trigger('change')
}

describe('CvField', () => {
  it('should render the 96-tall box with the placeholder around a hidden PDF-only input', () => {
    const wrapper = mount(CvField, { props })
    const box = wrapper.find('label.caja')

    expect(box.text()).toBe(props.placeholder)
    expect(box.classes()).toEqual(
      expect.arrayContaining([
        'h-area-alto',
        'text-texto-tenue',
        'md:text-gris-400',
      ])
    )
    const input = box.find('input')
    expect(input.attributes('type')).toBe('file')
    expect(input.attributes('accept')).toBe('application/pdf')
    expect(input.classes()).toContain('sr-only')
  })

  it('should show the chosen file name in Blanco', () => {
    const wrapper = mount(CvField, {
      props: { ...props, modelValue: file(10) },
    })

    expect(wrapper.find('label.caja').text()).toBe('ana.pdf')
    expect(wrapper.find('label.caja').classes()).toContain('text-blanco')
  })

  it('should emit an accepted PDF', async () => {
    const wrapper = mount(CvField, { props })
    const chosen = file(5_242_880)

    await choose(wrapper, chosen)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([chosen])
    expect(wrapper.emitted('reject')).toBeUndefined()
  })

  it.each([
    ['format', file(10, 'text/plain')],
    ['size', file(5_242_881)],
  ])('should reject for %s and keep nothing', async (kind, chosen) => {
    const wrapper = mount(CvField, { props })

    await choose(wrapper, chosen)

    expect(wrapper.emitted('reject')?.[0]).toEqual([kind])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should emit null when the selection is cleared', async () => {
    const wrapper = mount(CvField, { props })

    await choose(wrapper, null)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
  })
})
