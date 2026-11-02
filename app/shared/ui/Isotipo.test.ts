import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Isotipo from '@/shared/ui/Isotipo.vue'

/**
 * Feature 43 · FR-036, contract § 1. The geometry must stay the brand
 * logo's (Roberto, 2026-11-01): same viewBox, circle, path and stroke 12.
 */
describe('Isotipo', () => {
  it('should keep the brand logo geometry when rendered', () => {
    const svg = mount(Isotipo).find('svg')
    const circle = svg.find('circle')
    const path = svg.find('path')

    expect(svg.attributes('viewBox')).toBe('14.5 38.5 70.5 39.5')
    expect(circle.attributes()).toMatchObject({ cx: '21', cy: '45', r: '6.5' })
    expect(path.attributes('d')).toBe(
      'M21 72a17 17 0 0 1 34 0 12 12 0 0 1 24 0'
    )
    expect(path.attributes('stroke-width')).toBe('12')
    expect(path.attributes('stroke-linecap')).toBe('round')
  })

  it('should draw the stroke in currentColor and the dot in Red muush 500 when rendered', () => {
    const svg = mount(Isotipo).find('svg')

    expect(svg.find('path').attributes('stroke')).toBe('currentColor')
    expect(svg.find('circle').classes()).toContain('fill-red-muush-500')
  })

  it('should be hidden from assistive technology when rendered', () => {
    expect(mount(Isotipo).find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('should size itself by the isotipo token when rendered', () => {
    expect(mount(Isotipo).find('svg').classes()).toContain('w-isotipo-ancho')
  })
})
