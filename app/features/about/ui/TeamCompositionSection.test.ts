import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import { TEAM_COMPOSITION_COPY } from './aboutFixtures.testing'
import CompositionCard from './CompositionCard.vue'
import TeamCompositionSection from './TeamCompositionSection.vue'

/** Feature 46 · US1, FR-008…FR-014; pen extract-46 §§ 1.2, 2. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(TeamCompositionSection, {
    props: TEAM_COMPOSITION_COPY[locale],
  })
}

describe('TeamCompositionSection', () => {
  it('should render three list items in team, pool, partner order', () => {
    const wrapper = render()

    expect(wrapper.findAll('ul > li')).toHaveLength(3)
    expect(
      wrapper.findAllComponents(CompositionCard).map(card => card.props('kind'))
    ).toEqual(['team', 'pool', 'partner'])
  })

  it('should start-align the head below lg', () => {
    const classes = render().find('section').classes()

    expect(classes).toEqual(
      expect.arrayContaining([
        'items-start',
        'lg:items-center',
        'lg:text-center',
      ])
    )
    expect(classes).not.toContain('text-center')
  })

  it('should title the section with a two-tone h2 at the 30 to 56 scale when rendered', () => {
    const heading = render('en').findComponent(Heading)

    expect(heading.props()).toMatchObject({
      level: 2,
      first: 'Who joins',
      second: 'your project.',
    })
    expect(heading.classes()).toContain('text-servicios-titulo')
  })

  it('should carry the shared pill air', () => {
    const pill = render().findComponent(Pill)

    expect(pill.props('label')).toBe('Cómo se arma')
    expect(pill.classes()).toContain('pill-aire')
  })

  it('should lay the cards in three equal columns from lg when rendered', () => {
    expect(render().find('ul').classes()).toEqual(
      expect.arrayContaining([
        'grid',
        'lg:grid-cols-3',
        'gap-composicion-tarjetas',
        'max-w-composicion',
      ])
    )
  })

  it('should sit on the page black with no background when rendered', () => {
    expect(render().find('canvas').exists()).toBe(false)
  })

  it('should fill the viewport below the header and centre its content when rendered', () => {
    /* Section framing (Roberto 2026-11-08, global.css). */
    expect(render().find('section').classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-col',
        'min-h-seccion-alto',
        'justify-center',
        'pt-seccion-arriba',
        'pb-seccion-aire',
      ])
    )
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe(
      'how_it_comes_together'
    )
  })
})
