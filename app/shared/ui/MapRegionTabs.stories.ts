import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MapRegionTabs from '@/shared/ui/MapRegionTabs.vue'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'

/**
 * The mobile map's region selector (feature 44, pen extract-44 § 2.1).
 * Coverage note (review-44): the tabs exist only below `lg`, so only
 * "Móvil (390)" applies; ES and EN are both shown.
 */
const meta = {
  title: 'Shared/UI/MapRegionTabs',
  component: MapRegionTabs,
  globals: { backgrounds: { value: 'negro' }, viewport: { value: 'mobile' } },
  args: { panelId: 'mapa-panel', idPrefix: 'mapa' },
} satisfies Meta<typeof MapRegionTabs>

export default meta
type Story = StoryObj<typeof meta>

export const EsAmerica: Story = {
  args: {
    regions: MAP_COPY.es.regions,
    label: MAP_COPY.es.regionsLabel,
    selected: 'america',
  },
}
export const EnEurope: Story = {
  args: {
    regions: MAP_COPY.en.regions,
    label: MAP_COPY.en.regionsLabel,
    selected: 'europe',
  },
}
