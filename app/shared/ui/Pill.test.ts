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

  it('should draw one 7 px dot centred in its 20 px footprint, with no static rings, when rendered', () => {
    /* Pen extract-44 § 9 (Roberto 2026-11-01): the drawn halos are the radar
       ping, so at rest only the dot is painted. */
    const footprint = mount(Pill, { props: { label: 'x' } }).find(
      '[data-punto]'
    )
    const dots = footprint.findAll('span')

    expect(footprint.classes()).toEqual(
      expect.arrayContaining(['size-pill-punto', 'grid', 'place-items-center'])
    )
    expect(dots).toHaveLength(1)
    expect(dots[0]?.classes()).toEqual(
      expect.arrayContaining([
        'size-pill-nucleo',
        'bg-red-muush-500',
        'relative',
      ])
    )
  })

  it('should ping the dot like a radar when rendered', () => {
    const dot = mount(Pill, { props: { label: 'x' } }).find(
      '[data-punto] > span'
    )

    expect(dot.classes()).toContain('pulso')
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
