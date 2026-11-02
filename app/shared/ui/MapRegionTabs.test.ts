import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MapRegionTabs from '@/shared/ui/MapRegionTabs.vue'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'

/** Feature 44 · FR-011, research R5; pen extract-44 § 2.1. */
function render(selected: 'america' | 'europe' = 'america') {
  return mount(MapRegionTabs, {
    props: {
      regions: MAP_COPY.es.regions,
      selected,
      label: 'Región del mapa',
      panelId: 'mapa-panel',
      idPrefix: 'mapa',
    },
  })
}

describe('MapRegionTabs', () => {
  it('should be a named tab list of two tabs when rendered', () => {
    const wrapper = render()
    const tabs = wrapper.findAll('[role="tab"]')

    expect(wrapper.attributes('role')).toBe('tablist')
    expect(wrapper.attributes('aria-label')).toBe('Región del mapa')
    expect(tabs.map(tab => tab.text())).toEqual(['América', 'Europa'])
    for (const tab of tabs) {
      expect(tab.attributes('aria-controls')).toBe('mapa-panel')
      expect(tab.attributes('type')).toBe('button')
    }
  })

  it('should keep only the selected tab in the tab order when rendered', () => {
    const tabs = render('europe').findAll('[role="tab"]')

    expect(tabs.map(tab => tab.attributes('aria-selected'))).toEqual([
      'false',
      'true',
    ])
    expect(tabs.map(tab => tab.attributes('tabindex'))).toEqual(['-1', '0'])
    expect(tabs[1]?.attributes('id')).toBe('mapa-tab-europe')
  })

  it('should fill the selected tab and grey the other when rendered', () => {
    const [america, europe] = render('america').findAll('[role="tab"]')

    expect(america?.classes()).toEqual(
      expect.arrayContaining(['bg-blanco-10', 'text-blanco', 'text-pestana'])
    )
    expect(europe?.classes()).toContain('text-gris-400')
    expect(europe?.classes()).not.toContain('bg-blanco-10')
  })

  it('should emit the region when a tab is clicked', async () => {
    const wrapper = render()

    await wrapper.findAll('[role="tab"]')[1]?.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['europe']])
  })
})
