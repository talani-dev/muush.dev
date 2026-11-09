import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FaqTopicTabs from './FaqTopicTabs.vue'
import { FAQ_CONTENT } from './faqFixtures.testing'

/** Feature 51 · spec FR-010, FR-014; contract `ui-contract.md`. */
function render(selected = 0, locale: 'es' | 'en' = 'es') {
  return mount(FaqTopicTabs, {
    props: {
      topics: FAQ_CONTENT[locale].topics,
      selected,
      label: FAQ_CONTENT[locale].tabsLabel,
      idPrefix: 'faq',
    },
  })
}

describe('FaqTopicTabs', () => {
  it('should be a named tab list of five tabs when rendered', () => {
    const wrapper = render()
    const tabs = wrapper.findAll('[role="tab"]')

    expect(wrapper.attributes('role')).toBe('tablist')
    expect(wrapper.attributes('aria-label')).toBe('Temas')
    const visibleText = (tab: (typeof tabs)[number]) =>
      tab
        .findAll('span:not([data-icono])')
        .map(span => span.text())
        .join(' ')

    expect(tabs.map(visibleText)).toEqual([
      '01 Diagnóstico y cómo empezar',
      '02 Precios y pagos',
      '03 Proceso y tiempos',
      '04 Entrega, propiedad y soporte',
      '05 Trabaja con muush',
    ])
  })

  it('should keep only the selected tab in the tab order when rendered', () => {
    const tabs = render(1).findAll('[role="tab"]')

    expect(tabs.map(tab => tab.attributes('tabindex'))).toEqual([
      '-1',
      '0',
      '-1',
      '-1',
      '-1',
    ])
    expect(tabs.map(tab => tab.attributes('aria-selected'))).toEqual([
      'false',
      'true',
      'false',
      'false',
      'false',
    ])
  })

  it('should name each tab by its anchor and control its panel when rendered', () => {
    const tab = render(0, 'en').findAll('[role="tab"]')[1]

    expect(tab?.attributes('id')).toBe('faq-tab-pricing')
    expect(tab?.attributes('aria-controls')).toBe('faq-panel-pricing')
  })

  it('should light the selected tab and grey the others when rendered', () => {
    const [active, inactive] = render().findAll('[role="tab"]')

    expect(active?.classes()).toEqual(
      expect.arrayContaining([
        'bg-carbon-800/60',
        'text-blanco',
        'borde-faq-activo',
      ])
    )
    expect(active?.find('.text-faq-numero').classes()).toContain(
      'text-red-muush-500'
    )
    expect(inactive?.classes()).toEqual(
      expect.arrayContaining([
        'bg-negro-900/40',
        'text-gris-400',
        'borde-faq-tenue',
      ])
    )
  })

  it('should be a snapping chip row below lg and a column from lg when rendered', () => {
    const wrapper = render()

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'overflow-x-auto',
        'snap-x',
        'snap-mandatory',
        'ps-gutter',
        'lg:flex-col',
      ])
    )
    expect(wrapper.classes().some(name => name.startsWith('pe-'))).toBe(false)
  })

  it('should show the chevron from lg only and hide it from assistive technology', () => {
    const chevron = render().find('[data-icono]')

    expect(chevron.classes()).toEqual(
      expect.arrayContaining(['hidden', 'lg:block'])
    )
    expect(chevron.attributes('aria-hidden')).toBe('true')
  })

  it('should emit the index when a tab is clicked', async () => {
    const wrapper = render()

    await wrapper.findAll('[role="tab"]')[3]?.trigger('click')

    expect(wrapper.emitted('select')).toEqual([[3]])
  })
})
