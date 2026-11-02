import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GlassSurface from '@/shared/ui/GlassSurface.vue'
import AlsoAvailable from './AlsoAvailable.vue'
import { SERVICES_COPY } from './landingFixtures.testing'

/** Feature 44 · FR-017; pen extract-44 § 3.2. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(AlsoAvailable, { props: SERVICES_COPY[locale].also })
}

describe('AlsoAvailable', () => {
  it('should show the franja strip from lg only when rendered', () => {
    const strip = render().findComponent(GlassSurface)

    expect(strip.props('preset')).toBe('franja')
    expect(strip.classes()).toEqual(
      expect.arrayContaining(['hidden', 'lg:flex', 'justify-between'])
    )
  })

  it('should uppercase the stored sentence-case label by CSS when rendered', () => {
    const label = render().find('p')

    expect(label.text()).toBe('También, si lo necesitas')
    expect(label.classes()).toEqual(
      expect.arrayContaining(['uppercase', 'text-rotulo'])
    )
  })

  it('should mark each strip chip with a steel dot when rendered', () => {
    const chips = render('en').findComponent(GlassSurface).findAll('li')

    expect(chips.map(chip => chip.text())).toEqual(['Creative', 'Marketing'])
    for (const chip of chips) {
      expect(chip.find('span').classes()).toEqual(
        expect.arrayContaining([
          'bg-acero-200',
          'size-chip-punto',
          /* FR-041 (Roberto review 2026-11-02): the radar ping, on a
             positioned dot so the ghost overflows without resizing. */
          'pulso',
          'relative',
        ])
      )
      expect(chip.classes()).toContain('borde-suave')
    }
  })

  it('should stack the mobile card below lg with a decorative separator when rendered', () => {
    const card = render().find('div.lg\\:hidden')
    const line = card.findAll('p')[1]

    expect(card.classes()).toEqual(
      expect.arrayContaining(['rounded-caja', 'p-tambien', 'gap-tambien-gap'])
    )
    expect(line?.text()).toBe('Creativo · Marketing')
    expect(line?.find('span').attributes('aria-hidden')).toBe('true')
    expect(card.findAll('p')[2]?.classes()).toContain('text-texto-suave')
  })
})
