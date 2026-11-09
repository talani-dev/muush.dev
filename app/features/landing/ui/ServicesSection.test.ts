import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'
import Pill from '@/shared/ui/Pill.vue'
import AlsoAvailable from './AlsoAvailable.vue'
import { SERVICES_COPY } from './landingFixtures.testing'
import ServicesCarousel from './ServicesCarousel.vue'
import ServicesSection from './ServicesSection.vue'

/** Feature 44 · US3, FR-014…FR-017; pen extract-44 § 3, § 8. */
function render(locale: 'es' | 'en' = 'es') {
  return mount(ServicesSection, { props: SERVICES_COPY[locale] })
}

describe('ServicesSection', () => {
  it('should carry the servicios anchor when rendered', () => {
    expect(render().find('section').attributes('id')).toBe('servicios')
  })

  it('should name the carousel with its h2 when rendered', () => {
    const wrapper = render()
    const heading = wrapper.findComponent(Heading)
    const id = heading.attributes('id')

    expect(heading.element.tagName).toBe('H2')
    expect(heading.classes()).toContain('text-servicios-titulo')
    expect(id).toBeTruthy()
    expect(wrapper.findComponent(ServicesCarousel).props('labelledBy')).toBe(id)
  })

  it('should compose pill, heading, cards and strip in order when rendered', () => {
    const wrapper = render('en')

    expect(wrapper.findComponent(Pill).props('label')).toBe('Services')
    expect(wrapper.findComponent(ServicesCarousel).props('cards')).toHaveLength(
      4
    )
    expect(wrapper.findComponent(AlsoAvailable).props()).toEqual(
      SERVICES_COPY.en.also
    )
  })

  it('should pad and space the section as drawn when rendered', () => {
    const wrapper = render()

    expect(wrapper.find('section').classes()).toEqual(
      expect.arrayContaining(['px-gutter', 'lg:px-gutter-desktop'])
    )
    expect(wrapper.find('section > div').classes()).toEqual(
      expect.arrayContaining(['max-w-contenido', 'gap-servicios-gap'])
    )
  })

  it('should fill the viewport below the header and centre its content when rendered', () => {
    /* Section framing (Roberto 2026-11-08, global.css). */
    expect(render().find('section').classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'flex-col',
        'min-h-seccion-alto',
        /* Round 3: the jump lands on the section's own top edge. */
        '-scroll-mt-cabecera',
        'justify-center',
        'pt-seccion-arriba',
        'pb-seccion-aire',
      ])
    )
    expect(render().find('section > div').classes()).toEqual(
      expect.arrayContaining(['w-full', 'mx-auto', 'max-w-contenido'])
    )
  })

  it('should mark its root for section timing when rendered', () => {
    /* Feature 49 · `section_view` (tracking plan § 5). */
    expect(render().attributes('data-track-section')).toBe('services')
  })
})
