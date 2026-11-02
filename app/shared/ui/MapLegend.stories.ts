import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MapLegend from '@/shared/ui/MapLegend.vue'
import { MAP_COPY } from '@/shared/ui/mapFixtures.testing'

/**
 * The map legend (feature 44, pen extract-44 § 2): one row at "Escritorio
 * (1440)", two rows with the "Estonia · pronto" chip at "Móvil (390)".
 */
const meta = {
  title: 'Shared/UI/MapLegend',
  component: MapLegend,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MapLegend>

export default meta
type Story = StoryObj<typeof meta>

function args(locale: 'es' | 'en') {
  return {
    items: MAP_COPY[locale].legend,
    soonLabel: MAP_COPY[locale].soonLabel,
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
