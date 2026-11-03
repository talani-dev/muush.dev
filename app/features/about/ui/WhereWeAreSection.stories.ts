import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { WHERE_WE_ARE_COPY } from './aboutFixtures.testing'
import WhereWeAreSection from './WhereWeAreSection.vue'

/**
 * "Dónde estamos" (feature 46, US1; pen extract-46 §§ 1.3, 2; frames
 * `sBV2H` / `ab0j5`): the shared map, tabs and legend. Below `lg` the tabs
 * zoom the map; use them in "Móvil (390)".
 */
const meta = {
  title: 'About/WhereWeAreSection',
  component: WhereWeAreSection,
  globals: { backgrounds: { value: 'negro' } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WhereWeAreSection>

export default meta
type Story = StoryObj<typeof meta>

export const EsMobile390: Story = {
  args: WHERE_WE_ARE_COPY.es,
  globals: { viewport: { value: 'mobile' } },
}
export const EnMobile390: Story = {
  args: WHERE_WE_ARE_COPY.en,
  globals: { viewport: { value: 'mobile' } },
}
export const EsDesktop1440: Story = {
  args: WHERE_WE_ARE_COPY.es,
  globals: { viewport: { value: 'desktop' } },
}
export const EnDesktop1440: Story = {
  args: WHERE_WE_ARE_COPY.en,
  globals: { viewport: { value: 'desktop' } },
}
