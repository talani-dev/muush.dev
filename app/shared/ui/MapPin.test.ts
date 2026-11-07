import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MapPin from '@/shared/ui/MapPin.vue'

/** Feature 44 · FR-009, Clarifications Q4; pen extract-44 § 2.1, § 8. */
function render(kind: 'team' | 'partner' | 'soon') {
  return mount(MapPin, { props: { kind, leftPercent: 24, topPercent: 54 } })
}

describe('MapPin', () => {
  it('should centre a 28 px decorative marker on its point when rendered', () => {
    const pin = render('team')

    expect(pin.attributes('aria-hidden')).toBe('true')
    expect(pin.attributes('style')).toContain('left: 24%')
    expect(pin.attributes('style')).toContain('top: 54%')
    expect(pin.classes()).toEqual(
      expect.arrayContaining(['absolute', 'size-pin', '-translate-1/2'])
    )
  })

  it('should keep its on-screen size with no counter-scale when rendered', () => {
    /* Feature 50: the canvas is laid out at its zoomed size, not scaled, so
       the pin has nothing to undo. */
    expect(
      render('team')
        .classes()
        .some(name => name.includes('scale'))
    ).toBe(false)
  })

  it('should draw only a pinging red dot, no static rings, when the pin is a team city', () => {
    /* Pen extract-44 § 9 (Roberto 2026-11-01): the halos are the ping. */
    const dots = render('team').findAll('span > span')

    expect(dots).toHaveLength(1)
    expect(dots[0]?.classes()).toEqual(
      expect.arrayContaining([
        'size-pin-nucleo',
        'bg-red-muush-500',
        'pulso',
        'relative',
      ])
    )
  })

  it('should draw a pinging steel dot when the pin is a partner', () => {
    const dot = render('partner').find('span > span')

    expect(dot.classes()).toEqual(
      expect.arrayContaining(['size-pin-nucleo', 'bg-acero-200', 'pulso'])
    )
  })

  it('should draw only a hollow grey ring with no ping when the pin is coming soon', () => {
    const dots = render('soon').findAll('span > span')

    expect(dots).toHaveLength(1)
    expect(dots[0]?.classes()).toEqual(
      expect.arrayContaining([
        'size-pin-nucleo',
        'border-(length:--trazo-anillo)',
        'border-gris-400',
      ])
    )
    expect(dots[0]?.classes()).not.toContain('pulso')
  })

  it('should keep the 28 px footprint centred on the dot when rendered', () => {
    expect(render('team').classes()).toEqual(
      expect.arrayContaining(['size-pin', 'grid', 'place-items-center'])
    )
  })
})
