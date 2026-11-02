import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GlassSurface from '@/shared/ui/GlassSurface.vue'
import { SERVICES_COPY } from './landingFixtures.testing'
import ServiceCard from './ServiceCard.vue'

/** Feature 44 · FR-014; pen extract-44 § 3.1, § 8. */
function render(index = 0, locale: 'es' | 'en' = 'es') {
  const card = SERVICES_COPY[locale].cards[index]
  if (!card) throw new Error('fixture missing')
  return mount(ServiceCard, { props: card })
}

describe('ServiceCard', () => {
  it('should be the servicio glass article when rendered', () => {
    const surface = render().findComponent(GlassSurface)

    expect(surface.props()).toMatchObject({ preset: 'servicio', as: 'article' })
    expect(surface.element.tagName).toBe('ARTICLE')
  })

  it('should title the card with an h3 that keeps the forced break when rendered', () => {
    const title = render(1).find('h3')

    expect(title.text()).toBe('Software, web\ny nube')
    expect(title.classes()).toEqual(
      expect.arrayContaining(['text-servicio', 'whitespace-pre-line'])
    )
  })

  it('should light each card from its corner when rendered', () => {
    const lights = [0, 1, 2, 3].map(index =>
      render(index).find('[data-visual]').classes()
    )

    expect(lights[0]).toContain('bg-(image:--luz-crimson)')
    expect(lights[1]).toContain('bg-(image:--luz-acero)')
    expect(lights[2]).toContain('bg-(image:--luz-crimson)')
    expect(lights[3]).toContain('bg-(image:--luz-arena)')
  })

  it('should inline the lucide glyph decoratively in the glass tile when rendered', () => {
    const icon = render(3).find('.icono')

    expect(icon.attributes('aria-hidden')).toBe('true')
    expect(icon.classes()).toContain('size-tile-icono')
    expect(icon.find('svg title').text()).toBe('lucide · pen-tool')
    expect(icon.find('svg').attributes('stroke-width')).toBe('1.5')
  })

  it('should soften the description when rendered', () => {
    const description = render(0, 'en').find('p')

    expect(description.text()).toContain('A clear diagnosis')
    expect(description.classes()).toEqual(
      expect.arrayContaining(['text-p', 'text-texto-suave'])
    )
  })
})
