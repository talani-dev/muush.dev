import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Heading from '@/shared/ui/Heading.vue'
import LegalArticle from './LegalArticle.vue'
import LegalIndex from './LegalIndex.vue'
import LegalIndexDisclosure from './LegalIndexDisclosure.vue'
import LegalSection from './LegalSection.vue'
import { LEGAL_PAGES } from './legalFixtures.testing'

/** Feature 48 · pen-extract-48 § 3. */
function render(
  page: 'privacy' | 'terms' = 'privacy',
  locale: 'es' | 'en' = 'es'
) {
  return mount(LegalArticle, {
    props: { content: LEGAL_PAGES[page][locale], activeId: 'controller' },
  })
}

describe('LegalArticle', () => {
  it('should render the two-tone heading as the only h1 at the legal size', () => {
    const wrapper = render()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findComponent(Heading).props()).toMatchObject({
      first: 'Aviso de',
      second: 'privacidad.',
      level: 1,
      size: 'legal',
    })
  })

  it('should show the update date with the substituted publication date', () => {
    expect(render().text()).toContain(
      'Última actualización: 5 de noviembre de 2026'
    )
    expect(render('terms', 'en').text()).toContain(
      'Last updated: November 5, 2026'
    )
  })

  it('should show the courtesy translation note on English pages only', () => {
    const note = 'Courtesy translation.'

    expect(render('privacy', 'en').text()).toContain(note)
    expect(render('terms', 'en').text()).toContain(note)
    expect(render('privacy', 'es').text()).not.toContain(note)
  })

  it('should render every section in the .pen order', () => {
    expect(
      render('terms')
        .findAllComponents(LegalSection)
        .map(section => section.props('section').id)
    ).toEqual([
      'whoWeAre',
      'usingTheSite',
      'whatYouFind',
      'assessment',
      'projects',
      'workWithUs',
      'properUse',
      'intellectualProperty',
      'thirdParties',
      'availability',
      'privacy',
      'changes',
      'governingLaw',
      'contact',
    ])
  })

  it('should give the desktop index and the mobile disclosure the same links', () => {
    const wrapper = render()

    expect(wrapper.findComponent(LegalIndex).props('sections')).toHaveLength(10)
    expect(
      wrapper.findComponent(LegalIndexDisclosure).props('sections')
    ).toHaveLength(10)
    expect(wrapper.findComponent(LegalIndex).props('activeId')).toBe(
      'controller'
    )
  })

  it('should swap the disclosure for the sticky index at lg', () => {
    const wrapper = render()

    expect(wrapper.find('aside').classes()).toEqual(
      expect.arrayContaining(['hidden', 'lg:block'])
    )
    expect(wrapper.findComponent(LegalIndexDisclosure).classes()).toContain(
      'lg:hidden'
    )
    expect(wrapper.find('aside > div').classes()).toEqual(
      expect.arrayContaining(['sticky', 'top-legal-indice-fijo'])
    )
  })

  it('should forward the preferences request with its trigger', async () => {
    const wrapper = render()

    await wrapper.find('section#cookies button').trigger('click')

    const [[trigger]] = wrapper.emitted('open-preferences') as [[HTMLElement]]
    expect(trigger.textContent?.trim()).toBe('Cambiar mis preferencias')
  })
})
