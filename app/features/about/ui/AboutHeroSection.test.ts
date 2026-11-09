import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import ShaderBackground from '@/shared/ui/ShaderBackground.vue'
import AboutHeroSection from './AboutHeroSection.vue'
import { ABOUT_HERO_COPY } from './aboutFixtures.testing'

/** Feature 46 · US1, FR-004…FR-007; pen extract-46 §§ 1.1, 2. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(AboutHeroSection, {
    props: ABOUT_HERO_COPY[locale],
    global: { stubs: { ShaderBackground: true } },
  })
}

describe('AboutHeroSection', () => {
  it('should render the two-tone heading as the only h1', () => {
    const wrapper = render('en')

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      level: 1,
      size: 'pagina',
      first: 'The team takes shape',
      second: 'around the project.',
    })
  })

  it('should carry the shared pill air', () => {
    const pill = render().findComponent(Pill)

    expect(pill.props('label')).toBe('Nosotros')
    expect(pill.classes()).toContain('pill-aire')
  })

  it('should mount the aboutHero background', () => {
    const wrapper = render()

    expect(wrapper.findComponent(ShaderBackground).props('preset')).toBe(
      'aboutHero'
    )
    expect(wrapper.find('section').classes()).toEqual(
      expect.arrayContaining(['relative', 'isolate'])
    )
  })

  it('should stack pill, heading and intro in a centred column when rendered', () => {
    const column = render().find('section > div')

    expect(column.classes()).toEqual(
      expect.arrayContaining([
        'relative',
        'z-10',
        'items-center',
        'justify-center',
        'gap-pagina-gap',
        'flex-1',
        'pt-seccion-arriba',
        'pb-seccion-aire',
        'text-center',
      ])
    )
    expect(column.find('p').text()).toContain('Reunimos al talento indicado')
    expect(column.find('p').classes()).toEqual(
      expect.arrayContaining([
        'text-pagina-intro',
        'max-w-pagina-intro',
        'text-texto-suave',
      ])
    )
  })

  it('should fill at least the viewport, like the home hero, when rendered', () => {
    /* Section framing (Roberto 2026-11-08, global.css). */
    expect(render().find('section').classes()).toContain('min-h-portada-alto')
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe('hero')
  })
})
