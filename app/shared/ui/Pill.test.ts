import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pill from '@/shared/ui/Pill.vue'

/** Feature 42 · FR-011, contract § 2, pen extract § 2 (`XqFl6`). */
describe('Pill', () => {
  it('should render the caller-supplied label when given one', () => {
    const wrapper = mount(Pill, {
      props: { label: 'Estrategia tecnológica' },
    })

    expect(wrapper.text()).toBe('Estrategia tecnológica')
  })

  it('should render the default slot instead of the label when given one', () => {
    const wrapper = mount(Pill, {
      props: { label: 'Ignored' },
      slots: { default: '<span class="slotted">Technology strategy</span>' },
    })

    expect(wrapper.find('.slotted').text()).toBe('Technology strategy')
    expect(wrapper.text()).not.toContain('Ignored')
  })

  it('should hide the red dot from assistive technology when rendered', () => {
    const dot = mount(Pill, { props: { label: 'x' } }).find('[aria-hidden]')

    expect(dot.attributes('aria-hidden')).toBe('true')
  })

  it('should draw the dot as three concentric rings of 20, 14 and 7 when rendered', () => {
    const rings = mount(Pill, { props: { label: 'x' } })
      .find('[aria-hidden]')
      .findAll('span')

    expect(rings).toHaveLength(3)
    expect(rings[0]?.classes()).toEqual(
      expect.arrayContaining(['size-pill-punto', 'bg-punto-halo2'])
    )
    expect(rings[1]?.classes()).toEqual(
      expect.arrayContaining(['size-pill-halo', 'bg-punto-halo'])
    )
    expect(rings[2]?.classes()).toEqual(
      expect.arrayContaining(['size-pill-nucleo', 'bg-red-muush-500'])
    )
  })

  it('should carry the Kit capsule when rendered', () => {
    const wrapper = mount(Pill, { props: { label: 'x' } })

    expect(wrapper.element.tagName).toBe('DIV')
    for (const expected of [
      'inline-flex',
      'bg-pill-fondo',
      'rounded-pill',
      'backdrop-blur-pill',
      'borde-luz',
      'borde-linea',
      'gap-pill-gap',
      'py-pill-y',
      'ps-pill-inicio',
      'pe-pill-fin',
      'font-texto',
      'text-pill',
      'text-blanco',
    ]) {
      expect(wrapper.classes()).toContain(expected)
    }
  })
})
