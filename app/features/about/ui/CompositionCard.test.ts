import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { CompositionKind } from '@/features/about/data/teamCompositionContent'
import { TEAM_COMPOSITION_COPY } from './aboutFixtures.testing'
import CompositionCard from './CompositionCard.vue'

/** Feature 46 · FR-010…FR-012, FR-014; pen extract-46 § 1.2. */
function render(kind: CompositionKind = 'team', locale: 'es' | 'en' = 'es') {
  const card = TEAM_COMPOSITION_COPY[locale].cards.find(
    entry => entry.kind === kind
  )
  if (!card) throw new Error(`no ${kind} card`)
  return mount(CompositionCard, { props: card })
}

describe('CompositionCard', () => {
  const COLOURS: [CompositionKind, string][] = [
    ['team', 'bg-red-muush-500'],
    ['pool', 'bg-blanco'],
    ['partner', 'bg-acero-200'],
  ]

  for (const [kind, colour] of COLOURS) {
    it(`should colour the dot by kind when rendered as ${kind}`, () => {
      expect(render(kind).find('[data-punto]').classes()).toContain(colour)
    })
  }

  it('should hide the dot from assistive technology', () => {
    expect(render().find('[data-punto]').attributes('aria-hidden')).toBe('true')
  })

  it('should carry the ping utility on the dot', () => {
    expect(render('pool').find('[data-punto]').classes()).toEqual(
      expect.arrayContaining([
        'pulso',
        'relative',
        'rounded-full',
        'size-tarjeta-equipo-punto',
      ])
    )
  })

  it('should render a list item with label, h3 title and text when rendered', () => {
    const wrapper = render('partner', 'en')

    expect(wrapper.element.tagName).toBe('LI')
    expect(wrapper.find('p').text()).toBe('Partners')
    expect(wrapper.find('h3').text()).toBe('Creative and marketing')
    expect(wrapper.findAll('p').at(1)?.text()).toBe(
      'Trusted studios, coordinated by us.'
    )
  })

  it('should paint the flat glass panel the design draws when rendered', () => {
    expect(render().classes()).toEqual(
      expect.arrayContaining([
        'bg-vidrio-fondo',
        'rounded-servicio',
        'p-tarjeta-equipo',
        'gap-tarjeta-equipo-gap',
        'borde-luz',
        'borde-linea',
        'relative',
      ])
    )
  })

  it('should let the title run into the end padding from lg only when rendered', () => {
    /* Leader 2026-11-02: `wxw3m` is one 355 px line in the 336 px box. */
    const classes = render('pool').find('h3').classes()

    expect(classes).toContain('lg:-me-tarjeta-equipo-titulo-fin')
    expect(classes.filter(name => name.startsWith('-me-'))).toEqual([])
  })
})
