import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'
import WorldMap from '@/shared/ui/WorldMap.vue'

/**
 * The dotted world map (feature 44, pen extract-44 § 2.1). "Escritorio
 * (1440)": the whole map at 80 % with every pin. "Móvil (390)": the America
 * / Europa tabs zooming the same map (click or use the arrow keys).
 */
const meta = {
  title: 'Shared/UI/WorldMap',
  component: WorldMap,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
  decorators: [
    () => ({ template: '<div class="px-gutter lg:px-0"><story /></div>' }),
  ],
} satisfies Meta<typeof WorldMap>

export default meta
type Story = StoryObj<typeof meta>

function args(locale: 'es' | 'en') {
  const copy = MAP_COPY[locale]
  return {
    regions: copy.regions,
    regionsLabel: copy.regionsLabel,
    groups: copy.groups,
    cityNames: copy.cityNames,
  }
}

export const EsMobile390: Story = {
  args: args('es'),
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: args('en'),
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: args('es'),
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: args('en'),
  globals: { viewport: { value: 'desktop' } },
}
