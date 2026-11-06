import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LegalDataTable from './LegalDataTable.vue'
import LegalList from './LegalList.vue'
import LegalSection from './LegalSection.vue'
import { LEGAL_PAGES } from './legalFixtures.testing'

const sections = LEGAL_PAGES.privacy.es.sections
const section = (id: string) => {
  const found = sections.find(candidate => candidate.id === id)
  if (!found) throw new Error(id)
  return found
}

describe('LegalSection', () => {
  it('should anchor the section and label it with its h2', () => {
    const wrapper = mount(LegalSection, {
      props: { section: section('controller') },
    })

    expect(wrapper.attributes('id')).toBe('controller')
    expect(wrapper.attributes('aria-labelledby')).toBe('controller-titulo')
    expect(wrapper.find('h2#controller-titulo').text()).toBe(
      'Quién es responsable de tus datos'
    )
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['border-t', 'border-carbon-700'])
    )
  })

  it('should render paragraphs, the table and lists in order', () => {
    const data = mount(LegalSection, { props: { section: section('data') } })
    const rights = mount(LegalSection, {
      props: { section: section('rights') },
    })

    expect(data.findComponent(LegalDataTable).props('rows')).toHaveLength(4)
    expect(data.findAll('p')).toHaveLength(1)
    expect(rights.findComponent(LegalList).props('kind')).toBe('steps')
  })

  it('should render the preferences block as a button that emits its trigger', async () => {
    const wrapper = mount(LegalSection, {
      props: { section: section('cookies') },
    })
    const button = wrapper.find('button')

    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toEqual(
      expect.arrayContaining([
        'rounded-pill',
        'bg-btn2-fondo',
        'inset-ring-linea-fuerte',
      ])
    )
    await button.trigger('click')
    expect(wrapper.emitted('open-preferences')?.[0]?.[0]).toBe(button.element)
  })
})
